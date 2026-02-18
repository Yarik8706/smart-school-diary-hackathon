import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/v1/reminders/pending", async (route) => {
    await route.fulfill({ json: { reminders: [] } });
  });
});

test("loads schedule page and renders slot", async ({ page }) => {
  await page.route("**/subjects**", async (route) => {
    await route.fulfill({
      json: [{ id: "s1", name: "Математика", color: "blue" }],
    });
  });

  await page.route("**/schedule/slots**", async (route) => {
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

  await page.goto("/schedule");

  await expect(page.getByText("Расписание уроков")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Математика" }).first()).toBeVisible();
  await expect(page.locator("p:has-text('09:00 - 09:45'):visible").first()).toBeVisible();
});

test("adds lesson slot via form", async ({ page }) => {
  let slots = [
    {
      id: "slot1",
      subject_id: "s1",
      day_of_week: 1,
      start_time: "09:00",
      end_time: "09:45",
      classroom: "101",
    },
  ];

  await page.route("**/subjects**", async (route) => {
    await route.fulfill({
      json: [{ id: "s1", name: "Математика", color: "blue" }],
    });
  });

  await page.route("**/schedule/slots**", async (route) => {
    if (route.request().method() === "POST") {
      const payload = route.request().postDataJSON() as {
        subject_id: string;
        day_of_week: number;
        start_time: string;
        end_time: string;
        classroom: string;
      };

      slots = [...slots, { id: "slot2", ...payload }];
      await route.fulfill({ json: { id: "slot2", ...payload } });
      return;
    }

    await route.fulfill({ json: slots });
  });

  await page.goto("/schedule");

  await page.getByRole("button", { name: "Добавить урок" }).click();
  const modal = page.locator('[role="dialog"]');
  await modal.locator("select").first().selectOption("s1");
  await modal.locator("select").nth(1).selectOption("2");
  await modal.locator('input[type="time"]').first().fill("10:00");
  await modal.locator('input[type="time"]').nth(1).fill("10:45");
  await modal.getByPlaceholder("Кабинет").fill("202");
  await modal.getByRole("button", { name: "Сохранить" }).click();

  await expect(page.getByText("10:00 - 10:45").first()).toBeVisible();
  await expect(page.getByText("Кабинет: 202").first()).toBeVisible();
});

test("deletes lesson slot", async ({ page }) => {
  let deleteCalled = false;
  let slots = [
    {
      id: "slot1",
      subject_id: "s1",
      day_of_week: 1,
      start_time: "09:00",
      end_time: "09:45",
      classroom: "101",
    },
  ];

  await page.route("**/subjects**", async (route) => {
    await route.fulfill({
      json: [{ id: "s1", name: "Математика", color: "blue" }],
    });
  });

  await page.route("**/schedule/slots**", async (route) => {
    if (route.request().method() === "DELETE") {
      deleteCalled = true;
      slots = [];
      await route.fulfill({ json: {} });
      return;
    }

    await route.fulfill({ json: slots });
  });

  await page.goto("/schedule");

  page.on("dialog", async (dialog) => {
    await dialog.accept();
  });

  await page
    .locator("article:visible")
    .filter({ hasText: "Кабинет: 101" })
    .first()
    .getByRole("button", { name: "Удалить" })
    .dispatchEvent("click");
  await expect.poll(() => deleteCalled).toBe(true);
});

test("creates and deletes subject in subject manager", async ({ page }) => {
  let subjects = [{ id: "s1", name: "Математика", color: "blue" }];

  await page.route("**/schedule/slots**", async (route) => {
    await route.fulfill({ json: [] });
  });

  await page.route("**/subjects**", async (route) => {
    const method = route.request().method();

    if (method === "POST") {
      const payload = route.request().postDataJSON() as {
        name: string;
        color: string;
      };
      subjects = [...subjects, { id: "s2", ...payload }];
      await route.fulfill({ json: { id: "s2", ...payload } });
      return;
    }

    if (method === "DELETE") {
      const id = route.request().url().split("/").pop();
      subjects = subjects.filter((item) => item.id !== id);
      await route.fulfill({ json: {} });
      return;
    }

    await route.fulfill({ json: subjects });
  });

  await page.goto("/schedule");

  await page.getByRole("button", { name: "Управление предметами" }).click();
  const modal = page.locator('[role="dialog"]');
  await modal.getByPlaceholder("Название предмета").fill("История");
  await modal.getByRole("button", { name: "Добавить", exact: true }).click();

  await expect(modal.getByText("История")).toBeVisible();

  await modal
    .locator("li", { hasText: "История" })
    .getByRole("button", { name: "Удалить" })
    .click();

  await expect(modal.locator("li", { hasText: "История" })).toHaveCount(0);
});
