'use client';

import { useEffect, useState } from 'react';

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timeout = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timeout);
  }, [copied]);

  return (
    <button
      type='button'
      aria-label={copied ? 'Copied' : 'Copy code'}
      onClick={() => void navigator.clipboard.writeText(text).then(() => setCopied(true))}
      className={`text-muted-foreground bg-background relative inline-flex size-[1.875rem] shrink-0 select-none items-center justify-center rounded-md transition-colors ${copied ? '' : 'hover:bg-muted hover:text-foreground'}`}
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
      <svg
        aria-hidden
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth={2}
        strokeLinecap='round'
        strokeLinejoin='round'
        className={`absolute size-3.5 transition-transform ${copied ? 'scale-0' : ''}`}
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
    </button>
  );
}
