export type MoodLevel = "easy" | "normal" | "hard";

export interface Subject {
  id: string;
  name: string;
  color: string;
}

export interface HomeworkStep {
  id: string;
  title: string;
  order: number;
  is_completed: boolean;
}

export interface Homework {
  id: string;
  subject_id: string;
  title: string;
  description?: string;
  deadline: string;
  is_completed: boolean;
  steps?: HomeworkStep[];
}

export interface HomeworkCreate {
  subject_id: string;
  title: string;
  description?: string;
  deadline: string;
}

export interface HomeworkUpdate {
  subject_id?: string;
  title?: string;
  description?: string;
  deadline?: string;
  is_completed?: boolean;
}

export interface GenerateStepsResponse {
  steps: HomeworkStep[];
  count: number;
}

export type HomeworkStatusFilter = "all" | "completed" | "active";
export type HomeworkDeadlineFilter = "all" | "week" | "month";

export interface HomeworkFiltersState {
  subject: string;
  status: HomeworkStatusFilter;
  deadline: HomeworkDeadlineFilter;
}
