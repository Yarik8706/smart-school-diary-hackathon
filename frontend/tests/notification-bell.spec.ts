import { expect, test } from "@playwright/test";

test("shows pending reminders badge and toggles dropdown", async ({ page }) => {
  await page.route("**/api/v1/reminders/pending", async (route) => {
    await route.fulfill({
      json: {
        reminders: [
          { id: "r1", title: "Алгебра №1", due_at: "Сегодня 18:00" },
          { id: "r2", title: "Физика — лабораторная" },
        ],
      },
    });
  });

  await page.goto("/");

  await expect(page.getByLabel("Открыть напоминания").getByText("2")).toBeVisible();

  const dropdown = page.locator("#pending-reminders");
  await expect(dropdown).toBeHidden();

  await page.getByLabel("Открыть напоминания").click();
  await expect(dropdown).toBeVisible();
  await expect(dropdown.getByText("Алгебра №1")).toBeVisible();

  await page.getByLabel("Открыть напоминания").click();
  await expect(dropdown).toBeHidden();
});

test("renders empty state in dropdown", async ({ page }) => {
  await page.route("**/api/v1/reminders/pending", async (route) => {
    await route.fulfill({ json: { reminders: [] } });
  });

  await page.goto("/");
  await page.getByLabel("Открыть напоминания").click();

  await expect(page.getByText("Пока всё чисто — новых напоминаний нет.")).toBeVisible();
});
