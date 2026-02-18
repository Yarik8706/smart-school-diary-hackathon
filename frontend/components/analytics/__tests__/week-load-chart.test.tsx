import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WeekLoadChart } from "@/components/analytics/week-load-chart";

describe("WeekLoadChart", () => {
  it("renders bars with legend", () => {
    render(
      <WeekLoadChart
        days={[
          { day: 1, load_score: 2, lessons_count: 3, hard_subjects: [], warning: null },
          { day: 2, load_score: 5, lessons_count: 4, hard_subjects: [], warning: null },
          { day: 3, load_score: 8, lessons_count: 6, hard_subjects: ["Физика"], warning: "Высокая" },
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
