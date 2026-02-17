from __future__ import annotations

import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.homework import HomeworkRead

MoodValue = Literal["easy", "normal", "hard"]


class MoodEntryCreate(BaseModel):
    homework_id: uuid.UUID = Field(example="f803c5b5-b608-4642-8127-48908f8da821")
    mood: MoodValue = Field(example="normal")
    note: str | None = Field(default=None, example="Задание средней сложности")


class MoodEntryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    homework_id: uuid.UUID
    homework: HomeworkRead
    mood: MoodValue
    note: str | None
    created_at: datetime


class MoodStats(BaseModel):
    easy_count: int
    normal_count: int
    hard_count: int
