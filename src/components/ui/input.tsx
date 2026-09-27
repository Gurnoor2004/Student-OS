import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type, ...props }, ref) => (
    <div className="w-full">
      <input
        ref={ref}
        type={type}
        className={cn(
          'w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground',
          'placeholder:text-muted-foreground outline-none transition-all duration-150',
          'focus:border-primary focus:ring-1 focus:ring-primary/30',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-danger focus:border-danger focus:ring-danger/30',
          className,
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  ),
);
Input.displayName = 'Input';
