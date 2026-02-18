from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from uuid import uuid4

import pytest
from fastapi import HTTPException

from app.crud import homework as homework_crud
from app.routers import homework as homework_router
from app.routers import materials as materials_router
from app.schemas.homework import HomeworkRead
from app.schemas.materials import AIMaterialsResponse, MaterialSearchResult
from app.schemas.subject import SubjectRead
import app.services.ai_materials_search as ai_materials_search


def _build_homework() -> HomeworkRead:
    now = datetime.now(timezone.utc)
    subject = SubjectRead(id=uuid4(), name="Алгебра", color="#fff", created_at=now, updated_at=now)
    return HomeworkRead(
        id=uuid4(),
        subject_id=subject.id,
        subject=subject,
        title="Квадратные уравнения",
        description="Решить задания",
        deadline=now.date(),
        is_completed=False,
        created_at=now,
        updated_at=now,
        steps=[],
    )


def _result(title: str) -> MaterialSearchResult:
    return MaterialSearchResult(
        title=title,
        url=f"https://example.com/{title}",
        source="youtube",
        description="desc",
        thumbnail_url=None,
    )


def _ai_response() -> AIMaterialsResponse:
    return AIMaterialsResponse(materials=[_result("video-1")], recommendation="Смотри каждый день")


def test_search_materials_calls_ai_service_with_subject_and_query(monkeypatch: pytest.MonkeyPatch) -> None:
    expected = _ai_response()

    async def fake_search(*, title: str, description: str | None, subject: str | None):
        assert title == "дроби"
        assert description is None
        assert subject == "Математика"
        return expected

    monkeypatch.setattr(materials_router, "search_materials_with_ai", fake_search)

    result = asyncio.run(materials_router.search_materials(query="дроби", subject="Математика"))

    assert result == expected


def test_search_materials_rejects_empty_query() -> None:
    with pytest.raises(HTTPException) as exc:
        asyncio.run(materials_router.search_materials(query="   ", subject="Math"))

    assert exc.value.status_code == 400


def test_search_materials_falls_back_on_ai_error(monkeypatch: pytest.MonkeyPatch) -> None:
    expected = [_result("video-1")]

    async def fake_ai(*, title: str, description: str | None, subject: str | None):
        raise ai_materials_search.AIMaterialsSearchError("unavailable")

    async def fake_default(*, query: str, subject: str | None):
        return expected

    monkeypatch.setattr(materials_router, "search_materials_with_ai", fake_ai)
    monkeypatch.setattr(materials_router, "search_materials_service", fake_default)

    result = asyncio.run(materials_router.search_materials(query="дроби", subject=None))

    assert result.materials == expected
    assert result.recommendation == ""


def test_get_homework_materials_builds_query_from_homework(monkeypatch: pytest.MonkeyPatch) -> None:
    homework = _build_homework()
    expected = _ai_response()

    async def fake_get_homework(db, homework_id):
        assert homework_id == homework.id
        return homework

    async def fake_search(*, title: str, description: str | None, subject: str | None):
        assert title == "Квадратные уравнения"
        assert description == "Решить задания"
        assert subject == "Алгебра"
        return expected

    monkeypatch.setattr(homework_crud, "get_homework", fake_get_homework)
    monkeypatch.setattr(homework_router, "search_materials_with_ai", fake_search)

    result = asyncio.run(homework_router.get_homework_materials(homework.id, db=object()))

    assert result == expected


def test_get_homework_materials_raises_404(monkeypatch: pytest.MonkeyPatch) -> None:
    async def fake_get_homework(db, homework_id):
        return None

    monkeypatch.setattr(homework_crud, "get_homework", fake_get_homework)

    with pytest.raises(HTTPException) as exc:
        asyncio.run(homework_router.get_homework_materials(uuid4(), db=object()))

    assert exc.value.status_code == 404


def test_get_homework_materials_fallback_on_ai_error(monkeypatch: pytest.MonkeyPatch) -> None:
    homework = _build_homework()
    expected = [_result("video-1"), _result("video-2")]

    async def fake_get_homework(db, homework_id):
        return homework

    async def fake_ai(*, title: str, description: str | None, subject: str | None):
        raise ai_materials_search.AIMaterialsSearchError("unavailable")

    async def fake_fallback(*, query: str, subject: str | None):
        assert query == homework.title
        assert subject == "Алгебра"
        return expected

    monkeypatch.setattr(homework_crud, "get_homework", fake_get_homework)
    monkeypatch.setattr(homework_router, "search_materials_with_ai", fake_ai)
    monkeypatch.setattr(homework_router, "search_materials", fake_fallback)

    result = asyncio.run(homework_router.get_homework_materials(homework.id, db=object()))

    assert result.materials == expected
    assert result.recommendation == ""
