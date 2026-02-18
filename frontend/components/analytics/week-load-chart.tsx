import type { WeekLoadDay } from "@/types/analytics";

interface LegacyWeekLoadDay {
  day: string;
  load: number;
}

interface WeekLoadChartProps {
  days: Array<WeekLoadDay | LegacyWeekLoadDay>;
}

const weekDayLabel: Record<number, string> = { 0: "Вс", 1: "Пн", 2: "Вт", 3: "Ср", 4: "Чт", 5: "Пт", 6: "Сб" };

const widthSteps = ["w-[8%]", "w-[16%]", "w-[24%]", "w-[32%]", "w-[40%]", "w-[48%]", "w-[56%]", "w-[64%]", "w-[72%]", "w-[80%]", "w-[88%]", "w-full"] as const;

const getLoadColor = (value: number) => (value <= 3 ? "bg-emerald-500" : value <= 6 ? "bg-amber-400" : "bg-rose-500");

const getLoadWidth = (value: number, max: number) => {
  const ratio = max ? value / max : 0;
  return widthSteps[Math.max(0, Math.min(widthSteps.length - 1, Math.round(ratio * 11)))];
};

const getDayLabel = (day: WeekLoadDay | LegacyWeekLoadDay) =>
  typeof day.day === "number" ? weekDayLabel[day.day] ?? `День ${day.day}` : day.day;

const getLoadValue = (day: WeekLoadDay | LegacyWeekLoadDay) =>
  "load_score" in day ? day.load_score : day.load;

export function WeekLoadChart({ days }: WeekLoadChartProps) {
  if (!days.length) {
    return (
      <article className="rounded-2xl border p-4">
        <h3 className="text-xl font-black">Нагрузка по дням</h3>
        <p className="text-muted-foreground mt-2 text-sm">Пока нет данных по нагрузке за неделю.</p>
      </article>
    );
  }

  const maxLoad = Math.max(...days.map(getLoadValue), 1);

  return (
    <article className="rounded-2xl border p-4">
      <h3 className="text-xl font-black">Нагрузка по дням</h3>
      <ul className="mt-4 space-y-3" role="list">
        {days.map((item, index) => {
          const dayLabel = getDayLabel(item);
          const loadValue = getLoadValue(item);
          return (
            <li key={`${dayLabel}-${index}`} className="grid grid-cols-[88px_1fr_34px] items-center gap-3">
              <span className="text-sm font-semibold">{dayLabel}</span>
              <div className="bg-muted h-3 rounded-full">
                <div className={`h-3 rounded-full transition-all duration-500 ${getLoadColor(loadValue)} ${getLoadWidth(loadValue, maxLoad)}`} aria-label={`Нагрузка ${dayLabel}: ${loadValue}`} />
              </div>
              <span className="text-right text-sm font-semibold">{loadValue}</span>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 flex flex-wrap gap-4 text-xs" aria-label="Легенда нагрузок">
        <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Лёгкая</span>
        <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-400" /> Средняя</span>
        <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-rose-500" /> Высокая</span>
      </div>
    </article>
  );
}
