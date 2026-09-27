import { useState } from 'react';
import { Plus, Trash2, Pin, Bell, CheckCircle2, CheckCheck } from 'lucide-react';
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
import type { Notice, NoticeCategory } from '@/types';

const CAT_VARIANTS: Record<NoticeCategory, 'default' | 'warning' | 'danger' | 'success' | 'info' | 'secondary'> = {
  academic: 'info', administrative: 'secondary', event: 'success',
  exam: 'danger', fee: 'warning', placement: 'default', other: 'secondary',
};

const CAT_LABELS: Record<NoticeCategory, string> = {
  academic: 'Academic', administrative: 'Administrative', event: 'Event',
  exam: 'Exam', fee: 'Fee', placement: 'Placement', other: 'Other',
};

export function NoticesPage() {
  const { notices, addNotice, updateNotice, deleteNotice, markAllNoticesRead } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewNotice, setViewNotice] = useState<Notice | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const emptyForm = {
    title: '', content: '', source: '', date: format(new Date(), 'yyyy-MM-dd'),
    category: 'academic' as NoticeCategory, isPinned: false, isRead: false,
  };
  const [form, setForm] = useState(emptyForm);

  const set = (f: keyof typeof form) => (ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [f]: ev.target.value }));

  const save = () => {
    addNotice(form);
    setDialogOpen(false);
    setForm(emptyForm);
  };

  const markRead = (id: string) => updateNotice(id, { isRead: true });
  const togglePin = (n: Notice) => updateNotice(n.id, { isPinned: !n.isPinned });

  const pinned = notices.filter((n) => n.isPinned).sort((a, b) => b.date.localeCompare(a.date));
  const rest = notices.filter((n) => !n.isPinned).sort((a, b) => b.date.localeCompare(a.date));
  const unreadCount = notices.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-semibold text-xl">Notices</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {unreadCount} unread
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllNoticesRead}>
              <CheckCheck className="h-4 w-4" /> Mark all read
            </Button>
          )}
          <Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4" /> Add Notice</Button>
        </div>
      </div>

      {pinned.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Pin className="h-3 w-3" /> Pinned
          </p>
          {pinned.map((n) => <NoticeRow key={n.id} n={n} onView={setViewNotice} onRead={markRead} onPin={togglePin} onDelete={setDeleteId} />)}
        </div>
      )}

      <div className="space-y-2">
        {rest.length === 0 && pinned.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No notices yet</p>
          </div>
        ) : (
          rest.map((n) => <NoticeRow key={n.id} n={n} onView={setViewNotice} onRead={markRead} onPin={togglePin} onDelete={setDeleteId} />)
        )}
      </div>

      {/* View dialog */}
      <Dialog open={!!viewNotice} onClose={() => setViewNotice(null)} size="lg">
        {viewNotice && (
          <>
            <DialogHeader>
              <div className="flex-1">
                {viewNotice.isPinned && <div className="flex items-center gap-1 text-[10px] text-warning mb-1"><Pin className="h-3 w-3" /> Pinned</div>}
                <DialogTitle>{viewNotice.title.replace('[PROTOTYPE] ', '')}</DialogTitle>
                <p className="text-xs text-muted-foreground mt-1">{viewNotice.source} · {format(new Date(viewNotice.date), 'MMMM d, yyyy')}</p>
              </div>
              <DialogClose onClose={() => setViewNotice(null)} />
            </DialogHeader>
            <DialogContent>
              <Badge variant={CAT_VARIANTS[viewNotice.category]} className="mb-4">{CAT_LABELS[viewNotice.category]}</Badge>
              <p className="text-sm text-foreground leading-relaxed">{viewNotice.content}</p>
            </DialogContent>
            <DialogFooter>
              {!viewNotice.isRead && (
                <Button variant="outline" onClick={() => { markRead(viewNotice.id); setViewNotice(null); }}>
                  <CheckCircle2 className="h-4 w-4" /> Mark as read
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </Dialog>

      {/* Add dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} size="lg">
        <DialogHeader>
          <DialogTitle>Add Notice</DialogTitle>
          <DialogClose onClose={() => setDialogOpen(false)} />
        </DialogHeader>
        <DialogContent className="space-y-3">
          <div>
            <Label>Title *</Label>
            <Input placeholder="Notice title" value={form.title} onChange={set('title')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Source</Label>
              <Input placeholder="e.g. Exam Cell" value={form.source} onChange={set('source')} />
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={set('date')} />
            </div>
          </div>
          <div>
            <Label>Category</Label>
            <Select value={form.category} onChange={set('category')}>
              {Object.entries(CAT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </div>
          <div>
            <Label>Content *</Label>
            <Textarea placeholder="Notice details..." rows={4} value={form.content} onChange={set('content')} />
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={save} disabled={!form.title || !form.content}>Add Notice</Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} size="sm">
        <DialogHeader><DialogTitle>Delete notice?</DialogTitle></DialogHeader>
        <DialogContent><p className="text-sm text-muted-foreground">This action cannot be undone.</p></DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="destructive" onClick={() => { deleteNotice(deleteId!); setDeleteId(null); }}>Delete</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

function NoticeRow({ n, onView, onRead, onPin, onDelete }: {
  n: Notice; onView: (n: Notice) => void; onRead: (id: string) => void;
  onPin: (n: Notice) => void; onDelete: (id: string) => void;
}) {
  return (
    <Card
      className={`cursor-pointer hover:border-primary/20 transition-all group ${!n.isRead ? 'border-primary/20 bg-primary/5' : ''}`}
      onClick={() => { onView(n); if (!n.isRead) onRead(n.id); }}
    >
      <div className="flex items-start gap-4 px-4 py-3">
        <div className="shrink-0 mt-0.5">
          {!n.isRead ? (
            <div className="h-2 w-2 rounded-full bg-primary mt-1" />
          ) : (
            <div className="h-2 w-2 rounded-full bg-transparent" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {n.isPinned && <Pin className="h-3 w-3 text-warning shrink-0" />}
            <p className={`text-sm font-medium ${!n.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
              {n.title.replace('[PROTOTYPE] ', '')}
            </p>
            <Badge variant={CAT_VARIANTS[n.category]} className="text-[10px]">{CAT_LABELS[n.category]}</Badge>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1">{n.content}</p>
          <p className="text-[10px] text-muted-foreground mt-1">{n.source} · {format(new Date(n.date), 'MMM d, yyyy')}</p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onPin(n)} title={n.isPinned ? 'Unpin' : 'Pin'}>
            <Pin className={`h-3.5 w-3.5 ${n.isPinned ? 'text-warning' : ''}`} />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDelete(n.id)}>
            <Trash2 className="h-3.5 w-3.5 text-danger" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
