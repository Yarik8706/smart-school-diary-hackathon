from __future__ import annotations

import asyncio
from datetime import date, datetime, timedelta, timezone
from uuid import uuid4

import pytest
from fastapi import HTTPException

from app.crud import homework as homework_crud
from app.routers import homework as homework_router
from app.schemas.homework import HomeworkCreate, HomeworkRead, HomeworkUpdate
from app.schemas.subject import SubjectRead


def _build_subject() -> SubjectRead:
    now = datetime.now(timezone.utc)
    return SubjectRead(id=uuid4(), name="Math", color="#ffffff", created_at=now, updated_at=now)


def _build_homework() -> HomeworkRead:
    now = datetime.now(timezone.utc)
    subject = _build_subject()
    return HomeworkRead(
        id=uuid4(),
        subject_id=subject.id,
        subject=subject,
        title="Prepare report",
        description="With references",
        deadline=date.today() + timedelta(days=5),
        is_completed=False,
        created_at=now,
        updated_at=now,
        steps=[],
    )


def test_create_homework_returns_created_entity(monkeypatch: pytest.MonkeyPatch) -> None:
    payload = HomeworkCreate(
        subject_id=uuid4(),
        title="Read text",
        description=None,
        deadline=date.today() + timedelta(days=1),
    )
    expected = _build_homework()

    async def fake_create_homework(db, obj_in):
        assert obj_in == payload
        return expected

    monkeypatch.setattr(homework_crud, "create_homework", fake_create_homework)

    result = asyncio.run(homework_router.create_homework(payload, db=object()))

    assert result == expected


def test_list_homeworks_passes_filters(monkeypatch: pytest.MonkeyPatch) -> None:
    expected = [_build_homework()]
    subject_id = uuid4()
    deadline_from = date.today()
    deadline_to = date.today() + timedelta(days=7)

    async def fake_list_homeworks(db, **filters):
        assert filters == {
            "subject_id": subject_id,
            "is_completed": False,
            "deadline_from": deadline_from,
            "deadline_to": deadline_to,
        }
        return expected

    monkeypatch.setattr(homework_crud, "list_homeworks", fake_list_homeworks)

    result = asyncio.run(
        homework_router.list_homeworks(
            subject_id=subject_id,
            is_completed=False,
            deadline_from=deadline_from,
            deadline_to=deadline_to,
            db=object(),
        )
    )

    assert result == expected


def test_get_homework_raises_404_when_not_found(monkeypatch: pytest.MonkeyPatch) -> None:
    async def fake_get_homework(db, homework_id):
        return None

    monkeypatch.setattr(homework_crud, "get_homework", fake_get_homework)

    with pytest.raises(HTTPException) as exc:
        asyncio.run(homework_router.get_homework(uuid4(), db=object()))

    assert exc.value.status_code == 404


def test_update_homework_raises_404_when_not_found(monkeypatch: pytest.MonkeyPatch) -> None:
    payload = HomeworkUpdate(title="Updated")

    async def fake_update_homework(db, homework_id, obj_in):
        return None

    monkeypatch.setattr(homework_crud, "update_homework", fake_update_homework)

    with pytest.raises(HTTPException) as exc:
        asyncio.run(homework_router.update_homework(uuid4(), payload, db=object()))

    assert exc.value.status_code == 404


def test_delete_homework_raises_404_when_not_found(monkeypatch: pytest.MonkeyPatch) -> None:
    async def fake_delete_homework(db, homework_id):
        return False

    monkeypatch.setattr(homework_crud, "delete_homework", fake_delete_homework)

    with pytest.raises(HTTPException) as exc:
        asyncio.run(homework_router.delete_homework(uuid4(), db=object()))

    assert exc.value.status_code == 404


def test_complete_homework_raises_404_when_not_found(monkeypatch: pytest.MonkeyPatch) -> None:
    async def fake_mark_homework_completed(db, homework_id):
        return None

    monkeypatch.setattr(homework_crud, "mark_homework_completed", fake_mark_homework_completed)

    with pytest.raises(HTTPException) as exc:
        asyncio.run(homework_router.complete_homework(uuid4(), db=object()))

    assert exc.value.status_code == 404
