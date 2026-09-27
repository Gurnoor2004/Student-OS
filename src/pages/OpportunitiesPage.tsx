import { useState } from 'react';
import { Plus, Trash2, Edit, ExternalLink, Briefcase, Filter } from 'lucide-react';
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
import { getDaysUntil, formatDate } from '@/lib/utils';
import type { Opportunity, OpportunityType, ApplicationStatus } from '@/types';

const STATUS_VARIANTS: Record<ApplicationStatus, 'secondary' | 'default' | 'warning' | 'info' | 'danger' | 'success'> = {
  saved: 'secondary', applied: 'default', assessment: 'warning',
  interview: 'info', rejected: 'danger', selected: 'success',
};

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  saved: 'Saved', applied: 'Applied', assessment: 'Assessment',
  interview: 'Interview', rejected: 'Rejected', selected: 'Selected',
};

const TYPE_LABELS: Record<OpportunityType, string> = {
  internship: 'Internship', job: 'Full-time', fellowship: 'Fellowship',
  scholarship: 'Scholarship', open_source: 'Open Source', hackathon: 'Hackathon',
};

export function OpportunitiesPage() {
  const { opportunities, addOpportunity, updateOpportunity, deleteOpportunity } = useApp();
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Opportunity | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const emptyForm = {
    title: '', company: '', type: 'internship' as OpportunityType,
    description: '', deadline: '', applicationStatus: 'saved' as ApplicationStatus,
    link: '', stipend: '', location: '', tags: '',
  };
  const [form, setForm] = useState(emptyForm);

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (o: Opportunity) => {
    setEditItem(o);
    setForm({ title: o.title, company: o.company, type: o.type, description: o.description, deadline: o.deadline ?? '', applicationStatus: o.applicationStatus, link: o.link ?? '', stipend: o.stipend ?? '', location: o.location ?? '', tags: o.tags.join(', ') });
    setDialogOpen(true);
  };

  const set = (f: keyof typeof form) => (ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [f]: ev.target.value }));

  const save = () => {
    const data = { ...form, deadline: form.deadline || undefined, tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean) };
    if (editItem) updateOpportunity(editItem.id, data);
    else addOpportunity(data);
    setDialogOpen(false);
  };

  const filtered = opportunities.filter((o) => statusFilter === 'all' || o.applicationStatus === statusFilter);

  const statuses: ApplicationStatus[] = ['saved', 'applied', 'assessment', 'interview', 'rejected', 'selected'];
  const counts = statuses.reduce((acc, s) => ({ ...acc, [s]: opportunities.filter((o) => o.applicationStatus === s).length }), {} as Record<ApplicationStatus, number>);

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-semibold text-xl">Opportunities</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{opportunities.length} tracked</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4" /> Add</Button>
      </div>

      {/* Pipeline view */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
        >
          All ({opportunities.length})
        </button>
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
          >
            {STATUS_LABELS[s]} {counts[s] > 0 && `(${counts[s]})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Briefcase className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {opportunities.length === 0 ? 'Track internships, jobs, and other opportunities' : 'No opportunities in this status'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => {
            const days = o.deadline ? getDaysUntil(o.deadline) : null;
            return (
              <Card key={o.id} className="group">
                <div className="flex items-start gap-4 px-4 py-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-semibold">{o.title.replace('[PROTOTYPE] ', '')}</p>
                      <Badge variant={STATUS_VARIANTS[o.applicationStatus]}>{STATUS_LABELS[o.applicationStatus]}</Badge>
                      <Badge variant="secondary" className="text-[10px]">{TYPE_LABELS[o.type]}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">{o.company}</p>
                    {o.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{o.description}</p>}
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                      {o.stipend && <span>💰 {o.stipend}</span>}
                      {o.location && <span>📍 {o.location}</span>}
                      {o.deadline && (
                        <span className={days !== null && days <= 7 ? 'text-warning' : ''}>
                          📅 Deadline: {formatDate(o.deadline)} {days !== null && days >= 0 && `(${days}d)`}
                        </span>
                      )}
                    </div>
                    {o.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-2">
                        {o.tags.map((t) => (
                          <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 items-end shrink-0">
                    <Select
                      value={o.applicationStatus}
                      onChange={(e) => updateOpportunity(o.id, { applicationStatus: e.target.value as ApplicationStatus })}
                      className="h-8 text-xs py-1 w-32"
                    >
                      {statuses.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </Select>
                    <div className="flex gap-1">
                      {o.link && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => window.open(o.link, '_blank')}>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(o)}><Edit className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDeleteId(o.id)}><Trash2 className="h-3.5 w-3.5 text-danger" /></Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} size="lg">
        <DialogHeader>
          <DialogTitle>{editItem ? 'Edit Opportunity' : 'Add Opportunity'}</DialogTitle>
          <DialogClose onClose={() => setDialogOpen(false)} />
        </DialogHeader>
        <DialogContent className="space-y-3">
          <div>
            <Label>Title / Role *</Label>
            <Input placeholder="e.g. Software Engineering Intern" value={form.title} onChange={set('title')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Company / Organization *</Label>
              <Input placeholder="e.g. Google" value={form.company} onChange={set('company')} />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={form.type} onChange={set('type')}>
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Status</Label>
              <Select value={form.applicationStatus} onChange={set('applicationStatus')}>
                {statuses.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </Select>
            </div>
            <div>
              <Label>Deadline</Label>
              <Input type="date" value={form.deadline} onChange={set('deadline')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Stipend / Salary</Label>
              <Input placeholder="e.g. ₹30,000/month" value={form.stipend} onChange={set('stipend')} />
            </div>
            <div>
              <Label>Location</Label>
              <Input placeholder="e.g. Remote / Bangalore" value={form.location} onChange={set('location')} />
            </div>
          </div>
          <div>
            <Label>Application Link</Label>
            <Input placeholder="https://..." value={form.link} onChange={set('link')} />
          </div>
          <div>
            <Label>Tags (comma separated)</Label>
            <Input placeholder="e.g. backend, python, ml" value={form.tags} onChange={set('tags')} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea placeholder="About this opportunity..." rows={3} value={form.description} onChange={set('description')} />
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={save} disabled={!form.title || !form.company}>Save</Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} size="sm">
        <DialogHeader><DialogTitle>Delete opportunity?</DialogTitle></DialogHeader>
        <DialogContent><p className="text-sm text-muted-foreground">This action cannot be undone.</p></DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="destructive" onClick={() => { deleteOpportunity(deleteId!); setDeleteId(null); }}>Delete</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
