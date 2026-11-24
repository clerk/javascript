'use client';

import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

import type { PropDocs } from '@/core/doc';
import { controlFor, type PlaygroundNode, type PlaygroundValue, type PlaygroundValues } from '@/core/playground';

interface PlaygroundState {
  name: string;
  props: PropDocs;
  values: PlaygroundValues;
  content: PlaygroundNode[] | undefined;
  changed: boolean;
  set: (prop: string, value: PlaygroundValue) => void;
  reset: () => void;
}

const PlaygroundContext = createContext<PlaygroundState | null>(null);

export function PlaygroundProvider({
  name,
  props,
  initial,
  content,
  children,
}: {
  name: string;
  props: PropDocs;
  initial: PlaygroundValues;
  content: PlaygroundNode[] | undefined;
  children: ReactNode;
}) {
  const [values, setValues] = useState(initial);
  const set = (prop: string, value: PlaygroundValue) => setValues(current => ({ ...current, [prop]: value }));
  const reset = () => setValues(initial);
  const changed = Object.keys({ ...initial, ...values }).some(prop => values[prop] !== initial[prop]);
  return (
    <PlaygroundContext.Provider value={{ name, props, values, content, changed, set, reset }}>
      {children}
    </PlaygroundContext.Provider>
  );
}

export function PlaygroundReset() {
  const playground = usePlayground();
  if (!playground?.changed) {
    return null;
  }
  return (
    <button
      type='button'
      aria-label='Reset'
      onClick={playground.reset}
      className='text-muted-foreground bg-background hover:bg-muted hover:text-foreground size-7.5 inline-flex shrink-0 items-center justify-center rounded-md transition-colors'
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
        <path d='M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8' />
        <path d='M3 3v5h5' />
      </svg>
    </button>
  );
}

export function usePlayground(): PlaygroundState | null {
  return useContext(PlaygroundContext);
}

export function PlaygroundControl({ prop, type }: { prop: string; type: string }) {
  const playground = usePlayground();
  const control = controlFor(type);
  if (!playground || control.kind === 'none') {
    return null;
  }
  const value = playground.values[prop];

  if (control.kind === 'switch') {
    return (
      <button
        type='button'
        role='switch'
        aria-label={prop}
        aria-checked={value === true}
        onClick={() => playground.set(prop, value !== true)}
        className='bg-muted-foreground/40 aria-checked:bg-foreground group relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors'
      >
        <span className='bg-background group-aria-checked:translate-x-4.5 size-4 translate-x-0.5 rounded-full shadow-sm transition-transform' />
      </button>
    );
  }
  if (control.kind === 'text') {
    return (
      <input
        type='text'
        aria-label={prop}
        value={typeof value === 'string' ? value : ''}
        onChange={event => playground.set(prop, event.currentTarget.value)}
        className={FIELD}
      />
    );
  }
  return (
    <span className='relative block'>
      <select
        aria-label={prop}
        value={typeof value === 'string' ? value : ''}
        onChange={event => playground.set(prop, event.currentTarget.value)}
        className={`${FIELD} appearance-none pr-8`}
      >
        {typeof value === 'string' ? null : <option value='' />}
        {control.options.map(option => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
      <svg
        aria-hidden
        viewBox='0 0 16 16'
        className='text-muted-foreground pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2'
      >
        <path
          d='m4 6 4 4 4-4'
          fill='none'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    </span>
  );
}

const FIELD =
  'border-border bg-background text-foreground hover:border-muted-foreground/50 block h-8 w-full min-w-32 rounded-lg border px-2.5 font-sans text-sm shadow-xs transition-colors';

export function LiveCode({ code }: { code: string }) {
  const [highlighted, setHighlighted] = useState<{ code: string; html: string } | null>(null);

  useEffect(() => {
    let current = true;
    void import('@/core/highlight')
      .then(({ highlight }) => highlight(code, 'tsx'))
      .then(html => {
        if (current) {
          setHighlighted({ code, html });
        }
      });
    return () => {
      current = false;
    };
  }, [code]);

  return highlighted?.code === code ? (
    <div dangerouslySetInnerHTML={{ __html: highlighted.html }} />
  ) : (
    <pre className='shiki'>
      <code>{code}</code>
    </pre>
  );
}
