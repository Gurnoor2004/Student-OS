import type {
  User,
  Subject,
  TimetableEntry,
  AttendanceRecord,
  Assignment,
  Exam,
  Task,
  Note,
  Notice,
  Opportunity,
  AppSettings,
} from '@/types';
import { generateId } from './utils';

const KEYS = {
  users: 'sos_users',
  session: 'sos_session',
  subjects: 'sos_subjects',
  timetable: 'sos_timetable',
  attendance: 'sos_attendance',
  assignments: 'sos_assignments',
  exams: 'sos_exams',
  tasks: 'sos_tasks',
  notes: 'sos_notes',
  notices: 'sos_notices',
  opportunities: 'sos_opportunities',
  settings: 'sos_settings',
  seeded: 'sos_seeded',
} as const;

function read<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]') as T[];
  } catch {
    return [];
  }
}

function write<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export const db = {
  users: {
    getAll: () => read<User>(KEYS.users),
    findById: (id: string) => read<User>(KEYS.users).find((u) => u.id === id),
    findByEmail: (email: string) =>
      read<User>(KEYS.users).find((u) => u.email.toLowerCase() === email.toLowerCase()),
    create: (data: Omit<User, 'id' | 'createdAt'>): User => {
      const users = read<User>(KEYS.users);
      const user: User = { ...data, id: generateId(), createdAt: new Date().toISOString() };
      write(KEYS.users, [...users, user]);
      return user;
    },
    update: (id: string, updates: Partial<User>): User => {
      const users = read<User>(KEYS.users).map((u) => (u.id === id ? { ...u, ...updates } : u));
      write(KEYS.users, users);
      return users.find((u) => u.id === id)!;
    },
  },

  session: {
    get: (): string | null => {
      try {
        const s = localStorage.getItem(KEYS.session);
        return s ? JSON.parse(s).userId : null;
      } catch {
        return null;
      }
    },
    set: (userId: string) =>
      localStorage.setItem(KEYS.session, JSON.stringify({ userId })),
    clear: () => localStorage.removeItem(KEYS.session),
  },

  subjects: {
    getForUser: (userId: string) =>
      read<Subject>(KEYS.subjects).filter((s) => s.userId === userId),
    create: (data: Omit<Subject, 'id'>): Subject => {
      const all = read<Subject>(KEYS.subjects);
      const item: Subject = { ...data, id: generateId() };
      write(KEYS.subjects, [...all, item]);
      return item;
    },
    update: (id: string, updates: Partial<Subject>): Subject => {
      const all = read<Subject>(KEYS.subjects).map((s) =>
        s.id === id ? { ...s, ...updates } : s,
      );
      write(KEYS.subjects, all);
      return all.find((s) => s.id === id)!;
    },
    delete: (id: string) =>
      write(KEYS.subjects, read<Subject>(KEYS.subjects).filter((s) => s.id !== id)),
  },

  timetable: {
    getForUser: (userId: string) =>
      read<TimetableEntry>(KEYS.timetable).filter((t) => t.userId === userId),
    create: (data: Omit<TimetableEntry, 'id'>): TimetableEntry => {
      const all = read<TimetableEntry>(KEYS.timetable);
      const item: TimetableEntry = { ...data, id: generateId() };
      write(KEYS.timetable, [...all, item]);
      return item;
    },
    update: (id: string, updates: Partial<TimetableEntry>): TimetableEntry => {
      const all = read<TimetableEntry>(KEYS.timetable).map((t) =>
        t.id === id ? { ...t, ...updates } : t,
      );
      write(KEYS.timetable, all);
      return all.find((t) => t.id === id)!;
    },
    delete: (id: string) =>
      write(
        KEYS.timetable,
        read<TimetableEntry>(KEYS.timetable).filter((t) => t.id !== id),
      ),
  },

  attendance: {
    getForUser: (userId: string) =>
      read<AttendanceRecord>(KEYS.attendance).filter((a) => a.userId === userId),
    create: (data: Omit<AttendanceRecord, 'id'>): AttendanceRecord => {
      const all = read<AttendanceRecord>(KEYS.attendance);
      const item: AttendanceRecord = { ...data, id: generateId() };
      write(KEYS.attendance, [...all, item]);
      return item;
    },
    update: (id: string, updates: Partial<AttendanceRecord>): AttendanceRecord => {
      const all = read<AttendanceRecord>(KEYS.attendance).map((a) =>
        a.id === id ? { ...a, ...updates } : a,
      );
      write(KEYS.attendance, all);
      return all.find((a) => a.id === id)!;
    },
    delete: (id: string) =>
      write(
        KEYS.attendance,
        read<AttendanceRecord>(KEYS.attendance).filter((a) => a.id !== id),
      ),
    upsertByDate: (
      userId: string,
      subjectId: string,
      date: string,
      status: AttendanceRecord['status'],
    ): AttendanceRecord => {
      const all = read<AttendanceRecord>(KEYS.attendance);
      const existing = all.find(
        (a) => a.userId === userId && a.subjectId === subjectId && a.date === date,
      );
      if (existing) {
        const updated = all.map((a) =>
          a.id === existing.id ? { ...a, status } : a,
        );
        write(KEYS.attendance, updated);
        return updated.find((a) => a.id === existing.id)!;
      }
      const item: AttendanceRecord = { id: generateId(), userId, subjectId, date, status };
      write(KEYS.attendance, [...all, item]);
      return item;
    },
  },

  assignments: {
    getForUser: (userId: string) =>
      read<Assignment>(KEYS.assignments).filter((a) => a.userId === userId),
    create: (data: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>): Assignment => {
      const all = read<Assignment>(KEYS.assignments);
      const now = new Date().toISOString();
      const item: Assignment = { ...data, id: generateId(), createdAt: now, updatedAt: now };
      write(KEYS.assignments, [...all, item]);
      return item;
    },
    update: (id: string, updates: Partial<Assignment>): Assignment => {
      const all = read<Assignment>(KEYS.assignments).map((a) =>
        a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a,
      );
      write(KEYS.assignments, all);
      return all.find((a) => a.id === id)!;
    },
    delete: (id: string) =>
      write(KEYS.assignments, read<Assignment>(KEYS.assignments).filter((a) => a.id !== id)),
  },

  exams: {
    getForUser: (userId: string) =>
      read<Exam>(KEYS.exams).filter((e) => e.userId === userId),
    create: (data: Omit<Exam, 'id' | 'createdAt'>): Exam => {
      const all = read<Exam>(KEYS.exams);
      const item: Exam = { ...data, id: generateId(), createdAt: new Date().toISOString() };
      write(KEYS.exams, [...all, item]);
      return item;
    },
    update: (id: string, updates: Partial<Exam>): Exam => {
      const all = read<Exam>(KEYS.exams).map((e) =>
        e.id === id ? { ...e, ...updates } : e,
      );
      write(KEYS.exams, all);
      return all.find((e) => e.id === id)!;
    },
    delete: (id: string) =>
      write(KEYS.exams, read<Exam>(KEYS.exams).filter((e) => e.id !== id)),
  },

  tasks: {
    getForUser: (userId: string) =>
      read<Task>(KEYS.tasks).filter((t) => t.userId === userId),
    create: (data: Omit<Task, 'id' | 'createdAt'>): Task => {
      const all = read<Task>(KEYS.tasks);
      const item: Task = { ...data, id: generateId(), createdAt: new Date().toISOString() };
      write(KEYS.tasks, [...all, item]);
      return item;
    },
    update: (id: string, updates: Partial<Task>): Task => {
      const all = read<Task>(KEYS.tasks).map((t) =>
        t.id === id ? { ...t, ...updates } : t,
      );
      write(KEYS.tasks, all);
      return all.find((t) => t.id === id)!;
    },
    delete: (id: string) =>
      write(KEYS.tasks, read<Task>(KEYS.tasks).filter((t) => t.id !== id)),
  },

  notes: {
    getForUser: (userId: string) =>
      read<Note>(KEYS.notes).filter((n) => n.userId === userId),
    create: (data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Note => {
      const all = read<Note>(KEYS.notes);
      const now = new Date().toISOString();
      const item: Note = { ...data, id: generateId(), createdAt: now, updatedAt: now };
      write(KEYS.notes, [...all, item]);
      return item;
    },
    update: (id: string, updates: Partial<Note>): Note => {
      const all = read<Note>(KEYS.notes).map((n) =>
        n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n,
      );
      write(KEYS.notes, all);
      return all.find((n) => n.id === id)!;
    },
    delete: (id: string) =>
      write(KEYS.notes, read<Note>(KEYS.notes).filter((n) => n.id !== id)),
  },

  notices: {
    getForUser: (userId: string) =>
      read<Notice>(KEYS.notices).filter((n) => n.userId === userId),
    create: (data: Omit<Notice, 'id' | 'createdAt'>): Notice => {
      const all = read<Notice>(KEYS.notices);
      const item: Notice = { ...data, id: generateId(), createdAt: new Date().toISOString() };
      write(KEYS.notices, [...all, item]);
      return item;
    },
    update: (id: string, updates: Partial<Notice>): Notice => {
      const all = read<Notice>(KEYS.notices).map((n) =>
        n.id === id ? { ...n, ...updates } : n,
      );
      write(KEYS.notices, all);
      return all.find((n) => n.id === id)!;
    },
    delete: (id: string) =>
      write(KEYS.notices, read<Notice>(KEYS.notices).filter((n) => n.id !== id)),
  },

  opportunities: {
    getForUser: (userId: string) =>
      read<Opportunity>(KEYS.opportunities).filter((o) => o.userId === userId),
    create: (data: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'>): Opportunity => {
      const all = read<Opportunity>(KEYS.opportunities);
      const now = new Date().toISOString();
      const item: Opportunity = { ...data, id: generateId(), createdAt: now, updatedAt: now };
      write(KEYS.opportunities, [...all, item]);
      return item;
    },
    update: (id: string, updates: Partial<Opportunity>): Opportunity => {
      const all = read<Opportunity>(KEYS.opportunities).map((o) =>
        o.id === id ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o,
      );
      write(KEYS.opportunities, all);
      return all.find((o) => o.id === id)!;
    },
    delete: (id: string) =>
      write(
        KEYS.opportunities,
        read<Opportunity>(KEYS.opportunities).filter((o) => o.id !== id),
      ),
  },

  settings: {
    getForUser: (userId: string): AppSettings =>
      read<AppSettings>(KEYS.settings).find((s) => s.userId === userId) ?? {
        userId,
        theme: 'dark',
        attendanceWarningThreshold: 75,
        attendanceCriticalThreshold: 65,
      },
    save: (settings: AppSettings) => {
      const all = read<AppSettings>(KEYS.settings).filter((s) => s.userId !== settings.userId);
      write(KEYS.settings, [...all, settings]);
    },
  },

  seeded: {
    has: (userId: string) => read<string>(KEYS.seeded).includes(userId),
    mark: (userId: string) => {
      const all = read<string>(KEYS.seeded);
      if (!all.includes(userId)) write(KEYS.seeded, [...all, userId]);
    },
  },
};
