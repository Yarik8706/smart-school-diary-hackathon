import { cn } from "@/lib/utils";
import type { WarningItem } from "@/types/analytics";

interface WarningsListProps {
  warnings: WarningItem[];
}

const getTone = (warning: WarningItem) => {
  const value = `${warning.message} ${warning.recommendation}`.toLowerCase();

  if (value.includes("крит") || value.includes("срочно")) {
    return "danger" as const;
  }
  if (value.includes("рекомен") || value.includes("совет")) {
    return "info" as const;
  }
  return "warning" as const;
};

const toneClass = {
  warning: "border-amber-500/40 bg-amber-500/5",
  danger: "border-rose-500/40 bg-rose-500/5",
  info: "border-blue-500/40 bg-blue-500/5",
};

const toneLabel = {
  warning: "Внимание",
  danger: "Критично",
  info: "Рекомендация",
};

export function WarningsList({ warnings }: WarningsListProps) {
  return (
    <article className="rounded-2xl border p-4">
      <h3 className="text-xl font-black">Предупреждения</h3>
      {warnings.length ? (
        <ul className="mt-4 space-y-3" role="list">
          {warnings.map((warning) => {
            const tone = getTone(warning);
            return (
              <li
                key={warning.id}
                className={cn("rounded-xl border p-3", toneClass[tone])}
              >
                <p className="text-sm font-bold">{warning.day}</p>
                <p className="text-muted-foreground mt-1 text-xs">{toneLabel[tone]}</p>
                <p className="mt-1 text-sm">{warning.message}</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Рекомендация: {warning.recommendation}
                </p>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-muted-foreground mt-2 text-sm">Перегрузок не обнаружено.</p>
      )}
    </article>
  );
}
