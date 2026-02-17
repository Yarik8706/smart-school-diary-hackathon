import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MoodStatsCard } from "@/components/analytics/mood-stats-card";

describe("MoodStatsCard", () => {
  it("renders values and percentages", () => {
    render(<MoodStatsCard stats={{ easy: 4, normal: 3, hard: 3 }} />);

    expect(screen.getByText("Статистика настроения")).toBeInTheDocument();
    expect(screen.getByText("Легко: 4")).toBeInTheDocument();
    expect(screen.getByText("Нормально: 3")).toBeInTheDocument();
    expect(screen.getByText("Сложно: 3")).toBeInTheDocument();
    expect(screen.getByText("40%")).toBeInTheDocument();
  });

  it("renders empty state", () => {
    render(<MoodStatsCard stats={null} />);

    expect(
      screen.getByText("Недостаточно данных для расчёта статистики."),
    ).toBeInTheDocument();
  });
});
