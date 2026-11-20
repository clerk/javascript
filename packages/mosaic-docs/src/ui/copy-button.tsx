'use client';

import { useEffect, useState } from 'react';

export function useFlash<T>(): [T | undefined, (value: T) => void] {
  const [value, setValue] = useState<T>();

  useEffect(() => {
    if (value === undefined) {
      return;
    }
    const timeout = setTimeout(() => setValue(undefined), 1500);
    return () => clearTimeout(timeout);
  }, [value]);

  return [value, setValue];
}

export function CopyIcon({ className }: { className: string }) {
  return (
    <svg
      aria-hidden
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={2}
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
    >
      <rect
        width='14'
        height='14'
        x='8'
        y='8'
        rx='2'
        ry='2'
      />
      <path d='M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2' />
    </svg>
  );
}

export async function copyText(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

export function CopyButton({ text }: { text: string }) {
  const [status, flash] = useFlash<'copied' | 'failed'>();
  const copied = status === 'copied';

  return (
    <button
      type='button'
      aria-label={copied ? 'Copied' : status === 'failed' ? 'Copy failed' : 'Copy code'}
      onClick={() =>
        void copyText(text).then(
          () => flash('copied'),
          () => flash('failed'),
        )
      }
      className={`text-muted-foreground bg-background size-7.5 relative inline-flex shrink-0 select-none items-center justify-center rounded-md transition-colors ${copied ? '' : 'hover:bg-muted hover:text-foreground'}`}
    >
      <svg
        aria-hidden
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth={2}
        strokeLinecap='round'
        strokeLinejoin='round'
        className={`size-3.5 text-green-600 transition-transform ${copied ? '' : 'scale-0'}`}
      >
        <path d='M20 6 9 17l-5-5' />
      </svg>
      <CopyIcon className={`absolute size-3.5 transition-transform ${copied ? 'scale-0' : ''}`} />
    </button>
  );
}
