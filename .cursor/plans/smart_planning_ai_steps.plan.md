---
name: Smart Planning AI Steps
overview: Implement AI-powered homework step generation using Gemini via OpenRouter with structured JSON output. The backend service sends homework details to Gemini, receives structured steps, and saves them to the existing HomeworkStep model. The frontend gets a button to trigger generation and interactive step management.
todos:
  - id: deps-config
    content: Add `openai` to requirements.txt and `openrouter_api_key` to Settings in config.py
    status: pending
  - id: smart-planner-service
    content: Create `backend/app/services/smart_planner.py` with Gemini structured output via OpenRouter
    status: pending
  - id: step-crud
    content: Create `backend/app/crud/homework_step.py` with batch create, delete, toggle operations
    status: pending
  - id: step-schemas
    content: Add HomeworkStepCreate and GenerateStepsResponse schemas
    status: pending
  - id: step-endpoints
    content: Add generate-steps and toggle-step endpoints to homework router
    status: pending
  - id: frontend-store
    content: Add generateSteps and toggleStep actions to homework Zustand store
    status: pending
  - id: frontend-ui
    content: Update HomeworkCard with generate button, step checklist, and loading state
    status: pending
  - id: architecture-docs
    content: Update ARCHITECTURE.md for both backend and frontend
    status: pending
isProject: false
---

# Smart Planning: AI-разбиение задач на шаги

## Текущее состояние

Модель `HomeworkStep` и схема `HomeworkStepRead` уже существуют, `HomeworkRead` уже возвращает `steps`. Но нет:

- Сервиса для генерации шагов через AI
- CRUD-операций для создания/управления шагами
- Эндпоинтов для генерации и управления шагами
- UI для запуска генерации и интерактивной работы со степами

## Архитектура решения

```mermaid
sequenceDiagram
    participant User as Frontend
    participant Router as HomeworkRouter
    participant Service as SmartPlannerService
    participant OpenRouter as "OpenRouter (Gemini)"
    participant CRUD as HomeworkStepCRUD
    participant DB as PostgreSQL

    User->>Router: POST /homework/{id}/generate-steps
    Router->>CRUD: get_homework(id)
    CRUD->>DB: SELECT homework
    DB-->>CRUD: homework data
    Router->>Service: generate_steps(homework)
    Service->>OpenRouter: chat.completions.create (json_schema)
    OpenRouter-->>Service: structured JSON [{title, order}]
    Service-->>Router: list[StepData]
    Router->>CRUD: create_steps_batch(homework_id, steps)
    CRUD->>DB: INSERT homework_steps
    DB-->>CRUD: created steps
    Router-->>User: HomeworkRead (with steps)
```



## Backend

### 1. Зависимости и конфигурация

- Добавить `openai` в [requirements.txt](backend/requirements.txt)
- Добавить `openrouter_api_key: str = ""` в `Settings` в [backend/app/core/config.py](backend/app/core/config.py)

### 2. Сервис AI-генерации: `backend/app/services/smart_planner.py`

Новый сервис, использующий OpenAI-совместимый клиент через OpenRouter:

- Инициализация `OpenAI(base_url="https://openrouter.ai/api/v1", api_key=settings.openrouter_api_key)`
- Модель: `google/gemini-2.5-flash` (дешевая и быстрая)
- Метод `generate_steps(title, description, subject_name, deadline)` -> `list[StepData]`
- Structured output через `response_format` с `json_schema`:

```python
response_format = {
    "type": "json_schema",
    "json_schema": {
        "name": "homework_steps",
        "strict": True,
        "schema": {
            "type": "object",
            "properties": {
                "steps": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "title": {"type": "string"},
                            "order": {"type": "integer"}
                        },
                        "required": ["title", "order"],
                        "additionalProperties": False
                    }
                }
            },
            "required": ["steps"],
            "additionalProperties": False
        }
    }
}
```

- System prompt на русском: роль = помощник ученику, разбить задачу на 3-7 конкретных шагов, шаги должны быть понятны школьнику
- User message включает: предмет, заголовок, описание, дедлайн
- Обработка ошибок: кастомное исключение `PlannerServiceError`

### 3. CRUD для шагов: `backend/app/crud/homework_step.py`

- `create_steps_batch(db, homework_id, steps: list[StepData])` -- массовая вставка шагов
- `delete_steps_by_homework(db, homework_id)` -- удаление всех шагов задания (перед перегенерацией)
- `toggle_step(db, step_id)` -- переключение `is_completed` у конкретного шага

### 4. Схемы: расширить [backend/app/schemas/homework.py](backend/app/schemas/homework.py)

- `HomeworkStepCreate(BaseModel)`: `title: str`, `order: int`
- `GenerateStepsResponse(BaseModel)`: `steps: list[HomeworkStepRead]`, `count: int`

### 5. Эндпоинты: расширить [backend/app/routers/homework.py](backend/app/routers/homework.py)

- `POST /api/v1/homework/{homework_id}/generate-steps` -- вызывает AI, удаляет старые шаги (если есть), сохраняет новые, возвращает обновленный `HomeworkRead`
- `PATCH /api/v1/homework/{homework_id}/steps/{step_id}/toggle` -- переключает выполнение шага, возвращает `HomeworkRead`

## Frontend

### 6. Типы: обновить [frontend/types/homework.ts](frontend/types/homework.ts)

Тип `HomeworkStep` уже существует с полями `id`, `title`, `done`. Нужно убедиться, что маппинг `is_completed` -> `done` происходит корректно (возможно через алиас или трансформацию). Также проверить что `order` присутствует.

### 7. Store: обновить [frontend/store/homework.ts](frontend/store/homework.ts)

Добавить действия:

- `generateSteps(homeworkId: string)` -- POST к `/api/v1/homework/{id}/generate-steps`
- `toggleStep(homeworkId: string, stepId: string)` -- PATCH к `/api/v1/homework/{id}/steps/{stepId}/toggle`

### 8. UI: обновить [frontend/components/homework/homework-card.tsx](frontend/components/homework/homework-card.tsx)

- Добавить кнопку "Разбить на шаги" (с иконкой `IconListCheck` или `IconWand`) -- вызывает `generateSteps`
- Показывать loading-состояние при генерации
- Рендерить шаги как чеклист с чекбоксами, клик по чекбоксу -- `toggleStep`
- Если шаги уже есть, кнопка меняется на "Перегенерировать шаги"

## Ключевые решения

- **Модель Gemini**: `google/gemini-2.5-flash` -- баланс скорости и качества, дешевая
- **Structured output**: `json_schema` с `strict: True` гарантирует валидный JSON нужной структуры
- **Перегенерация**: при повторном вызове старые шаги удаляются и заменяются новыми
- **Количество шагов**: 3-7 шагов -- задается через system prompt

