import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Spinner({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-primary', className)}
      aria-label="Loading"
      role="status"
      {...props}
    />
  );
}

export default Spinner;
