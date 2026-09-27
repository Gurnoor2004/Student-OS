import { useState } from 'react';
import { Plus, Trash2, Edit, BookOpen, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { formatDateRelative, getDaysUntil, isOverdue } from '@/lib/utils';
import type { Assignment } from '@/types';

const STATUS_LABELS = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  submitted: 'Submitted',
  overdue: 'Overdue',
};

const STATUS_VARIANTS = {
  not_started: 'secondary' as const,
  in_progress: 'info' as const,
  submitted: 'success' as const,
  overdue: 'danger' as const,
};

const PRIORITY_VARIANTS = {
  low: 'secondary' as const,
  medium: 'warning' as const,
  high: 'danger' as const,
};

export function AssignmentsPage() {
  const { subjects, assignments, addAssignment, updateAssignment, deleteAssignment, getSubjectById } = useApp();
  const [tab, setTab] = useState('active');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Assignment | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const emptyForm = {
    title: '', subjectId: '', description: '',
    dueDate: format(new Date(), 'yyyy-MM-dd'), priority: 'medium' as const,
    status: 'not_started' as const, attachmentUrl: '',
  };
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (a: Assignment) => {
    setEditItem(a);
    setForm({ title: a.title, subjectId: a.subjectId ?? '', description: a.description, dueDate: a.dueDate, priority: a.priority as typeof emptyForm['priority'], status: a.status as typeof emptyForm['status'], attachmentUrl: a.attachmentUrl ?? '' });
    setDialogOpen(true);
  };

  const set = (f: keyof typeof form) => (ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [f]: ev.target.value }));

  const save = () => {
    setSaving(true);
    const data = { ...form, subjectId: form.subjectId || undefined };
    if (editItem) updateAssignment(editItem.id, data);
    else addAssignment(data);
    setSaving(false);
    setDialogOpen(false);
  };

  const all = assignments.map((a) => {
    // Auto-detect overdue
    if (a.status !== 'submitted' && isOverdue(a.dueDate) && a.status !== 'overdue') {
      return { ...a, status: 'overdue' as const };
    }
    return a;
  });

  const filtered = all.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    getSubjectById(a.subjectId ?? '')?.name.toLowerCase().includes(search.toLowerCase())
  );

  const active = filtered.filter((a) => a.status !== 'submitted').sort((a, b) => {
    if (a.status === 'overdue' && b.status !== 'overdue') return -1;
    if (b.status === 'overdue' && a.status !== 'overdue') return 1;
    return getDaysUntil(a.dueDate) - getDaysUntil(b.dueDate);
  });
  const submitted = filtered.filter((a) => a.status === 'submitted');

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-semibold text-xl">Assignments</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {active.length} pending · {submitted.length} submitted
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add Assignment
        </Button>
      </div>

      <div className="relative">
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search assignments..."
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-input text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
        />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="active">Active <span className="ml-1 text-xs opacity-60">({active.length})</span></TabsTrigger>
          <TabsTrigger value="submitted">Submitted <span className="ml-1 text-xs opacity-60">({submitted.length})</span></TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {active.length === 0 ? (
            <EmptyState text="No active assignments" />
          ) : (
            <div className="space-y-2">
              {active.map((a) => <AssignmentRow key={a.id} a={a} onEdit={openEdit} onDelete={setDeleteId} getSubjectById={getSubjectById} onStatusChange={(id, s) => updateAssignment(id, { status: s })} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="submitted">
          {submitted.length === 0 ? (
            <EmptyState text="No submitted assignments yet" />
          ) : (
            <div className="space-y-2">
              {submitted.map((a) => <AssignmentRow key={a.id} a={a} onEdit={openEdit} onDelete={setDeleteId} getSubjectById={getSubjectById} onStatusChange={(id, s) => updateAssignment(id, { status: s })} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add/Edit dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} size="lg">
        <DialogHeader>
          <DialogTitle>{editItem ? 'Edit Assignment' : 'New Assignment'}</DialogTitle>
          <DialogClose onClose={() => setDialogOpen(false)} />
        </DialogHeader>
        <DialogContent className="space-y-3">
          <div>
            <Label>Title *</Label>
            <Input placeholder="Assignment title" value={form.title} onChange={set('title')} />
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
              <Label>Due Date *</Label>
              <Input type="date" value={form.dueDate} onChange={set('dueDate')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Priority</Label>
              <Select value={form.priority} onChange={set('priority')}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onChange={set('status')}>
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="submitted">Submitted</option>
                <option value="overdue">Overdue</option>
              </Select>
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea placeholder="Assignment details..." rows={3} value={form.description} onChange={set('description')} />
          </div>
          <div>
            <Label>Attachment / Link</Label>
            <Input placeholder="https://..." value={form.attachmentUrl} onChange={set('attachmentUrl')} />
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={save} loading={saving} disabled={!form.title || !form.dueDate}>Save</Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} size="sm">
        <DialogHeader><DialogTitle>Delete assignment?</DialogTitle></DialogHeader>
        <DialogContent><p className="text-sm text-muted-foreground">This action cannot be undone.</p></DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="destructive" onClick={() => { deleteAssignment(deleteId!); setDeleteId(null); }}>Delete</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

function AssignmentRow({ a, onEdit, onDelete, getSubjectById, onStatusChange }: {
  a: Assignment; onEdit: (a: Assignment) => void; onDelete: (id: string) => void;
  getSubjectById: (id: string) => any; onStatusChange: (id: string, s: Assignment['status']) => void;
}) {
  const sub = getSubjectById(a.subjectId ?? '');
  const days = getDaysUntil(a.dueDate);
  return (
    <Card className={a.status === 'overdue' ? 'border-danger/30' : ''}>
      <div className="flex items-start gap-4 px-4 py-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="text-sm font-semibold">{a.title.replace('[PROTOTYPE] ', '')}</p>
            <Badge variant={STATUS_VARIANTS[a.status]}>{STATUS_LABELS[a.status]}</Badge>
            <Badge variant={PRIORITY_VARIANTS[a.priority]}>{a.priority}</Badge>
          </div>
          {sub && <p className="text-xs text-muted-foreground">{sub.name}</p>}
          {a.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{a.description}</p>}
          <div className="flex items-center gap-3 mt-2">
            <span className={`text-xs font-medium ${days < 0 ? 'text-danger' : days <= 2 ? 'text-warning' : 'text-muted-foreground'}`}>
              Due: {formatDateRelative(a.dueDate)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Select
            value={a.status}
            onChange={(e) => onStatusChange(a.id, e.target.value as Assignment['status'])}
            className="h-8 text-xs py-1 w-32"
          >
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="submitted">Submitted</option>
            <option value="overdue">Overdue</option>
          </Select>
          <Button variant="ghost" size="icon" onClick={() => onEdit(a)}><Edit className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(a.id)}><Trash2 className="h-3.5 w-3.5 text-danger" /></Button>
        </div>
      </div>
    </Card>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-16">
      <BookOpen className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
