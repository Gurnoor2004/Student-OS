import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => (
    <div className="w-full">
      <select
        ref={ref}
        className={cn(
          'w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground',
          'outline-none transition-all duration-150 cursor-pointer appearance-none',
          'focus:border-primary focus:ring-1 focus:ring-primary/30',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-danger',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  ),
);
Select.displayName = 'Select';
