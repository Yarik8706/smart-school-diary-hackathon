from __future__ import annotations

import uuid
from datetime import datetime, timezone

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.homework import HomeworkRead


class ReminderCreate(BaseModel):
    homework_id: uuid.UUID = Field(example="f803c5b5-b608-4642-8127-48908f8da821")
    remind_at: datetime = Field(example="2026-02-01T18:00:00Z")

    @field_validator("remind_at")
    @classmethod
    def validate_remind_at_future(cls, value: datetime) -> datetime:
        now = datetime.now(timezone.utc)
        if value <= now:
            raise ValueError("remind_at must be in the future")
        return value


class ReminderUpdate(BaseModel):
    remind_at: datetime | None = Field(default=None, example="2026-02-01T20:00:00Z")


class ReminderRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    homework_id: uuid.UUID
    homework: HomeworkRead
    remind_at: datetime
    is_sent: bool
    created_at: datetime
    updated_at: datetime
