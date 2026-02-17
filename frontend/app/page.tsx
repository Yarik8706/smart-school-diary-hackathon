const dashboardCards = [
  {
    title: "Ближайшая домашка",
    value: "Алгебра — до 18:00",
    description: "Осталось 2 задачи и проверка ответов.",
  },
  {
    title: "Сегодня по расписанию",
    value: "6 уроков",
    description: "Физика, литература, информатика и другие.",
  },
  {
    title: "Предупреждения",
    value: "1 риск",
    description: "Контрольная по биологии уже завтра.",
  },
];

export default function Home() {
  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <p className="text-primary text-sm font-semibold tracking-[0.2em] uppercase">
          Дашборд
        </p>
        <h2 className="text-3xl font-black tracking-tight md:text-5xl">
          Учись спокойно и без дедлайн-паники
        </h2>
        <p className="text-muted-foreground max-w-2xl text-sm md:text-base">
          Здесь собрана ключевая сводка по дню: что сдавать, что учить и где не
          забыть про напоминание.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
        <article className="border-primary/30 bg-primary text-primary-foreground rounded-3xl border p-6">
          <p className="text-sm">Фокус дня</p>
          <h3 className="mt-2 text-2xl font-black">Подготовка к контрольной</h3>
          <p className="mt-3 max-w-lg text-sm opacity-95">
            Разбей повторение на три блока по 20 минут и добавь паузы. Так проще
            держать концентрацию и не перегружаться.
          </p>
        </article>
        <article className="rounded-3xl border border-border/70 bg-card p-6">
          <h3 className="text-lg font-bold">Быстрые действия</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>• Добавить новое ДЗ</li>
            <li>• Поставить напоминание</li>
            <li>• Проверить нагрузку недели</li>
          </ul>
        </article>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {dashboardCards.map((card) => (
          <article key={card.title} className="rounded-2xl border border-border/70 bg-card p-4">
            <p className="text-muted-foreground text-xs">{card.title}</p>
            <p className="mt-1 text-xl font-bold">{card.value}</p>
            <p className="text-muted-foreground mt-2 text-sm">{card.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
