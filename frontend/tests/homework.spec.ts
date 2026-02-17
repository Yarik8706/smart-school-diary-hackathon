import { expect, test } from "@playwright/test";

test("loads homework page and renders homework card", async ({ page }) => {
  await page.route("**/api/v1/subjects", async (route) => {
    await route.fulfill({
      json: [{ id: "s1", name: "Математика", color: "bg-blue-500" }],
    });
  });

  await page.route("**/api/v1/homework**", async (route) => {
    if (route.request().method() === "GET") {
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
      return;
    }
    await route.fulfill({ json: {} });
  });

  await page.route("**/api/v1/mood", async (route) => {
    await route.fulfill({ json: {} });
  });

  await page.goto("/homework");

  await expect(page.getByText("Добавить ДЗ")).toBeVisible();
  await expect(page.getByText("Алгебра №3")).toBeVisible();
});
