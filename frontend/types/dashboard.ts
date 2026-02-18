export interface DashboardSummary {
  nearestHomework: {
    title: string;
    deadline: string;
    remaining: string;
  } | null;
  todayLessons: {
    count: number;
    subjects: string[];
  };
  warnings: {
    count: number;
    description: string;
  };
}
