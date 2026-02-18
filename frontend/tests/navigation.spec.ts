import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/v1/reminders/pending", async (route) => {
    await route.fulfill({ json: { reminders: [] } });
  });

  await page.route("**/subjects", async (route) => {
    await route.fulfill({
      json: [{ id: "s1", name: "Математика", color: "blue" }],
    });
  });

  await page.route("**/schedule/slots", async (route) => {
    await route.fulfill({
      json: [
        {
          id: "slot1",
          subject_id: "s1",
          day_of_week: 1,
          start_time: "09:00",
          end_time: "09:45",
          classroom: "101",
        },
      ],
    });
  });

  await page.route("**/api/v1/homework**", async (route) => {
    await route.fulfill({
      json: [
        {
          id: "h1",
          subject_id: "s1",
          title: "Алгебра №3",
          deadline: "2099-01-01",
          completed: false,
        },
      ],
    });
  });

  await page.route("**/api/v1/reminders", async (route) => {
    await route.fulfill({
      json: [
        {
          id: "r1",
          homework_id: "h1",
          remind_at: "2099-01-01T09:00:00.000Z",
          status: "pending",
        },
      ],
    });
  });

  await page.route("**/api/v1/analytics/load", async (route) => {
    await route.fulfill({ json: { days: [{ day: "Понедельник", load: 3 }] } });
  });

  await page.route("**/api/v1/mood/stats", async (route) => {
    await route.fulfill({ json: { easy: 1, normal: 1, hard: 0 } });
  });

  await page.route("**/api/v1/analytics/warnings", async (route) => {
    await route.fulfill({ json: [] });
  });

  await page.route("**/api/v1/mood", async (route) => {
    await route.fulfill({ json: {} });
  });
});

test("sidebar links navigate to all pages", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "Расписание" }).click();
  await expect(page).toHaveURL(/\/schedule$/);
  await expect(page.getByText("Расписание уроков")).toBeVisible();

  await page.getByRole("link", { name: "Домашка" }).click();
  await expect(page).toHaveURL(/\/homework$/);
  await expect(page.getByText("Добавить ДЗ")).toBeVisible();

  await page.getByRole("link", { name: "Напоминания" }).click();
  await expect(page).toHaveURL(/\/reminders$/);
  await expect(page.getByText("Добавить напоминание")).toBeVisible();

  await page.getByRole("link", { name: "Аналитика" }).click();
  await expect(page).toHaveURL(/\/analytics$/);
  await expect(page.getByText("Аналитика нагрузки")).toBeVisible();

  await page.getByRole("link", { name: "Материалы" }).click();
  await expect(page).toHaveURL(/\/materials$/);
  await expect(page.getByText("Ищи полезные конспекты")).toBeVisible();

  await page.getByRole("link", { name: "Главная" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText("Учись спокойно и без дедлайн-паники")).toBeVisible();
});
