from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.crud import subject as subject_crud
from app.schemas.subject import SubjectCreate, SubjectRead, SubjectUpdate

router = APIRouter(prefix="/v1/subjects", tags=["subjects"])


@router.post("", response_model=SubjectRead, status_code=status.HTTP_201_CREATED)
async def create_subject(payload: SubjectCreate, db: AsyncSession = Depends(get_db)) -> SubjectRead:
    subject = await subject_crud.create_subject(db, payload)
    return SubjectRead.model_validate(subject)


@router.get("", response_model=list[SubjectRead])
async def list_subjects(db: AsyncSession = Depends(get_db)) -> list[SubjectRead]:
    subjects = await subject_crud.list_subjects(db)
    return [SubjectRead.model_validate(subject) for subject in subjects]


@router.get("/{subject_id}", response_model=SubjectRead)
async def get_subject(subject_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> SubjectRead:
    subject = await subject_crud.get_subject(db, subject_id)
    if subject is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")
    return SubjectRead.model_validate(subject)


@router.put("/{subject_id}", response_model=SubjectRead)
async def update_subject(
    subject_id: uuid.UUID,
    payload: SubjectUpdate,
    db: AsyncSession = Depends(get_db),
) -> SubjectRead:
    subject = await subject_crud.update_subject(db, subject_id, payload)
    if subject is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")
    return SubjectRead.model_validate(subject)


@router.delete("/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_subject(subject_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> None:
    deleted = await subject_crud.delete_subject(db, subject_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")
