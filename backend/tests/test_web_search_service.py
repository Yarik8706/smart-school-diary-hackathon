from __future__ import annotations

import asyncio

import pytest

from app.schemas.materials import MaterialSearchResult
import app.services.web_search as web_search


class _FakeDDGS:
    def __init__(self, payload: list[dict[str, str]]) -> None:
        self.payload = payload

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False

    def text(self, query: str, max_results: int) -> list[dict[str, str]]:
        assert query == "квадратные уравнения"
        assert max_results == 5
        return self.payload


def test_search_web_maps_results(monkeypatch: pytest.MonkeyPatch) -> None:
    payload = [
        {"title": "Статья", "href": "https://example.com/article", "body": "Описание"},
    ]
    monkeypatch.setattr(web_search, "_build_ddgs", lambda: _FakeDDGS(payload))

    result = asyncio.run(web_search.search_web("квадратные уравнения"))

    assert result == [
        MaterialSearchResult(
            title="Статья",
            url="https://example.com/article",
            source="article",
            description="Описание",
            thumbnail_url=None,
        )
    ]


def test_search_web_raises_provider_error(monkeypatch: pytest.MonkeyPatch) -> None:
    class _BrokenDDGS:
        def text(self, query: str, max_results: int):
            raise RuntimeError("boom")

    monkeypatch.setattr(web_search, "_build_ddgs", lambda: _BrokenDDGS())

    with pytest.raises(web_search.WebSearchProviderError):
        asyncio.run(web_search.search_web("квадратные уравнения"))
