import { expect, test } from "@playwright/test";

test("renders materials page title and description", async ({ page }) => {
  await page.route("**/api/v1/reminders/pending", async (route) => {
    await route.fulfill({ json: { reminders: [] } });
  });

  await page.goto("/materials");

  await expect(page.locator("section h2", { hasText: "Материалы" })).toBeVisible();
  await expect(page.getByText("Ищи полезные конспекты, статьи и видео")).toBeVisible();
});
