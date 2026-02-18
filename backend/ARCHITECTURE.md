## Endpoints
- API namespace: `/api/v1/...`.
- Health endpoint: `/api/v1/health`.
- Subjects: CRUD endpoints under `/api/v1/subjects`.
- Schedule: CRUD endpoints under `/api/v1/schedule`.
- Homework: CRUD + completion and materials under `/api/v1/homework`.
- Reminders: CRUD + pending/sent actions under `/api/v1/reminders`.
- Mood: create/read/statistics endpoints under `/api/v1/mood`.
- Analytics: workload and warnings under `/api/v1/analytics`.
- Materials: search endpoint under `/api/v1/materials`.

## Models
- `Subject` — учебный предмет.
- `ScheduleSlot` — слот расписания с привязкой к предмету.
- `Homework` — домашнее задание с дедлайном и статусом выполнения.
- `HomeworkStep` — шаги выполнения для задания.
- `Reminder` — напоминание по заданию.
- `MoodEntry` — оценка сложности и настроения по заданию.

## Services
- `load_analyzer` — расчёт нагрузки по дням/неделе и предупреждений перегрузки.
- `materials_search` — интеграция с YouTube API для поиска учебных материалов.

## Data Flow
- Request проходит через `routers`.
- Роутер делегирует бизнес-логику в `services` или операции данных в `crud`.
- `crud` слой работает с SQLAlchemy async models через `AsyncSession`.
- Ответ сериализуется через Pydantic V2 схемы в `schemas`.

## Notes
- Конфигурация читается через `pydantic-settings` из переменных окружения.
- YouTube API key должен передаваться через `YOUTUBE_API_KEY` в окружении.
- Файл `.env` не хранится в репозитории; используется `.env.example` как шаблон.


## Notes (2026-02-18 smart planning)

## Endpoints
- `POST /api/v1/homework/{homework_id}/generate-steps` — вызывает AI-генерацию, удаляет старые шаги задания, сохраняет новый набор, возвращает `{steps, count}`.
- `PATCH /api/v1/homework/steps/{step_id}/toggle` — переключает `is_completed` для одного шага.

## Services
- `smart_planner` — интеграция с OpenRouter (`google/gemini-2.5-flash`) через `AsyncOpenAI`, структурированный JSON-ответ по схеме `steps[]`, единый тип ошибки `PlannerServiceError`.

## Data Flow
1. Homework router получает задание по `homework_id` через CRUD.
2. `smart_planner_service.generate_steps(...)` формирует промпт и вызывает OpenRouter с `json_schema` форматом.
3. Router удаляет старые шаги (`delete_steps_by_homework`) и массово сохраняет новые (`create_steps_batch`).
4. UI может переключать конкретный шаг через `toggle_step`.

## Notes
- Для AI-функции требуется `OPENROUTER_API_KEY` (настраивается через `Settings.openrouter_api_key`).
- Добавлена зависимость `openai` в `requirements.txt` для OpenRouter-клиента.


## Notes (2026-02-18 ai materials search)

## Endpoints
- `GET /api/v1/materials/search` теперь возвращает `AIMaterialsResponse` (`materials[]` + `recommendation`) и сначала использует AI-подбор, затем fallback в YouTube.
- `GET /api/v1/homework/{id}/materials` теперь возвращает `AIMaterialsResponse` и использует тот же AI+fallback поток.

## Services
- `ai_materials_search` добавляет ReAct-цикл через OpenRouter (`google/gemini-2.5-flash`) c tool calling для `search_youtube` и `search_web`.
- `web_search` добавляет DuckDuckGo-поиск (`duckduckgo-search`) и нормализацию результатов в `MaterialSearchResult`.

## Data Flow
1. Router получает тему/контекст задания.
2. `search_materials_with_ai(...)` запускает до 5 итераций tool-calling (YouTube и web).
3. AI делает финальную JSON-селекцию ссылок и рекомендацию.
4. При отсутствии ключа OpenRouter или ошибке AI выполняется fallback на обычный YouTube-поиск.

## Notes
- Добавлена схема `AIMaterialsResponse` в `schemas/materials.py`.
- Для web-поиска добавлена зависимость `duckduckgo-search`.
