## Next steps

1. Подключить backend-формат поля deadline к явному timezone-aware ISO, чтобы расчёт `remaining` в дашборде учитывал часовой пояс пользователя.
2. Добавить unit-тесты для `useDashboardStore` (ветки: пустые данные, ошибка API, дедлайн в прошлом).
3. Расширить карточку "Сегодня по расписанию" ссылкой на `/schedule` с фильтром по текущему дню.
4. Проверить z-index слои на iOS Safari (header + notification dropdown + mobile bottom nav) и при необходимости уточнить stacking tokens.
