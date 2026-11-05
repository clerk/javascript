'use client';
import Link from 'next/link';
import * as React from 'react';

import { MosaicWordmark } from '@/components/marketing/mosaic-mark';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';
export function PanelLabel({ children }: { children: React.ReactNode }) {
  return <span className='font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-500'>{children}</span>;
}
export function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'rounded-lg border px-3 py-2 text-sm transition-colors',
        active
          ? 'border-foreground bg-foreground text-background'
          : 'border-foreground/15 hover:border-foreground/40 text-neutral-700 dark:text-neutral-300',
      )}
    >
      {children}
    </button>
  );
}
export function SliderField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  const id = React.useId();
  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-center justify-between'>
        <label
          htmlFor={id}
          className='font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-500'
        >
          {label}
        </label>
        <span className='font-mono text-xs tabular-nums text-neutral-700 dark:text-neutral-300'>{value}</span>
      </div>
      <input
        id={id}
        type='range'
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={event => onChange(Number(event.target.value))}
        className='h-1 w-full cursor-pointer accent-white'
      />
    </div>
  );
}
export function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = React.useId();
  return (
    <div className='flex flex-col gap-2'>
      <label
        htmlFor={id}
        className='font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-500'
      >
        {label}
      </label>
      <input
        id={id}
        type='text'
        value={value}
        onChange={event => onChange(event.target.value)}
        className='border-foreground/15 text-foreground focus:border-foreground/50 rounded-lg border bg-transparent px-3 py-2 text-sm outline-none'
      />
    </div>
  );
}
export function LabShell({ title, stage, panel }: { title: string; stage: React.ReactNode; panel: React.ReactNode }) {
  return (
    <div className='flex min-h-svh flex-col lg:h-svh lg:flex-row'>
      <div className='relative flex min-h-[60svh] flex-1 flex-col'>
        <header className='mx-auto flex w-full max-w-[1120px] items-center justify-between px-6 py-6'>
          <Link
            href='/'
            aria-label='Mosaic Components home'
          >
            <MosaicWordmark />
          </Link>
          <div className='flex items-center gap-4'>
            <span className='flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-500'>
              <Link
                href='/tools'
                className='hover:text-foreground transition-colors'
              >
                Mosaic Lab
              </Link>
              <span aria-hidden='true'>/</span>
              <span className='text-neutral-700 dark:text-neutral-300'>{title}</span>
            </span>
            <ThemeToggle />
          </div>
        </header>
        {stage}
      </div>
      <aside className='border-foreground/10 bg-foreground/[0.02] flex w-full flex-col gap-6 overflow-y-auto border-t p-6 lg:w-[340px] lg:border-l lg:border-t-0'>
        {panel}
      </aside>
    </div>
  );
}
