import { expect, test } from "@playwright/test";

test("searches and renders materials on /materials", async ({ page }) => {
  await page.route("**/api/v1/materials/search**", async (route) => {
    const url = new URL(route.request().url());
    const query = url.searchParams.get("query");

    if (query === "алгебра") {
      await route.fulfill({
        json: [
          {
            id: "m1",
            title: "Видео: квадратные уравнения",
            source: "youtube",
            url: "https://youtu.be/abc",
            thumbnail: "https://img.youtube.com/vi/abc/default.jpg",
          },
        ],
      });
      return;
    }

    await route.fulfill({ json: [] });
  });

  await page.goto("/materials");

  await page.getByLabel("Поиск материалов").fill("алгебра");
  await page.getByRole("button", { name: "Найти" }).click();

  await expect(page.getByText("Видео: квадратные уравнения")).toBeVisible();
  await expect(page.getByRole("link", { name: "Открыть" })).toBeVisible();
});
