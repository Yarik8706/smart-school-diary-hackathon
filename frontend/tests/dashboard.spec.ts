import { expect, test } from "@playwright/test";

test("renders dashboard cards, quick actions, and hero content", async ({ page }) => {
  await page.route("**/api/v1/reminders/pending", async (route) => {
    await route.fulfill({ json: { reminders: [] } });
  });

  await page.goto("/");

  await expect(page.getByText("Учись спокойно и без дедлайн-паники")).toBeVisible();
  await expect(page.getByText("Здесь собрана ключевая сводка по дню")).toBeVisible();

  await expect(page.getByText("Ближайшая домашка")).toBeVisible();
  await expect(page.getByText("Сегодня по расписанию")).toBeVisible();
  await expect(page.getByText("Предупреждения")).toBeVisible();

  await expect(page.getByRole("heading", { name: "Быстрые действия" })).toBeVisible();
  await expect(page.getByText("Добавить новое ДЗ")).toBeVisible();
  await expect(page.getByText("Поставить напоминание")).toBeVisible();
  await expect(page.getByText("Проверить нагрузку недели")).toBeVisible();
});
