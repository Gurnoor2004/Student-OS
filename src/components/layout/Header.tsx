import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  Bell,
  Moon,
  Sun,
  CheckCheck,
  CheckCircle2,
  Pin,
  ExternalLink,
  X,
  Calendar,
  Sparkles,
  Inbox,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { Notice, NoticeCategory } from '@/types';

const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/today': 'Today',
  '/calendar': 'Calendar',
  '/timetable': 'Timetable',
  '/attendance': 'Attendance',
  '/assignments': 'Assignments',
  '/exams': 'Exams',
  '/notes': 'Notes',
  '/notices': 'Notices',
  '/opportunities': 'Opportunities',
  '/tasks': 'Tasks',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
};

const CAT_VARIANTS: Record<NoticeCategory, 'default' | 'warning' | 'danger' | 'success' | 'info' | 'secondary'> = {
  academic: 'info',
  administrative: 'secondary',
  event: 'success',
  exam: 'danger',
  fee: 'warning',
  placement: 'default',
  other: 'secondary',
};

const CAT_LABELS: Record<NoticeCategory, string> = {
  academic: 'Academic',
  administrative: 'Admin',
  event: 'Event',
  exam: 'Exam',
  fee: 'Fee',
  placement: 'Placement',
  other: 'Notice',
};

