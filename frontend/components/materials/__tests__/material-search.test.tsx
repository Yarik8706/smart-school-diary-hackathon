import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MaterialSearch } from "../material-search";

describe("MaterialSearch", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("calls onSearch with debounce and selected subject", () => {
    const onSearch = vi.fn();

    render(
      <MaterialSearch
        onSearch={onSearch}
        subjects={["math", "physics"]}
        loading={false}
      />,
    );

    fireEvent.change(screen.getByLabelText("Поиск материалов"), {
      target: { value: "алгебра" },
    });
    fireEvent.change(screen.getByLabelText("Предмет"), {
      target: { value: "math" },
    });

    expect(onSearch).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);

    expect(onSearch).toHaveBeenCalledWith("алгебра", "math");
  });

  it("runs immediate search on button click", () => {
    const onSearch = vi.fn();

    render(<MaterialSearch onSearch={onSearch} subjects={[]} loading={false} />);

    fireEvent.change(screen.getByLabelText("Поиск материалов"), {
      target: { value: "геометрия" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Найти" }));

    expect(onSearch).toHaveBeenCalledWith("геометрия", undefined);
  });
});
