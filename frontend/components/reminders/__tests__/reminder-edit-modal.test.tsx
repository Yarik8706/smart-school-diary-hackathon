import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ReminderEditModal } from "../reminder-edit-modal";

describe("ReminderEditModal", () => {
  const homework = [
    {
      id: "h1",
      title: "Алгебра №1",
      subject: { name: "Алгебра", color: "bg-blue-500" },
    },
  ];

  it("shows validation if datetime is not in the future", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <ReminderEditModal
        open
        homework={homework}
        reminder={null}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText("Дата"), {
      target: { value: "2000-01-01" },
    });
    fireEvent.change(screen.getByLabelText("Время"), {
      target: { value: "10:00" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Сохранить" }));

    expect(
      await screen.findByText("Укажите задание и время в будущем."),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
