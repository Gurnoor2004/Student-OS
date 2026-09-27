import { Navigate, Outlet } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { AppProvider } from '@/contexts/AppContext';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { Header } from './Header';

export function Shell() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-xs text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <AppProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Sidebar — desktop only */}
        <div className="hidden lg:flex lg:w-[240px] lg:shrink-0 lg:flex-col border-r border-border">
          <Sidebar />
        </div>

        {/* Main area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-24 lg:pb-6">
            <Outlet />
          </main>
        </div>

        {/* Mobile bottom nav */}
        <MobileNav />
      </div>
    </AppProvider>
  );
}
