## Next steps

1. Добавить backend-интеграционный тест с реальной test DB для `POST /api/v1/homework/{id}/generate-steps` и `PATCH /api/v1/homework/steps/{step_id}/toggle` (помимо router unit tests).
2. Вынести повторяющийся маппинг полей `is_completed/completed` в единый адаптер API, чтобы фронт не зависел от вариаций контракта.
3. Добавить retry/timeout-политику для OpenRouter в `smart_planner_service` и логирование метрик ошибок провайдера.
4. После выдачи OpenRouter ключа проверить UX на реальных ответах модели и скорректировать промпт под школьные предметы.
