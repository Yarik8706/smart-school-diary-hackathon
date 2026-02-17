import { expect, test } from "@playwright/test";

test("loads analytics page and renders charts with warnings", async ({ page }) => {
  await page.route("**/api/v1/analytics/load", async (route) => {
    await route.fulfill({
      json: {
        days: [
          { day: "Понедельник", load: 2 },
          { day: "Вторник", load: 5 },
          { day: "Среда", load: 8 },
        ],
      },
    });
  });

  await page.route("**/api/v1/mood/stats", async (route) => {
    await route.fulfill({ json: { easy: 4, normal: 3, hard: 1 } });
  });

  await page.route("**/api/v1/analytics/warnings", async (route) => {
    await route.fulfill({
      json: [
        {
          id: "w1",
          day: "Среда",
          message: "Риск перегрузки",
          recommendation: "Запланируй 30 минут отдыха",
        },
      ],
    });
  });

  await page.goto("/analytics");

  await expect(page.getByText("Нагрузка по дням")).toBeVisible();
  await expect(page.getByText("Статистика настроения")).toBeVisible();
  await expect(page.getByText("Риск перегрузки")).toBeVisible();
});
