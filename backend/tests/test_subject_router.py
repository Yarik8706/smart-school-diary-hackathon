import asyncio
from datetime import datetime, timezone
from uuid import uuid4

import pytest
from fastapi import HTTPException

from app.crud import subject as subject_crud
from app.routers import subjects as subjects_router
from app.schemas.subject import SubjectCreate, SubjectRead, SubjectUpdate


def test_create_subject_returns_created_subject(monkeypatch: pytest.MonkeyPatch) -> None:
    payload = SubjectCreate(name="Math", color="#FFFFFF")
    expected = SubjectRead(
        id=uuid4(),
        name="Math",
        color="#FFFFFF",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )

    async def fake_create_subject(db, obj_in):
        assert obj_in == payload
        return expected

    monkeypatch.setattr(subject_crud, "create_subject", fake_create_subject)

    result = asyncio.run(subjects_router.create_subject(payload, db=object()))

    assert result == expected


def test_get_subject_raises_404_when_not_found(monkeypatch: pytest.MonkeyPatch) -> None:
    async def fake_get_subject(db, subject_id):
        return None

    monkeypatch.setattr(subject_crud, "get_subject", fake_get_subject)

    with pytest.raises(HTTPException) as exc:
        asyncio.run(subjects_router.get_subject(uuid4(), db=object()))

    assert exc.value.status_code == 404


def test_delete_subject_raises_404_when_not_found(monkeypatch: pytest.MonkeyPatch) -> None:
    async def fake_delete_subject(db, subject_id):
        return False

    monkeypatch.setattr(subject_crud, "delete_subject", fake_delete_subject)

    with pytest.raises(HTTPException) as exc:
        asyncio.run(subjects_router.delete_subject(uuid4(), db=object()))

    assert exc.value.status_code == 404


def test_update_subject_returns_updated_entity(monkeypatch: pytest.MonkeyPatch) -> None:
    subject_id = uuid4()
    payload = SubjectUpdate(name="History")
    expected = SubjectRead(
        id=subject_id,
        name="History",
        color="#111111",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )

    async def fake_update_subject(db, subject_id_arg, obj_in):
        assert subject_id_arg == subject_id
        assert obj_in == payload
        return expected

    monkeypatch.setattr(subject_crud, "update_subject", fake_update_subject)

    result = asyncio.run(subjects_router.update_subject(subject_id, payload, db=object()))

    assert result == expected
