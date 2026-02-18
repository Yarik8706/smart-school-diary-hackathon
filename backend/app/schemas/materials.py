from __future__ import annotations

from pydantic import BaseModel, HttpUrl


class MaterialSearchResult(BaseModel):
    title: str
    url: HttpUrl
    source: str
    description: str | None = None
    thumbnail_url: HttpUrl | None = None


class AIMaterialsResponse(BaseModel):
    materials: list[MaterialSearchResult]
    recommendation: str = ""
