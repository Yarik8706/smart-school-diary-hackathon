import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/v1/reminders/pending", async (route) => {
    await route.fulfill({ json: { reminders: [] } });
  });
});

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

test("adds homework from modal", async ({ page }) => {
  let homework = [
    {
      id: "h1",
      subject_id: "s1",
      title: "Алгебра №3",
      description: "",
      deadline: "2099-01-01",
      completed: false,
    },
  ];

  await page.route("**/api/v1/subjects", async (route) => {
    await route.fulfill({
      json: [{ id: "s1", name: "Математика", color: "bg-blue-500" }],
    });
  });

  await page.route("**/api/v1/homework**", async (route) => {
    if (route.request().method() === "POST") {
      const payload = route.request().postDataJSON() as {
        subject_id: string;
        title: string;
        description?: string;
        deadline: string;
      };
      homework = [
        ...homework,
        {
          id: "h2",
          completed: false,
          ...payload,
        },
      ];
      await route.fulfill({ json: { id: "h2", completed: false, ...payload } });
      return;
    }

    await route.fulfill({ json: homework });
  });

  await page.route("**/api/v1/mood", async (route) => {
    await route.fulfill({ json: {} });
  });

  await page.goto("/homework");

  await page.getByRole("button", { name: "Добавить ДЗ" }).click();
  await page.getByLabel("Название").fill("Геометрия №8");
  await page.getByLabel("Описание").fill("Подготовить доказательство");
  await page.locator('input[aria-label="Дедлайн"]').fill("2099-02-10");
  await page.getByRole("button", { name: "Сохранить" }).click();

  await expect(page.getByText("Геометрия №8")).toBeVisible();
});

test("validates empty homework title", async ({ page }) => {
  await page.route("**/api/v1/subjects", async (route) => {
    await route.fulfill({
      json: [{ id: "s1", name: "Математика", color: "bg-blue-500" }],
    });
  });

  await page.route("**/api/v1/homework**", async (route) => {
    await route.fulfill({ json: [] });
  });

  await page.route("**/api/v1/mood", async (route) => {
    await route.fulfill({ json: {} });
  });

  await page.goto("/homework");

  await page.getByRole("button", { name: "Добавить ДЗ" }).click();
  await page.locator('input[aria-label="Дедлайн"]').fill("2099-02-10");
  await page.getByRole("button", { name: "Сохранить" }).click();

  await expect(page.getByText("Название обязательно.")).toBeVisible();
});

test("marks homework as completed", async ({ page }) => {
  let homework = [
    {
      id: "h1",
      subject_id: "s1",
      title: "Алгебра №3",
      deadline: "2099-01-01",
      completed: false,
    },
  ];

  await page.route("**/api/v1/subjects", async (route) => {
    await route.fulfill({
      json: [{ id: "s1", name: "Математика", color: "bg-blue-500" }],
    });
  });

  await page.route("**/api/v1/homework**", async (route) => {
    const method = route.request().method();
    const url = route.request().url();

    if (method === "PATCH" && url.endsWith("/h1/complete")) {
      homework = homework.map((item) =>
        item.id === "h1" ? { ...item, completed: true } : item,
      );
      await route.fulfill({ json: {} });
      return;
    }

    await route.fulfill({ json: homework });
  });

  await page.route("**/api/v1/mood", async (route) => {
    await route.fulfill({ json: {} });
  });

  await page.goto("/homework");

  await page.getByLabel("Выполнено").click();
  await expect(page.getByLabel("Выполнено")).toBeChecked();
});

test("deletes homework card", async ({ page }) => {
  let homework = [
    {
      id: "h1",
      subject_id: "s1",
      title: "Алгебра №3",
      deadline: "2099-01-01",
      completed: false,
    },
  ];

  await page.route("**/api/v1/subjects", async (route) => {
    await route.fulfill({
      json: [{ id: "s1", name: "Математика", color: "bg-blue-500" }],
    });
  });

  await page.route("**/api/v1/homework**", async (route) => {
    const method = route.request().method();
    if (method === "DELETE") {
      homework = [];
      await route.fulfill({ json: {} });
      return;
    }

    await route.fulfill({ json: homework });
  });

  await page.route("**/api/v1/mood", async (route) => {
    await route.fulfill({ json: {} });
  });

  await page.goto("/homework");

  await page.getByRole("button", { name: "Удалить" }).click();
  await expect(page.getByText("Алгебра №3")).toHaveCount(0);
});

test("submits mood rating", async ({ page }) => {
  let moodPayload: Record<string, unknown> | null = null;

  await page.route("**/api/v1/subjects", async (route) => {
    await route.fulfill({
      json: [{ id: "s1", name: "Математика", color: "bg-blue-500" }],
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

  await page.route("**/api/v1/mood", async (route) => {
    moodPayload = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({ json: {} });
  });

  await page.goto("/homework");

  await page.getByRole("button", { name: "Оценить сложность" }).click();
  await page.getByRole("button", { name: "Легко" }).click();
  await page.getByRole("button", { name: "Сохранить" }).click();

  await expect.poll(() => moodPayload).not.toBeNull();
  await expect
    .poll(() => moodPayload?.mood as string | undefined)
    .toBe("easy");
});
