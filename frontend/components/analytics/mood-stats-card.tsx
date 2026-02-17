import type { MoodStats } from "@/types/analytics";

interface MoodStatsCardProps {
  stats: MoodStats | null;
}

const toPercent = (value: number, total: number) =>
  total ? Math.round((value / total) * 100) : 0;

export function MoodStatsCard({ stats }: MoodStatsCardProps) {
  if (!stats) {
    return (
      <article className="rounded-2xl border p-4">
        <h3 className="text-xl font-black">Статистика настроения</h3>
        <p className="text-muted-foreground mt-2 text-sm">
          Недостаточно данных для расчёта статистики.
        </p>
      </article>
    );
  }

  const total = stats.easy + stats.normal + stats.hard;

  return (
    <article className="rounded-2xl border p-4">
      <h3 className="text-xl font-black">Статистика настроения</h3>
      <ul className="mt-4 space-y-2 text-sm">
        <li className="flex items-center justify-between">
          <span>Легко: {stats.easy}</span>
          <span className="font-semibold">{toPercent(stats.easy, total)}%</span>
        </li>
        <li className="flex items-center justify-between">
          <span>Нормально: {stats.normal}</span>
          <span className="font-semibold">{toPercent(stats.normal, total)}%</span>
        </li>
        <li className="flex items-center justify-between">
          <span>Сложно: {stats.hard}</span>
          <span className="font-semibold">{toPercent(stats.hard, total)}%</span>
        </li>
      </ul>
    </article>
  );
}
