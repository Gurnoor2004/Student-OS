import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isToday, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatTime } from '@/lib/utils';

type EventType = 'class' | 'assignment' | 'exam' | 'task';

interface CalEvent {
  id: string;
  type: EventType;
  title: string;
  time?: string;
  color: string;
}

const TYPE_COLORS: Record<EventType, string> = {
  class: 'var(--primary)',
  assignment: 'var(--warning)',
  exam: 'var(--danger)',
  task: 'var(--success)',
};

export function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { timetable, assignments, exams, tasks, getSubjectById, subjects } = useApp();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const getEventsForDate = (date: Date): CalEvent[] => {
    const events: CalEvent[] = [];
    const dow = date.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
    const dateStr = format(date, 'yyyy-MM-dd');

    // Classes (recurring)
    timetable
      .filter((e) => e.day === dow)
      .forEach((e) => {
        const sub = getSubjectById(e.subjectId);
        events.push({
          id: `cls-${e.id}-${dateStr}`,
          type: 'class',
          title: sub?.name ?? 'Class',
          time: formatTime(e.startTime),
          color: sub?.color ?? TYPE_COLORS.class,
        });
      });

    // Assignments due
    assignments
      .filter((a) => a.dueDate === dateStr && a.status !== 'submitted')
      .forEach((a) => {
        events.push({ id: a.id, type: 'assignment', title: a.title.replace('[PROTOTYPE] ', ''), color: TYPE_COLORS.assignment });
      });

    // Exams
    exams
      .filter((e) => e.date === dateStr)
      .forEach((e) => {
        events.push({ id: e.id, type: 'exam', title: e.title.replace('[PROTOTYPE] ', ''), time: formatTime(e.time), color: TYPE_COLORS.exam });
      });

    // Tasks
    tasks
      .filter((t) => t.dueDate === dateStr && t.status === 'pending')
      .forEach((t) => {
        events.push({ id: t.id, type: 'task', title: t.title.replace('[PROTOTYPE] ', ''), color: TYPE_COLORS.task });
      });

    return events.sort((a, b) => (a.time ?? '00:00').localeCompare(b.time ?? '00:00'));
  };

  const selectedEvents = getEventsForDate(selectedDate);

  return (
    <div className="space-y-5 max-w-6xl">
      <div>
        <h2 className="font-display font-semibold text-xl">Calendar</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Classes, assignments, exams, and tasks in one view</p>
      </div>

      {/* Legend */}
      <div className="flex gap-4 flex-wrap">
        {[
          { label: 'Classes', color: 'var(--primary)' },
          { label: 'Assignments', color: 'var(--warning)' },
          { label: 'Exams', color: 'var(--danger)' },
          { label: 'Tasks', color: 'var(--success)' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Calendar grid */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth((m) => subMonths(m, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="font-display font-semibold text-sm">
                {format(currentMonth, 'MMMM yyyy')}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth((m) => addMonths(m, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4">
              {/* Day headers */}
              <div className="grid grid-cols-7 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground uppercase py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-0.5">
                {days.map((day) => {
                  const events = getEventsForDate(day);
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isSelected = isSameDay(day, selectedDate);
                  const isTodayDate = isToday(day);

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`relative flex flex-col items-center rounded-lg p-1.5 min-h-[52px] transition-all hover:bg-muted/50 ${
                        isSelected ? 'bg-primary/15 border border-primary/30' :
                        isTodayDate ? 'bg-muted/40' : ''
                      } ${!isCurrentMonth ? 'opacity-30' : ''}`}
                    >
                      <span className={`text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center mb-1 ${
                        isSelected ? 'bg-primary text-primary-foreground' :
                        isTodayDate ? 'bg-foreground text-background' : 'text-foreground'
                      }`}>
                        {format(day, 'd')}
                      </span>
                      <div className="flex flex-wrap gap-0.5 justify-center">
                        {events.slice(0, 3).map((e) => (
                          <div
                            key={e.id}
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: e.color }}
                          />
                        ))}
                        {events.length > 3 && (
                          <span className="text-[8px] text-muted-foreground">+{events.length - 3}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>

        {/* Selected day events */}
        <div>
          <Card>
            <div className="px-5 py-4 border-b border-border">
              <p className="font-semibold text-sm">{format(selectedDate, 'EEEE, MMMM d')}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="p-4 space-y-2">
              {selectedEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Nothing scheduled</p>
                </div>
              ) : (
                selectedEvents.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center gap-3 rounded-lg bg-muted/40 px-3 py-2.5"
                  >
                    <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: e.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{e.title}</p>
                      {e.time && <p className="text-[10px] text-muted-foreground">{e.time}</p>}
                    </div>
                    <Badge
                      variant={e.type === 'exam' ? 'danger' : e.type === 'assignment' ? 'warning' : e.type === 'class' ? 'default' : 'success'}
                      className="text-[9px] shrink-0"
                    >
                      {e.type}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Mini upcoming list */}
          <Card className="mt-4">
            <div className="px-5 py-4 border-b border-border">
              <p className="font-semibold text-sm">Upcoming</p>
            </div>
            <div className="p-4 space-y-2">
              {exams
                .filter((e) => {
                  const d = new Date(e.date);
                  return d >= new Date();
                })
                .sort((a, b) => a.date.localeCompare(b.date))
                .slice(0, 4)
                .map((e) => (
                  <div key={e.id} className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-danger shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{e.title.replace('[PROTOTYPE] ', '')}</p>
                      <p className="text-[10px] text-muted-foreground">{format(new Date(e.date), 'MMM d')}</p>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
