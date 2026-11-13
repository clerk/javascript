'use client';

import clsx from 'clsx';
import { useEffect, useReducer, useRef, useState } from 'react';

import { CopyCheckIcon } from '@/components/prompt-bar/copy-check-icon';
import { SKILL_URL } from '@/lib/agent-prompt';

const label = SKILL_URL.replace(/^https?:\/\//, '');

export function SkillUrl({ className }: { className?: string }) {
  const [copied, setCopied] = useState(false);
  const [copies, countCopy] = useReducer((n: number) => n + 1, 0);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(SKILL_URL);
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
      Or install with your agent
      <button
        type='button'
        aria-label={`Copy skill URL: ${SKILL_URL}`}
        onClick={() => void handleCopy()}
        className='focus-visible:outline-focus inline-flex cursor-pointer items-center gap-1.5 rounded-sm font-mono text-neutral-800 transition-colors hover:text-neutral-950 dark:text-neutral-200 dark:hover:text-white'
      >
        {label}
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
        {copied && <span key={copies}>Skill URL copied</span>}
      </span>
    </div>
  );
}
