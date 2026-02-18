import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/v1/reminders/pending", async (route) => {
    await route.fulfill({ json: { reminders: [] } });
  });
});

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

  await page.route("**/api/v1/reminders**", async (route) => {
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

test("adds reminder", async ({ page }) => {
  let reminders = [
    {
      id: "r1",
      homework_id: "h1",
      remind_at: "2099-01-01T09:00:00.000Z",
      status: "pending",
    },
  ];

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

  await page.route("**/api/v1/reminders**", async (route) => {
    if (route.request().method() === "POST") {
      const payload = route.request().postDataJSON() as {
        homework_id: string;
        remind_at: string;
      };
      reminders = [...reminders, { id: "r2", status: "pending", ...payload }];
      await route.fulfill({ json: { id: "r2", status: "pending", ...payload } });
      return;
    }
    await route.fulfill({ json: reminders });
  });

  await page.goto("/reminders");

  await page.getByRole("button", { name: "Добавить напоминание" }).click();
  await page.locator('input[type="datetime-local"]').fill("2099-02-10T10:00");
  await page.getByRole("button", { name: "Сохранить" }).click();

  await expect(page.getByText("10.02.2099")).toBeVisible();
});

test("deletes reminder", async ({ page }) => {
  let reminders = [
    {
      id: "r1",
      homework_id: "h1",
      remind_at: "2099-01-01T09:00:00.000Z",
      status: "pending",
    },
  ];

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

  await page.route("**/api/v1/reminders**", async (route) => {
    if (route.request().method() === "DELETE") {
      reminders = [];
      await route.fulfill({ json: {} });
      return;
    }
    await route.fulfill({ json: reminders });
  });

  await page.goto("/reminders");

  await page
    .locator("article", { hasText: "Алгебра №1" })
    .getByRole("button", { name: "Удалить" })
    .click();
  await expect(page.getByText("Напоминаний пока нет.")).toBeVisible();
});
