'use client';
import * as React from 'react';

import { cn } from '@/lib/utils';
const CELL = 32;
export type SegmentedOption<T extends string> = { id: T; label: string; icon: React.ReactNode };
export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: SegmentedOption<T>[];
  onChange: (id: T) => void;
}) {
  const index = Math.max(
    0,
    options.findIndex(option => option.id === value),
  );
  return (
    <div
      role='group'
      aria-label={label}
      className='bg-foreground/[0.06] relative flex rounded-full p-0.5'
    >
      <span
        aria-hidden='true'
        className='bg-background ring-foreground/10 absolute left-0.5 top-0.5 size-8 rounded-full shadow-sm ring-1 transition-transform duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none'
        style={{ transform: `translateX(${index * CELL}px)` }}
      />
      {options.map(option => (
        <button
          key={option.id}
          type='button'
          aria-label={option.label}
          aria-pressed={value === option.id}
          onClick={() => onChange(option.id)}
          className={cn(
            'relative flex size-8 items-center justify-center rounded-full transition-colors duration-300',
            value === option.id ? 'text-foreground' : 'hover:text-foreground text-neutral-500 dark:text-neutral-400',
          )}
        >
          {option.icon}
        </button>
      ))}
    </div>
  );
}
