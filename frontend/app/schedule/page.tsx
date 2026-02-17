import SchedulePageClient from "@/components/schedule/schedule-page-client";

export default function SchedulePage() {
  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-black">Расписание уроков</h2>
      <SchedulePageClient />;
    </section>
  );
}
