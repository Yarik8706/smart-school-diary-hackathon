import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HomeworkEditModal } from "../homework-edit-modal";

describe("HomeworkEditModal", () => {
  const subjects = [{ id: "s1", name: "Математика", color: "bg-blue-500" }];

  it("validates required title and future deadline", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <HomeworkEditModal
        open
        subjects={subjects}
        homework={null}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText("Дедлайн"), {
      target: { value: "2000-01-01" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Сохранить" }));

    expect(await screen.findByText("Название обязательно.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
