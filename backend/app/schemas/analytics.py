from __future__ import annotations

from pydantic import BaseModel, Field


class DayLoadAnalysis(BaseModel):
    day: int = Field(ge=0, le=6)
    load_score: int = Field(ge=0)
    lessons_count: int = Field(ge=0)
    hard_subjects: list[str]
    warning: str | None = None


class WeekLoadAnalysis(BaseModel):
    days: list[DayLoadAnalysis]


class LoadWarningsResponse(BaseModel):
    warnings: list[str]
