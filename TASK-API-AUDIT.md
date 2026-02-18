# Задача: Аудит и исправление API-запросов (405 / 422)

## Контекст

Фронтенд отправляет запросы к бэкенду, но на большинство из них сервер возвращает **405 Method Not Allowed** или **422 Unprocessable Entity**. Причина — расхождения между тем, что фронтенд отправляет (URL-пути, HTTP-методы, имена полей, формат данных), и тем, что бэкенд реально принимает.

Ниже — полный результат аудита. **По каждому пункту нужно привести фронтенд в соответствие с бэкендом** (или наоборот — по согласованию), чтобы все запросы проходили без ошибок.

---

## 1. Schedule: неправильный URL-путь ⇒ 405

| | Фронтенд | Бэкенд |
|---|---|---|
| **Путь** | `/api/v1/schedule/slots` | `/api/v1/schedule` |
| **Файлы** | `frontend/store/schedule.ts` (строка 31), `frontend/store/dashboard.ts` (строка 98), `frontend/lib/mock-api-routes.ts` | `backend/app/routers/schedule.py` (строка 12) |

**Проблема:** Фронтенд добавляет `/slots` к пути, такого эндпоинта нет — сервер отвечает 405.

**Исправление:** Заменить `"/api/v1/schedule/slots"` → `"/api/v1/schedule"` в:
- `frontend/store/schedule.ts` — переменная `schedulePath`
- `frontend/store/dashboard.ts` — строка с `api.get<ScheduleSlot[]>`
- `frontend/lib/mock-api-routes.ts` — все вхождения `/schedule/slots`

---

## 2. Schedule: поле `classroom` vs `room` / `room_number` ⇒ 422

| | Фронтенд | Бэкенд |
|---|---|---|
| **Имя поля (создание)** | `classroom` | `room` (alias) или `room_number` |
| **Имя поля (ответ)** | `classroom` | `room_number` (serialization_alias) |
| **Файлы** | `frontend/types/schedule.ts` | `backend/app/schemas/schedule.py` |

**Проблема:** Фронтенд отправляет `{ classroom: "..." }`, бэкенд ожидает `room` или `room_number`. Pydantic отклоняет неизвестное поле.

**Исправление (один из вариантов):**
- **Вариант A (рекомендуется):** В `frontend/types/schedule.ts` заменить `classroom` на `room` в интерфейсах `ScheduleSlot`, `ScheduleSlotCreate`. В компонентах, использующих `classroom`, обновить на `room` или `room_number`.
- **Вариант B:** Добавить `classroom` в `AliasChoices` на бэкенде (менее предпочтительно).

---

## 3. Homework: поле `completed` vs `is_completed` ⇒ Данные не совпадают / 422

| | Фронтенд | Бэкенд |
|---|---|---|
| **Имя поля** | `completed` | `is_completed` |
| **Файлы** | `frontend/types/homework.ts` (строка 22, 38) | `backend/app/schemas/homework.py` (строки 39, 78) |

**Проблема:** 
- При чтении: бэкенд возвращает `is_completed`, фронтенд ожидает `completed` — поле всегда `undefined`.
- При обновлении (PUT): фронтенд отправляет `{ completed: true }`, Pydantic не знает это поле, валидация падает (422) или поле игнорируется.
- В `frontend/store/dashboard.ts` фильтрация `!item.completed` — всегда true, потому что `completed` не приходит.
- В `frontend/lib/mock-api-routes.ts` используется `completed` — мок работает, реальный API нет.

**Исправление:**
- В `frontend/types/homework.ts`: заменить `completed` → `is_completed` в `Homework` и `HomeworkUpdate`.
- В `frontend/store/dashboard.ts`: обновить фильтр `.filter((item) => !item.is_completed)`.
- В `frontend/lib/mock-api-routes.ts`: заменить `completed` → `is_completed`.

---

## 4. Homework: фильтры запроса не соответствуют Query-параметрам бэкенда ⇒ Фильтры не работают

| | Фронтенд отправляет | Бэкенд принимает |
|---|---|---|
| По предмету | `?subject=<id>` | `?subject_id=<uuid>` |
| По статусу | `?status=completed` / `?status=active` | `?is_completed=true` / `?is_completed=false` |
| По дедлайну | `?deadline=week` / `?deadline=month` | `?deadline_from=<date>&deadline_to=<date>` |

**Файлы:** `frontend/store/homework.ts` функция `makeQuery` (строки 38–46), `backend/app/routers/homework.py` (строки 28–43)

