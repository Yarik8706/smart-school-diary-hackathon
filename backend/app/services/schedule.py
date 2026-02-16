from __future__ import annotations

import uuid
from datetime import time

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.schedule_slot import ScheduleSlot
from app.schemas.schedule import ScheduleSlotCreate, ScheduleSlotUpdate


class ScheduleService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, data: ScheduleSlotCreate) -> ScheduleSlot:
        await self.ensure_no_overlap(data.day_of_week, data.start_time, data.end_time)
        slot = ScheduleSlot(
            subject_id=data.subject_id,
            day_of_week=data.day_of_week,
            start_time=data.start_time,
            end_time=data.end_time,
            room=data.room,
        )
        self.session.add(slot)
        await self.session.commit()
        await self.session.refresh(slot)
        return await self.get_by_id(slot.id)

    async def get_all(self, day_of_week: int | None = None) -> list[ScheduleSlot]:
        query = select(ScheduleSlot).options(selectinload(ScheduleSlot.subject)).order_by(
            ScheduleSlot.day_of_week,
            ScheduleSlot.start_time,
        )
        if day_of_week is not None:
            query = query.where(ScheduleSlot.day_of_week == day_of_week)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_by_id(self, slot_id: uuid.UUID) -> ScheduleSlot | None:
        result = await self.session.execute(
            select(ScheduleSlot)
            .options(selectinload(ScheduleSlot.subject))
            .where(ScheduleSlot.id == slot_id)
        )
        return result.scalar_one_or_none()

    async def update(self, slot: ScheduleSlot, data: ScheduleSlotUpdate) -> ScheduleSlot:
        await self.ensure_no_overlap(
            data.day_of_week,
            data.start_time,
            data.end_time,
            excluded_slot_id=slot.id,
        )
        slot.subject_id = data.subject_id
        slot.day_of_week = data.day_of_week
        slot.start_time = data.start_time
        slot.end_time = data.end_time
        slot.room = data.room
        await self.session.commit()
        await self.session.refresh(slot)
        return await self.get_by_id(slot.id)

    async def delete(self, slot: ScheduleSlot) -> None:
        await self.session.delete(slot)
        await self.session.commit()

    async def ensure_no_overlap(
        self,
        day_of_week: int,
        start_time: time,
        end_time: time,
        excluded_slot_id: uuid.UUID | None = None,
    ) -> None:
        filters = [
            ScheduleSlot.day_of_week == day_of_week,
            ScheduleSlot.start_time < end_time,
            ScheduleSlot.end_time > start_time,
        ]
        if excluded_slot_id is not None:
            filters.append(ScheduleSlot.id != excluded_slot_id)

        result = await self.session.execute(select(ScheduleSlot.id).where(and_(*filters)).limit(1))
        if result.scalar_one_or_none() is not None:
            raise ValueError("Schedule slot overlaps with an existing slot")
