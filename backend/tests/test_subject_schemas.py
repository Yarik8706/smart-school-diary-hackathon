from datetime import datetime, timezone
from uuid import uuid4

import pytest
from pydantic import ValidationError

from app.schemas.subject import SubjectCreate, SubjectRead, SubjectUpdate


def test_subject_create_accepts_valid_payload() -> None:
    subject = SubjectCreate(name="Mathematics", color="#FFAA00")

    assert subject.name == "Mathematics"
    assert subject.color == "#FFAA00"


def test_subject_create_rejects_empty_name() -> None:
    with pytest.raises(ValidationError):
        SubjectCreate(name="   ", color="#FFAA00")


def test_subject_update_allows_partial_payload() -> None:
    subject = SubjectUpdate(color="#00AAFF")

    assert subject.name is None
    assert subject.color == "#00AAFF"


def test_subject_read_schema_serializes_expected_fields() -> None:
    now = datetime.now(timezone.utc)
    item_id = uuid4()
    subject = SubjectRead(
        id=item_id,
        name="Physics",
        color=None,
        created_at=now,
        updated_at=now,
    )

    assert subject.id == item_id
    assert subject.name == "Physics"
    assert subject.color is None
