export interface Homework {
  id: string;
  title: string;
  subject: string;
  subject_color: string;
}

export interface Reminder {
  id: string;
  homework_id: string;
  remind_at: string;
  is_sent: boolean;
}

export interface ReminderCreate {
  homework_id: string;
  remind_at: string;
}

export interface ReminderUpdate {
  remind_at?: string;
}

export interface ReminderView extends Reminder {
  homework: Homework | null;
}
