import { useState } from 'react';
import { Plus, Trash2, Circle, CheckCircle2, Edit, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { formatDateRelative, isOverdue } from '@/lib/utils';
import type { Task, TaskCategory } from '@/types';

const CAT_COLORS: Record<TaskCategory, string> = {
  academic: 'text-info',
  personal: 'text-success',
  career: 'text-warning',
  projects: 'text-primary',
  college: 'text-accent-foreground',
  other: 'text-muted-foreground',
};

const CAT_LABELS: Record<TaskCategory, string> = {
  academic: 'Academic', personal: 'Personal', career: 'Career',
  projects: 'Projects', college: 'College', other: 'Other',
};

const PRIORITY_VARIANTS = { low: 'secondary' as const, medium: 'warning' as const, high: 'danger' as const };

export function TasksPage() {
  const { tasks, addTask, updateTask, deleteTask, toggleTask } = useApp();
  const [tab, setTab] = useState('pending');
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | 'all'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Task | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const emptyForm = {
    title: '', description: '', dueDate: '', priority: 'medium' as const,
    category: 'academic' as TaskCategory, status: 'pending' as const,
  };
  const [form, setForm] = useState(emptyForm);

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (t: Task) => {
    setEditItem(t);
    setForm({ title: t.title, description: t.description ?? '', dueDate: t.dueDate ?? '', priority: t.priority as typeof emptyForm['priority'], category: t.category as typeof emptyForm['category'], status: t.status as typeof emptyForm['status'] });
    setDialogOpen(true);
  };

  const set = (f: keyof typeof form) => (ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [f]: ev.target.value }));

  const save = () => {
    const data = { ...form, dueDate: form.dueDate || undefined, description: form.description || undefined };
    if (editItem) updateTask(editItem.id, data);
    else addTask(data);
    setDialogOpen(false);
  };

  const rootTasks = tasks.filter((t) => !t.parentId);
  const filterCat = (arr: Task[]) => categoryFilter === 'all' ? arr : arr.filter((t) => t.category === categoryFilter);

  const pending = filterCat(rootTasks.filter((t) => t.status === 'pending'));
  const completed = filterCat(rootTasks.filter((t) => t.status === 'completed'));
  const overdue = pending.filter((t) => t.dueDate && isOverdue(t.dueDate));
  const normal = pending.filter((t) => !t.dueDate || !isOverdue(t.dueDate));

  const allCategories = [...new Set(tasks.map((t) => t.category))] as TaskCategory[];

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-semibold text-xl">Tasks</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {pending.length} pending · {completed.length} completed
          </p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4" /> Add Task</Button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${categoryFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
        >
          All
        </button>
        {allCategories.map((c) => (
          <button
            key={c}
            onClick={() => setCategoryFilter(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${categoryFilter === c ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
          >
            {CAT_LABELS[c]}
          </button>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {overdue.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-danger mb-2">Overdue</p>
              <div className="space-y-1.5">
                {overdue.map((t) => <TaskRow key={t.id} t={t} onToggle={toggleTask} onEdit={openEdit} onDelete={setDeleteId} />)}
              </div>
            </div>
          )}
          {normal.length > 0 ? (
            <div className="space-y-1.5">
              {normal.map((t) => <TaskRow key={t.id} t={t} onToggle={toggleTask} onEdit={openEdit} onDelete={setDeleteId} />)}
            </div>
          ) : overdue.length === 0 ? (
            <EmptyState text="No pending tasks" />
          ) : null}
        </TabsContent>

        <TabsContent value="completed">
          {completed.length === 0 ? (
            <EmptyState text="No completed tasks yet" />
          ) : (
            <div className="space-y-1.5">
              {completed.map((t) => <TaskRow key={t.id} t={t} onToggle={toggleTask} onEdit={openEdit} onDelete={setDeleteId} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogHeader>
          <DialogTitle>{editItem ? 'Edit Task' : 'New Task'}</DialogTitle>
          <DialogClose onClose={() => setDialogOpen(false)} />
        </DialogHeader>
        <DialogContent className="space-y-3">
          <div>
            <Label>Title *</Label>
            <Input placeholder="What needs to be done?" value={form.title} onChange={set('title')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Category</Label>
              <Select value={form.category} onChange={set('category')}>
                {Object.entries(CAT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={form.priority} onChange={set('priority')}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
            </div>
          </div>
          <div>
            <Label>Due Date (optional)</Label>
            <Input type="date" value={form.dueDate} onChange={set('dueDate')} />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea placeholder="Additional details..." rows={2} value={form.description} onChange={set('description')} />
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={save} disabled={!form.title}>Save</Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} size="sm">
        <DialogHeader><DialogTitle>Delete task?</DialogTitle></DialogHeader>
        <DialogContent><p className="text-sm text-muted-foreground">This action cannot be undone.</p></DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="destructive" onClick={() => { deleteTask(deleteId!); setDeleteId(null); }}>Delete</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

function TaskRow({ t, onToggle, onEdit, onDelete }: {
  t: Task; onToggle: (id: string) => void; onEdit: (t: Task) => void; onDelete: (id: string) => void;
}) {
  const isCompleted = t.status === 'completed';
  const isTaskOverdue = t.dueDate && isOverdue(t.dueDate) && !isCompleted;
  return (
    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border bg-card hover:border-primary/20 transition-all group ${isTaskOverdue ? 'border-danger/30' : ''}`}>
      <button onClick={() => onToggle(t.id)} className={`shrink-0 transition-colors ${isCompleted ? 'text-success' : 'text-muted-foreground hover:text-success'}`}>
        {isCompleted ? <CheckCircle2 className="h-4.5 w-4.5" /> : <Circle className="h-4.5 w-4.5" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
          {t.title.replace('[PROTOTYPE] ', '')}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-[10px] font-medium ${CAT_COLORS[t.category]}`}>{CAT_LABELS[t.category]}</span>
          {t.dueDate && (
            <span className={`text-[10px] ${isTaskOverdue ? 'text-danger' : 'text-muted-foreground'}`}>
              {formatDateRelative(t.dueDate)}
            </span>
          )}
        </div>
      </div>
      <Badge variant={PRIORITY_VARIANTS[t.priority]} className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px]">
        {t.priority}
      </Badge>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <Button variant="ghost" size="icon" onClick={() => onEdit(t)} className="h-7 w-7"><Edit className="h-3 w-3" /></Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(t.id)} className="h-7 w-7"><Trash2 className="h-3 w-3 text-danger" /></Button>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-12">
      <CheckCircle2 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
