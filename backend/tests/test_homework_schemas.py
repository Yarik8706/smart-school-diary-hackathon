from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from uuid import uuid4

import pytest
from pydantic import ValidationError

from app.schemas.homework import HomeworkCreate, HomeworkRead, HomeworkStepRead, HomeworkUpdate
from app.schemas.subject import SubjectRead


def _build_subject() -> SubjectRead:
    now = datetime.now(timezone.utc)
    return SubjectRead(id=uuid4(), name="Math", color="#ffaa00", created_at=now, updated_at=now)


def test_homework_create_accepts_valid_payload() -> None:
    payload = HomeworkCreate(
        subject_id=uuid4(),
        title="Read chapter 3",
        description="Pages 45-62",
        deadline=date.today() + timedelta(days=2),
    )

    assert payload.title == "Read chapter 3"


def test_homework_create_rejects_blank_title() -> None:
    with pytest.raises(ValidationError):
        HomeworkCreate(
            subject_id=uuid4(),
            title="   ",
            description=None,
            deadline=date.today() + timedelta(days=1),
        )


def test_homework_create_rejects_past_deadline() -> None:
    with pytest.raises(ValidationError):
        HomeworkCreate(
            subject_id=uuid4(),
            title="Essay",
            description=None,
            deadline=date.today() - timedelta(days=1),
        )


def test_homework_update_supports_partial_payload() -> None:
    payload = HomeworkUpdate(title="Updated title", is_completed=True)

    assert payload.title == "Updated title"
    assert payload.is_completed is True


def test_homework_read_serializes_nested_subject_and_steps() -> None:
    now = datetime.now(timezone.utc)
    subject = _build_subject()
    hw_id = uuid4()
    payload = HomeworkRead(
        id=hw_id,
        subject_id=subject.id,
        subject=subject,
        title="Lab work",
        description=None,
        deadline=date.today() + timedelta(days=3),
        is_completed=False,
        created_at=now,
        updated_at=now,
        steps=[HomeworkStepRead(id=uuid4(), title="Collect data", is_completed=False, order=1, created_at=now)],
    )

    assert payload.subject.id == subject.id
    assert payload.steps[0].title == "Collect data"
