from __future__ import annotations

import asyncio
from datetime import date, datetime, timedelta, timezone
from uuid import uuid4

import pytest
from fastapi import HTTPException

from app.crud import reminder as reminder_crud
from app.routers import reminders as reminder_router
from app.schemas.homework import HomeworkRead
from app.schemas.reminder import ReminderCreate, ReminderRead, ReminderUpdate
from app.schemas.subject import SubjectRead


def _build_subject() -> SubjectRead:
    now = datetime.now(timezone.utc)
    return SubjectRead(id=uuid4(), name="Physics", color="#abc123", created_at=now, updated_at=now)


def _build_homework() -> HomeworkRead:
    now = datetime.now(timezone.utc)
    subject = _build_subject()
    return HomeworkRead(
        id=uuid4(),
        subject_id=subject.id,
        subject=subject,
        title="Lab",
        description="Prepare report",
        deadline=date.today() + timedelta(days=3),
        is_completed=False,
        created_at=now,
        updated_at=now,
        steps=[],
    )


def _build_reminder() -> ReminderRead:
    now = datetime.now(timezone.utc)
    hw = _build_homework()
    return ReminderRead(
        id=uuid4(),
        homework_id=hw.id,
        homework=hw,
        remind_at=now + timedelta(minutes=10),
        is_sent=False,
        created_at=now,
        updated_at=now,
    )


def test_create_reminder_returns_created_entity(monkeypatch: pytest.MonkeyPatch) -> None:
    payload = ReminderCreate(homework_id=uuid4(), remind_at=datetime.now(timezone.utc) + timedelta(hours=1))
    expected = _build_reminder()

    async def fake_create_reminder(db, obj_in):
        assert obj_in == payload
        return expected

    monkeypatch.setattr(reminder_crud, "create_reminder", fake_create_reminder)

    result = asyncio.run(reminder_router.create_reminder(payload, db=object()))

    assert result == expected


def test_create_reminder_raises_404_for_missing_homework(monkeypatch: pytest.MonkeyPatch) -> None:
    payload = ReminderCreate(homework_id=uuid4(), remind_at=datetime.now(timezone.utc) + timedelta(hours=1))

    async def fake_create_reminder(db, obj_in):
        raise reminder_crud.HomeworkNotFoundError

    monkeypatch.setattr(reminder_crud, "create_reminder", fake_create_reminder)

    with pytest.raises(HTTPException) as exc:
        asyncio.run(reminder_router.create_reminder(payload, db=object()))

    assert exc.value.status_code == 404


def test_list_reminders_returns_items(monkeypatch: pytest.MonkeyPatch) -> None:
    expected = [_build_reminder()]

    async def fake_list_reminders(db):
        return expected

    monkeypatch.setattr(reminder_crud, "list_reminders", fake_list_reminders)

    result = asyncio.run(reminder_router.list_reminders(db=object()))

    assert result == expected


def test_pending_reminders_returns_items(monkeypatch: pytest.MonkeyPatch) -> None:
    expected = [_build_reminder()]

    async def fake_list_pending_reminders(db):
        return expected

    monkeypatch.setattr(reminder_crud, "list_pending_reminders", fake_list_pending_reminders)

    result = asyncio.run(reminder_router.list_pending_reminders(db=object()))

    assert result == expected


def test_update_reminder_raises_404_when_not_found(monkeypatch: pytest.MonkeyPatch) -> None:
    payload = ReminderUpdate(remind_at=datetime.now(timezone.utc) + timedelta(days=1))

    async def fake_update_reminder(db, reminder_id, obj_in):
        return None

    monkeypatch.setattr(reminder_crud, "update_reminder", fake_update_reminder)

    with pytest.raises(HTTPException) as exc:
        asyncio.run(reminder_router.update_reminder(uuid4(), payload, db=object()))

    assert exc.value.status_code == 404


def test_delete_reminder_raises_404_when_not_found(monkeypatch: pytest.MonkeyPatch) -> None:
    async def fake_delete_reminder(db, reminder_id):
        return False

    monkeypatch.setattr(reminder_crud, "delete_reminder", fake_delete_reminder)

    with pytest.raises(HTTPException) as exc:
        asyncio.run(reminder_router.delete_reminder(uuid4(), db=object()))

    assert exc.value.status_code == 404


def test_mark_sent_raises_404_when_not_found(monkeypatch: pytest.MonkeyPatch) -> None:
    async def fake_mark_reminder_sent(db, reminder_id):
        return None

    monkeypatch.setattr(reminder_crud, "mark_reminder_sent", fake_mark_reminder_sent)

    with pytest.raises(HTTPException) as exc:
        asyncio.run(reminder_router.mark_reminder_sent(uuid4(), db=object()))

    assert exc.value.status_code == 404
