from __future__ import annotations

import uuid
from datetime import date

from sqlalchemy import Select, case, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.enums import DifficultyLevel
from app.models.homework import Homework
from app.models.mood_entry import MoodEntry
from app.schemas.mood import MoodEntryCreate, MoodStats


class HomeworkNotFoundError(Exception):
    pass


async def create_mood_entry(db: AsyncSession, obj_in: MoodEntryCreate) -> MoodEntry:
    homework = await db.get(Homework, obj_in.homework_id)
    if homework is None:
        raise HomeworkNotFoundError

    db_entry = MoodEntry(
        homework_id=obj_in.homework_id,
        date=date.today(),
        mood=DifficultyLevel(obj_in.mood),
        note=obj_in.note,
    )
    db.add(db_entry)
    await db.commit()
    return await get_mood_entry(db, db_entry.id)  # type: ignore[return-value]


async def get_mood_entry(db: AsyncSession, mood_id: uuid.UUID) -> MoodEntry | None:
    result = await db.execute(
        select(MoodEntry)
        .options(
            selectinload(MoodEntry.homework).selectinload(Homework.subject),
            selectinload(MoodEntry.homework).selectinload(Homework.steps),
        )
        .where(MoodEntry.id == mood_id)
    )
    return result.scalar_one_or_none()


async def list_mood_entries(
    db: AsyncSession,
    date_from: date | None = None,
    date_to: date | None = None,
    subject_id: uuid.UUID | None = None,
) -> list[MoodEntry]:
    query: Select[tuple[MoodEntry]] = (
        select(MoodEntry)
        .join(Homework, MoodEntry.homework_id == Homework.id)
        .options(
            selectinload(MoodEntry.homework).selectinload(Homework.subject),
            selectinload(MoodEntry.homework).selectinload(Homework.steps),
        )
    )

    if date_from is not None:
        query = query.where(MoodEntry.date >= date_from)
    if date_to is not None:
        query = query.where(MoodEntry.date <= date_to)
    if subject_id is not None:
        query = query.where(Homework.subject_id == subject_id)

    query = query.order_by(MoodEntry.created_at.desc())
    result = await db.execute(query)
    return list(result.scalars().all())


async def get_mood_stats(db: AsyncSession) -> MoodStats:
    result = await db.execute(
        select(
            func.count(case((MoodEntry.mood == DifficultyLevel.EASY, 1))).label("easy_count"),
            func.count(case((MoodEntry.mood == DifficultyLevel.NORMAL, 1))).label("normal_count"),
            func.count(case((MoodEntry.mood == DifficultyLevel.HARD, 1))).label("hard_count"),
        )
    )
    row = result.one()
    return MoodStats(easy_count=row.easy_count, normal_count=row.normal_count, hard_count=row.hard_count)