export function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notices, settings, saveSettings, updateNotice, markAllNoticesRead } = useApp();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const title = routeTitles[pathname] ?? 'Student OS';
  const unreadCount = notices.filter((n) => !n.isRead).length;

  const toggleTheme = () => {
    const next = settings.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', next === 'dark');
    saveSettings({ ...settings, theme: next });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    };

    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationsOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && notificationsOpen) {
        setNotificationsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [notificationsOpen]);

  const sortedNotices = [...notices].sort((a, b) => {
    // Unread first, then pinned, then latest date
    if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return b.date.localeCompare(a.date);
  });

  const displayedNotices =
    filter === 'unread' ? sortedNotices.filter((n) => !n.isRead) : sortedNotices;

  const handleNoticeClick = (notice: Notice) => {
    if (!notice.isRead) {
      updateNotice(notice.id, { isRead: true });
    }
    setSelectedNotice(notice);
  };

  const handleMarkAsRead = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    updateNotice(id, { isRead: true });
  };

  return (
    <>
      <header className="flex h-13 items-center justify-between px-4 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <h1 className="font-display font-semibold text-sm text-foreground">{title}</h1>
          {pathname === '/dashboard' && (
            <span className="text-xs text-muted-foreground hidden sm:block">
              Good {getGreeting()}, {user?.name?.split(' ')[0]}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title="Toggle theme"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            {settings.theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* Notifications Button */}
          <div className="relative">
            <Button
              ref={buttonRef}
              variant="ghost"
              size="icon"
              className={cn(
                'relative h-8 w-8 text-muted-foreground hover:text-foreground transition-colors',
                notificationsOpen && 'bg-accent text-accent-foreground',
              )}
              title="Notifications"
              onClick={() => setNotificationsOpen((prev) => !prev)}
              aria-expanded={notificationsOpen}
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-danger text-white text-[9px] font-bold flex items-center justify-center shadow-sm shadow-danger/40 animate-in zoom-in">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>

            {/* Notification Popover Dropdown */}
            {notificationsOpen && (
              <div
                ref={popoverRef}
                className="absolute right-0 top-full mt-2 w-84 sm:w-96 rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/20 z-50 overflow-hidden flex flex-col animate-in fade-in-0 zoom-in-95 duration-150"
                style={{ maxHeight: '85vh' }}
              >
                {/* Popover Header */}
                <div className="p-3.5 border-b border-border/70 flex items-center justify-between bg-card/70">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-primary/10 text-primary">
                      <Bell className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-sm text-foreground">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-danger/15 text-danger border border-danger/20">
                        {unreadCount} new
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllNoticesRead()}
                        className="text-[11px] font-medium text-primary hover:text-primary/80 flex items-center gap-1 px-2 py-1 rounded-md hover:bg-primary/10 transition-colors"
                        title="Mark all as read"
                      >
                        <CheckCheck className="h-3.5 w-3.5" />
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setNotificationsOpen(false)}
                      className="p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
                      title="Close"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="px-3 py-2 border-b border-border/50 flex gap-2 bg-muted/20">
                  <button
                    onClick={() => setFilter('all')}
                    className={cn(
                      'text-xs font-medium px-2.5 py-1 rounded-lg transition-all',
                      filter === 'all'
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                    )}
                  >
                    All ({notices.length})
                  </button>
                  <button
                    onClick={() => setFilter('unread')}
                    className={cn(
                      'text-xs font-medium px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5',
                      filter === 'unread'
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                    )}
                  >
                    Unread ({unreadCount})
                  </button>
                </div>

                {/* Notification Items List */}
                <div className="flex-1 overflow-y-auto divide-y divide-border/40 max-h-[380px]">
                  {displayedNotices.length === 0 ? (
                    <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                        <Sparkles className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {filter === 'unread' ? 'All caught up!' : 'No notifications'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                        {filter === 'unread'
                          ? 'You have read all your campus notices and updates.'
                          : 'Check back later for circulars, exam dates, and notices.'}
                      </p>
                    </div>
                  ) : (
                    displayedNotices.map((n) => {
                      const cleanTitle = n.title.replace(/^\[PROTOTYPE\]\s*/i, '');
                      return (
                        <div
                          key={n.id}
                          onClick={() => handleNoticeClick(n)}
                          className={cn(
                            'p-3.5 transition-colors cursor-pointer group flex items-start gap-3 text-left relative',
                            !n.isRead
                              ? 'bg-primary/[0.04] hover:bg-primary/[0.08]'
                              : 'hover:bg-muted/40 opacity-80 hover:opacity-100',
                          )}
                        >
                          {/* Unread indicator dot */}
                          <div className="pt-1 shrink-0">
                            {!n.isRead ? (
                              <span className="flex h-2 w-2 rounded-full bg-primary ring-2 ring-primary/20" />
                            ) : (
                              <span className="flex h-2 w-2 rounded-full bg-border" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap mb-1">
                              <Badge
                                variant={CAT_VARIANTS[n.category] || 'default'}
                                className="text-[10px] py-0 px-1.5 h-4"
                              >
                                {CAT_LABELS[n.category] || n.category}
                              </Badge>
                              {n.isPinned && (
                                <span className="flex items-center gap-0.5 text-[10px] text-warning font-medium">
                                  <Pin className="h-2.5 w-2.5" /> Pinned
                                </span>
                              )}
                              <span className="text-[10px] text-muted-foreground ml-auto shrink-0">
                                {format(new Date(n.date), 'MMM d')}
                              </span>
                            </div>

                            <p
                              className={cn(
                                'text-xs line-clamp-1 leading-snug',
                                !n.isRead
                                  ? 'font-semibold text-foreground'
                                  : 'font-normal text-muted-foreground',
                              )}
                            >
                              {cleanTitle}
                            </p>
                            <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                              {n.content}
                            </p>
                            <div className="mt-1 flex items-center justify-between">
                              <span className="text-[10px] text-muted-foreground/75 truncate">
                                {n.source}
                              </span>
                              {!n.isRead && (
                                <button
                                  onClick={(e) => handleMarkAsRead(e, n.id)}
                                  className="text-[10px] text-primary hover:underline font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  Mark read
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Popover Footer */}
                <div className="p-2.5 border-t border-border/70 bg-card/80 flex items-center justify-between text-xs">
                  <button
                    onClick={() => {
                      setNotificationsOpen(false);
                      navigate('/notices');
                    }}
                    className="w-full py-1.5 px-3 rounded-lg text-primary hover:bg-primary/10 font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>View all notices & circulars</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Notice View Modal Dialog */}
      <Dialog
        open={!!selectedNotice}
        onClose={() => setSelectedNotice(null)}
        size="md"
      >
        {selectedNotice && (
          <>
            <DialogHeader>
              <div className="flex-1 pr-6">
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant={CAT_VARIANTS[selectedNotice.category] || 'default'}
                    className="text-xs"
                  >
                    {CAT_LABELS[selectedNotice.category] || selectedNotice.category}
                  </Badge>
                  {selectedNotice.isPinned && (
                    <span className="flex items-center gap-1 text-xs text-warning font-medium">
                      <Pin className="h-3 w-3" /> Pinned
                    </span>
                  )}
                </div>
                <DialogTitle className="text-base font-semibold text-foreground leading-snug">
                  {selectedNotice.title.replace(/^\[PROTOTYPE\]\s*/i, '')}
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Issued by <span className="text-foreground font-medium">{selectedNotice.source}</span> •{' '}
                  {format(new Date(selectedNotice.date), 'MMMM d, yyyy')}
                </p>
              </div>
              <DialogClose onClose={() => setSelectedNotice(null)} />
            </DialogHeader>

            <DialogContent className="py-4">
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {selectedNotice.content}
              </div>
            </DialogContent>

            <DialogFooter className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedNotice(null);
                  setNotificationsOpen(false);
                  navigate('/notices');
                }}
              >
                Go to Notices
              </Button>
              <Button
                size="sm"
                onClick={() => setSelectedNotice(null)}
              >
                Close
              </Button>
            </DialogFooter>
          </>
        )}
      </Dialog>
    </>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
