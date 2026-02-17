# Frontend — 5 исправлений (модалки, навбар, расписание, мок-данные)

## Описание

Устраняем 5 проблем в frontend:
1. Оверлей модалок затемняет только секцию, а не весь экран
2. Модалки открываются без анимации
3. Нижний навбар пропадает при скролле вверх на мобильных
4. Секция расписания не адаптирована под мобайл
5. Нет моковых данных для работы без бекенда

---

## Proposed Changes

### 1. Shared ModalOverlay component

Все 5 модалок (`HomeworkEditModal`, `ReminderEditModal`, `ScheduleForm`, `SubjectManager`, `MoodPicker`) используют один и тот же паттерн `<div className="fixed inset-0 z-50 ...">` внутри своего дерева React. Проблема: поскольку модалки рендерятся внутри `<div className="shell-enter rounded-3xl ...">` в `app-shell.tsx`, CSS `overflow` и `border-radius` родителя обрезают оверлей, и он не покрывает весь экран.

**Решение:** создать переиспользуемый `ModalOverlay` с React Portal (`createPortal` в `document.body`) + GSAP-анимация входа/выхода.

#### [NEW] [modal-overlay.tsx](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/components/common/modal-overlay.tsx)

Компонент:
- Использует `createPortal(...)` в `document.body` для рендера оверлея поверх всего
- CSS: `fixed inset-0 z-50 bg-black/40 backdrop-blur-sm` — затемнение полного экрана
- GSAP анимация входа: overlay `opacity: 0 → 1`, контент `scale: 0.95, y: 12, opacity: 0 → scale: 1, y: 0, opacity: 1`
- GSAP анимация выхода (при `onClose`): обратный порядок, по завершении вызываем `onClose`
- Props: `open`, `onClose`, `children`, `className?`
- `aria-modal`, `role="dialog"`, фокус-трап (focus on first focusable, Escape closes)
- Блокировка скролла `body` при `open`

### 2. Миграция модалок на ModalOverlay

#### [MODIFY] [homework-edit-modal.tsx](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/components/homework/homework-edit-modal.tsx)

- Убрать `<div className="fixed inset-0 z-50 ...">` обёртку
- Обернуть содержимое в `<ModalOverlay open={open} onClose={onClose}>`
- Содержимое `<form>` остаётся как есть

#### [MODIFY] [reminder-edit-modal.tsx](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/components/reminders/reminder-edit-modal.tsx)

Аналогично `HomeworkEditModal`.

#### [MODIFY] [mood-picker.tsx](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/components/homework/mood-picker.tsx)

Аналогично.

#### [MODIFY] [schedule-form.tsx](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/components/schedule/schedule-form.tsx)

Аналогично. Уже есть `aria-modal` / `role="dialog"` — можно убрать с `<div>`, т.к. `ModalOverlay` их предоставит.

#### [MODIFY] [subject-manager.tsx](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/components/schedule/subject-manager.tsx)

Аналогично.

---

### 3. Fix: BottomNav всегда видим

#### [MODIFY] [bottom-nav.tsx](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/components/layout/bottom-nav.tsx)

Текущие стили: `fixed right-0 bottom-0 left-0 z-40 ...` — технически должен быть видим.  

Проблема: при скролле вверх на iOS (Safari) может срабатывать overscroll, и `bottom-0` уходит за пределы viewport. Причина — `min-h-screen` на родителе в `app-shell.tsx`, который не учитывает `dvh`.

**Решение:**
- В `bottom-nav.tsx`: поднять `z-index` до `z-50` (как у модалок), чтобы навбар гарантированно был поверх контента
- В `app-shell.tsx`: заменить `min-h-screen` на `min-h-dvh` (dynamic viewport height), что корректно обрабатывает мобильный браузерный хром
- Убедиться что `pb-24` padding-bottom остаётся для контента, чтобы навбар не перекрывал последние элементы

#### [MODIFY] [app-shell.tsx](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/components/layout/app-shell.tsx)

- `min-h-screen` → `min-h-dvh` на корневом `<div>`

---

### 4. Адаптация секции расписания для мобайл

#### [MODIFY] [schedule-page-client.tsx](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/components/schedule/schedule-page-client.tsx)

Сейчас: `<main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-6 py-10">` — фиксированные отступы `px-6 py-10`.

**Изменения:**
- `px-6 py-10` → `px-4 py-6 md:px-6 md:py-10`
- `text-4xl` заголовок → `text-2xl md:text-4xl`
- `flex-wrap items-center justify-between gap-3` для кнопок — добавить `w-full md:w-auto` на контейнер кнопок, чтобы на мобайл кнопки шли отдельной строкой
- `min-h-screen` удалить (уже есть в shell)

#### [MODIFY] [schedule-grid.tsx](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/components/schedule/schedule-grid.tsx)

