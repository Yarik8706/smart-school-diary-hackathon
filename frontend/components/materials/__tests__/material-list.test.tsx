import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MaterialList } from "../material-list";

describe("MaterialList", () => {
  it("shows placeholder if materials are empty", () => {
    render(<MaterialList materials={[]} />);

    expect(screen.getByText("Ничего не найдено")).toBeVisible();
  });

  it("renders material cards with description", () => {
    render(
      <MaterialList
        materials={[
          {
                        title: "Видео по алгебре",
            source: "youtube",
            url: "https://youtu.be/abc",
            thumbnail_url: "https://img.youtube.com/vi/abc/default.jpg",
            description: "Разбор типовых заданий",
          },
        ]}
      />,
    );

    expect(screen.getByText("Видео по алгебре")).toBeVisible();
    expect(screen.getByText("Разбор типовых заданий")).toBeVisible();
    expect(screen.getByRole("link", { name: "Открыть" })).toHaveAttribute(
      "target",
      "_blank",
    );
  });
});
