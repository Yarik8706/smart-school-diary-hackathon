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
