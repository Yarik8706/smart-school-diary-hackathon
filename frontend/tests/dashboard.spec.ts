import { expect, test } from "@playwright/test";

test("renders dashboard cards, quick actions, and hero content", async ({
  page,
}) => {
  await page.route("**/api/v1/homework", async (route) => {
    await route.fulfill({
      json: [
        {
          id: "hw-1",
          subject_id: "sub-1",
          title: "Алгебра",
          deadline: "2026-03-01",
          completed: false,
        },
      ],
    });
  });
  await page.route("**/schedule/slots", async (route) => {
    await route.fulfill({ json: [] });
  });
  await page.route("**/api/v1/subjects", async (route) => {
    await route.fulfill({
      json: [{ id: "sub-1", name: "Математика", color: "blue" }],
    });
  });
  await page.route("**/api/v1/analytics/warnings", async (route) => {
    await route.fulfill({
      json: [
        {
          id: "warn-1",
          day: "Пн",
          message: "Контрольная завтра",
          recommendation: "Повтори темы",
        },
      ],
    });
  });
  await page.route("**/api/v1/reminders/pending", async (route) => {
    await route.fulfill({ json: { reminders: [] } });
  });

  await page.goto("/");

  await expect(
    page.getByText("Учись спокойно и без дедлайн-паники"),
  ).toBeVisible();
  await expect(
    page.getByText("Здесь собрана ключевая сводка по дню"),
  ).toBeVisible();

  await expect(page.getByText("Ближайшая домашка")).toBeVisible();
  await expect(page.getByText("Сегодня по расписанию")).toBeVisible();
  await expect(page.getByText("Предупреждения")).toBeVisible();

  await expect(
    page.getByRole("heading", { name: "Быстрые действия" }),
  ).toBeVisible();
  await expect(page.getByText("Добавить новое ДЗ")).toBeVisible();
  await expect(page.getByText("Поставить напоминание")).toBeVisible();
  await expect(page.getByText("Проверить нагрузку недели")).toBeVisible();
});