**Исправление:** Переписать `makeQuery` чтобы отправлять правильные параметры:
```typescript
const makeQuery = (filters?: HomeworkFiltersState) => {
  if (!filters) return "";
  const params = new URLSearchParams();
  if (filters.subject !== "all") params.set("subject_id", filters.subject);
  if (filters.status === "completed") params.set("is_completed", "true");
  if (filters.status === "active") params.set("is_completed", "false");
  if (filters.deadline === "week") {
    params.set("deadline_from", new Date().toISOString().split("T")[0]);
    const weekLater = new Date();
    weekLater.setDate(weekLater.getDate() + 7);
    params.set("deadline_to", weekLater.toISOString().split("T")[0]);
  }
  if (filters.deadline === "month") {
    params.set("deadline_from", new Date().toISOString().split("T")[0]);
    const monthLater = new Date();
    monthLater.setMonth(monthLater.getMonth() + 1);
    params.set("deadline_to", monthLater.toISOString().split("T")[0]);
  }
  const query = params.toString();
  return query ? `?${query}` : "";
};
```

---

## 5. Homework: фронтенд-тип `Homework` не имеет полей `subject`, `created_at`, `updated_at`

| | Фронтенд | Бэкенд |
|---|---|---|
| **Поля** | `id, subject_id, title, description, deadline, completed, steps` | `id, subject_id, subject, title, description, deadline, is_completed, created_at, updated_at, steps` |

**Файлы:** `frontend/types/homework.ts`, `backend/app/schemas/homework.py`

**Проблема:** Бэкенд всегда возвращает вложенный объект `subject` и timestamps, фронтенд их не типизирует — не критичная ошибка, но данные теряются.

**Исправление:** Добавить недостающие поля в тип `Homework`:
```typescript
export interface Homework {
  id: string;
  subject_id: string;
  subject: Subject;
  title: string;
  description?: string;
  deadline: string;
  is_completed: boolean;
  steps?: HomeworkStep[];
  created_at: string;
  updated_at: string;
}
```

---

## 6. Reminders: тип ответа не совпадает ⇒ данные не парсятся корректно

| | Фронтенд (`types/reminders.ts`) | Бэкенд (`schemas/reminder.py`) |
|---|---|---|
| `status: "pending" | "sent"` | `is_sent: bool` |
| Нет `homework` объекта | `homework: HomeworkRead` (вложенный) |
| `homework.subject: string` | Не существует — `subject` это объект внутри `homework.subject` |
| `homework.subject_color: string` | Не существует |
| `created_at`, `updated_at` | Есть в ответе, нет в типе |

**Проблема:** Фронтенд ожидает плоский `status: "pending"|"sent"`, бэкенд возвращает `is_sent: bool`. Также фронтенд ожидает `homework` как `{id, title, subject(string), subject_color}`, но бэкенд возвращает полный `HomeworkRead` с вложенным `SubjectRead`.

**Исправление:** Обновить `frontend/types/reminders.ts`:
```typescript
export interface Reminder {
  id: string;
  homework_id: string;
  homework: HomeworkRead; // вложенный объект из бэкенда
  remind_at: string;
  is_sent: boolean;
  created_at: string;
  updated_at: string;
}
```
И адаптировать компоненты, которые используют `reminder.status` → `reminder.is_sent`.

---

## 7. Reminders: `ReminderUpdate` отправляет `homework_id` и `status`, бэкенд принимает только `remind_at`

| | Фронтенд | Бэкенд |
|---|---|---|
| `ReminderUpdate` | `{ homework_id?, remind_at?, status? }` | `{ remind_at? }` |

**Файлы:** `frontend/types/reminders.ts`, `backend/app/schemas/reminder.py`

**Проблема:** Лишние поля `homework_id` и `status` отправляются на бэкенд. Pydantic V2 по умолчанию **запрещает** лишние поля → 422.

**Исправление:** Убрать `homework_id` и `status` из `ReminderUpdate` на фронтенде.

---

## 8. Analytics warnings: форма ответа не совпадает

| | Фронтенд | Бэкенд |
|---|---|---|
| **Ожидает** | `WarningItem[]` напрямую | `{ warnings: string[] }` (обёрнуто в `LoadWarningsResponse`) |
| **Тип элемента** | `{ id, day, message, recommendation }` | `string` |

