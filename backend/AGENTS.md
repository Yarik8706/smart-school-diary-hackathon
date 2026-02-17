# AGENTS.md

ЭТО ПРАВИЛА ДЛЯ РАБОТЫ С BACKEND ЧАСТЬЮ ПРОЕКТА

Ты — эксперт по modern backend (FastAPI 0.100+, Python 3.11+, SQLAlchemy 2.0+, Pydantic V2, Alembic, PostgreSQL).

## Запреты

- Нет синхронных вызовов БД — только async/await с asyncpg.
- Нет ORM-запросов в route handlers — только через CRUD/Service слой.
- Нет неиспользуемого кода: удаляй мёртвые функции, импорты, models.
- Нет дублирования кода (>30 строк) — выноси в общие utils/services/базовые классы.
- Нет хардкода конфигов — только через environment variables и Pydantic Settings.

## Стек и стиль кода

- Python 3.11+, строгая типизация через type hints (mypy --strict).
- Async-first: все I/O операции (БД, внешние API) через async/await.
- Структура слоёв: **Routers → Services → CRUD → Models**.
- Pydantic V2 для всех schemas (BaseModel, ConfigDict, field validators).
- SQLAlchemy 2.0: declarative_base, async sessions, mapped_column.
- Каждый модуль — в отдельной директории: `routers/`, `schemas/`, `models/`, `crud/`, `services/`.
- Экспорт: явный import в `__init__.py` (если нужно).
- Обязательная обработка ошибок: HTTPException с правильными статус-кодами.
- Комментарии — только к сложной бизнес-логике.
- Файл — **не более 200 строк**. Дроби крупные модули.
- Цикломатическая сложность функции — **не более 10**.

## API дизайн

- RESTful endpoints: правильные HTTP методы (GET, POST, PUT, DELETE, PATCH).
- Консистентные схемы ответов: `{"success": bool, "data": ..., "error": ...}`.
- Версионирование API: `/api/v1/...`.
- Документация: FastAPI автогенерация + docstrings в endpoints.
- Валидация: Pydantic validators + Field constraints (min_length, max_length, ge, le).
- Информативные HTTPException с detail messages.

## Безопасность

- Input validation на уровне Pydantic schemas.
- SQL injection prevention: используй ORM параметризованные запросы.
- CORS настройки в production — строго указанные origins.
- Sensitive data (пароли, токены) — никогда в логах.
- Environment variables через pydantic-settings, НИКОГДА не коммить `.env`.

## База данных

- Alembic для всех миграций: `alembic revision --autogenerate -m "описание"`.
- Индексы на часто запрашиваемые поля.
- Foreign keys + ON DELETE каскады где уместно.
- Транзакции для связанных операций.
- Connection pooling: настрой через SQLAlchemy engine parameters.

## Валидация данных

- Строгая валидация на уровне Pydantic (Field, validators, model_validator).
- Информативные ValidationError messages.
- Проверка типов и constraints (email, UUID, datetime formats).
- Бизнес-логика валидации — в Service layer.

## Тестирование

- pytest + pytest-asyncio для async тестов.
- Минимум **1 интеграционный тест на каждый основной endpoint**.
- Используй test database (не production).
- Все тесты должны проходить.
- Моки для внешних API (Google API и др.).

## Documentation Management

- Веди файл `ARCHITECTURE.md` (не README.md).
- **Перед задачей** — прочитай его. **После задачи** — обнови.
- Разделы: `## Endpoints`, `## Models`, `## Services`, `## Data Flow`, `## Notes`.
- Содержание: описание новых/изменённых endpoints, моделей БД, зависимости, API contracts.
- Стиль: техническая документация, строго по факту.

## Приоритеты

1. Безопасность > скорость разработки
2. Чистота архитектуры > быстрые хаки
3. Производительность > лишние зависимости

## PR Guidelines

- Название: `[feat|fix|refactor]: кратко суть`
- В описании обязательна секция `What was changed`
