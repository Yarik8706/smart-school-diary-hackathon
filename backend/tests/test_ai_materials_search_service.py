from __future__ import annotations

import asyncio

import pytest

from app.schemas.materials import AIMaterialsResponse, MaterialSearchResult
import app.services.ai_materials_search as ai_materials_search


def _material(url: str) -> MaterialSearchResult:
    return MaterialSearchResult(title=url, url=url, source="youtube")


def test_search_materials_with_ai_fallback_without_openrouter_key(monkeypatch: pytest.MonkeyPatch) -> None:
    expected = [_material("https://example.com/v1")]

    async def fake_youtube(*, query: str, subject: str | None = None):
        assert query == "дроби"
        assert subject == "Математика"
        return expected

    monkeypatch.setattr(ai_materials_search.settings, "openrouter_api_key", "")
    monkeypatch.setattr(ai_materials_search, "search_materials", fake_youtube)

    result = asyncio.run(
        ai_materials_search.search_materials_with_ai(
            title="дроби",
            description=None,
            subject="Математика",
        )
    )

    assert result == AIMaterialsResponse(materials=expected, recommendation="")


def test_finalize_ai_selection_picks_requested_urls() -> None:
    items = [
        _material("https://example.com/v1"),
        _material("https://example.com/a1"),
    ]

    result = ai_materials_search._finalize_materials(  # noqa: SLF001
        materials=items,
        selected_urls=["https://example.com/a1", "https://missing.local"],
        recommendation="Учить постепенно",
    )

    assert [str(item.url) for item in result.materials] == ["https://example.com/a1"]
    assert result.recommendation == "Учить постепенно"


def test_finalize_ai_selection_falls_back_to_first_five() -> None:
    items = [_material(f"https://example.com/{index}") for index in range(6)]

    result = ai_materials_search._finalize_materials(  # noqa: SLF001
        materials=items,
        selected_urls=[],
        recommendation="",
    )

    assert len(result.materials) == 5


def test_parse_final_payload_validates_format() -> None:
    payload = '{"selected_urls": ["https://example.com"], "recommendation": "ok"}'

    selected_urls, recommendation = ai_materials_search._parse_final_payload(payload)  # noqa: SLF001

    assert selected_urls == ["https://example.com"]
    assert recommendation == "ok"


def test_parse_final_payload_raises_error_on_invalid_json() -> None:
    with pytest.raises(ai_materials_search.AIMaterialsSearchError):
        ai_materials_search._parse_final_payload("not-json")  # noqa: SLF001