**Файлы:** `frontend/store/analytics.ts` (строка 52), `frontend/store/dashboard.ts` (строка 100), `frontend/types/analytics.ts`, `backend/app/schemas/analytics.py`

**Проблема:** Фронтенд вызывает `api.get<WarningItem[]>("/api/v1/analytics/warnings")`, но бэкенд возвращает `{ warnings: ["строка1", "строка2"] }`. Две ошибки:
1. Ответ обёрнут в объект, а не массив.
2. Элементы — простые строки, а не объекты `{ id, day, message, recommendation }`.

**Исправление (согласовать один из вариантов):**
- **Вариант A (фронтенд под бэкенд):** Изменить запрос на `api.get<{ warnings: string[] }>()` и адаптировать `WarningItem` под `string`.
- **Вариант B (бэкенд под фронтенд):** Изменить `LoadWarningsResponse` и `load_analyzer` чтобы возвращать структурированные объекты.

---

## 9. Analytics: `WeekLoadDay` тип не совпадает

| | Фронтенд | Бэкенд |
|---|---|---|
| `WeekLoadDay` | `{ day: string, load: number }` | `DayLoadAnalysis { day: int, load_score: int, lessons_count: int, hard_subjects: string[], warning: string \| null }` |

**Файлы:** `frontend/types/analytics.ts`, `backend/app/schemas/analytics.py`

**Проблема:** Фронтенд ожидает `day` как строку и `load` как число, бэкенд возвращает `day` как `int` (0–6) и `load_score`.

**Исправление:** Обновить `frontend/types/analytics.ts`:
```typescript
export interface WeekLoadDay {
  day: number;
  load_score: number;
  lessons_count: number;
  hard_subjects: string[];
  warning: string | null;
}
```

---

## 10. Mood stats: имена полей не совпадают

| | Фронтенд | Бэкенд |
|---|---|---|
| `MoodStats` | `{ easy, normal, hard }` | `{ easy_count, normal_count, hard_count }` |

**Файлы:** `frontend/types/analytics.ts`, `backend/app/schemas/mood.py`

**Исправление:** Обновить `MoodStats` на фронтенде:
```typescript
export interface MoodStats {
  easy_count: number;
  normal_count: number;
  hard_count: number;
}
```

---

## 11. Materials: поля `id` и `thumbnail` не совпадают

| | Фронтенд | Бэкенд |
|---|---|---|
| `Material.id` | есть (обязательное) | **нет** такого поля |
| `Material.thumbnail` | `thumbnail?: string` | `thumbnail_url?: HttpUrl` |

**Файлы:** `frontend/types/materials.ts`, `backend/app/schemas/materials.py`

**Исправление:**
- Убрать `id` из фронтенд-типа (или добавить на бэкенде).
- Переименовать `thumbnail` → `thumbnail_url`.

---

## Сводная таблица приоритетов

| # | Проблема | Ошибка | Приоритет |
|---|---|---|---|
| 1 | Schedule: путь `/slots` | 405 | 🔴 Критический |
| 2 | Schedule: `classroom` vs `room` | 422 | 🔴 Критический |
| 3 | Homework: `completed` vs `is_completed` | 422 / потеря данных | 🔴 Критический |
| 4 | Homework: неправильные фильтры | Фильтры не работают | 🟡 Высокий |
| 5 | Homework: неполный тип ответа | Потеря данных | 🟡 Средний |
| 6 | Reminders: `status` vs `is_sent` + структура | Ошибки чтения | 🔴 Критический |
| 7 | Reminders: лишние поля в Update | 422 | 🔴 Критический |
| 8 | Warnings: массив vs объект + тип элемента | Ошибки чтения | 🔴 Критический |
| 9 | WeekLoadDay: тип полей | Потеря данных | 🟡 Средний |
| 10 | MoodStats: имена полей | Потеря данных | 🟡 Средний |
| 11 | Materials: `id` и `thumbnail` | Потеря данных | 🟡 Средний |

---

## Порядок выполнения

1. Начать с пунктов 1–3 (критические 405/422).
2. Затем пункты 6–8 (критические несоответствия формата).
3. Затем пункт 4 (фильтры).
4. Наконец пункты 5, 9–11 (согласование типов).

## Верификация

После каждого исправления:
1. Запустить бэкенд-тесты: `cd backend && python -m pytest tests/ -v`
2. Запустить фронтенд-тесты: `cd frontend && npx vitest run`
3. Запустить приложение локально и проверить через браузер, что запросы проходят без ошибок 405/422 (открыть DevTools → Network).
