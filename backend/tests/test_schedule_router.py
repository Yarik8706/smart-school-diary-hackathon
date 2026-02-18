import asyncio
from datetime import datetime, time, timezone
from uuid import uuid4

import pytest
from fastapi import HTTPException

from app.crud import schedule as schedule_crud
from app.routers import schedule as schedule_router
from app.schemas.schedule import ScheduleSlotCreate, ScheduleSlotRead, ScheduleSlotUpdate
from app.schemas.subject import SubjectRead


def _build_subject() -> SubjectRead:
    now = datetime.now(timezone.utc)
    return SubjectRead(id=uuid4(), name="Math", color="#fff000", created_at=now, updated_at=now)


def _build_slot(subject: SubjectRead | None = None) -> ScheduleSlotRead:
    now = datetime.now(timezone.utc)
    subject_obj = subject or _build_subject()
    return ScheduleSlotRead(
        id=uuid4(),
        subject_id=subject_obj.id,
        subject=subject_obj,
        day_of_week=1,
        start_time=time(8, 30),
        end_time=time(9, 15),
        room="101",
        created_at=now,
        updated_at=now,
    )


def test_list_schedule_supports_day_filter(monkeypatch: pytest.MonkeyPatch) -> None:
    expected = [_build_slot()]

    async def fake_list_schedule_slots(db, day_of_week=None):
        assert day_of_week == 1
        return expected

    monkeypatch.setattr(schedule_crud, "list_schedule_slots", fake_list_schedule_slots)

    result = asyncio.run(schedule_router.list_schedule_slots(day_of_week=1, db=object()))

    assert result == expected


def test_create_schedule_slot_returns_created_slot(monkeypatch: pytest.MonkeyPatch) -> None:
    payload = ScheduleSlotCreate(
        subject_id=uuid4(),
        day_of_week=0,
        start_time=time(9, 0),
        end_time=time(9, 45),
        room="202",
    )
    expected = _build_slot()

    async def fake_create_schedule_slot(db, obj_in):
        assert obj_in == payload
        return expected

    monkeypatch.setattr(schedule_crud, "create_schedule_slot", fake_create_schedule_slot)

    result = asyncio.run(schedule_router.create_schedule_slot(payload, db=object()))

    assert result == expected


def test_get_schedule_slot_raises_404_when_not_found(monkeypatch: pytest.MonkeyPatch) -> None:
    async def fake_get_schedule_slot(db, slot_id):
        return None

    monkeypatch.setattr(schedule_crud, "get_schedule_slot", fake_get_schedule_slot)

    with pytest.raises(HTTPException) as exc:
        asyncio.run(schedule_router.get_schedule_slot(uuid4(), db=object()))

    assert exc.value.status_code == 404


def test_update_schedule_slot_raises_404_when_not_found(monkeypatch: pytest.MonkeyPatch) -> None:
    payload = ScheduleSlotUpdate(room="303")

    async def fake_update_schedule_slot(db, slot_id, obj_in):
        return None

    monkeypatch.setattr(schedule_crud, "update_schedule_slot", fake_update_schedule_slot)

    with pytest.raises(HTTPException) as exc:
        asyncio.run(schedule_router.update_schedule_slot(uuid4(), payload, db=object()))

    assert exc.value.status_code == 404
