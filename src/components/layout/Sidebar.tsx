import { NavLink, useNavigate } from 'react-router';
import {
  LayoutDashboard, Sun, Calendar, Clock, CheckSquare, BookOpen,
  GraduationCap, FileText, Bell, Briefcase, CheckCircle2,
  BarChart3, Settings, LogOut, Zap,
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';

const nav = [
  { label: 'OVERVIEW', items: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/today', icon: Sun, label: 'Today' },
  ]},
  { label: 'ACADEMICS', items: [
    { to: '/calendar', icon: Calendar, label: 'Calendar' },
    { to: '/timetable', icon: Clock, label: 'Timetable' },
    { to: '/attendance', icon: CheckSquare, label: 'Attendance' },
    { to: '/assignments', icon: BookOpen, label: 'Assignments' },
    { to: '/exams', icon: GraduationCap, label: 'Exams' },
    { to: '/notes', icon: FileText, label: 'Notes' },
  ]},
  { label: 'LIFE', items: [
    { to: '/tasks', icon: CheckCircle2, label: 'Tasks' },
    { to: '/notices', icon: Bell, label: 'Notices' },
    { to: '/opportunities', icon: Briefcase, label: 'Opportunities' },
  ]},
  { label: 'TOOLS', items: [
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  ]},
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const { notices } = useApp();
  const navigate = useNavigate();

  const unreadNoticesCount = notices.filter((n) => !n.isRead).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="flex h-full flex-col" style={{ backgroundColor: 'var(--sidebar)' }}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Zap className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <span className="font-display font-semibold text-sm text-foreground">Student OS</span>
          <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
            {user?.college?.split(' ').slice(0, 2).join(' ') || 'Your Workspace'}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {nav.map((section) => (
          <div key={section.label} className="mb-4">
            <p className="px-2 mb-1 text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">
              {section.label}
            </p>
            {section.items.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 mb-0.5 relative group',
                    isActive
                      ? 'bg-primary/15 text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 truncate">{label}</span>
                {to === '/notices' && unreadNoticesCount > 0 && (
                  <span className="ml-auto px-1.5 py-0.5 rounded-full bg-danger text-white text-[10px] font-bold leading-none">
                    {unreadNoticesCount > 9 ? '9+' : unreadNoticesCount}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-3 space-y-1">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all w-full',
              isActive
                ? 'bg-primary/15 text-primary font-medium'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
            )
          }
        >
          <Settings className="h-4 w-4 shrink-0" />
          Settings
        </NavLink>
        <div className="flex items-center gap-2.5 px-3 py-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-semibold shrink-0">
            {getInitials(user?.name || '?')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{user?.name}</p>
            <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1 rounded-md text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors"
            title="Logout"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
