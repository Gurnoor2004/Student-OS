import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import {
  LayoutDashboard, Sun, BookOpen, CheckSquare, CheckCircle2,
  MoreHorizontal, Calendar, Clock, GraduationCap, FileText,
  Bell, Briefcase, BarChart3, Settings, X, LogOut, Zap,
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';

const bottomNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/today', icon: Sun, label: 'Today' },
  { to: '/assignments', icon: BookOpen, label: 'Tasks' },
  { to: '/attendance', icon: CheckSquare, label: 'Attendance' },
];

const allNav = [
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/timetable', icon: Clock, label: 'Timetable' },
  { to: '/exams', icon: GraduationCap, label: 'Exams' },
  { to: '/notes', icon: FileText, label: 'Notes' },
  { to: '/tasks', icon: CheckCircle2, label: 'Tasks' },
  { to: '/notices', icon: Bell, label: 'Notices' },
  { to: '/opportunities', icon: Briefcase, label: 'Opportunities' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { notices } = useApp();
  const navigate = useNavigate();

  const unreadNoticesCount = notices.filter((n) => !n.isRead).length;

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Bottom bar */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border"
        style={{ backgroundColor: 'var(--card)' }}
      >
        <div className="flex items-center justify-around px-2 py-2 safe-area-pb">
          {bottomNav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-all',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )
              }
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </NavLink>
          ))}
          <button
            onClick={() => setOpen(true)}
            className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-muted-foreground"
          >
            <MoreHorizontal className="h-5 w-5" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>

      {/* Drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div
            className="relative ml-auto w-72 h-full flex flex-col border-l border-border shadow-2xl"
            style={{ backgroundColor: 'var(--card)' }}
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                  <Zap className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <span className="font-display font-semibold text-sm">Student OS</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-muted">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {/* User info */}
              <div className="flex items-center gap-3 p-3 mb-3 rounded-xl bg-muted/50">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary font-semibold">
                  {getInitials(user?.name || '?')}
                </div>
                <div>
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.course} · Sem {user?.semester}</p>
                </div>
              </div>

              {allNav.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-0.5 transition-all',
                      isActive
                        ? 'bg-primary/15 text-primary font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
                    )
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{label}</span>
                  {to === '/notices' && unreadNoticesCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-danger text-white text-[10px] font-bold leading-none">
                      {unreadNoticesCount > 9 ? '9+' : unreadNoticesCount}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>

            <div className="p-3 border-t border-border">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-danger hover:bg-danger/10 w-full transition-all"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
