from __future__ import annotations

import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.crud import mood as mood_crud
from app.schemas.mood import MoodEntryCreate, MoodEntryRead, MoodStats

router = APIRouter(prefix="/v1/mood", tags=["mood"])


@router.post("", response_model=MoodEntryRead, status_code=status.HTTP_201_CREATED)
async def create_mood_entry(payload: MoodEntryCreate, db: AsyncSession = Depends(get_db)) -> MoodEntryRead:
    """Добавить запись о сложности выполнения домашнего задания."""
    try:
        mood_entry = await mood_crud.create_mood_entry(db, payload)
    except mood_crud.HomeworkNotFoundError as err:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Homework not found") from err

    return MoodEntryRead.model_validate(mood_entry)


@router.get("", response_model=list[MoodEntryRead])
async def list_mood_entries(
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    subject_id: uuid.UUID | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
) -> list[MoodEntryRead]:
    """Получить журнал записей настроения с фильтрами по дате и предмету."""
    items = await mood_crud.list_mood_entries(db, date_from=date_from, date_to=date_to, subject_id=subject_id)
    return [MoodEntryRead.model_validate(item) for item in items]


@router.get("/stats", response_model=MoodStats)
async def get_mood_stats(db: AsyncSession = Depends(get_db)) -> MoodStats:
    """Получить агрегированную статистику настроения по всем записям."""
    return await mood_crud.get_mood_stats(db)
