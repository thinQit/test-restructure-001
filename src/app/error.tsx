'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';

export function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="max-w-md text-sm text-secondary">Please try again or refresh the page.</p>
      <Button onClick={reset} aria-label="Retry">
        Try again
      </Button>
    </div>
  );
}

export default GlobalError;
