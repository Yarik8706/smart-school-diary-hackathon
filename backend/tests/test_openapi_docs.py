from __future__ import annotations

from app.main import app


REQUIRED_TAGS = {
    "subjects": "Операции с учебными предметами",
    "schedule": "Управление расписанием занятий",
    "homework": "Работа с домашними заданиями",
    "reminders": "Планирование напоминаний по дедлайнам",
    "mood": "Трекер сложности и настроения по заданиям",
    "analytics": "Аналитика учебной нагрузки",
    "materials": "Образовательные материалы и контент",
}


def test_swagger_ui_is_available_at_docs_route() -> None:
    assert app.docs_url == "/docs"


def test_openapi_info_contains_project_metadata() -> None:
    payload = app.openapi()

    assert payload["info"]["title"] == "Smart School Diary API"
    assert payload["info"]["description"] == "API для умного школьного дневника"
    assert payload["info"]["version"] == "1.0.0"


def test_openapi_contains_required_tag_definitions() -> None:
    payload = app.openapi()

    tags = {tag["name"]: tag.get("description") for tag in payload.get("tags", [])}

    assert tags == REQUIRED_TAGS


def test_all_feature_endpoints_are_grouped_by_expected_tags() -> None:
    payload = app.openapi()

    used_tags: set[str] = set()
    for methods in payload["paths"].values():
        for operation in methods.values():
            for tag in operation.get("tags", []):
                used_tags.add(tag)

    assert REQUIRED_TAGS.keys() <= used_tags


def test_feature_endpoints_have_human_readable_descriptions() -> None:
    payload = app.openapi()

    for path, methods in payload["paths"].items():
        for method, operation in methods.items():
            tags = set(operation.get("tags", []))
            if not (tags & set(REQUIRED_TAGS)):
                continue
            description = operation.get("description")
            assert description, f"{method.upper()} {path} does not contain description from docstring"


def test_create_schemas_include_examples_for_swagger() -> None:
    components = app.openapi()["components"]["schemas"]

    assert components["SubjectCreate"]["properties"]["name"]["example"] == "Математика"
    assert components["SubjectCreate"]["properties"]["color"]["example"] == "#FF5733"

    assert components["ScheduleSlotCreate"]["properties"]["day_of_week"]["example"] == 1
    assert components["HomeworkCreate"]["properties"]["title"]["example"] == "Решить задачи №1-10"
    assert components["ReminderCreate"]["properties"]["remind_at"]["example"] == "2026-02-01T18:00:00Z"
    assert components["MoodEntryCreate"]["properties"]["mood"]["example"] == "normal"
