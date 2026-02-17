from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from uuid import uuid4

import pytest
from pydantic import ValidationError

from app.schemas.homework import HomeworkRead
from app.schemas.reminder import ReminderCreate, ReminderRead, ReminderUpdate
from app.schemas.subject import SubjectRead


def _build_subject() -> SubjectRead:
    now = datetime.now(timezone.utc)
    return SubjectRead(id=uuid4(), name="Math", color="#1a2b3c", created_at=now, updated_at=now)


def _build_homework() -> HomeworkRead:
    now = datetime.now(timezone.utc)
    subject = _build_subject()
    return HomeworkRead(
        id=uuid4(),
        subject_id=subject.id,
        subject=subject,
        title="Essay",
        description="Write 2 pages",
        deadline=date.today() + timedelta(days=2),
        is_completed=False,
        created_at=now,
        updated_at=now,
        steps=[],
    )


def test_reminder_create_accepts_future_datetime() -> None:
    payload = ReminderCreate(homework_id=uuid4(), remind_at=datetime.now(timezone.utc) + timedelta(minutes=30))

    assert payload.homework_id


def test_reminder_create_rejects_past_datetime() -> None:
    with pytest.raises(ValidationError):
        ReminderCreate(homework_id=uuid4(), remind_at=datetime.now(timezone.utc) - timedelta(seconds=1))


def test_reminder_update_supports_optional_remind_at() -> None:
    payload = ReminderUpdate(remind_at=None)

    assert payload.remind_at is None


def test_reminder_read_contains_nested_homework() -> None:
    now = datetime.now(timezone.utc)
    homework = _build_homework()
    reminder = ReminderRead(
        id=uuid4(),
        homework_id=homework.id,
        homework=homework,
        remind_at=now + timedelta(minutes=15),
        is_sent=False,
        created_at=now,
        updated_at=now,
    )

    assert reminder.homework.id == homework.id
