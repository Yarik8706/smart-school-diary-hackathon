from __future__ import annotations

import uuid
from datetime import time

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.schemas.subject import SubjectResponse


class ScheduleSlotCreate(BaseModel):
    subject_id: uuid.UUID
    day_of_week: int = Field(ge=0, le=6)
    start_time: time
    end_time: time
    room: str | None = None

    @model_validator(mode="after")
    def validate_time_range(self) -> "ScheduleSlotCreate":
        if self.start_time >= self.end_time:
            raise ValueError("start_time must be less than end_time")
        return self


class ScheduleSlotUpdate(BaseModel):
    subject_id: uuid.UUID
    day_of_week: int = Field(ge=0, le=6)
    start_time: time
    end_time: time
    room: str | None = None

    @model_validator(mode="after")
    def validate_time_range(self) -> "ScheduleSlotUpdate":
        if self.start_time >= self.end_time:
            raise ValueError("start_time must be less than end_time")
        return self


class ScheduleSlotResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    day_of_week: int
    start_time: time
    end_time: time
    room: str | None = None
    subject: SubjectResponse
