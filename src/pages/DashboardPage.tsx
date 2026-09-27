import { useNavigate } from 'react-router';
import { format } from 'date-fns';
import {
  AlertTriangle, ArrowRight, BookOpen, Calendar, CheckCircle2,
  Clock, GraduationCap, TrendingUp, Zap, Bell,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatTime, formatDateRelative, getDaysUntil } from '@/lib/utils';

const priorityColors = {
  critical: { bg: 'bg-danger/10', text: 'text-danger', border: 'border-danger/20' },
  high: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/20' },
  medium: { bg: 'bg-info/10', text: 'text-info', border: 'border-info/20' },
  low: { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-transparent' },
};

const statusBadge = {
  not_started: { label: 'Not Started', variant: 'secondary' as const },
  in_progress: { label: 'In Progress', variant: 'info' as const },
  submitted: { label: 'Submitted', variant: 'success' as const },
  overdue: { label: 'Overdue', variant: 'danger' as const },
};

export function DashboardPage() {
  const { user } = useAuth();
  const {
    subjects, assignments, exams, tasks,
    getTodayClasses, getNextClass, getAttendanceForSubject, getPriorityQueue,
    notices, getSubjectById, settings,
  } = useApp();
  const navigate = useNavigate();

  const todayClasses = getTodayClasses();
  const nextClass = getNextClass();
  const priorityQueue = getPriorityQueue();

  const pendingAssignments = assignments.filter((a) => a.status !== 'submitted');
  const upcomingExams = exams
    .filter((e) => getDaysUntil(e.date) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);
  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const taskCompletion = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

  const attendanceAlerts = subjects.filter((s) => {
    const stats = getAttendanceForSubject(s.id);
    return stats.statusLevel !== 'safe' && stats.conducted > 0;
  });

  const unreadNotices = notices.filter((n) => !n.isRead).slice(0, 2);

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Prototype banner */}
      <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 px-4 py-2.5 text-xs text-warning">
        <Zap className="h-3.5 w-3.5 shrink-0" />
        <span>Prototype data loaded — replace with your real academic information in each module.</span>
      </div>

      {/* Today stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<BookOpen className="h-4 w-4" />}
          label="Pending"
          value={pendingAssignments.length}
          sub="assignments"
          color="text-warning"
          onClick={() => navigate('/assignments')}
        />
        <StatCard
          icon={<GraduationCap className="h-4 w-4" />}
          label="Upcoming"
          value={upcomingExams.length}
          sub="exams"
          color="text-danger"
          onClick={() => navigate('/exams')}
        />
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Task rate"
          value={`${Math.round(taskCompletion)}%`}
          sub="completion"
          color="text-success"
          onClick={() => navigate('/tasks')}
        />
        <StatCard
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Attendance"
          value={attendanceAlerts.length}
          sub="alerts"
          color="text-danger"
          onClick={() => navigate('/attendance')}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Priority Queue */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Zap className="h-4 w-4 text-primary" />
                  Priority Queue
                </CardTitle>
                <span className="text-xs text-muted-foreground">{priorityQueue.length} items</span>
              </div>
            </CardHeader>
            <CardContent className="pt-3 space-y-2">
              {priorityQueue.length === 0 ? (
                <EmptyState icon={<CheckCircle2 className="h-8 w-8" />} text="All clear! Nothing urgent right now." />
              ) : (
                priorityQueue.slice(0, 7).map((item) => {
                  const colors = priorityColors[item.priority];
                  return (
                    <div
                      key={item.id}
                      className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 cursor-pointer hover:opacity-80 transition-opacity ${colors.bg} ${colors.border}`}
                      onClick={() => navigate(item.link)}
                    >
                      <div className={`mt-0.5 ${colors.text}`}>
                        {item.type === 'assignment' && <BookOpen className="h-4 w-4" />}
                        {item.type === 'exam' && <GraduationCap className="h-4 w-4" />}
                        {item.type === 'task' && <CheckCircle2 className="h-4 w-4" />}
                        {item.type === 'attendance' && <AlertTriangle className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${colors.text}`}>{item.title}</p>
                        {item.subtitle && (
                          <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <Badge variant={item.priority === 'critical' ? 'danger' : item.priority === 'high' ? 'warning' : 'info'}>
                          {item.priority}
                        </Badge>
                        {item.dueDate && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {formatDateRelative(item.dueDate)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Today's classes */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-primary" />
                  Today's Schedule
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/timetable')}>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-2 space-y-2">
              {todayClasses.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">No classes today</p>
              ) : (
                todayClasses.map((cls) => {
                  const subject = getSubjectById(cls.subjectId);
                  const isNext = nextClass?.id === cls.id;
                  return (
                    <div key={cls.id} className={`flex items-center gap-3 rounded-lg px-3 py-2 ${isNext ? 'bg-primary/10 border border-primary/20' : 'bg-muted/40'}`}>
                      <div
                        className="h-8 w-1 rounded-full shrink-0"
                        style={{ backgroundColor: subject?.color || 'var(--primary)' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium truncate ${isNext ? 'text-primary' : 'text-foreground'}`}>
                          {subject?.name || 'Unknown'}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatTime(cls.startTime)} · {cls.room}
                        </p>
                      </div>
                      {isNext && <Badge variant="default" className="text-[10px]">Next</Badge>}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Upcoming Exams */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <GraduationCap className="h-4 w-4 text-danger" />
                  Upcoming Exams
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/exams')}>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-2 space-y-2">
              {upcomingExams.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">No upcoming exams</p>
              ) : (
                upcomingExams.map((exam) => {
                  const days = getDaysUntil(exam.date);
                  return (
                    <div key={exam.id} className="flex items-center gap-3 rounded-lg bg-muted/40 px-3 py-2">
                      <div className="text-center shrink-0">
                        <div className={`text-lg font-bold font-mono leading-none ${days <= 3 ? 'text-danger' : days <= 7 ? 'text-warning' : 'text-foreground'}`}>
                          {days}
                        </div>
                        <div className="text-[9px] text-muted-foreground uppercase">days</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{exam.title.replace('[PROTOTYPE] ', '')}</p>
                        <p className="text-[10px] text-muted-foreground">{format(new Date(exam.date), 'MMM d')} · {exam.venue}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Attendance overview */}
          {attendanceAlerts.length > 0 && (
            <Card className="border-danger/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm text-danger">
                  <AlertTriangle className="h-4 w-4" />
                  Attendance Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2 space-y-3">
                {attendanceAlerts.slice(0, 3).map((s) => {
                  const stats = getAttendanceForSubject(s.id);
                  return (
                    <div key={s.id} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium truncate">{s.name}</span>
                        <span className={stats.statusLevel === 'critical' ? 'text-danger' : 'text-warning'}>
                          {stats.percentage}%
                        </span>
                      </div>
                      <Progress
                        value={stats.percentage}
                        max={100}
                        color={stats.statusLevel === 'critical' ? 'var(--danger)' : 'var(--warning)'}
                      />
                    </div>
                  );
                })}
                <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/attendance')}>
                  View attendance details
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Unread notices */}
          {unreadNotices.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Bell className="h-4 w-4 text-primary" />
                  Recent Notices
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2 space-y-2">
                {unreadNotices.map((n) => (
                  <div
                    key={n.id}
                    className="rounded-lg bg-muted/40 px-3 py-2 cursor-pointer hover:bg-muted/60 transition-colors"
                    onClick={() => navigate('/notices')}
                  >
                    {n.isPinned && <Badge variant="warning" className="text-[9px] mb-1">Pinned</Badge>}
                    <p className="text-xs font-medium leading-snug">{n.title.replace('[PROTOTYPE] ', '')}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{n.source}</p>
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="w-full" onClick={() => navigate('/notices')}>
                  View all notices
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, color, onClick }: {
  icon: React.ReactNode; label: string; value: string | number; sub: string; color: string; onClick: () => void;
}) {
  return (
    <Card
      className="cursor-pointer hover:border-primary/30 transition-colors"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className={`flex items-center gap-2 mb-2 ${color}`}>
          {icon}
          <span className="text-xs font-medium">{label}</span>
        </div>
        <p className="text-2xl font-bold font-display text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="text-muted-foreground/30 mb-3">{icon}</div>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
