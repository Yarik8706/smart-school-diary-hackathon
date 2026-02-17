from __future__ import annotations

import uuid
from datetime import datetime, timezone

from pydantic import BaseModel, ConfigDict, field_validator

from app.schemas.homework import HomeworkRead


class ReminderCreate(BaseModel):
    homework_id: uuid.UUID
    remind_at: datetime

    @field_validator("remind_at")
    @classmethod
    def validate_remind_at_future(cls, value: datetime) -> datetime:
        now = datetime.now(timezone.utc)
        if value <= now:
            raise ValueError("remind_at must be in the future")
        return value


class ReminderUpdate(BaseModel):
    remind_at: datetime | None = None


class ReminderRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    homework_id: uuid.UUID
    homework: HomeworkRead
    remind_at: datetime
    is_sent: bool
    created_at: datetime
    updated_at: datetime
