from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query, status

from app.schemas.materials import AIMaterialsResponse
from app.services.ai_materials_search import AIMaterialsSearchError, search_materials_with_ai
from app.services.materials_search import MaterialsProviderError, search_materials as search_materials_service

router = APIRouter(prefix="/v1/materials", tags=["materials"])


@router.get("/search", response_model=AIMaterialsResponse)
async def search_materials(
    query: str = Query(min_length=1),
    subject: str | None = Query(default=None, min_length=1),
) -> AIMaterialsResponse:
    """Найти учебные материалы по теме задания и названию предмета."""
    normalized_query = query.strip()
    if not normalized_query:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Query must not be empty")

    try:
        return await search_materials_with_ai(title=normalized_query, description=None, subject=subject)
    except AIMaterialsSearchError:
        try:
            fallback = await search_materials_service(query=normalized_query, subject=subject)
            return AIMaterialsResponse(materials=fallback, recommendation="")
        except MaterialsProviderError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Materials provider is unavailable",
            ) from exc
