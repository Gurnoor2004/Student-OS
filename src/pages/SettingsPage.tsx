import { useState } from 'react';
import { User, Lock, Bell, Palette, Save, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Avatar } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export function SettingsPage() {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const { settings, saveSettings, subjects, addSubject, deleteSubject } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [profile, setProfile] = useState({
    name: user?.name ?? '',
    college: user?.college ?? '',
    university: user?.university ?? '',
    course: user?.course ?? '',
    branch: user?.branch ?? '',
    year: user?.year ?? 1,
    semester: user?.semester ?? 1,
  });

  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });

  const [localSettings, setLocalSettings] = useState({
    theme: settings.theme,
    attendanceWarningThreshold: settings.attendanceWarningThreshold,
    attendanceCriticalThreshold: settings.attendanceCriticalThreshold,
  });

  // Subject form
  const emptySubForm = { name: '', code: '', teacher: '', room: '', credits: 3, semester: user?.semester ?? 5, color: '#6366f1' };
  const [subForm, setSubForm] = useState(emptySubForm);

  const setP = (f: keyof typeof profile) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setProfile((p) => ({ ...p, [f]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }));

  const saveProfile = async () => {
    setSaving(true);
    setError('');
    try {
      await updateProfile(profile);
      setSuccess('Profile saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async () => {
    if (passwords.next !== passwords.confirm) { setError('Passwords do not match'); return; }
    if (passwords.next.length < 6) { setError('Password must be at least 6 characters'); return; }
    setSaving(true);
    setError('');
    try {
      await changePassword(passwords.current, passwords.next);
      setSuccess('Password changed successfully');
      setPasswords({ current: '', next: '', confirm: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const applySettings = () => {
    document.documentElement.classList.toggle('dark', localSettings.theme === 'dark');
    saveSettings({ userId: user!.id, ...localSettings });
    setSuccess('Settings saved');
    setTimeout(() => setSuccess(''), 3000);
  };

  const addSub = () => {
    if (!subForm.name) return;
    addSubject(subForm);
    setSubForm(emptySubForm);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h2 className="font-display font-semibold text-xl">Settings</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your account and preferences</p>
      </div>

      {success && (
        <div className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">{success}</div>
      )}
      {error && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                <Avatar name={user?.name} size="xl" />
                <div>
                  <p className="font-semibold">{user?.name}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <Badge variant="secondary" className="mt-1">{user?.course} · Sem {user?.semester}</Badge>
                </div>
              </div>

              <div className="grid gap-3">
                <div>
                  <Label>Full name</Label>
                  <Input value={profile.name} onChange={setP('name')} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Course</Label>
                    <Input value={profile.course} onChange={setP('course')} placeholder="e.g. B.Tech" />
                  </div>
                  <div>
                    <Label>Branch</Label>
                    <Input value={profile.branch} onChange={setP('branch')} placeholder="e.g. Computer Science" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Year</Label>
                    <Select value={profile.year} onChange={setP('year')}>
                      {[1,2,3,4,5].map((y) => <option key={y} value={y}>{y}st/nd/rd Year</option>)}
                    </Select>
                  </div>
                  <div>
                    <Label>Semester</Label>
                    <Select value={profile.semester} onChange={setP('semester')}>
                      {[1,2,3,4,5,6,7,8,9,10].map((s) => <option key={s} value={s}>Semester {s}</option>)}
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>College</Label>
                  <Input value={profile.college} onChange={setP('college')} />
                </div>
                <div>
                  <Label>University</Label>
                  <Input value={profile.university} onChange={setP('university')} />
                </div>
              </div>
              <div className="flex justify-between items-center pt-2">
                <Button onClick={handleLogout} variant="ghost" className="text-danger hover:bg-danger/10">
                  <LogOut className="h-4 w-4" /> Sign out
                </Button>
                <Button onClick={saveProfile} loading={saving}>
                  <Save className="h-4 w-4" /> Save Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects">
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Add Subject</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Name *</Label>
                    <Input placeholder="e.g. Data Structures" value={subForm.name} onChange={(e) => setSubForm((p) => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Code</Label>
                    <Input placeholder="e.g. CS301" value={subForm.code} onChange={(e) => setSubForm((p) => ({ ...p, code: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Teacher</Label>
                    <Input placeholder="Dr. Sharma" value={subForm.teacher} onChange={(e) => setSubForm((p) => ({ ...p, teacher: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Room</Label>
                    <Input placeholder="A-201" value={subForm.room} onChange={(e) => setSubForm((p) => ({ ...p, room: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Credits</Label>
                    <Input type="number" min={1} max={6} value={subForm.credits} onChange={(e) => setSubForm((p) => ({ ...p, credits: Number(e.target.value) }))} />
                  </div>
                  <div>
                    <Label>Semester</Label>
                    <Input type="number" min={1} max={10} value={subForm.semester} onChange={(e) => setSubForm((p) => ({ ...p, semester: Number(e.target.value) }))} />
                  </div>
                  <div>
                    <Label>Color</Label>
                    <input type="color" value={subForm.color} onChange={(e) => setSubForm((p) => ({ ...p, color: e.target.value }))} className="w-full h-9 rounded-lg border border-border cursor-pointer" />
                  </div>
                </div>
                <Button onClick={addSub} disabled={!subForm.name} className="w-full">Add Subject</Button>
              </CardContent>
            </Card>

            <div className="space-y-2">
              {subjects.map((s) => (
                <Card key={s.id}>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="h-8 w-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.code} · {s.teacher} · {s.credits} credits</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteSubject(s.id)} className="text-danger hover:bg-danger/10 h-7 w-7">
                      <span className="text-xs">✕</span>
                    </Button>
                  </div>
                </Card>
              ))}
              {subjects.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No subjects added yet</p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Lock className="h-4 w-4" /> Change Password</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Current password</Label>
                <Input type="password" value={passwords.current} onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))} />
              </div>
              <div>
                <Label>New password</Label>
                <Input type="password" value={passwords.next} onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))} />
              </div>
              <div>
                <Label>Confirm new password</Label>
                <Input type="password" value={passwords.confirm} onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))} />
              </div>
              <Button onClick={savePassword} loading={saving} disabled={!passwords.current || !passwords.next}>
                <Lock className="h-4 w-4" /> Change Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardContent className="p-5 space-y-4">
              <div>
                <Label>Theme</Label>
                <Select value={localSettings.theme} onChange={(e) => setLocalSettings((p) => ({ ...p, theme: e.target.value as 'dark' | 'light' }))}>
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </Select>
              </div>
              <div>
                <Label>Attendance Warning Threshold (%)</Label>
                <Input
                  type="number" min={50} max={95}
                  value={localSettings.attendanceWarningThreshold}
                  onChange={(e) => setLocalSettings((p) => ({ ...p, attendanceWarningThreshold: Number(e.target.value) }))}
                />
                <p className="text-xs text-muted-foreground mt-1">Subjects below this are shown as "Warning" (default: 75%)</p>
              </div>
              <div>
                <Label>Attendance Critical Threshold (%)</Label>
                <Input
                  type="number" min={30} max={80}
                  value={localSettings.attendanceCriticalThreshold}
                  onChange={(e) => setLocalSettings((p) => ({ ...p, attendanceCriticalThreshold: Number(e.target.value) }))}
                />
                <p className="text-xs text-muted-foreground mt-1">Subjects below this are shown as "Critical" (default: 65%)</p>
              </div>
              <Button onClick={applySettings}>
                <Save className="h-4 w-4" /> Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
