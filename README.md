# Smart School Diary

## Название и краткое описание
**Smart School Diary** — это учебный планировщик с веб-интерфейсом и REST API для школьного дневника. Проект помогает вести предметы и расписание, отслеживать домашние задания, напоминания и субъективную сложность/настроение по заданиям, а также смотреть аналитику учебной нагрузки. В кодовой базе также есть модуль поиска учебных материалов. На практике это закрывает типичную проблему «разрозненных заметок» и собирает учебные задачи в едином рабочем контуре.

## Стек технологий
- **Backend:** Python, FastAPI, SQLAlchemy (async), Alembic, asyncpg, Uvicorn.
- **Frontend:** TypeScript, Next.js (App Router), React, Zustand, Tailwind CSS.
- **База данных:** PostgreSQL.
- **Инфраструктура:** Docker, Docker Compose.
- **Тестирование:** pytest (backend), Vitest и Playwright (frontend).

## Структура проекта
- `backend/` — серверная часть на FastAPI.
  - `app/main.py` — создание приложения, CORS, подключение общего роутера API.
  - `app/api/v1/` — сборка v1 API и health-check.
  - `app/routers/` — HTTP-роутеры предметов, расписания, ДЗ, напоминаний, настроения, аналитики, материалов.
  - `app/models/`, `app/schemas/`, `app/crud/`, `app/services/` — модели БД, схемы, операции доступа к данным и сервисная логика.
  - `alembic/` — миграции БД.
- `frontend/` — клиентская часть на Next.js.
  - `app/` — страницы (`/schedule`, `/homework`, `/reminders`, `/analytics`, `/materials`).
  - `components/` — UI-компоненты по доменам.
  - `lib/api-client.ts` и `lib/mock-api-client.ts` — работа с реальным и mock API.
- `docker-compose.yml` — запуск `postgres`, `backend`, `frontend` как отдельных сервисов.

## Установка и запуск
Минимальный вариант через Docker Compose:
1. Из корня проекта выполнить:
   ```bash
   docker compose up --build
   ```
2. После запуска сервисы доступны по адресам:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8000`

Для переменных окружения в проекте есть примеры:
- `backend/.env.example`
- `frontend/.env.example`

## Основные сущности / модули
Ядро backend строится вокруг доменных моделей:
- **Subject** — учебный предмет.
- **ScheduleSlot** — слот расписания (день недели, время, кабинет, предмет).
- **Homework** и **HomeworkStep** — задание и его шаги выполнения.
- **Reminder** — напоминание по домашнему заданию.
- **MoodEntry** — отметка сложности/настроения (уровни `easy/normal/hard`) с привязкой к дате и, опционально, к заданию.

## API / точки входа
Приложение подключает API с префиксом `/api`, а основные роутеры реализованы как:
- `/api/health`
- `/api/v1/subjects`
- `/api/v1/schedule`
- `/api/v1/homework`
- `/api/v1/reminders`
- `/api/v1/mood`
- `/api/v1/analytics` (в т.ч. `/load`, `/warnings`)
- `/api/v1/materials/search`
