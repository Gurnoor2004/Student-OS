import { useState } from 'react';
import { Plus, Trash2, Edit, GraduationCap, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { getDaysUntil, formatTime, formatDate } from '@/lib/utils';
import type { Exam, ExamType, PrepStatus } from '@/types';

const PREP_LABELS: Record<PrepStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  ready: 'Ready',
};
const PREP_VARIANTS: Record<PrepStatus, 'secondary' | 'info' | 'success'> = {
  not_started: 'secondary',
  in_progress: 'info',
  ready: 'success',
};
const EXAM_TYPE_LABELS: Record<ExamType, string> = {
  midterm: 'Mid-Semester', final: 'Final', quiz: 'Quiz',
  practical: 'Practical', internal: 'Internal', other: 'Other',
};

export function ExamsPage() {
  const { subjects, exams, addExam, updateExam, deleteExam, getSubjectById } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Exam | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const emptyForm = {
    title: '', subjectId: '', examType: 'midterm' as ExamType,
    date: format(new Date(), 'yyyy-MM-dd'), time: '09:00',
    venue: '', syllabus: '', preparationStatus: 'not_started' as PrepStatus,
  };
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (e: Exam) => {
    setEditItem(e);
    setForm({ title: e.title, subjectId: e.subjectId ?? '', examType: e.examType, date: e.date, time: e.time, venue: e.venue, syllabus: e.syllabus ?? '', preparationStatus: e.preparationStatus });
    setDialogOpen(true);
  };

  const set = (f: keyof typeof form) => (ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [f]: ev.target.value }));

  const save = () => {
    setSaving(true);
    const data = { ...form, subjectId: form.subjectId || undefined };
    if (editItem) updateExam(editItem.id, data);
    else addExam(data);
    setSaving(false);
    setDialogOpen(false);
  };

  const upcoming = exams.filter((e) => getDaysUntil(e.date) >= 0).sort((a, b) => a.date.localeCompare(b.date));
  const past = exams.filter((e) => getDaysUntil(e.date) < 0).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-semibold text-xl">Exams</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{upcoming.length} upcoming</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add Exam
        </Button>
      </div>

      {/* Upcoming countdown cards */}
      {upcoming.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {upcoming.slice(0, 3).map((e) => {
            const days = getDaysUntil(e.date);
            const sub = getSubjectById(e.subjectId ?? '');
            return (
              <Card key={e.id} className={`${days <= 3 ? 'border-danger/40' : days <= 7 ? 'border-warning/40' : ''}`}>
                <CardContent className="p-4 text-center">
                  <div className={`text-4xl font-bold font-display mb-1 ${days === 0 ? 'text-danger' : days <= 3 ? 'text-danger' : days <= 7 ? 'text-warning' : 'text-foreground'}`}>
                    {days}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{days === 1 ? 'day left' : 'days left'}</p>
                  <p className="text-xs font-semibold truncate">{e.title.replace('[PROTOTYPE] ', '')}</p>
                  {sub && <p className="text-[10px] text-muted-foreground truncate mt-0.5">{sub.name}</p>}
                  <Badge variant={PREP_VARIANTS[e.preparationStatus]} className="mt-2 text-[10px]">
                    {PREP_LABELS[e.preparationStatus]}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Full list */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Upcoming Exams</p>
        {upcoming.length === 0 ? (
          <EmptyState text="No upcoming exams" />
        ) : (
          upcoming.map((e) => <ExamRow key={e.id} e={e} onEdit={openEdit} onDelete={setDeleteId} getSubjectById={getSubjectById} onPrepChange={(id, p) => updateExam(id, { preparationStatus: p })} />)
        )}
      </div>

      {past.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Past Exams</p>
          {past.map((e) => <ExamRow key={e.id} e={e} onEdit={openEdit} onDelete={setDeleteId} getSubjectById={getSubjectById} onPrepChange={(id, p) => updateExam(id, { preparationStatus: p })} />)}
        </div>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} size="lg">
        <DialogHeader>
          <DialogTitle>{editItem ? 'Edit Exam' : 'Add Exam'}</DialogTitle>
          <DialogClose onClose={() => setDialogOpen(false)} />
        </DialogHeader>
        <DialogContent className="space-y-3">
          <div>
            <Label>Title *</Label>
            <Input placeholder="e.g. Mid-Semester Examination" value={form.title} onChange={set('title')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Subject</Label>
              <Select value={form.subjectId} onChange={set('subjectId')}>
                <option value="">No subject</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </div>
            <div>
              <Label>Exam Type</Label>
              <Select value={form.examType} onChange={set('examType')}>
                {Object.entries(EXAM_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Date *</Label>
              <Input type="date" value={form.date} onChange={set('date')} />
            </div>
            <div>
              <Label>Time</Label>
              <Input type="time" value={form.time} onChange={set('time')} />
            </div>
          </div>
          <div>
            <Label>Venue</Label>
            <Input placeholder="e.g. Exam Hall A" value={form.venue} onChange={set('venue')} />
          </div>
          <div>
            <Label>Preparation Status</Label>
            <Select value={form.preparationStatus} onChange={set('preparationStatus')}>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="ready">Ready</option>
            </Select>
          </div>
          <div>
            <Label>Syllabus / Notes</Label>
            <Textarea placeholder="Topics covered..." rows={3} value={form.syllabus} onChange={set('syllabus')} />
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={save} loading={saving} disabled={!form.title || !form.date}>Save</Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} size="sm">
        <DialogHeader><DialogTitle>Delete exam?</DialogTitle></DialogHeader>
        <DialogContent><p className="text-sm text-muted-foreground">This action cannot be undone.</p></DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="destructive" onClick={() => { deleteExam(deleteId!); setDeleteId(null); }}>Delete</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

function ExamRow({ e, onEdit, onDelete, getSubjectById, onPrepChange }: {
  e: Exam; onEdit: (e: Exam) => void; onDelete: (id: string) => void;
  getSubjectById: (id: string) => any; onPrepChange: (id: string, p: PrepStatus) => void;
}) {
  const sub = getSubjectById(e.subjectId ?? '');
  const days = getDaysUntil(e.date);
  const isPast = days < 0;
  return (
    <Card className={isPast ? 'opacity-60' : ''}>
      <div className="flex items-center gap-4 px-4 py-3">
        <div className={`shrink-0 text-center w-14 ${isPast ? 'opacity-40' : ''}`}>
          <p className={`text-xl font-bold font-display ${!isPast && (days <= 3 ? 'text-danger' : days <= 7 ? 'text-warning' : 'text-foreground')}`}>
            {isPast ? format(new Date(e.date), 'dd') : days}
          </p>
          <p className="text-[9px] text-muted-foreground uppercase">{isPast ? format(new Date(e.date), 'MMM') : 'days'}</p>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <p className="text-sm font-semibold">{e.title.replace('[PROTOTYPE] ', '')}</p>
            <Badge variant="secondary">{EXAM_TYPE_LABELS[e.examType]}</Badge>
            {!isPast && <Badge variant={PREP_VARIANTS[e.preparationStatus]}>{PREP_LABELS[e.preparationStatus]}</Badge>}
          </div>
          {sub && <p className="text-xs text-muted-foreground">{sub.name}</p>}
          <p className="text-xs text-muted-foreground mt-0.5">
            <Clock className="h-3 w-3 inline mr-1" />
            {formatDate(e.date)} at {formatTime(e.time)} · {e.venue || 'TBD'}
          </p>
          {e.syllabus && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{e.syllabus}</p>}
        </div>
        {!isPast && (
          <Select
            value={e.preparationStatus}
            onChange={(ev) => onPrepChange(e.id, ev.target.value as PrepStatus)}
            className="h-8 text-xs py-1 w-32 shrink-0"
          >
            <option value="not_started">Not Started</option>
            <option value="in_progress">Studying</option>
            <option value="ready">Ready</option>
          </Select>
        )}
        <div className="flex gap-1 shrink-0">
          <Button variant="ghost" size="icon" onClick={() => onEdit(e)}><Edit className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(e.id)}><Trash2 className="h-3.5 w-3.5 text-danger" /></Button>
        </div>
      </div>
    </Card>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-12">
      <GraduationCap className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
