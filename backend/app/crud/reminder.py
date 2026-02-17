from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.homework import Homework
from app.models.reminder import Reminder
from app.schemas.reminder import ReminderCreate, ReminderUpdate


class HomeworkNotFoundError(Exception):
    pass


async def create_reminder(db: AsyncSession, obj_in: ReminderCreate) -> Reminder:
    homework = await db.get(Homework, obj_in.homework_id)
    if homework is None:
        raise HomeworkNotFoundError

    db_reminder = Reminder(homework_id=obj_in.homework_id, remind_at=obj_in.remind_at, is_sent=False)
    db.add(db_reminder)
    await db.commit()
    return await get_reminder(db, db_reminder.id)  # type: ignore[return-value]


async def list_reminders(db: AsyncSession) -> list[Reminder]:
    result = await db.execute(
        select(Reminder)
        .options(
            selectinload(Reminder.homework).selectinload(Homework.subject),
            selectinload(Reminder.homework).selectinload(Homework.steps),
        )
        .order_by(Reminder.remind_at.asc(), Reminder.created_at.desc())
    )
    return list(result.scalars().all())


async def list_pending_reminders(db: AsyncSession) -> list[Reminder]:
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(Reminder)
        .options(
            selectinload(Reminder.homework).selectinload(Homework.subject),
            selectinload(Reminder.homework).selectinload(Homework.steps),
        )
        .where(Reminder.is_sent.is_(False), Reminder.remind_at <= now)
        .order_by(Reminder.remind_at.asc())
    )
    return list(result.scalars().all())


async def get_reminder(db: AsyncSession, reminder_id: uuid.UUID) -> Reminder | None:
    result = await db.execute(
        select(Reminder)
        .options(
            selectinload(Reminder.homework).selectinload(Homework.subject),
            selectinload(Reminder.homework).selectinload(Homework.steps),
        )
        .where(Reminder.id == reminder_id)
    )
    return result.scalar_one_or_none()


async def update_reminder(db: AsyncSession, reminder_id: uuid.UUID, obj_in: ReminderUpdate) -> Reminder | None:
    db_reminder = await db.get(Reminder, reminder_id)
    if db_reminder is None:
        return None

    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_reminder, field, value)

    await db.commit()
    return await get_reminder(db, reminder_id)


async def delete_reminder(db: AsyncSession, reminder_id: uuid.UUID) -> bool:
    db_reminder = await db.get(Reminder, reminder_id)
    if db_reminder is None:
        return False

    await db.delete(db_reminder)
    await db.commit()
    return True


async def mark_reminder_sent(db: AsyncSession, reminder_id: uuid.UUID) -> Reminder | None:
    db_reminder = await db.get(Reminder, reminder_id)
    if db_reminder is None:
        return None

    db_reminder.is_sent = True
    await db.commit()
    return await get_reminder(db, reminder_id)
