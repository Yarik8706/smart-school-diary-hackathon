from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from uuid import uuid4

import pytest
from pydantic import ValidationError

from app.schemas.homework import HomeworkRead
from app.schemas.mood import MoodEntryCreate, MoodEntryRead, MoodStats
from app.schemas.subject import SubjectRead


def _build_subject() -> SubjectRead:
    now = datetime.now(timezone.utc)
    return SubjectRead(id=uuid4(), name="Biology", color="#00ff00", created_at=now, updated_at=now)


def _build_homework() -> HomeworkRead:
    now = datetime.now(timezone.utc)
    subject = _build_subject()
    return HomeworkRead(
        id=uuid4(),
        subject_id=subject.id,
        subject=subject,
        title="Read chapter",
        description="Chapter 3",
        deadline=date.today() + timedelta(days=2),
        is_completed=False,
        created_at=now,
        updated_at=now,
        steps=[],
    )


def test_mood_entry_create_accepts_valid_payload() -> None:
    payload = MoodEntryCreate(homework_id=uuid4(), mood="easy", note="Everything clear")

    assert payload.mood == "easy"


def test_mood_entry_create_rejects_invalid_mood() -> None:
    with pytest.raises(ValidationError):
        MoodEntryCreate(homework_id=uuid4(), mood="impossible", note=None)


def test_mood_entry_read_contains_nested_homework() -> None:
    now = datetime.now(timezone.utc)
    homework = _build_homework()
    mood_entry = MoodEntryRead(
        id=uuid4(),
        homework_id=homework.id,
        homework=homework,
        mood="hard",
        note=None,
        created_at=now,
    )

    assert mood_entry.homework.id == homework.id


def test_mood_stats_schema_counts() -> None:
    stats = MoodStats(easy_count=1, normal_count=2, hard_count=3)

    assert stats.model_dump() == {"easy_count": 1, "normal_count": 2, "hard_count": 3}
