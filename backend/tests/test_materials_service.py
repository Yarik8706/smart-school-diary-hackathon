from __future__ import annotations

import asyncio

import pytest

from app.schemas.materials import MaterialSearchResult
from app.services import materials_search


class _FakeListExecutor:
    def __init__(self, payload: dict):
        self.payload = payload

    def execute(self) -> dict:
        return self.payload


class _FakeSearchResource:
    def __init__(self, payload: dict):
        self.payload = payload
        self.kwargs: dict | None = None

    def list(self, **kwargs):
        self.kwargs = kwargs
        return _FakeListExecutor(self.payload)


class _FakeYoutubeClient:
    def __init__(self, payload: dict):
        self.search_resource = _FakeSearchResource(payload)

    def search(self):
        return self.search_resource


def test_search_materials_limits_results_and_combines_query(monkeypatch: pytest.MonkeyPatch) -> None:
    payload = {
        "items": [
            {
                "id": {"videoId": f"video-{idx}"},
                "snippet": {
                    "title": f"Title {idx}",
                    "description": "Description",
                    "thumbnails": {"high": {"url": f"https://img/{idx}.jpg"}},
                },
            }
            for idx in range(7)
        ]
    }
    fake_client = _FakeYoutubeClient(payload)

    monkeypatch.setattr(materials_search, "_build_youtube_client", lambda: fake_client)
    monkeypatch.setattr(materials_search, "_get_api_key", lambda: "token")

    result = asyncio.run(materials_search.search_materials(query="квадратные уравнения", subject="алгебра"))

    assert len(result) == 5
    assert all(isinstance(item, MaterialSearchResult) for item in result)
    assert fake_client.search_resource.kwargs is not None
    assert fake_client.search_resource.kwargs["q"] == "алгебра квадратные уравнения"


def test_search_materials_raises_provider_error_without_api_key(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(materials_search, "_get_api_key", lambda: "")

    with pytest.raises(materials_search.MaterialsProviderError):
        asyncio.run(materials_search.search_materials(query="дроби", subject=None))


def test_search_materials_raises_provider_error_on_external_failure(monkeypatch: pytest.MonkeyPatch) -> None:
    class _BrokenYoutubeClient:
        def search(self):
            raise RuntimeError("boom")

    monkeypatch.setattr(materials_search, "_build_youtube_client", lambda: _BrokenYoutubeClient())
    monkeypatch.setattr(materials_search, "_get_api_key", lambda: "token")

    with pytest.raises(materials_search.MaterialsProviderError):
        asyncio.run(materials_search.search_materials(query="дроби", subject=None))
