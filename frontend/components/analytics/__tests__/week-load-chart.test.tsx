import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WeekLoadChart } from "@/components/analytics/week-load-chart";

describe("WeekLoadChart", () => {
  it("renders bars with legend", () => {
    render(
      <WeekLoadChart
        days={[
          { day: "Пн", load: 2 },
          { day: "Вт", load: 5 },
          { day: "Ср", load: 8 },
        ]}
      />,
    );

    expect(screen.getByText("Нагрузка по дням")).toBeInTheDocument();
    expect(screen.getByText("Лёгкая")).toBeInTheDocument();
    expect(screen.getByText("Средняя")).toBeInTheDocument();
    expect(screen.getByText("Высокая")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("renders empty state", () => {
    render(<WeekLoadChart days={[]} />);

    expect(
      screen.getByText("Пока нет данных по нагрузке за неделю."),
    ).toBeInTheDocument();
  });
});
