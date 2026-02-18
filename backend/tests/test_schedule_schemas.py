from datetime import time
from uuid import uuid4

import pytest
from pydantic import ValidationError

from app.schemas.schedule import ScheduleSlotCreate, ScheduleSlotUpdate


def test_schedule_slot_create_accepts_valid_payload() -> None:
    payload = ScheduleSlotCreate(
        subject_id=uuid4(),
        day_of_week=2,
        start_time=time(9, 0),
        end_time=time(9, 45),
        room="101A",
    )

    assert payload.day_of_week == 2
    assert payload.room == "101A"


@pytest.mark.parametrize("day_of_week", [-1, 7])
def test_schedule_slot_create_rejects_invalid_day(day_of_week: int) -> None:
    with pytest.raises(ValidationError):
        ScheduleSlotCreate(
            subject_id=uuid4(),
            day_of_week=day_of_week,
            start_time=time(9, 0),
            end_time=time(9, 45),
            room="101A",
        )


def test_schedule_slot_create_rejects_invalid_time_range() -> None:
    with pytest.raises(ValidationError):
        ScheduleSlotCreate(
            subject_id=uuid4(),
            day_of_week=1,
            start_time=time(10, 0),
            end_time=time(9, 45),
            room="101A",
        )


def test_schedule_slot_update_supports_partial_update() -> None:
    payload = ScheduleSlotUpdate(room="205B")

    assert payload.room == "205B"
