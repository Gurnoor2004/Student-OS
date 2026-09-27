import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type {
  Subject, TimetableEntry, AttendanceRecord, Assignment,
  Exam, Task, Note, Notice, Opportunity, AppSettings, PriorityItem,
} from '@/types';
import { db } from '@/lib/storage';
import { seedPrototypeData } from '@/lib/seed';
import { useAuth } from './AuthContext';
import {
  getAttendanceStats, calculatePriorityScore, getPriorityLevel,
  getDaysUntil, isOverdue,
} from '@/lib/utils';

interface AppContextValue {
  // Data
  subjects: Subject[];
  timetable: TimetableEntry[];
  attendance: AttendanceRecord[];
  assignments: Assignment[];
  exams: Exam[];
  tasks: Task[];
  notes: Note[];
  notices: Notice[];
  opportunities: Opportunity[];
  settings: AppSettings;

  // Subjects
  addSubject: (s: Omit<Subject, 'id' | 'userId'>) => void;
  updateSubject: (id: string, s: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

  // Timetable
  addTimetableEntry: (e: Omit<TimetableEntry, 'id' | 'userId'>) => void;
  updateTimetableEntry: (id: string, e: Partial<TimetableEntry>) => void;
  deleteTimetableEntry: (id: string) => void;

  // Attendance
  markAttendance: (subjectId: string, date: string, status: AttendanceRecord['status']) => void;
  deleteAttendance: (id: string) => void;

  // Assignments
  addAssignment: (a: Omit<Assignment, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  updateAssignment: (id: string, a: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;

  // Exams
  addExam: (e: Omit<Exam, 'id' | 'userId' | 'createdAt'>) => void;
  updateExam: (id: string, e: Partial<Exam>) => void;
  deleteExam: (id: string) => void;

  // Tasks
  addTask: (t: Omit<Task, 'id' | 'userId' | 'createdAt'>) => void;
  updateTask: (id: string, t: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;

  // Notes
  addNote: (n: Omit<Note, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, n: Partial<Note>) => void;
  deleteNote: (id: string) => void;

  // Notices
  addNotice: (n: Omit<Notice, 'id' | 'userId' | 'createdAt'>) => void;
  updateNotice: (id: string, n: Partial<Notice>) => void;
  deleteNotice: (id: string) => void;
  markAllNoticesRead: () => void;

  // Opportunities
  addOpportunity: (o: Omit<Opportunity, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  updateOpportunity: (id: string, o: Partial<Opportunity>) => void;
  deleteOpportunity: (id: string) => void;

  // Settings
  saveSettings: (s: AppSettings) => void;

  // Computed
  getTodayClasses: () => TimetableEntry[];
  getNextClass: () => TimetableEntry | null;
  getAttendanceForSubject: (id: string) => ReturnType<typeof getAttendanceStats>;
  getPriorityQueue: () => PriorityItem[];
  getSubjectById: (id: string) => Subject | undefined;
  syncOverdueAssignments: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    userId: '',
    theme: 'dark',
    attendanceWarningThreshold: 75,
    attendanceCriticalThreshold: 65,
  });

  const reload = useCallback((uid: string) => {
    seedPrototypeData(uid);
    setSubjects(db.subjects.getForUser(uid));
    setTimetable(db.timetable.getForUser(uid));
    setAttendance(db.attendance.getForUser(uid));
    setAssignments(db.assignments.getForUser(uid));
    setExams(db.exams.getForUser(uid));
    setTasks(db.tasks.getForUser(uid));
    setNotes(db.notes.getForUser(uid));
    setNotices(db.notices.getForUser(uid));
    setOpportunities(db.opportunities.getForUser(uid));
    setSettings(db.settings.getForUser(uid));
  }, []);

  useEffect(() => {
    if (user) {
      reload(user.id);
    } else {
      setSubjects([]); setTimetable([]); setAttendance([]);
      setAssignments([]); setExams([]); setTasks([]);
      setNotes([]); setNotices([]); setOpportunities([]);
    }
  }, [user?.id, reload]);

  // Auto-sync overdue assignments
  const syncOverdueAssignments = useCallback(() => {
    if (!user) return;
    const updated = assignments.map((a) => {
      if (a.status !== 'submitted' && a.status !== 'overdue' && isOverdue(a.dueDate)) {
        return db.assignments.update(a.id, { status: 'overdue' });
      }
      return a;
    });
    setAssignments(updated);
  }, [assignments, user]);

  useEffect(() => {
    syncOverdueAssignments();
  }, []);

  const getSubjectById = (id: string) => subjects.find((s) => s.id === id);

  const getTodayClasses = useCallback((): TimetableEntry[] => {
    const today = new Date().getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
    return timetable
      .filter((e) => e.day === today)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [timetable]);

  const getNextClass = useCallback((): TimetableEntry | null => {
    const now = new Date();
    const todayClasses = getTodayClasses();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    return todayClasses.find((c) => c.startTime > timeStr) ?? null;
  }, [getTodayClasses]);

  const getAttendanceForSubject = useCallback(
    (id: string) =>
      getAttendanceStats(
        id,
        attendance,
        settings.attendanceWarningThreshold,
        settings.attendanceCriticalThreshold,
      ),
    [attendance, settings],
  );

  const getPriorityQueue = useCallback((): PriorityItem[] => {
    const items: PriorityItem[] = [];

    for (const a of assignments) {
      if (a.status === 'submitted') continue;
      const score = calculatePriorityScore({ type: 'assignment', dueDate: a.dueDate, priority: a.priority, status: a.status });
      items.push({
        id: a.id, type: 'assignment',
        title: a.title, subtitle: getSubjectById(a.subjectId ?? '')?.name,
        dueDate: a.dueDate, priority: getPriorityLevel(score), score, status: a.status, link: '/assignments',
      });
    }

    for (const e of exams) {
      if (getDaysUntil(e.date) < 0) continue;
      const score = calculatePriorityScore({ type: 'exam', dueDate: e.date, priority: 'high' });
      items.push({
        id: e.id, type: 'exam',
        title: e.title, subtitle: getSubjectById(e.subjectId ?? '')?.name,
        dueDate: e.date, priority: getPriorityLevel(score), score, link: '/exams',
      });
    }

    for (const t of tasks) {
      if (t.status === 'completed') continue;
      const score = calculatePriorityScore({ type: 'task', dueDate: t.dueDate, priority: t.priority });
      items.push({
        id: t.id, type: 'task',
        title: t.title, dueDate: t.dueDate,
        priority: getPriorityLevel(score), score, link: '/tasks',
      });
    }

    for (const s of subjects) {
      const stats = getAttendanceForSubject(s.id);
      if (stats.statusLevel !== 'safe') {
        const score = calculatePriorityScore({ type: 'attendance', attendance: stats.percentage });
        items.push({
          id: s.id, type: 'attendance',
          title: `Low attendance: ${s.name}`,
          subtitle: `${stats.percentage}% (${stats.attended}/${stats.conducted})`,
          priority: stats.statusLevel === 'critical' ? 'critical' : 'high',
          score, link: '/attendance',
        });
      }
    }

    return items.sort((a, b) => b.score - a.score).slice(0, 10);
  }, [assignments, exams, tasks, subjects, getAttendanceForSubject, getSubjectById]);

  // CRUD helpers
  const addSubject = (s: Omit<Subject, 'id' | 'userId'>) => {
    const item = db.subjects.create({ ...s, userId: user!.id });
    setSubjects((p) => [...p, item]);
  };
  const updateSubject = (id: string, s: Partial<Subject>) => {
    const item = db.subjects.update(id, s);
    setSubjects((p) => p.map((x) => (x.id === id ? item : x)));
  };
  const deleteSubject = (id: string) => {
    db.subjects.delete(id);
    setSubjects((p) => p.filter((x) => x.id !== id));
  };

  const addTimetableEntry = (e: Omit<TimetableEntry, 'id' | 'userId'>) => {
    const item = db.timetable.create({ ...e, userId: user!.id });
    setTimetable((p) => [...p, item]);
  };
  const updateTimetableEntry = (id: string, e: Partial<TimetableEntry>) => {
    const item = db.timetable.update(id, e);
    setTimetable((p) => p.map((x) => (x.id === id ? item : x)));
  };
  const deleteTimetableEntry = (id: string) => {
    db.timetable.delete(id);
    setTimetable((p) => p.filter((x) => x.id !== id));
  };

  const markAttendance = (subjectId: string, date: string, status: AttendanceRecord['status']) => {
    const item = db.attendance.upsertByDate(user!.id, subjectId, date, status);
    setAttendance((p) => {
      const filtered = p.filter((a) => !(a.subjectId === subjectId && a.date === date));
      return [...filtered, item];
    });
  };
  const deleteAttendance = (id: string) => {
    db.attendance.delete(id);
    setAttendance((p) => p.filter((x) => x.id !== id));
  };

  const addAssignment = (a: Omit<Assignment, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const item = db.assignments.create({ ...a, userId: user!.id });
    setAssignments((p) => [...p, item]);
  };
  const updateAssignment = (id: string, a: Partial<Assignment>) => {
    const item = db.assignments.update(id, a);
    setAssignments((p) => p.map((x) => (x.id === id ? item : x)));
  };
  const deleteAssignment = (id: string) => {
    db.assignments.delete(id);
    setAssignments((p) => p.filter((x) => x.id !== id));
  };

  const addExam = (e: Omit<Exam, 'id' | 'userId' | 'createdAt'>) => {
    const item = db.exams.create({ ...e, userId: user!.id });
    setExams((p) => [...p, item]);
  };
  const updateExam = (id: string, e: Partial<Exam>) => {
    const item = db.exams.update(id, e);
    setExams((p) => p.map((x) => (x.id === id ? item : x)));
  };
  const deleteExam = (id: string) => {
    db.exams.delete(id);
    setExams((p) => p.filter((x) => x.id !== id));
  };

  const addTask = (t: Omit<Task, 'id' | 'userId' | 'createdAt'>) => {
    const item = db.tasks.create({ ...t, userId: user!.id });
    setTasks((p) => [...p, item]);
  };
  const updateTask = (id: string, t: Partial<Task>) => {
    const item = db.tasks.update(id, t);
    setTasks((p) => p.map((x) => (x.id === id ? item : x)));
  };
  const deleteTask = (id: string) => {
    db.tasks.delete(id);
    setTasks((p) => p.filter((x) => x.id !== id));
  };
  const toggleTask = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const updates: Partial<Task> =
      task.status === 'completed'
        ? { status: 'pending', completedAt: undefined }
        : { status: 'completed', completedAt: new Date().toISOString() };
    updateTask(id, updates);
  };

  const addNote = (n: Omit<Note, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const item = db.notes.create({ ...n, userId: user!.id });
    setNotes((p) => [...p, item]);
  };
  const updateNote = (id: string, n: Partial<Note>) => {
    const item = db.notes.update(id, n);
    setNotes((p) => p.map((x) => (x.id === id ? item : x)));
  };
  const deleteNote = (id: string) => {
    db.notes.delete(id);
    setNotes((p) => p.filter((x) => x.id !== id));
  };

  const addNotice = (n: Omit<Notice, 'id' | 'userId' | 'createdAt'>) => {
    const item = db.notices.create({ ...n, userId: user!.id });
    setNotices((p) => [...p, item]);
  };
  const updateNotice = (id: string, n: Partial<Notice>) => {
    const item = db.notices.update(id, n);
    setNotices((p) => p.map((x) => (x.id === id ? item : x)));
  };
  const deleteNotice = (id: string) => {
    db.notices.delete(id);
    setNotices((p) => p.filter((x) => x.id !== id));
  };
  const markAllNoticesRead = () => {
    if (!user) return;
    notices.forEach((n) => {
      if (!n.isRead) {
        db.notices.update(n.id, { isRead: true });
      }
    });
    setNotices((p) => p.map((x) => ({ ...x, isRead: true })));
  };

  const addOpportunity = (o: Omit<Opportunity, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const item = db.opportunities.create({ ...o, userId: user!.id });
    setOpportunities((p) => [...p, item]);
  };
  const updateOpportunity = (id: string, o: Partial<Opportunity>) => {
    const item = db.opportunities.update(id, o);
    setOpportunities((p) => p.map((x) => (x.id === id ? item : x)));
  };
  const deleteOpportunity = (id: string) => {
    db.opportunities.delete(id);
    setOpportunities((p) => p.filter((x) => x.id !== id));
  };

  const saveSettings = (s: AppSettings) => {
    db.settings.save(s);
    setSettings(s);
  };

  return (
    <AppContext.Provider
      value={{
        subjects, timetable, attendance, assignments, exams,
        tasks, notes, notices, opportunities, settings,
        addSubject, updateSubject, deleteSubject,
        addTimetableEntry, updateTimetableEntry, deleteTimetableEntry,
        markAttendance, deleteAttendance,
        addAssignment, updateAssignment, deleteAssignment,
        addExam, updateExam, deleteExam,
        addTask, updateTask, deleteTask, toggleTask,
        addNote, updateNote, deleteNote,
        addNotice, updateNotice, deleteNotice, markAllNoticesRead,
        addOpportunity, updateOpportunity, deleteOpportunity,
        saveSettings,
        getTodayClasses, getNextClass, getAttendanceForSubject,
        getPriorityQueue, getSubjectById, syncOverdueAssignments,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
