export interface WeekLoadDay {
  day: number;
  load_score: number;
  lessons_count: number;
  hard_subjects: string[];
  warning: string | null;
}

export interface WeekLoadAnalysis {
  days: WeekLoadDay[];
}

export interface MoodStats {
  easy_count: number;
  normal_count: number;
  hard_count: number;
}

export interface WarningsResponse {
  warnings: string[];
}
