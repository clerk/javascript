'use client';

import clsx from 'clsx';
import { useEffect, useReducer, useRef, useState } from 'react';

import { CopyCheckIcon } from '@/components/prompt-bar/copy-check-icon';
export function CopyLine({
  lead,
  value,
  name,
  className,
}: {
  lead: string;
  value: string;
  name: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [copies, countCopy] = useReducer((n: number) => n + 1, 0);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      return;
    }
    setCopied(true);
    countCopy();
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={clsx('body-3 flex flex-col items-center text-neutral-600 dark:text-neutral-400', className)}>
      {lead}
      <button
        type='button'
        aria-label={`Copy ${name}: ${value}`}
        onClick={() => void handleCopy()}
        className='focus-visible:outline-focus -my-0.5 inline-flex cursor-pointer items-center gap-1.5 rounded-sm py-0.5 font-mono text-neutral-800 transition-colors hover:text-neutral-950 dark:text-neutral-200 dark:hover:text-white'
      >
        {value}
        <span
          aria-hidden
          className='grid size-4 place-items-center'
        >
          <CopyCheckIcon copied={copied} />
        </span>
      </button>
      <span
        className='sr-only'
        aria-live='polite'
      >
        {copied && <span key={copies}>{`${name[0].toUpperCase()}${name.slice(1)} copied`}</span>}
      </span>
    </div>
  );
}
