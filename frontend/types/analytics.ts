export interface WeekLoadDay {
  day: string;
  load: number;
}

export interface WeekLoadAnalysis {
  days: WeekLoadDay[];
}

export interface MoodStats {
  easy: number;
  normal: number;
  hard: number;
}

export interface WarningItem {
  id: string;
  day: string;
  message: string;
  recommendation: string;
}
