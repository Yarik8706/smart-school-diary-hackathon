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
          subject: { name: "Алгебра", color: "bg-blue-500" },
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
            is_sent: false,
            homework: {
              id: "h1",
              title: "Алгебра №1",
              subject: { name: "Алгебра", color: "bg-blue-500" },
            },
            created_at: "2099-01-01T00:00:00.000Z",
            updated_at: "2099-01-01T00:00:00.000Z",
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
      is_sent: false,
      homework: {
        id: "h1",
        title: "Алгебра №1",
        subject: { name: "Алгебра", color: "bg-blue-500" },
      },
      created_at: "2099-01-01T00:00:00.000Z",
      updated_at: "2099-01-01T00:00:00.000Z",
    },
  ];

  await page.route("**/api/v1/homework", async (route) => {
    await route.fulfill({
      json: [
        {
          id: "h1",
          title: "Алгебра №1",
          subject: { name: "Алгебра", color: "bg-blue-500" },
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
      reminders = [
        ...reminders,
        {
          id: "r2",
          is_sent: false,
          homework: {
            id: "h1",
            title: "Алгебра №1",
            subject: { name: "Алгебра", color: "bg-blue-500" },
          },
          created_at: "2099-01-01T00:00:00.000Z",
          updated_at: "2099-01-01T00:00:00.000Z",
          ...payload,
        },
      ];
      await route.fulfill({
        json: {
          id: "r2",
          is_sent: false,
          homework: {
            id: "h1",
            title: "Алгебра №1",
            subject: { name: "Алгебра", color: "bg-blue-500" },
          },
          created_at: "2099-01-01T00:00:00.000Z",
          updated_at: "2099-01-01T00:00:00.000Z",
          ...payload,
        },
      });
      return;
    }
    await route.fulfill({ json: reminders });
  });

  await page.goto("/reminders");

  await page.getByRole("button", { name: "Добавить напоминание" }).click();
  await page.locator('input[type="date"]').fill("2099-02-10");
  await page.locator('input[type="time"]').fill("10:00");
  await page.getByRole("button", { name: "Сохранить" }).click();

  await expect(page.getByText("10.02.2099")).toBeVisible();
});

test("deletes reminder", async ({ page }) => {
  let reminders = [
    {
      id: "r1",
      homework_id: "h1",
      remind_at: "2099-01-01T09:00:00.000Z",
      is_sent: false,
      homework: {
        id: "h1",
        title: "Алгебра №1",
        subject: { name: "Алгебра", color: "bg-blue-500" },
      },
      created_at: "2099-01-01T00:00:00.000Z",
      updated_at: "2099-01-01T00:00:00.000Z",
    },
  ];

  await page.route("**/api/v1/homework", async (route) => {
    await route.fulfill({
      json: [
        {
          id: "h1",
          title: "Алгебра №1",
          subject: { name: "Алгебра", color: "bg-blue-500" },
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
