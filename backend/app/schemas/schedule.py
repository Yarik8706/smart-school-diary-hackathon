from __future__ import annotations

import uuid
from datetime import datetime, time

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.schemas.subject import SubjectRead


class ScheduleSlotBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    subject_id: uuid.UUID | None = Field(default=None, example="9efbcad1-5604-4cd3-85e2-c3c74ef7de47")
    day_of_week: int | None = Field(default=None, ge=0, le=6, example=1)
    start_time: time | None = Field(default=None, example="09:00:00")
    end_time: time | None = Field(default=None, example="09:45:00")
    room: str | None = Field(default=None, alias="room", example="Кабинет 210")

    @model_validator(mode="after")
    def validate_time_range(self) -> "ScheduleSlotBase":
        if self.start_time is not None and self.end_time is not None and self.start_time >= self.end_time:
            raise ValueError("start_time must be less than end_time")
        return self


class ScheduleSlotCreate(ScheduleSlotBase):
    subject_id: uuid.UUID = Field(example="9efbcad1-5604-4cd3-85e2-c3c74ef7de47")
    day_of_week: int = Field(ge=0, le=6, example=1)
    start_time: time = Field(example="09:00:00")
    end_time: time = Field(example="09:45:00")


class ScheduleSlotUpdate(ScheduleSlotBase):
    pass


class ScheduleSlotRead(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: uuid.UUID
    subject_id: uuid.UUID
    subject: SubjectRead
    day_of_week: int
    start_time: time
    end_time: time
    room: str | None = Field(alias="room")
    created_at: datetime
    updated_at: datetime
