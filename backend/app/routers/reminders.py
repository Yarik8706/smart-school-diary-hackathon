from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.crud import reminder as reminder_crud
from app.schemas.reminder import ReminderCreate, ReminderRead, ReminderUpdate

router = APIRouter(prefix="/v1/reminders", tags=["reminders"])


@router.post("", response_model=ReminderRead, status_code=status.HTTP_201_CREATED)
async def create_reminder(payload: ReminderCreate, db: AsyncSession = Depends(get_db)) -> ReminderRead:
    try:
        reminder = await reminder_crud.create_reminder(db, payload)
    except reminder_crud.HomeworkNotFoundError as err:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Homework not found") from err
    return ReminderRead.model_validate(reminder)


@router.get("", response_model=list[ReminderRead])
async def list_reminders(db: AsyncSession = Depends(get_db)) -> list[ReminderRead]:
    items = await reminder_crud.list_reminders(db)
    return [ReminderRead.model_validate(item) for item in items]


@router.get("/pending", response_model=list[ReminderRead])
async def list_pending_reminders(db: AsyncSession = Depends(get_db)) -> list[ReminderRead]:
    items = await reminder_crud.list_pending_reminders(db)
    return [ReminderRead.model_validate(item) for item in items]


@router.put("/{reminder_id}", response_model=ReminderRead)
async def update_reminder(
    reminder_id: uuid.UUID,
    payload: ReminderUpdate,
    db: AsyncSession = Depends(get_db),
) -> ReminderRead:
    reminder = await reminder_crud.update_reminder(db, reminder_id, payload)
    if reminder is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found")
    return ReminderRead.model_validate(reminder)


@router.delete("/{reminder_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_reminder(reminder_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> None:
    deleted = await reminder_crud.delete_reminder(db, reminder_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found")


@router.patch("/{reminder_id}/mark-sent", response_model=ReminderRead)
async def mark_reminder_sent(reminder_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> ReminderRead:
    reminder = await reminder_crud.mark_reminder_sent(db, reminder_id)
    if reminder is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder not found")
    return ReminderRead.model_validate(reminder)