Сейчас мобильные кнопки дней: `flex-wrap gap-2` — уже нормально.
Но при 7 кнопках (суббота и воскресение) кнопки могут выходить за экран.

**Изменения:**
- Кнопки дней на мобайл: `grid grid-cols-5 gap-1 md:hidden` вместо `flex flex-wrap gap-2 md:hidden` — чтобы они не переносились неудачно (5 будних дней в сетке)
- Если в `WEEK_DAYS` >5 дней — добавить вторую строку. По текущему коду `WEEK_DAYS` — 5 дней, корректно.
- Мобильные карточки слотов: добавить `gap-3` и лёгкую разделяющую стилизацию

---

### 5. Моковые данные

#### [NEW] [mock-data.ts](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/lib/mock-data.ts)

Экспортирует константы-заглушки для каждого типа:
- `MOCK_SUBJECTS: Subject[]` — 5–6 предметов
- `MOCK_SCHEDULE: ScheduleSlot[]` — 10–15 слотов, равномерно по дням
- `MOCK_HOMEWORK: Homework[]` — 4–5 заданий
- `MOCK_REMINDERS: Reminder[]` — 3–4 напоминания  
- `MOCK_ANALYTICS_LOAD: WeekLoadAnalysis` — данные нагрузки
- `MOCK_MOOD_STATS: MoodStats`
- `MOCK_WARNINGS: WarningItem[]`
- `MOCK_PENDING_REMINDERS: PendingRemindersResponse`

#### [NEW] [mock-api-client.ts](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/lib/mock-api-client.ts)

- Реализует тот же интерфейс что `apiClient` (`request`, `get`, `post`)
- Роутинг по `endpoint`: матчит эндпоинт и возвращает соответствующие мок-данные из `mock-data.ts`
- Мутации (POST/PUT/DELETE) обновляют локальный массив in-memory, чтобы UI отображал изменения
- `await new Promise(r => setTimeout(r, 300))` для имитации задержки

#### [MODIFY] [api-client.ts](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/lib/api-client.ts)

- Добавить в конце файла условный re-export:
```ts
const useMock = process.env.NEXT_PUBLIC_USE_MOCK === "true";
export const api = useMock ? mockApiClient : apiClient;
```
- Или проще: условный экспорт единого клиента.

#### [MODIFY] Stores (schedule.ts, homework.ts, reminders.ts, analytics.ts)

- Заменить `import { apiClient } from "@/lib/api-client"` на `import { api } from "@/lib/api-client"` и использовать `api` вместо `apiClient`
- Это минимально-инвазивное изменение.

#### [MODIFY] [notification-bell.tsx](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/components/layout/notification-bell.tsx)

- Аналогично: заменить `apiClient` → `api`

#### `.env.local` / `.env.example`

- Добавить `NEXT_PUBLIC_USE_MOCK=true` в `.env.example` для документации.

---

## Verification Plan

### Automated Tests

1. **Vitest (unit/component tests):**
   ```bash
   cd d:\Programms\OtherProjects\smart-school-diary-hackathon\frontend
   npm run test
   ```
   Ожидание: все существующие тесты в `store/__tests__/` и `components/**/__tests__/` проходят.

2. **Build check:**
   ```bash
   cd d:\Programms\OtherProjects\smart-school-diary-hackathon\frontend
   npm run build
   ```
   Ожидание: сборка проходит без ошибок.

3. **Playwright (e2e):**
   ```bash
   cd d:\Programms\OtherProjects\smart-school-diary-hackathon\frontend
   npm run test:e2e
   ```
   Ожидание: существующие тесты `homework.spec.ts`, `reminders.spec.ts`, `analytics.spec.ts` проходят (они мокают API через route).

### Manual Verification

Все ручные проверки проводятся через `npm run dev` (уже запущен) — открыть `http://localhost:3000` в браузере.

1. **Модалки (проблемы 1+2):**
   - Перейти на `/homework`, нажать «Добавить ДЗ» — убедиться что затемняется **весь экран** (включая сайдбар и хедер), модалка плавно анимируется по центру
   - Повторить на `/reminders`, `/schedule` (кнопки «Добавить урок» и «Управление предметами»)

2. **BottomNav (проблема 3):**
   - Открыть DevTools → Toggle Device Toolbar (iPhone/Android)
   - Прокрутить страницу вверх и вниз — нижний навбар **всегда виден**

3. **Расписание мобайл (проблема 4):**
   - Находясь на `/schedule` в мобильном режиме: кнопки дней отображаются компактно, текст адаптирован, нет горизонтального скролла

4. **Мок-данные (проблема 5):**
   - Остановить backend (или не запускать)
   - Установить `NEXT_PUBLIC_USE_MOCK=true` в `.env.local` и перезапустить `npm run dev`
   - Все страницы отображают данные (предметы, расписание, ДЗ, напоминания, аналитика)
   - CRUD операции (добавить/редактировать/удалить) работают в рамках сессии
