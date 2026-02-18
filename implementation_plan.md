# Исправление 5 проблем Frontend

## Proposed Changes

---

### 1. Интерактивные быстрые действия на дашборде

Сейчас быстрые действия — статичные `<li>` (текст + иконка). Нужно превратить их в кликабельные элементы с реальной навигацией.

#### [MODIFY] [dashboard-page-client.tsx](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/components/dashboard/dashboard-page-client.tsx)

- Добавить `useRouter` из `next/navigation`
- Каждому элементу `quickActions` добавить поле `href` с целевой страницей:
  - «Добавить новое ДЗ» → `/homework` (или раскрытие модалки через query param)
  - «Поставить напоминание» → `/reminders`
  - «Проверить нагрузку недели» → `/analytics`
- Заменить `<li>` на `<li>` с внутренним `<button>` или `<Link>`, который вызывает `router.push(href)`
- Добавить hover/focus стили (уже есть Tailwind — использовать `hover:bg-muted`, `cursor-pointer`, `rounded-lg`, `p-2`)

---

### 2. Кнопка «Сделано» вместо чекбокса + удаление после оценки

Сейчас: чекбокс «Выполнено» (toggle) + отдельная кнопка «Оценить сложность». Нужно: одна кнопка «Сделано» → открывает диалог оценки сложности → после подтверждения удаляет ДЗ.

#### [MODIFY] [homework-card.tsx](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/components/homework/homework-card.tsx)

- Удалить чекбокс `<label>` с «Выполнено» (строки 89–96)
- Удалить кнопку «Оценить сложность» (строки 116–118)
- Убрать пропс `onToggle` и `onMood` из интерфейса
- Добавить новый пропс `onDone: (homework: Homework) => void`
- Добавить кнопку «Сделано» стилем `variant="default"` с иконкой `IconCheck`

#### [MODIFY] [homework-page-client.tsx](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/components/homework/homework-page-client.tsx)

- Убрать отдельные `onToggle` и `onMood` из `<HomeworkList>`, заменить на `onDone`
- Реализовать `handleDone`: сохраняет выбранное ДЗ → открывает MoodPicker
- В `onSubmit` у `<MoodPicker>`: после `submitMood()` вызвать `deleteHomework(id)`

#### [MODIFY] [homework-list.tsx](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/components/homework/homework-list.tsx)

- Заменить пропсы `onToggle` + `onMood` на единый `onDone`

---

### 3. Русские названия цветов и расширенная палитра

Сейчас `SUBJECT_COLORS` содержит 6 цветов с английскими `value`. В `<select>` отображаются английские имена.

#### [MODIFY] [constants.ts](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/components/schedule/constants.ts)

- Добавить поле `label` к каждому цвету (на русском)
- Расширить палитру до ~12–14 цветов:

```ts
export const SUBJECT_COLORS = [
  { value: "blue", label: "Синий", className: "bg-blue-500" },
  { value: "violet", label: "Фиолетовый", className: "bg-violet-500" },
  { value: "green", label: "Зелёный", className: "bg-green-500" },
  { value: "amber", label: "Янтарный", className: "bg-amber-500" },
  { value: "rose", label: "Розовый", className: "bg-rose-500" },
  { value: "cyan", label: "Голубой", className: "bg-cyan-500" },
  { value: "red", label: "Красный", className: "bg-red-500" },
  { value: "orange", label: "Оранжевый", className: "bg-orange-500" },
  { value: "yellow", label: "Жёлтый", className: "bg-yellow-500" },
  { value: "emerald", label: "Изумрудный", className: "bg-emerald-500" },
  { value: "teal", label: "Бирюзовый", className: "bg-teal-500" },
  { value: "indigo", label: "Индиго", className: "bg-indigo-500" },
  { value: "pink", label: "Малиновый", className: "bg-pink-500" },
  { value: "slate", label: "Серый", className: "bg-slate-500" },
] as const;
```

#### [MODIFY] [subject-manager.tsx](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/components/schedule/subject-manager.tsx)

- В `<option>` использовать `item.label` вместо `item.value`

---

### 4. Корректная верстка «Плана на неделю»

