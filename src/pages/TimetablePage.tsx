import { useState } from 'react';
import { Plus, Trash2, Edit, Clock } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { formatTime, DAY_NAMES, DAY_FULL } from '@/lib/utils';
import type { TimetableEntry, DayOfWeek } from '@/types';

const HOUR_SLOTS = Array.from({ length: 13 }, (_, i) => i + 7); // 7AM–7PM

function timeToMinutes(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export function TimetablePage() {
  const { subjects, timetable, addTimetableEntry, updateTimetableEntry, deleteTimetableEntry } = useApp();
  const [tab, setTab] = useState<'week' | 'day'>('week');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<TimetableEntry | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const today = new Date().getDay() as DayOfWeek;

  const emptyForm = {
    subjectId: subjects[0]?.id ?? '',
    day: today as DayOfWeek,
    startTime: '09:00',
    endTime: '10:00',
    room: '',
    teacher: '',
  };
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    setEditEntry(null);
    setForm({ ...emptyForm, subjectId: subjects[0]?.id ?? '' });
    setDialogOpen(true);
  };
  const openEdit = (e: TimetableEntry) => {
    setEditEntry(e);
    setForm({ subjectId: e.subjectId, day: e.day, startTime: e.startTime, endTime: e.endTime, room: e.room, teacher: e.teacher });
    setDialogOpen(true);
  };

  const set = (f: keyof typeof form) => (ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = ev.target.value;
    setForm((p) => ({ ...p, [f]: f === 'day' ? Number(val) as DayOfWeek : val }));
    // Auto-fill teacher/room from subject
    if (f === 'subjectId') {
      const s = subjects.find((s) => s.id === val);
      if (s) setForm((p) => ({ ...p, subjectId: val, teacher: s.teacher, room: s.room }));
    }
  };

  const save = async () => {
    if (!form.subjectId) return;
    setSaving(true);
    if (editEntry) {
      updateTimetableEntry(editEntry.id, form);
    } else {
      addTimetableEntry(form);
    }
    setSaving(false);
    setDialogOpen(false);
  };

  const dayEntries = (day: number) =>
    timetable.filter((e) => e.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-semibold text-xl">Timetable</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Weekly class schedule</p>
        </div>
        <Button onClick={openAdd} disabled={subjects.length === 0}>
          <Plus className="h-4 w-4" /> Add Class
        </Button>
      </div>

      {subjects.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Add subjects first to create your timetable</p>
        </div>
      )}

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList>
          <TabsTrigger value="week">Week View</TabsTrigger>
          <TabsTrigger value="day">Day View</TabsTrigger>
        </TabsList>

        <TabsContent value="week">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[1,2,3,4,5,6].map((day) => {
              const entries = dayEntries(day);
              const isToday = day === today;
              return (
                <div key={day} className={`rounded-xl border ${isToday ? 'border-primary/40 bg-primary/5' : 'border-border bg-card'}`}>
                  <div className={`px-3 py-2 border-b ${isToday ? 'border-primary/20' : 'border-border'}`}>
                    <p className={`text-xs font-semibold ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                      {DAY_FULL[day]}
                      {isToday && <span className="ml-1 text-[9px]">• Today</span>}
                    </p>
                  </div>
                  <div className="p-2 space-y-1.5 min-h-[120px]">
                    {entries.length === 0 ? (
                      <p className="text-[10px] text-muted-foreground/50 text-center py-4">Free</p>
                    ) : (
                      entries.map((e) => {
                        const sub = subjects.find((s) => s.id === e.subjectId);
                        return (
                          <div
                            key={e.id}
                            className="rounded-lg px-2 py-1.5 text-white text-[10px] group relative cursor-pointer"
                            style={{ backgroundColor: sub?.color || 'var(--primary)' }}
                          >
                            <p className="font-semibold leading-tight truncate">{sub?.name}</p>
                            <p className="opacity-80">{formatTime(e.startTime)}</p>
                            <div className="absolute top-1 right-1 hidden group-hover:flex gap-0.5">
                              <button onClick={() => openEdit(e)} className="p-0.5 bg-black/30 rounded hover:bg-black/50">
                                <Edit className="h-2.5 w-2.5" />
                              </button>
                              <button onClick={() => setDeleteId(e.id)} className="p-0.5 bg-black/30 rounded hover:bg-red-500/70">
                                <Trash2 className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="day">
          <div className="flex gap-2 mb-4 flex-wrap">
            {[1,2,3,4,5,6].map((d) => (
              <Button
                key={d}
                variant={d === today ? 'default' : 'outline'}
                size="sm"
                onClick={() => {}}
              >
                {DAY_NAMES[d]}
              </Button>
            ))}
          </div>
          <Card>
            <CardContent className="p-4">
              {dayEntries(today).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No classes today</p>
              ) : (
                <div className="space-y-3">
                  {dayEntries(today).map((e) => {
                    const sub = subjects.find((s) => s.id === e.subjectId);
                    return (
                      <div key={e.id} className="flex items-center gap-4 rounded-xl border border-border bg-muted/30 px-4 py-3">
                        <div className="w-4 h-10 rounded-full shrink-0" style={{ backgroundColor: sub?.color }} />
                        <div className="w-20 shrink-0">
                          <p className="text-sm font-mono font-semibold">{formatTime(e.startTime)}</p>
                          <p className="text-xs text-muted-foreground">{formatTime(e.endTime)}</p>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{sub?.name}</p>
                          <p className="text-xs text-muted-foreground">{e.room} · {e.teacher}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(e)}><Edit className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteId(e.id)}><Trash2 className="h-3.5 w-3.5 text-danger" /></Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogHeader>
          <DialogTitle>{editEntry ? 'Edit Class' : 'Add Class'}</DialogTitle>
          <DialogClose onClose={() => setDialogOpen(false)} />
        </DialogHeader>
        <DialogContent className="space-y-3">
          <div>
            <Label>Subject</Label>
            <Select value={form.subjectId} onChange={set('subjectId')}>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </div>
          <div>
            <Label>Day</Label>
            <Select value={form.day} onChange={set('day')}>
              {[1,2,3,4,5,6].map((d) => <option key={d} value={d}>{DAY_FULL[d]}</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Start Time</Label>
              <Input type="time" value={form.startTime} onChange={set('startTime')} />
            </div>
            <div>
              <Label>End Time</Label>
              <Input type="time" value={form.endTime} onChange={set('endTime')} />
            </div>
          </div>
          <div>
            <Label>Room</Label>
            <Input placeholder="e.g. A-201" value={form.room} onChange={set('room')} />
          </div>
          <div>
            <Label>Teacher</Label>
            <Input placeholder="e.g. Dr. Sharma" value={form.teacher} onChange={set('teacher')} />
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={save} loading={saving}>Save</Button>
        </DialogFooter>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} size="sm">
        <DialogHeader>
          <DialogTitle>Remove class?</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <p className="text-sm text-muted-foreground">This class will be removed from the timetable.</p>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="destructive" onClick={() => { deleteTimetableEntry(deleteId!); setDeleteId(null); }}>Remove</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
