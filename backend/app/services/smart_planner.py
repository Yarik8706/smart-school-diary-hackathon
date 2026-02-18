from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import date

from openai import AsyncOpenAI

from app.core.config import settings


class PlannerServiceError(Exception):
    """Raised when smart planning provider fails."""


@dataclass(slots=True)
class StepData:
    title: str
    order: int


class SmartPlannerService:
    def __init__(self) -> None:
        self._client = AsyncOpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=settings.openrouter_api_key,
        )

    async def generate_steps(
        self,
        title: str,
        description: str | None,
        subject_name: str | None,
        deadline: date,
    ) -> list[StepData]:
        if not settings.openrouter_api_key:
            raise PlannerServiceError("OpenRouter API key is not configured")

        response_format = {
            "type": "json_schema",
            "json_schema": {
                "name": "homework_steps",
                "strict": True,
                "schema": {
                    "type": "object",
                    "properties": {
                        "steps": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "title": {"type": "string"},
                                    "order": {"type": "integer"},
                                },
                                "required": ["title", "order"],
                                "additionalProperties": False,
                            },
                        }
                    },
                    "required": ["steps"],
                    "additionalProperties": False,
                },
            },
        }

        prompt = (
            "Разбей это домашнее задание на 3-7 конкретных шагов. "
            "Шаги должны быть короткими, понятными школьнику и выполнимыми по порядку. "
            "Не добавляй лишний текст, только шаги.\n\n"
            f"Предмет: {subject_name or 'Не указан'}\n"
            f"Задание: {title}\n"
            f"Описание: {description or 'Нет описания'}\n"
            f"Дедлайн: {deadline.isoformat()}"
        )

        try:
            response = await self._client.chat.completions.create(
                model="google/gemini-2.5-flash",
                response_format=response_format,
                messages=[
                    {
                        "role": "system",
                        "content": "Ты помощник ученика. Разбивай домашнее задание на понятные шаги на русском языке.",
                    },
                    {"role": "user", "content": prompt},
                ],
            )
        except Exception as exc:  # noqa: BLE001
            raise PlannerServiceError("Failed to request smart planning provider") from exc

        content = response.choices[0].message.content if response.choices else None
        if not content:
            raise PlannerServiceError("Planner returned empty response")

        try:
            payload = json.loads(content)
            steps_payload = payload["steps"]
            steps = [StepData(title=item["title"].strip(), order=int(item["order"])) for item in steps_payload]
        except (KeyError, TypeError, ValueError, json.JSONDecodeError) as exc:
            raise PlannerServiceError("Planner returned invalid response format") from exc

        normalized_steps = [step for step in steps if step.title]
        if not normalized_steps:
            raise PlannerServiceError("Planner returned no usable steps")
        return normalized_steps


smart_planner_service = SmartPlannerService()
