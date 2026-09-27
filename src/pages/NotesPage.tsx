import { useState } from 'react';
import { Plus, Trash2, Edit, FileText, Tag, Search } from 'lucide-react';
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
import type { Note } from '@/types';

const TYPE_ICONS: Record<Note['type'], string> = {
  text: '📝', pdf: '📄', docx: '📃', pptx: '📊', image: '🖼️',
};

export function NotesPage() {
  const { subjects, notes, addNote, updateNote, deleteNote, getSubjectById } = useApp();
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewNote, setViewNote] = useState<Note | null>(null);
  const [editItem, setEditItem] = useState<Note | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const emptyForm = {
    title: '', content: '', type: 'text' as Note['type'],
    subjectId: '', tags: '', category: '',
  };
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (n: Note) => {
    setEditItem(n);
    setForm({ title: n.title, content: n.content, type: n.type, subjectId: n.subjectId ?? '', tags: n.tags.join(', '), category: n.category ?? '' });
    setDialogOpen(true);
  };

  const set = (f: keyof typeof form) => (ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [f]: ev.target.value }));

  const save = () => {
    setSaving(true);
    const data = {
      title: form.title, content: form.content, type: form.type,
      subjectId: form.subjectId || undefined,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      category: form.category || undefined,
    };
    if (editItem) updateNote(editItem.id, data);
    else addNote(data);
    setSaving(false);
    setDialogOpen(false);
  };

  const filtered = notes.filter((n) => {
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchSub = subjectFilter === 'all' || n.subjectId === subjectFilter;
    return matchSearch && matchSub;
  });

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-semibold text-xl">Notes</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{notes.length} notes</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4" /> New Note</Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-input text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
          />
        </div>
        <Select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className="w-40">
          <option value="all">All subjects</option>
          {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {notes.length === 0 ? 'No notes yet. Create your first note.' : 'No notes match your search.'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((n) => {
            const sub = getSubjectById(n.subjectId ?? '');
            return (
              <Card
                key={n.id}
                className="cursor-pointer hover:border-primary/30 transition-all group"
                onClick={() => setViewNote(n)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-lg">{TYPE_ICONS[n.type]}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(n)}><Edit className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDeleteId(n.id)}><Trash2 className="h-3 w-3 text-danger" /></Button>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold mb-1 line-clamp-2">{n.title.replace('[PROTOTYPE] ', '')}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-3 mb-3">{n.content}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {n.tags.slice(0, 3).map((t) => (
                      <Badge key={t} variant="secondary" className="text-[10px]">
                        <Tag className="h-2.5 w-2.5 mr-0.5" />{t}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    {sub && (
                      <span className="text-[10px] font-medium" style={{ color: sub.color }}>{sub.name}</span>
                    )}
                    <span className="text-[10px] text-muted-foreground ml-auto">
                      {format(new Date(n.updatedAt), 'MMM d')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* View note */}
      <Dialog open={!!viewNote} onClose={() => setViewNote(null)} size="lg">
        {viewNote && (
          <>
            <DialogHeader>
              <DialogTitle>{viewNote.title.replace('[PROTOTYPE] ', '')}</DialogTitle>
              <DialogClose onClose={() => setViewNote(null)} />
            </DialogHeader>
            <DialogContent>
              <div className="flex gap-2 flex-wrap mb-4">
                {viewNote.tags.map((t) => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
              </div>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm text-foreground leading-relaxed">
                  {viewNote.content}
                </pre>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Last updated {format(new Date(viewNote.updatedAt), 'MMMM d, yyyy')}
              </p>
            </DialogContent>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setViewNote(null); openEdit(viewNote); }}>
                <Edit className="h-4 w-4" /> Edit
              </Button>
            </DialogFooter>
          </>
        )}
      </Dialog>

      {/* Add/Edit dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} size="lg">
        <DialogHeader>
          <DialogTitle>{editItem ? 'Edit Note' : 'New Note'}</DialogTitle>
          <DialogClose onClose={() => setDialogOpen(false)} />
        </DialogHeader>
        <DialogContent className="space-y-3">
          <div>
            <Label>Title *</Label>
            <Input placeholder="Note title" value={form.title} onChange={set('title')} />
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
              <Label>Type</Label>
              <Select value={form.type} onChange={set('type')}>
                <option value="text">Text Note</option>
                <option value="pdf">PDF Reference</option>
                <option value="docx">Document</option>
                <option value="pptx">Presentation</option>
                <option value="image">Image</option>
              </Select>
            </div>
          </div>
          <div>
            <Label>Tags (comma separated)</Label>
            <Input placeholder="e.g. graphs, algorithms, important" value={form.tags} onChange={set('tags')} />
          </div>
          <div>
            <Label>Content *</Label>
            <Textarea placeholder="Write your note here..." rows={8} value={form.content} onChange={set('content')} />
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={save} loading={saving} disabled={!form.title || !form.content}>Save</Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} size="sm">
        <DialogHeader><DialogTitle>Delete note?</DialogTitle></DialogHeader>
        <DialogContent><p className="text-sm text-muted-foreground">This action cannot be undone.</p></DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="destructive" onClick={() => { deleteNote(deleteId!); setDeleteId(null); }}>Delete</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
