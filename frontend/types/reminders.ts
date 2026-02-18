export interface ReminderSubject {
  name: string;
  color: string;
}

export interface Homework {
  id: string;
  title: string;
  subject?: ReminderSubject | null;
}

export interface Reminder {
  id: string;
  homework_id: string;
  homework: Homework | null;
  remind_at: string;
  is_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReminderCreate {
  homework_id: string;
  remind_at: string;
}

export interface ReminderUpdate {
  remind_at?: string;
}

export type ReminderView = Reminder;
