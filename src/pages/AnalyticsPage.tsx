import { useMemo } from 'react';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getAttendanceStats } from '@/lib/utils';

const COLORS = ['#818cf8', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#a78bfa'];

export function AnalyticsPage() {
  const { subjects, attendance, assignments, exams, tasks, settings } = useApp();

  // Attendance per subject
  const attendanceData = useMemo(
    () =>
      subjects.map((s, i) => {
        const stats = getAttendanceStats(s.id, attendance, settings.attendanceWarningThreshold, settings.attendanceCriticalThreshold);
        return {
          name: s.name.split(' ').slice(0, 2).join(' '),
          percentage: stats.percentage,
          attended: stats.attended,
          conducted: stats.conducted,
          color: s.color,
          status: stats.statusLevel,
        };
      }),
    [subjects, attendance, settings],
  );

  // Attendance trend over last 14 days
  const trend = useMemo(() => {
    const days = eachDayOfInterval({ start: subDays(new Date(), 13), end: new Date() });
    return days.map((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayRecords = attendance.filter((a) => a.date === dateStr && a.status !== 'cancelled');
      const present = dayRecords.filter((a) => a.status === 'present').length;
      const total = dayRecords.length;
      return {
        date: format(day, 'MMM d'),
        percentage: total > 0 ? Math.round((present / total) * 100) : null,
        classes: total,
      };
    });
  }, [attendance]);

  // Assignment status distribution
  const assignmentDist = useMemo(() => {
    const counts = assignments.reduce(
      (acc, a) => {
        acc[a.status] = (acc[a.status] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    return [
      { name: 'Not Started', value: counts.not_started ?? 0, color: '#64748b' },
      { name: 'In Progress', value: counts.in_progress ?? 0, color: '#818cf8' },
      { name: 'Submitted', value: counts.submitted ?? 0, color: '#22c55e' },
      { name: 'Overdue', value: counts.overdue ?? 0, color: '#ef4444' },
    ].filter((d) => d.value > 0);
  }, [assignments]);

  // Task category breakdown
  const tasksByCategory = useMemo(() => {
    const cats = tasks.reduce((acc, t) => {
      if (!acc[t.category]) acc[t.category] = { pending: 0, completed: 0 };
      if (t.status === 'completed') acc[t.category].completed++;
      else acc[t.category].pending++;
      return acc;
    }, {} as Record<string, { pending: number; completed: number }>);
    return Object.entries(cats).map(([cat, counts]) => ({
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      pending: counts.pending,
      completed: counts.completed,
    }));
  }, [tasks]);

  // Summary stats
  const totalClasses = attendance.filter((a) => a.status !== 'cancelled').length;
  const presentClasses = attendance.filter((a) => a.status === 'present').length;
  const overallPct = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const taskRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const submittedAssignments = assignments.filter((a) => a.status === 'submitted').length;
  const assignmentRate = assignments.length > 0 ? Math.round((submittedAssignments / assignments.length) * 100) : 0;

  const tooltipStyle = {
    backgroundColor: 'var(--popover)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    color: 'var(--foreground)',
    fontSize: '12px',
  };

  return (
    <div className="space-y-5 max-w-6xl">
      <div>
        <h2 className="font-display font-semibold text-xl">Analytics</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Your academic performance at a glance</p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard label="Overall Attendance" value={`${overallPct}%`} sub={`${presentClasses}/${totalClasses} classes`} color={overallPct >= 75 ? 'text-success' : overallPct >= 65 ? 'text-warning' : 'text-danger'} />
        <SummaryCard label="Assignment Rate" value={`${assignmentRate}%`} sub={`${submittedAssignments}/${assignments.length} submitted`} color="text-primary" />
        <SummaryCard label="Task Completion" value={`${taskRate}%`} sub={`${completedTasks}/${tasks.length} tasks done`} color="text-success" />
        <SummaryCard label="Subjects Tracked" value={subjects.length} sub={`${exams.filter(e => new Date(e.date) >= new Date()).length} upcoming exams`} color="text-foreground" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Attendance per subject */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Attendance by Subject</CardTitle>
          </CardHeader>
          <CardContent>
            {attendanceData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No attendance data yet</p>
            ) : (
              <div className="space-y-4">
                {attendanceData.map((s) => (
                  <div key={s.name}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-medium">{s.name}</span>
                      <span className={s.status === 'critical' ? 'text-danger' : s.status === 'warning' ? 'text-warning' : 'text-success'}>
                        {s.percentage}%
                      </span>
                    </div>
                    <Progress
                      value={s.percentage}
                      color={s.status === 'critical' ? 'var(--danger)' : s.status === 'warning' ? 'var(--warning)' : 'var(--success)'}
                    />
                    <p className="text-[10px] text-muted-foreground mt-0.5">{s.attended}/{s.conducted} classes attended</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attendance trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">14-Day Attendance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trend} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <defs>
                  <linearGradient id="attendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, 'Attendance']} />
                <Area type="monotone" dataKey="percentage" stroke="var(--primary)" strokeWidth={2} fill="url(#attendGrad)" connectNulls />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Assignment distribution */}
        {assignmentDist.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Assignment Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={assignmentDist} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={10}>
                    {assignmentDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Tasks by category */}
        {tasksByCategory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Tasks by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={tasksByCategory} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="completed" stackId="a" fill="var(--success)" name="Completed" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="pending" stackId="a" fill="var(--muted-foreground)" name="Pending" radius={[4, 4, 0, 0]} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, sub, color }: { label: string; value: string | number; sub: string; color: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className={`text-2xl font-bold font-display ${color}`}>{value}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
      </CardContent>
    </Card>
  );
}
