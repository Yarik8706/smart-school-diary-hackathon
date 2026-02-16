from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.schedule import ScheduleSlotCreate, ScheduleSlotResponse, ScheduleSlotUpdate
from app.services.schedule import ScheduleService
from app.services.subject import SubjectService

router = APIRouter(prefix="/schedule", tags=["schedule"])


@router.post("", response_model=ScheduleSlotResponse, status_code=status.HTTP_201_CREATED)
async def create_slot(data: ScheduleSlotCreate, db: AsyncSession = Depends(get_db)) -> ScheduleSlotResponse:
    subject = await SubjectService(db).get_by_id(data.subject_id)
    if subject is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")

    service = ScheduleService(db)
    try:
        return await service.create(data)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.get("", response_model=list[ScheduleSlotResponse])
async def get_schedule(
    day: int | None = Query(default=None, ge=0, le=6),
    db: AsyncSession = Depends(get_db),
) -> list[ScheduleSlotResponse]:
    service = ScheduleService(db)
    return await service.get_all(day)


@router.put("/{slot_id}", response_model=ScheduleSlotResponse)
async def update_slot(
    slot_id: uuid.UUID,
    data: ScheduleSlotUpdate,
    db: AsyncSession = Depends(get_db),
) -> ScheduleSlotResponse:
    subject = await SubjectService(db).get_by_id(data.subject_id)
    if subject is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")

    service = ScheduleService(db)
    slot = await service.get_by_id(slot_id)
    if slot is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Schedule slot not found")

    try:
        return await service.update(slot, data)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.delete("/{slot_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_slot(slot_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> None:
    service = ScheduleService(db)
    slot = await service.get_by_id(slot_id)
    if slot is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Schedule slot not found")
    await service.delete(slot)
