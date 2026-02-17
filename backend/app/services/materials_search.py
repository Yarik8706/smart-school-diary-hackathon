from __future__ import annotations

from collections.abc import Callable
from typing import Any

from starlette.concurrency import run_in_threadpool

from app.core.config import settings
from app.schemas.materials import MaterialSearchResult

_MAX_RESULTS = 5


class MaterialsProviderError(RuntimeError):
    """Ошибка при получении материалов из внешнего источника."""


def _get_api_key() -> str:
    return settings.youtube_api_key


def _build_youtube_client() -> Any:
    from googleapiclient.discovery import build

    return build("youtube", "v3", developerKey=_get_api_key())


def _compose_query(query: str, subject: str | None) -> str:
    if subject:
        return f"{subject.strip()} {query.strip()}".strip()
    return query.strip()


def _extract_results(response: dict[str, Any]) -> list[MaterialSearchResult]:
    items: list[MaterialSearchResult] = []
    for item in response.get("items", []):
        video_id = item.get("id", {}).get("videoId")
        snippet = item.get("snippet", {})
        if not video_id:
            continue

        thumbnails = snippet.get("thumbnails", {})
        thumbnail_url = (
            thumbnails.get("high", {}).get("url")
            or thumbnails.get("medium", {}).get("url")
            or thumbnails.get("default", {}).get("url")
        )
        items.append(
            MaterialSearchResult(
                title=snippet.get("title", "Без названия"),
                url=f"https://www.youtube.com/watch?v={video_id}",
                source="youtube",
                description=snippet.get("description"),
                thumbnail_url=thumbnail_url,
            )
        )

    return items[:_MAX_RESULTS]


def _request_youtube(client_factory: Callable[[], Any], q: str) -> dict[str, Any]:
    client = client_factory()
    return (
        client.search()
        .list(
            q=q,
            part="snippet",
            type="video",
            maxResults=10,
            order="relevance",
            safeSearch="moderate",
        )
        .execute()
    )


async def search_materials(*, query: str, subject: str | None = None) -> list[MaterialSearchResult]:
    api_key = _get_api_key()
    if not api_key:
        raise MaterialsProviderError("YOUTUBE_API_KEY is not configured")

    search_query = _compose_query(query, subject)
    try:
        payload = await run_in_threadpool(_request_youtube, _build_youtube_client, search_query)
    except Exception as exc:  # noqa: BLE001
        raise MaterialsProviderError("Failed to fetch materials from YouTube API") from exc

    return _extract_results(payload)
