import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MaterialsPageClient } from "../materials-page-client";

const mockedStore = vi.hoisted(() => vi.fn());

vi.mock("@/store/materials", () => ({
  useMaterialStore: mockedStore,
}));

describe("MaterialsPageClient", () => {
  it("renders recommendation block when available", () => {
    mockedStore.mockReturnValue({
      materials: [],
      recommendation: "Сначала теория, затем практика",
      loading: false,
      error: null,
      searchMaterials: vi.fn(),
    });

    render(<MaterialsPageClient />);

    expect(screen.getByText("AI-рекомендация")).toBeVisible();
    expect(screen.getByText("Сначала теория, затем практика")).toBeVisible();
  });
});
