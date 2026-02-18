from __future__ import annotations

import json
import logging
from dataclasses import dataclass
from datetime import date

from openai import AsyncOpenAI

from app.core.config import settings

logger = logging.getLogger(__name__)


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
        fallback_steps = self._generate_fallback_steps(title=title, description=description)
        if not settings.openrouter_api_key:
            logger.warning("OpenRouter API key is not configured, using fallback planner")
            return fallback_steps

        response_format = {"type": "json_object"}


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
                max_tokens=1024 * 8,
                messages=[
                    {
                        "role": "system",
                        "content": "Ты помощник ученика. Разбивай домашнее задание на понятные шаги на русском языке.",
                    },
                    {"role": "user", "content": prompt},
                ],
            )
        except Exception as exc:  # noqa: BLE001
            logger.warning("Smart planner provider request failed: %s. Using fallback planner", exc)
            return fallback_steps

        content = response.choices[0].message.content if response.choices else None
        if not content:
            logger.warning("Smart planner returned empty response, using fallback planner")
            return fallback_steps

        try:
            payload = json.loads(content)
            if isinstance(payload, list):
                steps_payload = payload
            elif isinstance(payload, dict):
                steps_payload = payload["steps"]
            else:
                raise ValueError(f"Unexpected payload type: {type(payload)}")
            steps: list[StepData] = []
            for idx, item in enumerate(steps_payload, start=1):
                if isinstance(item, str):
                    steps.append(StepData(title=item.strip(), order=idx))
                elif isinstance(item, dict):
                    steps.append(StepData(title=item["title"].strip(), order=int(item.get("order", idx))))
                else:
                    continue
        except (KeyError, TypeError, ValueError, json.JSONDecodeError) as exc:
            logger.warning("Smart planner response parse failed: %s. Using fallback planner", exc)
            return fallback_steps

        normalized_steps = [step for step in steps if step.title]
        if not normalized_steps:
            logger.warning("Smart planner returned no usable steps, using fallback planner")
            return fallback_steps

        return normalized_steps

    def _generate_fallback_steps(self, title: str, description: str | None) -> list[StepData]:
        details = [item.strip(" .,-") for item in (description or "").split(".") if item.strip()]
        base_steps = [
            f"Прочитай задание: {title.strip()}",
            "Собери нужные материалы и формулы",
        ]

        if details:
            base_steps.append(f"Сделай основную часть: {details[0]}")
        else:
            base_steps.append("Выполни основную часть задания")

        base_steps.extend(
            [
                "Проверь ответ и исправь ошибки",
                "Подготовь итоговую версию для сдачи",
            ]
        )
        return [StepData(title=step, order=index) for index, step in enumerate(base_steps, start=1)]


smart_planner_service = SmartPlannerService()
