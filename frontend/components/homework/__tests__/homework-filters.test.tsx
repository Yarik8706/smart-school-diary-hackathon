import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HomeworkFilters } from "../homework-filters";

describe("HomeworkFilters", () => {
  it("notifies consumer when filters change", () => {
    const onChange = vi.fn();

    render(
      <HomeworkFilters
        subjects={[{ id: "s1", name: "Математика", color: "bg-blue-500" }]}
        value={{ subject: "all", status: "all", deadline: "all" }}
        onChange={onChange}
      />,
    );

    fireEvent.change(screen.getByLabelText("Предмет"), {
      target: { value: "s1" },
    });

    expect(onChange).toHaveBeenCalledWith({
      subject: "s1",
      status: "all",
      deadline: "all",
    });
  });
});
