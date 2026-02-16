from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.subject import SubjectCreate, SubjectResponse, SubjectUpdate
from app.services.subject import SubjectService

router = APIRouter(prefix="/subjects", tags=["subjects"])


@router.post("", response_model=SubjectResponse, status_code=status.HTTP_201_CREATED)
async def create_subject(data: SubjectCreate, db: AsyncSession = Depends(get_db)) -> SubjectResponse:
    service = SubjectService(db)
    return await service.create(data)


@router.get("", response_model=list[SubjectResponse])
async def get_subjects(db: AsyncSession = Depends(get_db)) -> list[SubjectResponse]:
    service = SubjectService(db)
    return await service.get_all()


@router.get("/{subject_id}", response_model=SubjectResponse)
async def get_subject(subject_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> SubjectResponse:
    service = SubjectService(db)
    subject = await service.get_by_id(subject_id)
    if subject is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")
    return subject


@router.put("/{subject_id}", response_model=SubjectResponse)
async def update_subject(
    subject_id: uuid.UUID,
    data: SubjectUpdate,
    db: AsyncSession = Depends(get_db),
) -> SubjectResponse:
    service = SubjectService(db)
    subject = await service.get_by_id(subject_id)
    if subject is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")
    return await service.update(subject, data)


@router.delete("/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_subject(subject_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> None:
    service = SubjectService(db)
    subject = await service.get_by_id(subject_id)
    if subject is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")
    await service.delete(subject)
