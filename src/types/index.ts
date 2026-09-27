export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  college: string;
  university: string;
  course: string;
  branch: string;
  year: number;
  semester: number;
  createdAt: string;
}

export interface Subject {
  id: string;
  userId: string;
  name: string;
  code: string;
  teacher: string;
  room: string;
  credits: number;
  semester: number;
  color: string;
}

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface TimetableEntry {
  id: string;
  userId: string;
  subjectId: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  room: string;
  teacher: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  subjectId: string;
  date: string;
  status: 'present' | 'absent' | 'cancelled';
  timetableEntryId?: string;
}

export interface AttendanceStats {
  attended: number;
  conducted: number;
  percentage: number;
  statusLevel: 'safe' | 'warning' | 'critical';
}

export interface Assignment {
  id: string;
  userId: string;
  subjectId?: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'not_started' | 'in_progress' | 'submitted' | 'overdue';
  attachmentUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type ExamType = 'midterm' | 'final' | 'quiz' | 'practical' | 'internal' | 'other';
export type PrepStatus = 'not_started' | 'in_progress' | 'ready';

export interface Exam {
  id: string;
  userId: string;
  subjectId?: string;
  title: string;
  examType: ExamType;
  date: string;
  time: string;
  venue: string;
  syllabus?: string;
  preparationStatus: PrepStatus;
  createdAt: string;
}

export type TaskCategory = 'academic' | 'personal' | 'career' | 'projects' | 'college' | 'other';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed';
  category: TaskCategory;
  parentId?: string;
  completedAt?: string;
  createdAt: string;
}

export interface Note {
  id: string;
  userId: string;
  subjectId?: string;
  title: string;
  content: string;
  type: 'text' | 'pdf' | 'docx' | 'pptx' | 'image';
  tags: string[];
  semester?: number;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export type NoticeCategory =
  | 'academic'
  | 'administrative'
  | 'event'
  | 'exam'
  | 'fee'
  | 'placement'
  | 'other';

export interface Notice {
  id: string;
  userId: string;
  title: string;
  content: string;
  source: string;
  date: string;
  isPinned: boolean;
  isRead: boolean;
  category: NoticeCategory;
  createdAt: string;
}

export type OpportunityType =
  | 'internship'
  | 'job'
  | 'fellowship'
  | 'scholarship'
  | 'open_source'
  | 'hackathon';

export type ApplicationStatus =
  | 'saved'
  | 'applied'
  | 'assessment'
  | 'interview'
  | 'rejected'
  | 'selected';

export interface Opportunity {
  id: string;
  userId: string;
  title: string;
  company: string;
  type: OpportunityType;
  description: string;
  deadline?: string;
  applicationStatus: ApplicationStatus;
  link?: string;
  stipend?: string;
  location?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  userId: string;
  theme: 'dark' | 'light';
  attendanceWarningThreshold: number;
  attendanceCriticalThreshold: number;
}

export interface PriorityItem {
  id: string;
  type: 'assignment' | 'exam' | 'task' | 'attendance';
  title: string;
  subtitle?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  status?: string;
  link: string;
}
