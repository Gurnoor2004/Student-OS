import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, differenceInDays, isToday, isTomorrow, isPast, parseISO } from 'date-fns';
import type { AttendanceRecord, AttendanceStats, PriorityItem } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export function hashPassword(password: string): string {
  return btoa(encodeURIComponent(password + ':sos_2026'));
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy');
}

export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export function formatDateRelative(date: string): string {
  const d = parseISO(date);
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  const diff = differenceInDays(d, new Date());
  if (diff > 0 && diff <= 7) return `In ${diff} days`;
  if (diff < 0) return `${Math.abs(diff)} days ago`;
  return formatDate(date);
}

export function getDaysUntil(date: string): number {
  return differenceInDays(parseISO(date), new Date());
}

export function isOverdue(date: string): boolean {
  return isPast(parseISO(date)) && !isToday(parseISO(date));
}

export function getAttendanceStats(
  subjectId: string,
  records: AttendanceRecord[],
  warnThreshold = 75,
  critThreshold = 65,
): AttendanceStats {
  const relevant = records.filter(
    (r) => r.subjectId === subjectId && r.status !== 'cancelled',
  );
  const conducted = relevant.length;
  const attended = relevant.filter((r) => r.status === 'present').length;
  const percentage = conducted > 0 ? (attended / conducted) * 100 : 0;
  const statusLevel: AttendanceStats['statusLevel'] =
    percentage >= warnThreshold ? 'safe' : percentage >= critThreshold ? 'warning' : 'critical';
  return { attended, conducted, percentage: Math.round(percentage * 10) / 10, statusLevel };
}

export function classesToReachTarget(
  attended: number,
  conducted: number,
  target: number,
): number {
  if (conducted === 0) return 0;
  const current = (attended / conducted) * 100;
  if (current >= target) return 0;
  const x = Math.ceil((target * conducted - 100 * attended) / (100 - target));
  return x;
}

export function classesCanMiss(attended: number, conducted: number, target: number): number {
  const x = Math.floor((attended * 100 - target * conducted) / target);
  return Math.max(0, x);
}

export function calculatePriorityScore(item: {
  type: string;
  dueDate?: string;
  priority?: string;
  status?: string;
  attendance?: number;
}): number {
  let score = 0;

  if (item.dueDate) {
    const diff = getDaysUntil(item.dueDate);
    if (diff < 0) score += 100;
    else if (diff === 0) score += 90;
    else if (diff === 1) score += 75;
    else if (diff <= 3) score += 55;
    else if (diff <= 7) score += 35;
    else if (diff <= 14) score += 15;
  }

  if (item.priority === 'high') score += 30;
  else if (item.priority === 'medium') score += 15;
  else if (item.priority === 'low') score += 5;

  if (item.status === 'overdue') score += 25;
  else if (item.status === 'not_started') score += 8;

  if (item.type === 'attendance' && item.attendance !== undefined) {
    if (item.attendance < 65) score += 90;
    else if (item.attendance < 75) score += 55;
  }

  return score;
}

export function getPriorityLevel(score: number): PriorityItem['priority'] {
  if (score >= 100) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 30) return 'medium';
  return 'low';
}

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const SUBJECT_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#06b6d4',
  '#ef4444',
  '#84cc16',
  '#f97316',
];

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
