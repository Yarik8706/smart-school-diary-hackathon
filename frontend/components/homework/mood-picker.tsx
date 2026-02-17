import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { MoodLevel } from "@/types/homework";

interface MoodPickerProps {
  open: boolean;
  homeworkTitle: string;
  onClose: () => void;
  onSubmit: (mood: MoodLevel, note?: string) => Promise<void>;
}

const moodButtons: { label: string; value: MoodLevel }[] = [
  { label: "Легко", value: "easy" },
  { label: "Нормально", value: "normal" },
  { label: "Сложно", value: "hard" },
];

export function MoodPicker({
  open,
  homeworkTitle,
  onClose,
  onSubmit,
}: MoodPickerProps) {
  const [mood, setMood] = useState<MoodLevel>("normal");
  const [note, setNote] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    setSubmitting(true);
    await onSubmit(mood, note || undefined);
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="bg-background w-full max-w-md space-y-4 rounded-xl border p-6">
        <h3 className="text-xl font-black">
          Оценка сложности: {homeworkTitle}
        </h3>
        <div className="flex gap-2">
          {moodButtons.map((item) => (
            <Button
              key={item.value}
              variant={mood === item.value ? "default" : "outline"}
              onClick={() => setMood(item.value)}
            >
              {item.label}
            </Button>
          ))}
        </div>
        <label className="block space-y-1 text-sm font-medium">
          Комментарий
          <textarea
            aria-label="Комментарий"
            className="bg-background min-h-24 w-full rounded-md border px-3 py-2"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </label>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={isSubmitting}>
            {isSubmitting ? "Сохранение..." : "Сохранить"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default MoodPicker;
