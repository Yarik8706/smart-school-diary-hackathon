# NEXT_STEPS

1. Установить Playwright браузеры в CI/локальной среде (`npx playwright install`), чтобы e2e-пакет выполнялся без инфраструктурных ошибок.
2. Обновить Playwright сценарий `marks homework as completed` под новую UX-логику кнопки `Сделано` + `MoodPicker`.
3. После стабилизации backend проверить, можно ли убрать legacy-обработку старых путей `/subjects` и `/schedule/slots` из mock-роутера.
