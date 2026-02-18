# Frontend Fixes — План реализации

4 задачи по исправлению UI и подключению дашборда к бекенду.

---

## Fix 1: Плавная анимация закрытия модального окна

### Проблема
В [modal-overlay.tsx](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/components/common/modal-overlay.tsx) при `open=false` компонент возвращает `null` мгновенно — нет анимации закрытия. Анимация открытия есть (GSAP: fade in overlay + scale-up content).

### Решение
Добавить внутреннее состояние `visible` для отложенного размонтирования:

1. Ввести `const [visible, setVisible] = useState(false)` — управляет реальным рендером.
2. Когда `open` меняется с `false` на `true` — ставим `visible = true`, запускаем GSAP-анимацию появления.
3. Когда `open` меняется с `true` на `false` — запускаем GSAP-анимацию _закрытия_ (fade out + scale down), в `onComplete` ставим `visible = false`.
4. Рендерим портал, пока `visible === true` (а не `open`).

#### [MODIFY] [modal-overlay.tsx](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/components/common/modal-overlay.tsx)

- Добавить state `visible` + `useEffect` реагирующий на смену `open`.
- Анимация закрытия: `gsap.to(overlay, { opacity: 0 })` + `gsap.to(content, { opacity: 0, y: 12, scale: 0.95 })`, по завершению — `setVisible(false)`.
- Условие рендера: `if (!visible) return null`.

---

## Fix 2: Выпадающее меню напоминаний перекрывается

### Проблема
В [notification-bell.tsx](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/components/layout/notification-bell.tsx) dropdown имеет `z-50`, но секция контента в `app-shell.tsx` (`.shell-enter` блок) перекрывает его из-за `backdrop-blur` в header, который создаёт новый stacking context.

### Решение

#### [MODIFY] [notification-bell.tsx](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/components/layout/notification-bell.tsx)

- Изменить контейнер `<div className="relative">` на `<div className="relative z-50">` — весь компонент поднимется над остальными элементами.

#### [MODIFY] [header.tsx](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/components/layout/header.tsx)

- Добавить `relative z-30` к `<header>`, чтобы header был выше контента, но ниже dropdown.

---

## Fix 3: Sticky sidebar + свободная прокрутка контента

### Проблема
В [sidebar.tsx](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/components/layout/sidebar.tsx) — сайдбар не зафиксирован: при прокрутке страницы он уезжает вверх. В [app-shell.tsx](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/components/layout/app-shell.tsx) — layout не разделяет sidebar (фиксированный) и контент (прокручиваемый).

### Решение

#### [MODIFY] [sidebar.tsx](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/components/layout/sidebar.tsx)

- Добавить `sticky top-0 h-screen overflow-y-auto` к `<aside>`, чтобы sidebar оставался на месте при прокрутке основного контента и при необходимости прокручивался внутри себя.

#### [MODIFY] [app-shell.tsx](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/components/layout/app-shell.tsx)

- Добавить `min-h-screen` к контент-контейнеру — контент занимает минимум полный экран.
- Убрать любые ограничения высоты на `<main>`, чтобы содержимое могло свободно расти вниз.

---

## Fix 4: Dashboard — подключение к бекенду

### Проблема
[page.tsx](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/app/page.tsx) содержит только статичные захардкоженные данные. Нужно получать реальные данные с бекенда.

### Решение
Dashboard будет агрегировать данные из 3 существующих эндпоинтов:
- `GET /api/v1/homework` → ближайшее невыполненное ДЗ
- `GET /api/v1/schedule/slots` + `GET /api/v1/subjects` → уроки на сегодня
- `GET /api/v1/analytics/warnings` → предупреждения

#### [NEW] [types/dashboard.ts](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/types/dashboard.ts)

Типы для сводки дашборда:

```ts
export interface DashboardSummary {
  nearestHomework: { title: string; deadline: string; remaining: string } | null;
  todayLessons: { count: number; subjects: string[] };
  warnings: { count: number; description: string };
}
```

#### [NEW] [store/dashboard.ts](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/store/dashboard.ts)

Zustand-store, который:
- Вызывает `api.get("/api/v1/homework")`, `api.get("/schedule/slots")`, `api.get("/api/v1/subjects")`, `api.get("/api/v1/analytics/warnings")`
- Агрегирует данные в `DashboardSummary`
- Экспортирует `fetchDashboard()`, `summary`, `isLoading`, `error`

#### [MODIFY] [mock-data.ts](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/lib/mock-data.ts)

Моковые данные для дашборда уже существуют (homework, schedule, warnings) — нет необходимости добавлять новые, store будет агрегировать их.

#### [MODIFY] [app/page.tsx](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/app/page.tsx)

- Извлечь client компонент в отдельный файл `components/dashboard/dashboard-page-client.tsx`.
- Серверный `page.tsx` рендерит `<DashboardPageClient />`.
- Клиентский компонент использует `useDashboardStore` для загрузки и отображения данных.
- Карточки «Ближайшая домашка», «Сегодня по расписанию», «Предупреждения» наполняются из стора.
- Быстрые действия (`quickActions`) остаются статичными.

#### [NEW] [components/dashboard/dashboard-page-client.tsx](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/components/dashboard/dashboard-page-client.tsx)

Клиентский компонент дашборда с `useEffect(() => fetchDashboard())` и рендером карточек из стора.

---

## Verification Plan

### Automated Tests

```bash
npx playwright test
```

Все существующие тесты должны продолжить проходить. Изменения в `modal-overlay.tsx` затрагивают все модальные окна — нужно убедиться, что тесты с модалками не ломаются.

### Manual Verification
- **Fix 1**: Открыть/закрыть модалку (ДЗ, расписание, напоминания) — должна быть плавная анимация закрытия.
- **Fix 2**: Открыть колокольчик напоминаний — dropdown не должен обрезаться другими секциями.
- **Fix 3**: На ПК растянуть контент вниз — sidebar остаётся на месте при прокрутке.
- **Fix 4**: Главная страница должна загружать данные из API / моков.
