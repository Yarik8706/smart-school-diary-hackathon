from __future__ import annotations

import pytest
from pydantic import ValidationError

from app.schemas.analytics import DayLoadAnalysis, WeekLoadAnalysis


def test_day_load_analysis_accepts_valid_payload() -> None:
    analysis = DayLoadAnalysis(
        day=2,
        load_score=9,
        lessons_count=5,
        hard_subjects=["Math", "Physics"],
        warning="Высокая нагрузка",
    )

    assert analysis.day == 2
    assert analysis.load_score == 9


def test_day_load_analysis_rejects_invalid_day() -> None:
    with pytest.raises(ValidationError):
        DayLoadAnalysis(day=7, load_score=3, lessons_count=3, hard_subjects=[], warning=None)


def test_week_load_analysis_wraps_days() -> None:
    week = WeekLoadAnalysis(days=[DayLoadAnalysis(day=0, load_score=1, lessons_count=1, hard_subjects=[], warning=None)])

    assert len(week.days) == 1
