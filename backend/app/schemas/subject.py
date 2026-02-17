from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class SubjectBase(BaseModel):
    name: str | None = Field(default=None, min_length=1, example="Математика")
    color: str | None = Field(default=None, example="#FF5733")

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str | None) -> str | None:
        if value is None:
            return value
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("name must not be empty")
        return cleaned


class SubjectCreate(SubjectBase):
    name: str = Field(min_length=1, example="Математика")


class SubjectUpdate(SubjectBase):
    pass


class SubjectRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    color: str | None
    created_at: datetime
    updated_at: datetime
