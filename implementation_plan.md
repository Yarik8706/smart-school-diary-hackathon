# Playwright Integration Tests — Покрытие всех Frontend↔Backend взаимодействий

Проект «Умный школьный дневник 2.0» имеет 6 страниц и 7 backend-роутеров. Существующие 3 теста покрывают только базовый рендер (analytics, homework, reminders). Необходимо добавить тесты на **все** недостающие пользовательские сценарии: CRUD-операции, навигацию, валидацию форм, обработку ошибок API, и страницы без тестов.

Все тесты используют `page.route()` для мока API (тесты не зависят от бэкенда).

---

## Proposed Changes

### Новые тест-файлы

#### [NEW] [dashboard.spec.ts](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/tests/dashboard.spec.ts)

Тесты главной страницы `/`:
- Рендер дашборд-карточек («Ближайшая домашка», «Сегодня по расписанию», «Предупреждения»)
- Рендер быстрых действий («Добавить новое ДЗ», «Поставить напоминание», «Проверить нагрузку недели»)
- Рендер заголовка и описания

---

#### [NEW] [schedule.spec.ts](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/tests/schedule.spec.ts)

Тесты страницы расписания `/schedule`:
- **Рендер страницы** — загрузка расписания и отображение слотов (мок `GET /api/v1/subjects`, `GET /api/v1/schedule/slots`)
- **Добавление урока** — открыть форму «Добавить урок», заполнить предмет/день/время/кабинет, submit → мок `POST /api/v1/schedule/slots`, проверить что новый слот отображается
- **Удаление урока** — нажать кнопку «Удалить» на слоте → мок `DELETE /api/v1/schedule/slots/:id` + `window.confirm`, проверить исчезновение
- **Управление предметами** — открыть «Управление предметами», добавить предмет → мок `POST /api/v1/subjects`, проверить появление в списке
- **Удаление предмета** — удалить предмет → мок `DELETE /api/v1/subjects/:id`

---

#### [NEW] [materials.spec.ts](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/tests/materials.spec.ts)

Тесты страницы материалов `/materials`:
- Рендер заголовка «Материалы» и текста-описания

---

#### [NEW] [navigation.spec.ts](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/tests/navigation.spec.ts)

Тесты навигации по сайдбару:
- Клик по каждой ссылке из меню навигации (Главная, Расписание, Домашка, Напоминания, Аналитика, Материалы) → проверить, что URL и заголовок страницы соответствуют
- Необходимо мокать все API-эндпоинты, чтобы страницы рендерились без ошибок

---

#### [NEW] [notification-bell.spec.ts](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/tests/notification-bell.spec.ts)

Тесты компонента уведомлений:
- Рендер бейджа с количеством напоминаний (мок `GET /api/v1/reminders/pending`)
- Клик по колокольчику → открытие/закрытие dropdown-списка
- Отображение пустого состояния «Пока всё чисто»

---

### Расширение существующих тестов

#### [MODIFY] [homework.spec.ts](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/tests/homework.spec.ts)

Добавить тесты:
- **Добавление ДЗ** — нажать «Добавить ДЗ», заполнить форму (название, описание, предмет, дедлайн), submit → мок `POST /api/v1/homework`, проверить появление
- **Отметка выполнения** — нажать чекбокс «Выполнено» → мок `PATCH /api/v1/homework/:id/complete`
- **Удаление ДЗ** — нажать «Удалить» → мок `DELETE /api/v1/homework/:id`, проверить исчезновение
- **Валидация формы** — submit с пустым названием → ошибка «Название обязательно.»
- **Оценка сложности (mood)** — нажать «Оценить сложность», выбрать «Легко», submit → мок `POST /api/v1/mood`

---

#### [MODIFY] [reminders.spec.ts](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/tests/reminders.spec.ts)

Добавить тесты:
- **Добавление напоминания** — нажать «Добавить напоминание», заполнить форму (задание, время), submit → мок `POST /api/v1/reminders`
- **Удаление напоминания** — нажать «Удалить» → мок `DELETE /api/v1/reminders/:id`, проверить исчезновение

---

#### [MODIFY] [analytics.spec.ts](file:///d:/Programms/OtherProjects/smart-school-diary-hackathon/frontend/tests/analytics.spec.ts)

Добавить тесты:
- **Пустое состояние** — API возвращает пустые данные → страница рендерится без ошибок
- **Ошибка API** — API возвращает 500 → отображается сообщение об ошибке

---

## Verification Plan

### Automated Tests

Единственная команда для запуска всех тестов:

```bash
npx playwright test
```

Запускается из директории `d:\Programms\OtherProjects\smart-school-diary-hackathon\frontend`.

Playwright-конфиг автоматически стартует dev-сервер (`npm run dev -- --hostname 127.0.0.1 --port 3000`). Все API-вызовы мокаются через `page.route()`, поэтому бэкенд не требуется.

**Критерий успеха:** все тесты проходят (`npx playwright test` возвращает 0 failures).
