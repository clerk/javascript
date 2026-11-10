'use client';
import * as React from 'react';

import { cn } from '@/lib/utils';

export type Property = {
  id: string;
  label: string;
  value: string;
  options: { id: string; label: string; icon?: React.ReactNode }[];
  onChange: (value: string) => void;
};
const EXIT_MS = 200;
export function PropertiesMenu({
  properties,
  pillClass,
  embedded = false,
}: {
  properties: Property[];
  pillClass: string;
  embedded?: boolean;
}) {
  const [mounted, setMounted] = React.useState(false);
  const [shown, setShown] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const timer = React.useRef<number>(0);
  const open = () => {
    window.clearTimeout(timer.current);
    setMounted(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
  };
  const close = React.useCallback(() => {
    setShown(false);
    timer.current = window.setTimeout(() => setMounted(false), EXIT_MS);
  }, []);
  React.useEffect(() => {
    if (!mounted) {
      return;
    }
    const onPointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) {
        close();
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [mounted, close]);
  React.useEffect(() => () => window.clearTimeout(timer.current), []);
  return (
    <div
      ref={ref}
      className={embedded ? 'relative' : cn(pillClass, 'relative')}
    >
      <button
        type='button'
        aria-haspopup='dialog'
        aria-label='Properties'
        aria-expanded={mounted}
        onClick={() => (mounted ? close() : open())}
        className={cn(
          'dark:hover:bg-gray-850 flex h-9 items-center gap-2 rounded-full text-sm font-medium transition-colors hover:bg-gray-100',
          embedded ? 'w-9 justify-center text-neutral-600 dark:text-neutral-400' : 'px-3.5',
          embedded && mounted && 'text-foreground dark:bg-gray-850 bg-gray-100',
        )}
      >
        <svg
          viewBox='0 0 24 24'
          className='size-4'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          aria-hidden='true'
        >
          <path d='M15 10C16.6575 10 18 8.6575 18 7C18 5.3425 16.6575 4 15 4C13.3425 4 12 5.3425 12 7C12 8.6575 13.3425 10 15 10Z' />
          <path d='M12 7H4M20 7H18' />
          <path d='M9 20C10.6575 20 12 18.6575 12 17C12 15.3425 10.6575 14 9 14C7.3425 14 6 15.3425 6 17C6 18.6575 7.3425 20 9 20Z' />
          <path d='M6 17H4M20 17H12.5' />
        </svg>
        {embedded ? null : 'Properties'}
      </button>
      {mounted ? (
        <div
          role='dialog'
          aria-label='Properties'
          className={cn(
            'border-foreground/10 bg-background absolute bottom-full left-1/2 mb-3 flex w-[372px] -translate-x-1/2 flex-col gap-4 rounded-2xl border p-4 shadow-xl transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
            shown ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
          )}
        >
          {properties.map(property => (
            <div
              key={property.id}
              role='radiogroup'
              aria-label={property.label}
              className='flex flex-col gap-2'
            >
              <span className='font-mono text-[12px] text-neutral-500'>{property.label}</span>
              <div className='flex flex-wrap gap-1.5'>
                {property.options.map(option => (
                  <button
                    key={option.id}
                    type='button'
                    role='radio'
                    aria-checked={option.id === property.value}
                    onClick={() => property.onChange(option.id)}
                    className={cn(
                      'flex h-8 items-center gap-2 rounded-lg px-3 text-sm transition-colors',
                      option.id === property.value
                        ? 'bg-foreground/[0.1] text-foreground'
                        : 'hover:bg-foreground/[0.05] text-neutral-600 dark:text-neutral-400',
                    )}
                  >
                    {option.icon}
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
