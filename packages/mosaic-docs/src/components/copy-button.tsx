'use client';

import { useEffect, useState } from 'react';

export function CopyButton({ text, className }: { text: string; className?: string }) {
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
      className={`text-muted-foreground hover:bg-muted hover:text-foreground bg-background/80 inline-flex size-7 items-center justify-center rounded-md backdrop-blur ${className ?? ''}`}
    >
      <svg
        aria-hidden
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth={2}
        strokeLinecap='round'
        strokeLinejoin='round'
        className='size-3.5'
      >
        {copied ? (
          <path d='M20 6 9 17l-5-5' />
        ) : (
          <>
            <rect
              width='8'
              height='4'
              x='8'
              y='2'
              rx='1'
            />
            <path d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2' />
          </>
        )}
      </svg>
    </button>
  );
}
