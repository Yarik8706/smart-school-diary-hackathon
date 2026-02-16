from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.subject import Subject
from app.schemas.subject import SubjectCreate, SubjectUpdate


class SubjectService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, data: SubjectCreate) -> Subject:
        subject = Subject(name=data.name, color=data.color)
        self.session.add(subject)
        await self.session.commit()
        await self.session.refresh(subject)
        return subject

    async def get_all(self) -> list[Subject]:
        result = await self.session.execute(select(Subject).order_by(Subject.name))
        return list(result.scalars().all())

    async def get_by_id(self, subject_id: uuid.UUID) -> Subject | None:
        return await self.session.get(Subject, subject_id)

    async def update(self, subject: Subject, data: SubjectUpdate) -> Subject:
        subject.name = data.name
        subject.color = data.color
        await self.session.commit()
        await self.session.refresh(subject)
        return subject

    async def delete(self, subject: Subject) -> None:
        await self.session.delete(subject)
        await self.session.commit()
