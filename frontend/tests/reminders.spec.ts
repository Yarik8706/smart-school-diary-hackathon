import { expect, test } from "@playwright/test";

test("loads reminders page and renders grouped reminder", async ({ page }) => {
  await page.route("**/api/v1/homework", async (route) => {
    await route.fulfill({
      json: [
        {
          id: "h1",
          title: "Алгебра №1",
          subject: "Алгебра",
          subject_color: "bg-blue-500",
        },
      ],
    });
  });

  await page.route("**/api/v1/reminders", async (route) => {
    if (route.request().method() === "GET") {
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
      return;
    }
    await route.fulfill({ json: {} });
  });

  await page.goto("/reminders");

  await expect(page.getByText("Добавить напоминание")).toBeVisible();
  await expect(page.getByText("Алгебра №1")).toBeVisible();
});
