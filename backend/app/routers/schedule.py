from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.crud import schedule as schedule_crud
from app.schemas.schedule import ScheduleSlotCreate, ScheduleSlotRead, ScheduleSlotUpdate

router = APIRouter(prefix="/v1/schedule", tags=["schedule"])


@router.post("", response_model=ScheduleSlotRead, status_code=status.HTTP_201_CREATED)
async def create_schedule_slot(
    payload: ScheduleSlotCreate,
    db: AsyncSession = Depends(get_db),
) -> ScheduleSlotRead:
    """Добавить новый слот в школьное расписание."""
    slot = await schedule_crud.create_schedule_slot(db, payload)
    return ScheduleSlotRead.model_validate(slot)


@router.get("", response_model=list[ScheduleSlotRead])
async def list_schedule_slots(
    day_of_week: int | None = Query(default=None, ge=0, le=6),
    db: AsyncSession = Depends(get_db),
) -> list[ScheduleSlotRead]:
    """Получить расписание, опционально отфильтрованное по дню недели."""
    slots = await schedule_crud.list_schedule_slots(db, day_of_week)
    return [ScheduleSlotRead.model_validate(slot) for slot in slots]


@router.get("/{slot_id}", response_model=ScheduleSlotRead)
async def get_schedule_slot(slot_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> ScheduleSlotRead:
    """Получить один слот расписания по идентификатору."""
    slot = await schedule_crud.get_schedule_slot(db, slot_id)
    if slot is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Schedule slot not found")
    return ScheduleSlotRead.model_validate(slot)


@router.put("/{slot_id}", response_model=ScheduleSlotRead)
async def update_schedule_slot(
    slot_id: uuid.UUID,
    payload: ScheduleSlotUpdate,
    db: AsyncSession = Depends(get_db),
) -> ScheduleSlotRead:
    """Обновить параметры слота расписания."""
    slot = await schedule_crud.update_schedule_slot(db, slot_id, payload)
    if slot is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Schedule slot not found")
    return ScheduleSlotRead.model_validate(slot)


@router.delete("/{slot_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_schedule_slot(slot_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> None:
    """Удалить слот расписания."""
    deleted = await schedule_crud.delete_schedule_slot(db, slot_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Schedule slot not found")
