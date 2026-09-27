import { format } from 'date-fns';
import { CheckCircle2, Circle, Clock, BookOpen, GraduationCap, AlertTriangle, Zap } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatTime, getDaysUntil, formatDateRelative } from '@/lib/utils';

export function TodayPage() {
  const { user } = useAuth();
  const {
    getTodayClasses, getNextClass, getSubjectById,
    assignments, exams, tasks, toggleTask, getAttendanceForSubject, subjects,
  } = useApp();

  const todayClasses = getTodayClasses();
  const nextClass = getNextClass();
  const now = new Date();
  const dateStr = format(now, 'EEEE, MMMM d, yyyy');

  const todayAssignments = assignments.filter(
    (a) => a.status !== 'submitted' && getDaysUntil(a.dueDate) <= 1
  );
  const upcomingExams = exams
    .filter((e) => getDaysUntil(e.date) >= 0 && getDaysUntil(e.date) <= 7)
    .sort((a, b) => a.date.localeCompare(b.date));
  const pendingTasks = tasks.filter((t) => t.status === 'pending').slice(0, 8);
  const criticalAttendance = subjects.filter((s) => {
    const stats = getAttendanceForSubject(s.id);
    return stats.statusLevel === 'critical';
  });

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold">Today</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{dateStr}</p>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <span className="text-sm text-muted-foreground">
            {pendingTasks.length} tasks pending
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Today's classes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Today's Classes
                <Badge variant="secondary">{todayClasses.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {todayClasses.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No classes scheduled today
                </p>
              ) : (
                todayClasses.map((cls) => {
                  const subject = getSubjectById(cls.subjectId);
                  const isNext = nextClass?.id === cls.id;
                  const isPast = cls.endTime < format(now, 'HH:mm');
                  return (
                    <div
                      key={cls.id}
                      className={`flex items-center gap-4 rounded-xl px-4 py-3 border transition-all ${
                        isNext
                          ? 'bg-primary/10 border-primary/30'
                          : isPast
                          ? 'opacity-50 bg-muted/30 border-transparent'
                          : 'bg-muted/40 border-transparent'
                      }`}
                    >
                      <div className="text-center shrink-0 w-16">
                        <p className={`text-sm font-mono font-semibold ${isNext ? 'text-primary' : 'text-foreground'}`}>
                          {formatTime(cls.startTime)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{formatTime(cls.endTime)}</p>
                      </div>
                      <div
                        className="h-10 w-1 rounded-full shrink-0"
                        style={{ backgroundColor: subject?.color || 'var(--primary)' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${isNext ? 'text-primary' : ''}`}>
                          {subject?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {cls.room} · {subject?.teacher}
                        </p>
                      </div>
                      {isNext && <Badge variant="default">Up next</Badge>}
                      {isPast && !isNext && <Badge variant="secondary">Done</Badge>}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Today's tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Tasks
                <Badge variant="secondary">{pendingTasks.length} pending</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {pendingTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">All tasks completed!</p>
              ) : (
                pendingTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted/40 group">
                    <button onClick={() => toggleTask(task.id)} className="text-muted-foreground hover:text-success transition-colors">
                      <Circle className="h-4 w-4" />
                    </button>
                    <span className="flex-1 text-sm text-foreground">{task.title.replace('[PROTOTYPE] ', '')}</span>
                    <Badge
                      variant={task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'secondary'}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px]"
                    >
                      {task.priority}
                    </Badge>
                    {task.dueDate && (
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {formatDateRelative(task.dueDate)}
                      </span>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Urgent assignments */}
          {todayAssignments.length > 0 && (
            <Card className="border-warning/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-warning text-sm">
                  <BookOpen className="h-4 w-4" />
                  Due Soon
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {todayAssignments.map((a) => {
                  const sub = getSubjectById(a.subjectId ?? '');
                  const days = getDaysUntil(a.dueDate);
                  return (
                    <div key={a.id} className="rounded-lg bg-warning/5 border border-warning/20 px-3 py-2">
                      <p className="text-xs font-medium text-foreground">{a.title.replace('[PROTOTYPE] ', '')}</p>
                      {sub && <p className="text-[10px] text-muted-foreground">{sub.name}</p>}
                      <p className="text-[10px] text-warning mt-1">
                        {days < 0 ? 'Overdue!' : days === 0 ? 'Due today' : 'Due tomorrow'}
                      </p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Upcoming exams */}
          {upcomingExams.length > 0 && (
            <Card className="border-danger/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-danger text-sm">
                  <GraduationCap className="h-4 w-4" />
                  Exams This Week
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {upcomingExams.map((e) => {
                  const days = getDaysUntil(e.date);
                  return (
                    <div key={e.id} className="flex items-center gap-3 rounded-lg bg-danger/5 border border-danger/20 px-3 py-2">
                      <div className="text-center w-10">
                        <p className="text-lg font-bold text-danger">{days}</p>
                        <p className="text-[9px] text-muted-foreground">days</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium">{e.title.replace('[PROTOTYPE] ', '')}</p>
                        <p className="text-[10px] text-muted-foreground">{e.venue}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Critical attendance */}
          {criticalAttendance.length > 0 && (
            <Card className="border-danger/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-danger text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  Critical Attendance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {criticalAttendance.map((s) => {
                  const stats = getAttendanceForSubject(s.id);
                  return (
                    <div key={s.id}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium truncate">{s.name}</span>
                        <span className="text-danger">{stats.percentage}%</span>
                      </div>
                      <Progress value={stats.percentage} color="var(--danger)" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Quick summary */}
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Day Summary</p>
              <div className="space-y-2">
                <SummaryRow label="Classes today" value={todayClasses.length} />
                <SummaryRow label="Tasks pending" value={pendingTasks.length} />
                <SummaryRow label="Due soon" value={todayAssignments.length} color="text-warning" />
                <SummaryRow label="Exams this week" value={upcomingExams.length} color="text-danger" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-sm font-semibold ${color || 'text-foreground'}`}>{value}</span>
    </div>
  );
}
