from __future__ import annotations

import json
from typing import Any

from openai import AsyncOpenAI

from app.core.config import settings
from app.schemas.materials import AIMaterialsResponse, MaterialSearchResult
from app.services.materials_search import search_materials
from app.services.web_search import search_web

_MAX_REACT_STEPS = 5
_MAX_MATERIALS = 8
_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_youtube",
            "description": "Поиск видео на YouTube",
            "parameters": {
                "type": "object",
                "properties": {"query": {"type": "string"}, "subject": {"type": "string"}},
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "search_web",
            "description": "Поиск веб-страниц и статей",
            "parameters": {
                "type": "object",
                "properties": {"query": {"type": "string"}},
                "required": ["query"],
            },
        },
    },
]


class AIMaterialsSearchError(RuntimeError):
    """Ошибка AI-поиска материалов."""


def _build_client() -> AsyncOpenAI:
    return AsyncOpenAI(base_url="https://openrouter.ai/api/v1", api_key=settings.openrouter_api_key)


def _serialize_material(item: MaterialSearchResult) -> dict[str, str | None]:
    return {"title": item.title, "url": str(item.url), "source": item.source, "description": item.description}


def _parse_args(raw_args: str | None) -> dict[str, Any]:
    if not raw_args:
        return {}
    try:
        return json.loads(raw_args)
    except json.JSONDecodeError:
        return {}


def _parse_final_payload(content: str) -> tuple[list[str], str]:
    try:
        payload = json.loads(content)
    except json.JSONDecodeError as exc:
        raise AIMaterialsSearchError("AI returned invalid final response") from exc
    urls, recommendation = payload.get("selected_urls"), payload.get("recommendation")
    if not isinstance(urls, list) or not all(isinstance(item, str) for item in urls):
        raise AIMaterialsSearchError("AI final response has invalid selected_urls")
    if not isinstance(recommendation, str):
        raise AIMaterialsSearchError("AI final response has invalid recommendation")
    return urls, recommendation.strip()


def _finalize_materials(materials: list[MaterialSearchResult], selected_urls: list[str], recommendation: str) -> AIMaterialsResponse:
    chosen_urls = set(selected_urls)
    selected = [item for item in materials if str(item.url) in chosen_urls]
    normalized = selected or materials[:5]
    return AIMaterialsResponse(materials=normalized[:5], recommendation=recommendation)


async def _run_tool(tool_name: str, args: dict[str, Any], default_query: str) -> list[MaterialSearchResult]:
    query = str(args.get("query") or default_query).strip()
    if not query:
        return []
    if tool_name == "search_youtube":
        subject = args.get("subject")
        return await search_materials(query=query, subject=str(subject) if subject else None)
    if tool_name == "search_web":
        return await search_web(query)
    return []


async def _request_final_selection(
    client: AsyncOpenAI,
    title: str,
    description: str | None,
    subject: str | None,
    materials: list[MaterialSearchResult],
) -> tuple[list[str], str]:
    prompt = {"title": title, "description": description, "subject": subject, "materials": [_serialize_material(item) for item in materials]}
    response = await client.chat.completions.create(
        model="google/gemini-2.5-flash",
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": "Выбери лучшие ссылки и верни JSON: {\"selected_urls\": string[], \"recommendation\": string}."},
            {"role": "user", "content": json.dumps(prompt, ensure_ascii=False)},
        ],
    )
    content = response.choices[0].message.content if response.choices else None
    if not content:
        raise AIMaterialsSearchError("AI returned empty final response")
    return _parse_final_payload(content)


async def search_materials_with_ai(title: str, description: str | None, subject: str | None) -> AIMaterialsResponse:
    if not settings.openrouter_api_key:
        fallback = await search_materials(query=title, subject=subject)
        return AIMaterialsResponse(materials=fallback, recommendation="")
    try:
        client = _build_client()
        messages: list[dict[str, Any]] = [
            {
                "role": "system",
                "content": "Ты подбираешь учебные материалы на русском языке. Используй инструменты search_youtube и search_web 1-3 раза, затем остановись.",
            },
            {"role": "user", "content": f"Предмет: {subject or 'Не указан'}\nТема: {title}\nОписание: {description or 'Нет описания'}"},
        ]
        collected: list[MaterialSearchResult] = []
        seen_urls: set[str] = set()
        for _ in range(_MAX_REACT_STEPS):
            response = await client.chat.completions.create(model="google/gemini-2.5-flash", messages=messages, tools=_TOOLS, tool_choice="auto")
            message = response.choices[0].message if response.choices else None
            if message is None:
                break
            messages.append(message.model_dump(exclude_none=True))
            tool_calls = message.tool_calls or []
            if not tool_calls:
                break
            for call in tool_calls:
                args = _parse_args(call.function.arguments if call.function else None)
                results = await _run_tool(call.function.name if call.function else "", args, title)
                for item in results:
                    url = str(item.url)
                    if url in seen_urls:
                        continue
                    collected.append(item)
                    seen_urls.add(url)
                    if len(collected) >= _MAX_MATERIALS:
                        break
                messages.append({"role": "tool", "tool_call_id": call.id, "content": json.dumps([_serialize_material(item) for item in results], ensure_ascii=False)})
        if not collected:
            collected = await search_materials(query=title, subject=subject)
        selected_urls, recommendation = await _request_final_selection(client=client, title=title, description=description, subject=subject, materials=collected)
        return _finalize_materials(collected, selected_urls, recommendation)
    except Exception as exc:  # noqa: BLE001
        raise AIMaterialsSearchError("AI materials search failed") from exc
