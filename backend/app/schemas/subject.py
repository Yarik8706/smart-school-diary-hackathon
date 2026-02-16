from __future__ import annotations

import uuid

from pydantic import BaseModel, ConfigDict


class SubjectCreate(BaseModel):
    name: str
    color: str | None = None


class SubjectUpdate(BaseModel):
    name: str
    color: str | None = None


class SubjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    color: str | None = None
