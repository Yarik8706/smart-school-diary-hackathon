from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.subject import Subject
from app.schemas.subject import SubjectCreate, SubjectUpdate


async def create_subject(db: AsyncSession, obj_in: SubjectCreate) -> Subject:
    db_subject = Subject(name=obj_in.name, color=obj_in.color)
    db.add(db_subject)
    await db.commit()
    await db.refresh(db_subject)
    return db_subject


async def list_subjects(db: AsyncSession) -> list[Subject]:
    result = await db.execute(select(Subject).order_by(Subject.created_at.asc()))
    return list(result.scalars().all())


async def get_subject(db: AsyncSession, subject_id: uuid.UUID) -> Subject | None:
    return await db.get(Subject, subject_id)


async def update_subject(db: AsyncSession, subject_id: uuid.UUID, obj_in: SubjectUpdate) -> Subject | None:
    db_subject = await get_subject(db, subject_id)
    if db_subject is None:
        return None

    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_subject, field, value)

    await db.commit()
    await db.refresh(db_subject)
    return db_subject


async def delete_subject(db: AsyncSession, subject_id: uuid.UUID) -> bool:
    db_subject = await get_subject(db, subject_id)
    if db_subject is None:
        return False

    await db.delete(db_subject)
    await db.commit()
    return True
