from __future__ import annotations

import asyncio
from datetime import date, datetime, timedelta, timezone
from uuid import uuid4

import pytest
from fastapi import HTTPException

from app.crud import mood as mood_crud
from app.routers import mood as mood_router
from app.schemas.homework import HomeworkRead
from app.schemas.mood import MoodEntryCreate, MoodEntryRead, MoodStats
from app.schemas.subject import SubjectRead


def _build_subject() -> SubjectRead:
    now = datetime.now(timezone.utc)
    return SubjectRead(id=uuid4(), name="History", color="#123456", created_at=now, updated_at=now)


def _build_homework() -> HomeworkRead:
    now = datetime.now(timezone.utc)
    subject = _build_subject()
    return HomeworkRead(
        id=uuid4(),
        subject_id=subject.id,
        subject=subject,
        title="Essay",
        description="World war",
        deadline=date.today() + timedelta(days=1),
        is_completed=False,
        created_at=now,
        updated_at=now,
        steps=[],
    )


def _build_mood_entry() -> MoodEntryRead:
    now = datetime.now(timezone.utc)
    homework = _build_homework()
    return MoodEntryRead(
        id=uuid4(),
        homework_id=homework.id,
        homework=homework,
        mood="normal",
        note="ok",
        created_at=now,
    )


def test_create_mood_entry_returns_created_entity(monkeypatch: pytest.MonkeyPatch) -> None:
    payload = MoodEntryCreate(homework_id=uuid4(), mood="easy", note="simple")
    expected = _build_mood_entry()

    async def fake_create_mood_entry(db, obj_in):
        assert obj_in == payload
        return expected

    monkeypatch.setattr(mood_crud, "create_mood_entry", fake_create_mood_entry)

    result = asyncio.run(mood_router.create_mood_entry(payload, db=object()))

    assert result == expected


def test_create_mood_entry_raises_404_for_missing_homework(monkeypatch: pytest.MonkeyPatch) -> None:
    payload = MoodEntryCreate(homework_id=uuid4(), mood="normal", note=None)

    async def fake_create_mood_entry(db, obj_in):
        raise mood_crud.HomeworkNotFoundError

    monkeypatch.setattr(mood_crud, "create_mood_entry", fake_create_mood_entry)

    with pytest.raises(HTTPException) as exc:
        asyncio.run(mood_router.create_mood_entry(payload, db=object()))

    assert exc.value.status_code == 404


def test_list_mood_entries_passes_filters(monkeypatch: pytest.MonkeyPatch) -> None:
    expected = [_build_mood_entry()]
    date_from = date.today() - timedelta(days=1)
    date_to = date.today()
    subject_id = uuid4()

    async def fake_list_mood_entries(db, **filters):
        assert filters == {"date_from": date_from, "date_to": date_to, "subject_id": subject_id}
        return expected

    monkeypatch.setattr(mood_crud, "list_mood_entries", fake_list_mood_entries)

    result = asyncio.run(
        mood_router.list_mood_entries(
            date_from=date_from,
            date_to=date_to,
            subject_id=subject_id,
            db=object(),
        )
    )

    assert result == expected


def test_get_mood_stats_returns_stats(monkeypatch: pytest.MonkeyPatch) -> None:
    expected = MoodStats(easy_count=1, normal_count=4, hard_count=2)

    async def fake_get_mood_stats(db):
        return expected

    monkeypatch.setattr(mood_crud, "get_mood_stats", fake_get_mood_stats)

    result = asyncio.run(mood_router.get_mood_stats(db=object()))

    assert result == expected
