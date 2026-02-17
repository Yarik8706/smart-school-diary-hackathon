import type { WarningItem } from "@/types/analytics";

interface WarningsListProps {
  warnings: WarningItem[];
}

export function WarningsList({ warnings }: WarningsListProps) {
  return (
    <article className="rounded-2xl border p-4">
      <h3 className="text-xl font-black">Предупреждения</h3>
      {warnings.length ? (
        <ul className="mt-4 space-y-3" role="list">
          {warnings.map((warning) => (
            <li key={warning.id} className="rounded-xl border border-rose-500/40 p-3">
              <p className="text-sm font-bold">{warning.day}</p>
              <p className="mt-1 text-sm">{warning.message}</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Рекомендация: {warning.recommendation}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground mt-2 text-sm">Перегрузок не обнаружено.</p>
      )}
    </article>
  );
}
