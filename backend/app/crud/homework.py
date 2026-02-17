from __future__ import annotations

import uuid
from datetime import date, datetime, time, timezone

from sqlalchemy import Select, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.homework import Homework
from app.schemas.homework import HomeworkCreate, HomeworkUpdate


def _date_to_utc_datetime(value: date) -> datetime:
    return datetime.combine(value, time.min, tzinfo=timezone.utc)


async def create_homework(db: AsyncSession, obj_in: HomeworkCreate) -> Homework:
    db_homework = Homework(
        subject_id=obj_in.subject_id,
        title=obj_in.title,
        description=obj_in.description or "",
        deadline=_date_to_utc_datetime(obj_in.deadline),
        is_completed=False,
    )
    db.add(db_homework)
    await db.commit()
    return await get_homework(db, db_homework.id)  # type: ignore[return-value]


async def list_homeworks(
    db: AsyncSession,
    subject_id: uuid.UUID | None = None,
    is_completed: bool | None = None,
    deadline_from: date | None = None,
    deadline_to: date | None = None,
) -> list[Homework]:
    query: Select[tuple[Homework]] = select(Homework).options(
        selectinload(Homework.subject),
        selectinload(Homework.steps),
    )

    if subject_id is not None:
        query = query.where(Homework.subject_id == subject_id)
    if is_completed is not None:
        query = query.where(Homework.is_completed == is_completed)
    if deadline_from is not None:
        query = query.where(Homework.deadline >= _date_to_utc_datetime(deadline_from))
    if deadline_to is not None:
        query = query.where(Homework.deadline <= _date_to_utc_datetime(deadline_to))

    query = query.order_by(Homework.deadline.asc(), Homework.created_at.desc())
    result = await db.execute(query)
    return list(result.scalars().all())


async def get_homework(db: AsyncSession, homework_id: uuid.UUID) -> Homework | None:
    result = await db.execute(
        select(Homework)
        .options(selectinload(Homework.subject), selectinload(Homework.steps))
        .where(Homework.id == homework_id)
    )
    return result.scalar_one_or_none()


async def update_homework(db: AsyncSession, homework_id: uuid.UUID, obj_in: HomeworkUpdate) -> Homework | None:
    db_homework = await db.get(Homework, homework_id)
    if db_homework is None:
        return None

    update_data = obj_in.model_dump(exclude_unset=True)
    if "description" in update_data and update_data["description"] is None:
        update_data["description"] = ""
    if "deadline" in update_data and update_data["deadline"] is not None:
        update_data["deadline"] = _date_to_utc_datetime(update_data["deadline"])

    if update_data.get("is_completed") is True:
        db_homework.completed_at = datetime.now(timezone.utc)
    elif update_data.get("is_completed") is False:
        db_homework.completed_at = None

    for field, value in update_data.items():
        setattr(db_homework, field, value)

    await db.commit()
    return await get_homework(db, homework_id)


async def delete_homework(db: AsyncSession, homework_id: uuid.UUID) -> bool:
    db_homework = await db.get(Homework, homework_id)
    if db_homework is None:
        return False

    await db.delete(db_homework)
    await db.commit()
    return True


async def mark_homework_completed(db: AsyncSession, homework_id: uuid.UUID) -> Homework | None:
    db_homework = await db.get(Homework, homework_id)
    if db_homework is None:
        return None

    db_homework.is_completed = True
    db_homework.completed_at = datetime.now(timezone.utc)
    await db.commit()
    return await get_homework(db, homework_id)
