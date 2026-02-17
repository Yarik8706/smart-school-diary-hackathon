from __future__ import annotations

import uuid
from datetime import datetime, time

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.schemas.subject import SubjectRead


class ScheduleSlotBase(BaseModel):
    subject_id: uuid.UUID | None = None
    day_of_week: int | None = Field(default=None, ge=0, le=6)
    start_time: time | None = None
    end_time: time | None = None
    room: str | None = None

    @model_validator(mode="after")
    def validate_time_range(self) -> "ScheduleSlotBase":
        if self.start_time is not None and self.end_time is not None and self.start_time >= self.end_time:
            raise ValueError("start_time must be less than end_time")
        return self


class ScheduleSlotCreate(ScheduleSlotBase):
    subject_id: uuid.UUID
    day_of_week: int = Field(ge=0, le=6)
    start_time: time
    end_time: time


class ScheduleSlotUpdate(ScheduleSlotBase):
    pass


class ScheduleSlotRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    subject_id: uuid.UUID
    subject: SubjectRead
    day_of_week: int
    start_time: time
    end_time: time
    room: str | None
    created_at: datetime
    updated_at: datetime

    @model_validator(mode="before")
    @classmethod
    def map_room_field(cls, values: object) -> object:
        if not isinstance(values, dict):
            return values
        if "room" not in values and "room" in values:
            values["room"] = values["room"]
        return values
