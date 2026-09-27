import { createContext, useContext, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TabsCtx { value: string; onChange: (v: string) => void; }
const Ctx = createContext<TabsCtx>({ value: '', onChange: () => {} });

interface TabsProps { value: string; onValueChange: (v: string) => void; children: ReactNode; className?: string; }
export function Tabs({ value, onValueChange, children, className }: TabsProps) {
  return <Ctx.Provider value={{ value, onChange: onValueChange }}><div className={className}>{children}</div></Ctx.Provider>;
}

export function TabsList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('inline-flex items-center gap-0.5 rounded-lg bg-muted p-1', className)}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className }: { value: string; children: ReactNode; className?: string }) {
  const { value: active, onChange } = useContext(Ctx);
  return (
    <button
      onClick={() => onChange(value)}
      className={cn(
        'px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        active === value
          ? 'bg-card text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className }: { value: string; children: ReactNode; className?: string }) {
  const { value: active } = useContext(Ctx);
  if (active !== value) return null;
  return <div className={cn('mt-4', className)}>{children}</div>;
}
