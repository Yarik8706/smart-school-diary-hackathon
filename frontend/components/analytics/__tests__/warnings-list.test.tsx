import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WarningsList } from "@/components/analytics/warnings-list";

describe("WarningsList", () => {
  it("renders warning entries", () => {
    render(
      <WarningsList
        warnings={[
          {
            id: "w1",
            day: "Пятница",
            message: "Слишком много заданий",
            recommendation: "Раздели на части",
          },
        ]}
      />,
    );

    expect(screen.getByText("Предупреждения")).toBeInTheDocument();
    expect(screen.getByText("Пятница")).toBeInTheDocument();
    expect(screen.getByText("Рекомендация: Раздели на части")).toBeInTheDocument();
  });

  it("renders empty state", () => {
    render(<WarningsList warnings={[]} />);

    expect(screen.getByText("Перегрузок не обнаружено.")).toBeInTheDocument();
  });
});
