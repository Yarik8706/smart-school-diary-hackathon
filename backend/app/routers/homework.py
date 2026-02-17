from __future__ import annotations

import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.crud import homework as homework_crud
from app.schemas.homework import HomeworkCreate, HomeworkRead, HomeworkUpdate

router = APIRouter(prefix="/v1/homework", tags=["homework"])


@router.post("", response_model=HomeworkRead, status_code=status.HTTP_201_CREATED)
async def create_homework(payload: HomeworkCreate, db: AsyncSession = Depends(get_db)) -> HomeworkRead:
    """Создать новое домашнее задание по предмету."""
    homework = await homework_crud.create_homework(db, payload)
    return HomeworkRead.model_validate(homework)


@router.get("", response_model=list[HomeworkRead])
async def list_homeworks(
    subject_id: uuid.UUID | None = Query(default=None),
    is_completed: bool | None = Query(default=None),
    deadline_from: date | None = Query(default=None),
    deadline_to: date | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
) -> list[HomeworkRead]:
    """Получить список домашних заданий с фильтрами по предмету, срокам и статусу."""
    items = await homework_crud.list_homeworks(
        db,
        subject_id=subject_id,
        is_completed=is_completed,
        deadline_from=deadline_from,
        deadline_to=deadline_to,
    )
    return [HomeworkRead.model_validate(item) for item in items]


@router.get("/{homework_id}", response_model=HomeworkRead)
async def get_homework(homework_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> HomeworkRead:
    """Получить домашнее задание по идентификатору."""
    homework = await homework_crud.get_homework(db, homework_id)
    if homework is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Homework not found")
    return HomeworkRead.model_validate(homework)


@router.put("/{homework_id}", response_model=HomeworkRead)
async def update_homework(
    homework_id: uuid.UUID,
    payload: HomeworkUpdate,
    db: AsyncSession = Depends(get_db),
) -> HomeworkRead:
    """Обновить данные домашнего задания."""
    homework = await homework_crud.update_homework(db, homework_id, payload)
    if homework is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Homework not found")
    return HomeworkRead.model_validate(homework)


@router.delete("/{homework_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_homework(homework_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> None:
    """Удалить домашнее задание."""
    deleted = await homework_crud.delete_homework(db, homework_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Homework not found")


@router.patch("/{homework_id}/complete", response_model=HomeworkRead)
async def complete_homework(homework_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> HomeworkRead:
    """Отметить домашнее задание как выполненное."""
    homework = await homework_crud.mark_homework_completed(db, homework_id)
    if homework is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Homework not found")
    return HomeworkRead.model_validate(homework)
