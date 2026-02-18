from __future__ import annotations

from typing import Any

from starlette.concurrency import run_in_threadpool

from app.schemas.materials import MaterialSearchResult

_MAX_RESULTS = 5


class WebSearchProviderError(RuntimeError):
    """Ошибка при веб-поиске материалов."""


def _build_ddgs() -> Any:
    from duckduckgo_search import DDGS

    return DDGS()


def _run_search(query: str) -> list[dict[str, Any]]:
    with _build_ddgs() as ddgs:
        return list(ddgs.text(query, max_results=_MAX_RESULTS))


async def search_web(query: str) -> list[MaterialSearchResult]:
    try:
        rows = await run_in_threadpool(_run_search, query)
    except Exception as exc:  # noqa: BLE001
        raise WebSearchProviderError("Failed to fetch materials from web search") from exc

    items: list[MaterialSearchResult] = []
    for row in rows:
        url = row.get("href")
        if not url:
            continue
        items.append(
            MaterialSearchResult(
                title=row.get("title") or "Без названия",
                url=url,
                source="article",
                description=row.get("body") or None,
                thumbnail_url=None,
            )
        )
    return items[:_MAX_RESULTS]
