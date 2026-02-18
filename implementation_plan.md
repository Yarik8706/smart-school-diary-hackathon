# Исправление 5 багов: кабинет, удаление предметов, напоминания, z-index, 502

## Описание
Пять пользовательских проблем, связанных с расписанием, напоминаниями, уведомлениями и генерацией шагов.

---

## 1. Поле кабинета пустое при редактировании и не сохраняется

**Корневая причина:** Бэкенд-схема `ScheduleSlotRead` сериализует поле `room` под именем `room_number` (`serialization_alias="room_number"`). Фронтенд тип `ScheduleSlot` читает `room` — при преобразовании JSON → объект поле `room` остаётся `undefined`, потому что в JSON оно приходит как `room_number`.

### Предлагаемые изменения

#### [schedule.py](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/backend/app/schemas/schedule.py)
- Убрать `serialization_alias` в `ScheduleSlotRead` и `ScheduleSlotBase` — пусть поле сериализуется просто как `room` (совпадает с именем колонки в БД и с фронтендом).
- Упростить: `room: str | None = Field(default=None)` без алиасов (или оставить `validation_alias` для обратной совместимости).

#### [schedule.py](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/backend/app/crud/schedule.py)
- В `create_schedule_slot`: `obj_in.room_number` → `obj_in.room` (соответственно новому имени).
- В `update_schedule_slot`: аналогично — убрать маппинг `room_number` → `room`.

#### [test_schedule_schemas.py](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/backend/tests/test_schedule_schemas.py)
- Обновить тесты: использовать `room` вместо `room_number`.

---

## 2. Кнопку «Удалить предмет» перенести в модальное окно редактирования урока

**Текущее состояние:** Кнопка удаления предмета есть в `subject-manager.tsx` (управление предметами). Пользователь хочет также иметь возможность удалить предмет из модалки **редактирования урока** (`schedule-form.tsx`).

### Предлагаемые изменения

#### [schedule-form.tsx](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/components/schedule/schedule-form.tsx)
- Добавить проп `onDeleteSubject?: (id: string) => Promise<void>`.
- В режиме редактирования (`initialSlot` !== undefined) рядом с выпадающим списком предмета добавить кнопку «Удалить предмет» с подтверждением (`window.confirm`).

#### [schedule-page-client.tsx](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/components/schedule/schedule-page-client.tsx)
- Передать `onDeleteSubject={deleteSubject}` в `<ScheduleForm>`.

#### [subject-manager.tsx](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/components/schedule/subject-manager.tsx)
- Кнопку «Удалить» **оставить** (в управлении предметами она тоже нужна).

---

## 3. Напоминания: отдельные поля для даты и времени + исправить краш

### 3a. Отдельные поля вместо `datetime-local`

#### [reminder-edit-modal.tsx](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/components/reminders/reminder-edit-modal.tsx)
- Заменить один `<input type="datetime-local">` на два инпута:
  - `<input type="date">` для даты
  - `<input type="time">` для времени
- При сабмите комбинировать: `new Date(\`${dateValue}T${timeValue}\`).toISOString()`.
- В `toInputValue()` разбить ISO‑строку на `dateValue` и `timeValue`.

### 3b. Краш при добавлении напоминания

**Вероятные причины:** 
1. Бэкенд возвращает `ReminderRead` с вложенным полным `HomeworkRead` и `is_sent: bool`, а фронтенд тип `Reminder` ожидает плоский `status: "pending"|"sent"` и упрощённый `Homework { id, title, subject, subject_color }`.
2. Фронтенд `reminders-page-client.tsx` (строка 40) делает `homework.find(...)` на массиве `Homework` из store, но store возвращает `Homework` из `types/reminders.ts` (упрощённый), а бэкенд отдаёт `HomeworkRead` (полный).

#### [reminders.ts](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/types/reminders.ts)
- Обновить `Reminder`:
  - `status` → `is_sent: boolean`
  - Добавить `homework: object` (вложенный, от бэкенда)
  - Добавить `created_at`, `updated_at`
- Обновить `Homework` — добавить подтип с `subject: { name, color }`.
- Обновить `ReminderUpdate` — убрать `homework_id` и `status` (бэкенд принимает только `remind_at`).

#### [reminder-card.tsx](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/components/reminders/reminder-card.tsx)
- Уже использует `is_sent` (строка 54) — проверить что все обращения корректны.
- Обращения к `reminder.homework?.subject` и `subject_color` — адаптировать к вложенному `homework.subject.name` и `homework.subject.color`.

