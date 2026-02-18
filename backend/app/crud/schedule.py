from __future__ import annotations

import uuid

from sqlalchemy import Select, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.schedule_slot import ScheduleSlot
from app.schemas.schedule import ScheduleSlotCreate, ScheduleSlotUpdate


async def create_schedule_slot(db: AsyncSession, obj_in: ScheduleSlotCreate) -> ScheduleSlot:
    db_slot = ScheduleSlot(
        subject_id=obj_in.subject_id,
        day_of_week=obj_in.day_of_week,
        start_time=obj_in.start_time,
        end_time=obj_in.end_time,
        room=obj_in.room,
    )
    db.add(db_slot)
    await db.commit()
    result = await db.execute(
        select(ScheduleSlot).options(selectinload(ScheduleSlot.subject)).where(ScheduleSlot.id == db_slot.id)
    )
    return result.scalar_one()


async def list_schedule_slots(db: AsyncSession, day_of_week: int | None = None) -> list[ScheduleSlot]:
    query: Select[tuple[ScheduleSlot]] = select(ScheduleSlot).options(selectinload(ScheduleSlot.subject))
    if day_of_week is not None:
        query = query.where(ScheduleSlot.day_of_week == day_of_week)
    query = query.order_by(ScheduleSlot.day_of_week.asc(), ScheduleSlot.start_time.asc())
    result = await db.execute(query)
    return list(result.scalars().all())


async def get_schedule_slot(db: AsyncSession, slot_id: uuid.UUID) -> ScheduleSlot | None:
    result = await db.execute(
        select(ScheduleSlot).options(selectinload(ScheduleSlot.subject)).where(ScheduleSlot.id == slot_id)
    )
    return result.scalar_one_or_none()


async def update_schedule_slot(
    db: AsyncSession,
    slot_id: uuid.UUID,
    obj_in: ScheduleSlotUpdate,
) -> ScheduleSlot | None:
    db_slot = await db.get(ScheduleSlot, slot_id)
    if db_slot is None:
        return None

    update_data = obj_in.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(db_slot, field, value)

    await db.commit()
    return await get_schedule_slot(db, slot_id)


async def delete_schedule_slot(db: AsyncSession, slot_id: uuid.UUID) -> bool:
    db_slot = await db.get(ScheduleSlot, slot_id)
    if db_slot is None:
        return False

    await db.delete(db_slot)
    await db.commit()
    return True
