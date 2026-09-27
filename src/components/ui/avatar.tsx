import { type HTMLAttributes } from 'react';
import { cn, getInitials } from '@/lib/utils';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  name?: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizes = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-xl',
};

export function Avatar({ name = '', src, size = 'md', className, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        'relative rounded-full flex items-center justify-center overflow-hidden shrink-0',
        'bg-primary/20 text-primary font-semibold',
        sizes[size],
        className,
      )}
      {...props}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span>{getInitials(name) || '?'}</span>
      )}
    </div>
  );
}
