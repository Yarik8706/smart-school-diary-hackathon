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

test("marks homework as done via mood dialog and removes card", async ({ page }) => {
  let moodPayload: Record<string, unknown> | null = null;
  let deleteCalled = false;
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
    if (route.request().method() === "DELETE") {
      deleteCalled = true;
      homework = [];
      await route.fulfill({ json: {} });
      return;
    }

    await route.fulfill({ json: homework });
  });

  await page.route("**/api/v1/mood", async (route) => {
    moodPayload = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({ json: {} });
  });

  await page.goto("/homework");

  await page.getByRole("button", { name: "Сделано" }).click();
  await page.getByRole("button", { name: "Легко" }).click();
  await page.getByRole("button", { name: "Сохранить" }).click();

  await expect.poll(() => moodPayload?.mood as string | undefined).toBe("easy");
  await expect.poll(() => deleteCalled).toBe(true);
  await expect(page.getByText("Алгебра №3")).toHaveCount(0);
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

  await page.getByRole("button", { name: "Сделано" }).click();
  await page.getByRole("button", { name: "Легко" }).click();
  await page.getByRole("button", { name: "Сохранить" }).click();

  await expect.poll(() => moodPayload).not.toBeNull();
  await expect
    .poll(() => moodPayload?.mood as string | undefined)
    .toBe("easy");
});


test("generates steps and toggles step completion", async ({ page }) => {
  let homework = [
    {
      id: "h1",
      subject_id: "s1",
      title: "Алгебра №3",
      deadline: "2099-01-01",
      completed: false,
      steps: [],
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

    if (method === "POST" && url.endsWith("/generate-steps")) {
      homework = [
        {
          ...homework[0],
          steps: [
            {
              id: "step-1",
              title: "Повторить формулы",
              is_completed: false,
              order: 1,
            },
          ],
        },
      ];
      await route.fulfill({ json: { count: 1, steps: homework[0].steps } });
      return;
    }

    if (method === "PATCH" && url.includes("/steps/step-1/toggle")) {
      homework = [
        {
          ...homework[0],
          steps: [
            {
              id: "step-1",
              title: "Повторить формулы",
              is_completed: true,
              order: 1,
            },
          ],
        },
      ];
      await route.fulfill({ json: homework[0].steps[0] });
      return;
    }

    await route.fulfill({ json: homework });
  });

  await page.route("**/api/v1/mood", async (route) => {
    await route.fulfill({ json: {} });
  });

  await page.goto("/homework");

  await page.getByRole("button", { name: "Сгенерировать шаги" }).click();
  await expect(page.getByText("Повторить формулы")).toBeVisible();

  await page.getByLabel("Повторить формулы").click();
  await expect(page.getByLabel("Повторить формулы")).toBeChecked();
});
