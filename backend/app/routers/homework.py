from __future__ import annotations

import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.crud import homework as homework_crud
from app.crud import homework_step as homework_step_crud
from app.schemas.homework import GenerateStepsResponse, HomeworkCreate, HomeworkRead, HomeworkStepRead, HomeworkUpdate
from app.schemas.materials import AIMaterialsResponse
from app.services.ai_materials_search import AIMaterialsSearchError, search_materials_with_ai
from app.services.materials_search import MaterialsProviderError, search_materials
from app.services.smart_planner import PlannerServiceError, smart_planner_service

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


@router.get("/{homework_id}/materials", response_model=AIMaterialsResponse)
async def get_homework_materials(homework_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> AIMaterialsResponse:
    """Получить рекомендованные материалы для домашнего задания по его теме и предмету."""
    homework = await homework_crud.get_homework(db, homework_id)
    if homework is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Homework not found")

    subject_name = homework.subject.name if homework.subject is not None else None
    try:
        return await search_materials_with_ai(
            title=homework.title,
            description=homework.description,
            subject=subject_name,
        )
    except AIMaterialsSearchError:
        try:
            fallback = await search_materials(query=homework.title, subject=subject_name)
            return AIMaterialsResponse(materials=fallback, recommendation="")
        except MaterialsProviderError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Materials provider is unavailable",
            ) from exc


@router.post("/{homework_id}/generate-steps", response_model=GenerateStepsResponse)
async def generate_homework_steps(homework_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> GenerateStepsResponse:
    """Сгенерировать и сохранить шаги выполнения для домашнего задания."""
    homework = await homework_crud.get_homework(db, homework_id)
    if homework is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Homework not found")

    subject_name = homework.subject.name if homework.subject is not None else None
    try:
        generated_steps = await smart_planner_service.generate_steps(
            title=homework.title,
            description=homework.description,
            subject_name=subject_name,
            deadline=homework.deadline if isinstance(homework.deadline, date) else homework.deadline.date(),
        )
    except PlannerServiceError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Smart planner is unavailable",
        ) from exc

    await homework_step_crud.delete_steps_by_homework(db, homework_id)
    steps = await homework_step_crud.create_steps_batch(db, homework_id, generated_steps)
    step_reads = [HomeworkStepRead.model_validate(step) for step in steps]
    return GenerateStepsResponse(steps=step_reads, count=len(step_reads))


@router.patch("/steps/{step_id}/toggle", response_model=HomeworkStepRead)
async def toggle_homework_step(step_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> HomeworkStepRead:
    """Переключить статус выполнения шага домашнего задания."""
    step = await homework_step_crud.toggle_step(db, step_id)
    if step is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Homework step not found")
    return HomeworkStepRead.model_validate(step)


@router.patch("/{homework_id}/complete", response_model=HomeworkRead)
async def complete_homework(homework_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> HomeworkRead:
    """Отметить домашнее задание как выполненное."""
    homework = await homework_crud.mark_homework_completed(db, homework_id)
    if homework is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Homework not found")
    return HomeworkRead.model_validate(homework)
