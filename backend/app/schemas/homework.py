from __future__ import annotations

import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.subject import SubjectRead


class HomeworkStepRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    is_completed: bool
    order: int
    created_at: datetime


class HomeworkBase(BaseModel):
    subject_id: uuid.UUID | None = None
    title: str | None = Field(default=None, min_length=1)
    description: str | None = None
    deadline: date | None = None
    is_completed: bool | None = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, value: str | None) -> str | None:
        if value is None:
            return value
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("title must not be empty")
        return cleaned


class HomeworkCreate(HomeworkBase):
    subject_id: uuid.UUID
    title: str = Field(min_length=1)
    deadline: date

    @field_validator("deadline")
    @classmethod
    def validate_deadline(cls, value: date) -> date:
        if value < date.today():
            raise ValueError("deadline must not be in the past")
        return value


class HomeworkUpdate(HomeworkBase):
    pass


class HomeworkRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    subject_id: uuid.UUID
    subject: SubjectRead
    title: str
    description: str | None
    deadline: date
    is_completed: bool
    created_at: datetime
    updated_at: datetime
    steps: list[HomeworkStepRead] = Field(default_factory=list)

    @field_validator("description", mode="before")
    @classmethod
    def empty_description_to_none(cls, value: str | None) -> str | None:
        if value == "":
            return None
        return value
