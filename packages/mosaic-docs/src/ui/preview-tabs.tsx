'use client';

import { type KeyboardEvent, type ReactNode, useId, useRef, useState } from 'react';

import { CopyButton } from './copy-button';

const tabs = ['Preview', 'Code'] as const;
type Tab = (typeof tabs)[number];

export function PreviewTabs({
  code,
  preview,
  source,
  actions,
}: {
  code: string;
  preview: ReactNode;
  source: ReactNode;
  actions?: ReactNode;
}) {
  const [selected, setSelected] = useState<Tab>('Preview');
  const id = useId();
  const refs = useRef<Partial<Record<Tab, HTMLButtonElement | null>>>({});

  function onKeyDown(event: KeyboardEvent) {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (step === 0) {
      return;
    }
    event.preventDefault();
    const next = tabs[(tabs.indexOf(selected) + step + tabs.length) % tabs.length];
    setSelected(next);
    refs.current[next]?.focus();
  }

  return (
    <figure className='code-block'>
      <div className='not-prose border-border flex h-11 items-center gap-4 border-b pl-2.5 pr-1.5'>
        <div
          role='tablist'
          aria-label='Example'
          className='flex h-full flex-1 gap-1'
        >
          {tabs.map(tab => (
            <button
              key={tab}
              ref={node => {
                refs.current[tab] = node;
              }}
              type='button'
              role='tab'
              id={`${id}-${tab}-tab`}
              aria-selected={tab === selected}
              aria-controls={`${id}-${tab}`}
              tabIndex={tab === selected ? 0 : -1}
              onClick={() => setSelected(tab)}
              onKeyDown={onKeyDown}
              className='text-muted-foreground hover:text-foreground aria-selected:text-foreground aria-selected:after:bg-foreground group relative flex items-center font-sans text-xs font-medium outline-none transition-colors after:absolute after:inset-x-1.5 after:-bottom-px after:h-0.5'
            >
              <span className='group-focus-visible:outline-foreground rounded-md px-1.5 py-1 group-focus-visible:outline-2'>
                {tab}
              </span>
            </button>
          ))}
        </div>
        <div className='flex items-center gap-1'>
          {actions}
          {selected === 'Code' ? <CopyButton text={code} /> : null}
        </div>
      </div>
      {tabs.map(tab => (
        <div
          key={tab}
          role='tabpanel'
          id={`${id}-${tab}`}
          aria-labelledby={`${id}-${tab}-tab`}
          hidden={tab !== selected}
        >
          {tab === 'Preview' ? preview : source}
        </div>
      ))}
    </figure>
  );
}