#### [reminders-page-client.tsx](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/components/reminders/reminders-page-client.tsx)
- Бэкенд `GET /api/v1/reminders` уже возвращает `homework` вложенным — адаптировать маппинг `reminderViews` чтобы не делать повторный join, а использовать `reminder.homework` напрямую.

---

## 4. Меню уведомлений скрывается за секцией

**Корневая причина:** В `app-shell.tsx` (строка 55) блок контента имеет класс `bg-background rounded-3xl border p-4` — он отображается **после** header-а в DOM и визуально перекрывает выпадающее меню уведомлений, несмотря на `z-50`.

### Предлагаемые изменения

#### [header.tsx](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/components/layout/header.tsx)
- Увеличить `z-index` header-а: `z-30` → `z-40` чтобы он гарантированно был выше контент-секции.

#### [notification-bell.tsx](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/components/layout/notification-bell.tsx) 
- Оставить `z-50` на обёртке и dropdown — этого должно хватить если header имеет `z-40`.

> [!NOTE]
> Если проблема остаётся — альтернатива: разместить dropdown через портал (`createPortal`) вне stacking context, но для начала попробуем z-index fix.

---

## 5. 502 при генерации шагов (POST `/api/v1/homework/{id}/generate-steps`)

Бэкенд роутер ловит `PlannerServiceError` и возвращает 502. Служба `smart_planner.py` оборачивает любое исключение OpenRouter API в `PlannerServiceError`.

### Диагностика

**Шаг 1:** Добавить логирование ошибки в `smart_planner.py` чтобы видеть точную причину:

```python
except Exception as exc:
    import logging
    logging.getLogger(__name__).error("Smart planner failed: %s", exc, exc_info=True)
    raise PlannerServiceError("Failed to request smart planning provider") from exc
```

**Шаг 2:** Проверить, что модель `google/gemini-2.5-flash` доступна через OpenRouter (модель может быть недоступна или не поддерживать `json_schema` response_format).

**Шаг 3:** Если модель не поддерживает `json_schema` — использовать `response_format={"type": "json_object"}` вместо `json_schema` и парсить JSON ответ вручную (что уже делается).

### Предлагаемые изменения

#### [smart_planner.py](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/backend/app/services/smart_planner.py)
- Добавить `import logging` и `logger = logging.getLogger(__name__)`.
- Логировать ошибку **перед** выбросом `PlannerServiceError`.
- Заменить `response_format` с `json_schema` на `json_object` (более совместимый формат, поддерживается большинством моделей OpenRouter).

---

## User Review Required

> [!IMPORTANT]
> **Пункт 2:** Кнопку удаления **предмета** в модалке редактирования **урока** — подтвердите, что нужна именно кнопка удаления предмета, а не удаления слота урока (которая уже есть на карточке слота).

> [!WARNING]
> **Пункт 5 (502):** Без запуска сервера и реального вызова API точно определить причину сложно. Основной фикс — добавить логгирование и сменить `json_schema` → `json_object`. После этого нужно **пересобрать контейнер** и проверить. Можете ли вы подтвердить, что Docker-контейнер бэкенда работает и логи доступны?

---

## Verification Plan

### Существующие тесты

Бэкенд-тесты (pytest, без БД — через monkeypatch):
```bash
cd backend && python -m pytest tests/ -v
```
Релевантные файлы:
- `tests/test_schedule_schemas.py` — обновим под новое имя поля `room`
- `tests/test_schedule_router.py` — проверяет CRUD
- `tests/test_reminder_router.py`, `tests/test_reminder_schemas.py` — напоминания

### Ручная проверка

**После всех исправлений:**
1. Открыть приложение в браузере (`http://localhost:3000`)
2. **Расписание → Кабинет:** Создать урок с кабинетом → нажать «Редактировать» → убедиться что поле кабинета заполнено → изменить → сохранить → убедиться что сохранилось
3. **Расписание → Удаление предмета:** Нажать «Редактировать» на уроке → найти кнопку удаления предмета → удалить
4. **Напоминания:** Нажать «Добавить напоминание» → убедиться что есть два отдельных поля (дата и время) → создать → страница не падает
5. **Колокольчик уведомлений:** Кликнуть на иконку колокольчика → выпадающее меню отображается поверх контента (не скрыто за разделом)
6. **Генерация шагов:** Проверить логи бэкенда; при клике «Сгенерировать шаги» проверить ответ (200 или ошибка с информативным сообщением)
