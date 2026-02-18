export interface Subject {
  id: string;
  name: string;
  color: string;
}

export interface SubjectCreate {
  name: string;
  color: string;
}

export type SubjectUpdate = SubjectCreate;

export interface ScheduleSlot {
  id: string;
  subject_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room: string;
  subject?: Subject;
}

export interface ScheduleSlotCreate {
  subject_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room: string;
}

export type ScheduleSlotUpdate = Partial<ScheduleSlotCreate>;
