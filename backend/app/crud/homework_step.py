from __future__ import annotations

import uuid

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.homework_step import HomeworkStep
from app.services.smart_planner import StepData


async def create_steps_batch(
    db: AsyncSession,
    homework_id: uuid.UUID,
    steps: list[StepData],
) -> list[HomeworkStep]:
    db_steps = [
        HomeworkStep(
            homework_id=homework_id,
            title=step.title,
            order=step.order,
            is_completed=False,
        )
        for step in steps
    ]
    db.add_all(db_steps)
    await db.commit()
    result = await db.execute(
        select(HomeworkStep)
        .where(HomeworkStep.homework_id == homework_id)
        .order_by(HomeworkStep.order.asc(), HomeworkStep.created_at.asc())
    )
    return list(result.scalars().all())


async def delete_steps_by_homework(db: AsyncSession, homework_id: uuid.UUID) -> None:
    await db.execute(delete(HomeworkStep).where(HomeworkStep.homework_id == homework_id))
    await db.commit()


async def toggle_step(db: AsyncSession, step_id: uuid.UUID) -> HomeworkStep | None:
    step = await db.get(HomeworkStep, step_id)
    if step is None:
        return None

    step.is_completed = not step.is_completed
    await db.commit()
    await db.refresh(step)
    return step