Сейчас десктопная сетка — `grid grid-cols-5 gap-3`, колонки растягиваются/сжимаются. Нужно зафиксировать ширину колонок и добавить горизонтальный скролл.

#### [MODIFY] [schedule-grid.tsx](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/components/schedule/schedule-grid.tsx)

- Десктопный блок (строка 64): обернуть в `overflow-x-auto`
- Внутренний grid заменить на flex/inline-grid с фиксированной шириной колонок
- Каждая колонка дня: `min-w-[220px] w-[220px]` (фиксированная ширина)
- Карточки слотов: `min-h-[120px]` (фиксированная минимальная высота)
- Контейнер по высоте: `min-h-[400px]` или `flex-1` в зависимости от родителя

---

### 5. Исправление API-путей (404 ошибки)

#### Анализ проблемы

Backend: `api_v1_prefix = "/api"`, все роутеры используют `/v1/...`. Итоговые URL:

| Ресурс | Backend URL | Frontend (schedule store) | Статус |
|--------|-------------|--------------------------|--------|
| Subjects | `/api/v1/subjects` | `/subjects` | **❌ 404** |
| Schedule slots | `/api/v1/schedule/slots` | `/schedule/slots` | **❌ 404** |
| Homework | `/api/v1/homework` | `/api/v1/homework` | ✅ OK |
| Reminders | `/api/v1/reminders` | `/api/v1/reminders` | ✅ OK |
| Analytics | `/api/v1/analytics/*` | `/api/v1/analytics/*` | ✅ OK |
| Mood | `/api/v1/mood` | `/api/v1/mood` | ✅ OK |

Помимо путей, `api-client.ts` не имеет методов `put`, `patch`, `delete` — сторы используют `api.request()` напрямую.

#### [MODIFY] [schedule.ts (store)](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/store/schedule.ts)

```diff
-const subjectPath = "/subjects";
-const schedulePath = "/schedule/slots";
+const subjectPath = "/api/v1/subjects";
+const schedulePath = "/api/v1/schedule/slots";
```

#### [MODIFY] [dashboard.ts (store)](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/store/dashboard.ts)

```diff
-api.get<ScheduleSlot[]>("/schedule/slots"),
+api.get<ScheduleSlot[]>("/api/v1/schedule/slots"),
```

#### [MODIFY] [api-client.ts](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/lib/api-client.ts)

- Добавить методы `put`, `patch`, `delete` для удобства и единообразия

#### [MODIFY] [mock-api-routes.ts](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/lib/mock-api-routes.ts)

- Обновить все пути `/subjects` → `/api/v1/subjects`
- Обновить все пути `/schedule/slots` → `/api/v1/schedule/slots`
- Убедиться что mock обрабатывает оба варианта для обратной совместимости (или только новые)

---

## Verification Plan

### Существующие Playwright-тесты

В проекте уже есть тесты в `frontend/tests/`:
- `schedule.spec.ts` — загрузка страницы, добавление урока, удаление урока, создание/удаление предмета
- `homework.spec.ts` — тесты домашних заданий
- `dashboard.spec.ts` — тесты дашборда

Тесты используют `page.route("**/subjects**", ...)` — wildcard, поэтому они будут работать и с новыми path'ами.

**Команда запуска:**
```
cd d:\Programms\OtherProjects\smart-school-diary-hackathon\frontend
npx playwright test
```

### Ручная проверка

> [!IMPORTANT]
> Просьба вручную проверить эти сценарии в браузере после реализации:

1. **Дашборд**: нажать каждое быстрое действие — проверить что переход на нужную страницу работает
2. **Домашние задания**: нажать «Сделано» на каждом ДЗ → должен появиться диалог оценки сложности → после выбора сложности ДЗ удаляется из списка
3. **Управление предметами**: открыть менеджер предметов → проверить что в селекторе цветов отображаются русские названия и больше вариантов
4. **Расписание**: проверить что колонки дней имеют фиксированную ширину, при малом экране появляется горизонтальный скролл
5. **С выключенным mock** (`NEXT_PUBLIC_USE_MOCK=false`): проверить что все CRUD-операции (предметы, расписание, ДЗ) не дают 404
