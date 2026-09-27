import { useState } from 'react';
import { format, subDays } from 'date-fns';
import { CheckCircle2, XCircle, MinusCircle, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { classesToReachTarget, classesCanMiss, formatDate } from '@/lib/utils';
import type { Subject } from '@/types';

const STATUS_COLORS = { safe: 'success', warning: 'warning', critical: 'danger' } as const;

export function AttendancePage() {
  const { subjects, attendance, markAttendance, getAttendanceForSubject, settings } = useApp();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [tab, setTab] = useState('overview');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const target = settings.attendanceWarningThreshold;

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h2 className="font-display font-semibold text-xl">Attendance</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Target: {target}% · Thresholds: Warning &lt; {target}%, Critical &lt; {settings.attendanceCriticalThreshold}%
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mark">Mark Today</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {subjects.length === 0 ? (
            <EmptySubjects />
          ) : (
            <div className="space-y-3">
              {subjects.map((s) => {
                const stats = getAttendanceForSubject(s.id);
                const toReach = classesToReachTarget(stats.attended, stats.conducted, target);
                const canMiss = classesCanMiss(stats.attended, stats.conducted, target);
                const isExpanded = expanded === s.id;

                return (
                  <Card key={s.id} className={stats.statusLevel === 'critical' ? 'border-danger/30' : stats.statusLevel === 'warning' ? 'border-warning/30' : ''}>
                    <div
                      className="flex items-center gap-4 p-4 cursor-pointer"
                      onClick={() => setExpanded(isExpanded ? null : s.id)}
                    >
                      <div className="h-10 w-1.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <p className="text-sm font-semibold">{s.name}</p>
                          <Badge variant={STATUS_COLORS[stats.statusLevel]}>
                            {stats.statusLevel === 'safe' ? 'Safe' : stats.statusLevel === 'warning' ? 'Warning' : 'Critical'}
                          </Badge>
                        </div>
                        <Progress
                          value={stats.percentage}
                          color={
                            stats.statusLevel === 'critical' ? 'var(--danger)' :
                            stats.statusLevel === 'warning' ? 'var(--warning)' : 'var(--success)'
                          }
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>{stats.attended}/{stats.conducted} classes</span>
                          <span className={`font-semibold ${
                            stats.statusLevel === 'critical' ? 'text-danger' :
                            stats.statusLevel === 'warning' ? 'text-warning' : 'text-success'
                          }`}>{stats.percentage}%</span>
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                    </div>

                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-border pt-4">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <InfoCard label="Attended" value={stats.attended} />
                          <InfoCard label="Conducted" value={stats.conducted} />
                          <InfoCard label="Percentage" value={`${stats.percentage}%`} />
                          <InfoCard label="Teacher" value={s.teacher} />
                        </div>

                        {stats.statusLevel !== 'safe' && stats.conducted > 0 && (
                          <div className="rounded-lg bg-warning/10 border border-warning/20 p-3 mb-3 flex items-start gap-2">
                            <Info className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                            <p className="text-xs text-warning">
                              You need to attend <strong>{toReach}</strong> more consecutive class{toReach !== 1 ? 'es' : ''} to reach {target}% (assuming no new classes are added).
                              This is an estimate — actual required classes may vary.
                            </p>
                          </div>
                        )}

                        {stats.statusLevel === 'safe' && canMiss > 0 && (
                          <div className="rounded-lg bg-success/10 border border-success/20 p-3 mb-3 flex items-start gap-2">
                            <Info className="h-4 w-4 text-success shrink-0 mt-0.5" />
                            <p className="text-xs text-success">
                              You can afford to miss up to <strong>{canMiss}</strong> more class{canMiss !== 1 ? 'es' : ''} and stay above {target}%.
                            </p>
                          </div>
                        )}

                        {/* Quick mark for today */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Mark today:</span>
                          <AttendanceButtons subjectId={s.id} date={todayStr} attendance={attendance} onMark={markAttendance} />
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="mark">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1.5 block">Select date</label>
                <input
                  type="date"
                  value={selectedDate}
                  max={todayStr}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 w-full max-w-xs"
                />
              </div>
            </div>

            <div className="space-y-2">
              {subjects.map((s) => {
                const rec = attendance.find((a) => a.subjectId === s.id && a.date === selectedDate);
                return (
                  <Card key={s.id}>
                    <div className="flex items-center gap-4 px-4 py-3">
                      <div className="h-8 w-1.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.teacher}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {rec && (
                          <Badge variant={rec.status === 'present' ? 'success' : rec.status === 'absent' ? 'danger' : 'secondary'} className="mr-2">
                            {rec.status}
                          </Badge>
                        )}
                        <AttendanceButtons subjectId={s.id} date={selectedDate} attendance={attendance} onMark={markAttendance} />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="space-y-2">
            {[...Array(14)].map((_, i) => {
              const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
              const dayRecords = attendance.filter((a) => a.date === date);
              if (dayRecords.length === 0) return null;
              return (
                <Card key={date}>
                  <div className="px-4 py-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">{formatDate(date)}</p>
                    <div className="flex flex-wrap gap-2">
                      {dayRecords.map((r) => {
                        const sub = subjects.find((s) => s.id === r.subjectId);
                        return (
                          <div key={r.id} className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-2.5 py-1.5">
                            {r.status === 'present' ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                            ) : r.status === 'absent' ? (
                              <XCircle className="h-3.5 w-3.5 text-danger" />
                            ) : (
                              <MinusCircle className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                            <span className="text-xs font-medium">{sub?.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AttendanceButtons({
  subjectId, date, attendance, onMark,
}: {
  subjectId: string; date: string;
  attendance: ReturnType<typeof useApp>['attendance'];
  onMark: (s: string, d: string, status: 'present' | 'absent' | 'cancelled') => void;
}) {
  const rec = attendance.find((a) => a.subjectId === subjectId && a.date === date);
  return (
    <div className="flex gap-1">
      <button
        onClick={() => onMark(subjectId, date, 'present')}
        className={`p-1.5 rounded-lg transition-colors ${rec?.status === 'present' ? 'bg-success text-white' : 'hover:bg-success/20 text-muted-foreground'}`}
        title="Present"
      >
        <CheckCircle2 className="h-4 w-4" />
      </button>
      <button
        onClick={() => onMark(subjectId, date, 'absent')}
        className={`p-1.5 rounded-lg transition-colors ${rec?.status === 'absent' ? 'bg-danger text-white' : 'hover:bg-danger/20 text-muted-foreground'}`}
        title="Absent"
      >
        <XCircle className="h-4 w-4" />
      </button>
      <button
        onClick={() => onMark(subjectId, date, 'cancelled')}
        className={`p-1.5 rounded-lg transition-colors ${rec?.status === 'cancelled' ? 'bg-secondary text-secondary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
        title="Cancelled"
      >
        <MinusCircle className="h-4 w-4" />
      </button>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-muted/40 px-3 py-2">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}

function EmptySubjects() {
  return (
    <div className="text-center py-16">
      <CheckCircle2 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
      <p className="text-sm text-muted-foreground">Add subjects in the Timetable section first</p>
    </div>
  );
}
