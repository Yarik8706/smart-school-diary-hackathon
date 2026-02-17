from __future__ import annotations

import asyncio

from app.routers import analytics as analytics_router
from app.schemas.analytics import DayLoadAnalysis, WeekLoadAnalysis
from app.services import load_analyzer


def test_get_week_load_returns_service_result(monkeypatch) -> None:
    expected = WeekLoadAnalysis(days=[DayLoadAnalysis(day=0, load_score=1, lessons_count=1, hard_subjects=[], warning=None)])

    async def fake_analyze_week_load(db):
        return expected

    monkeypatch.setattr(load_analyzer, "analyze_week_load", fake_analyze_week_load)

    result = asyncio.run(analytics_router.get_week_load(db=object()))

    assert result == expected


def test_get_day_load_calls_service_with_day(monkeypatch) -> None:
    expected = DayLoadAnalysis(day=2, load_score=8, lessons_count=4, hard_subjects=["Math"], warning="Высокая нагрузка")

    async def fake_analyze_day_load(db, day):
        assert day == 2
        return expected

    monkeypatch.setattr(load_analyzer, "analyze_day_load", fake_analyze_day_load)

    result = asyncio.run(analytics_router.get_day_load(day=2, db=object()))

    assert result == expected


def test_get_warnings_returns_list(monkeypatch) -> None:
    expected = ["Во вторник высокая нагрузка"]

    async def fake_get_warnings(db):
        return expected

    monkeypatch.setattr(load_analyzer, "get_overload_warnings", fake_get_warnings)

    result = asyncio.run(analytics_router.get_warnings(db=object()))

    assert result.warnings == expected
