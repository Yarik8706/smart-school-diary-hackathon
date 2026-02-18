import type { MoodStats } from "@/types/analytics";

interface LegacyMoodStats {
  easy: number;
  normal: number;
  hard: number;
}

interface MoodStatsCardProps {
  stats: MoodStats | LegacyMoodStats | null;
}

const toPercent = (value: number, total: number) => (total ? Math.round((value / total) * 100) : 0);

const normalizeStats = (stats: MoodStats | LegacyMoodStats) =>
  "easy_count" in stats
    ? stats
    : {
        easy_count: stats.easy,
        normal_count: stats.normal,
        hard_count: stats.hard,
      };

export function MoodStatsCard({ stats }: MoodStatsCardProps) {
  if (!stats) {
    return (
      <article className="rounded-2xl border p-4">
        <h3 className="text-xl font-black">Статистика настроения</h3>
        <p className="text-muted-foreground mt-2 text-sm">Недостаточно данных для расчёта статистики.</p>
      </article>
    );
  }

  const normalized = normalizeStats(stats);
  const total = normalized.easy_count + normalized.normal_count + normalized.hard_count;

  return (
    <article className="rounded-2xl border p-4">
      <h3 className="text-xl font-black">Статистика настроения</h3>
      <ul className="mt-4 space-y-2 text-sm">
        <li className="flex items-center justify-between"><span>Легко: {normalized.easy_count}</span><span className="font-semibold">{toPercent(normalized.easy_count, total)}%</span></li>
        <li className="flex items-center justify-between"><span>Нормально: {normalized.normal_count}</span><span className="font-semibold">{toPercent(normalized.normal_count, total)}%</span></li>
        <li className="flex items-center justify-between"><span>Сложно: {normalized.hard_count}</span><span className="font-semibold">{toPercent(normalized.hard_count, total)}%</span></li>
      </ul>
    </article>
  );
}
