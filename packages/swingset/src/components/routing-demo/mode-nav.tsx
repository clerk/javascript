'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { buttonVariants } from '@/components/ui/button';

/** The mode named in the `mode` query param, or the first one. The param is left alone by every carrier. */
export function useModeParam<Mode extends string>(modes: readonly [Mode, ...Mode[]], param = 'mode'): Mode {
  const value = useSearchParams().get(param);
  return modes.find(mode => mode === value) ?? modes[0];
}

export function ModeNav<Mode extends string>({
  label,
  modes,
  mode,
  href,
}: {
  label: string;
  modes: readonly Mode[];
  mode: Mode;
  href: (mode: Mode) => string;
}) {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      <span className='text-muted-foreground text-sm'>{label}</span>
      <nav
        aria-label={label}
        className='flex flex-wrap gap-1'
      >
        {modes.map(option => (
          <Link
            key={option}
            href={href(option)}
            aria-current={option === mode ? 'page' : undefined}
            className={buttonVariants({ variant: option === mode ? 'secondary' : 'ghost', size: 'sm' })}
          >
            {option}
          </Link>
        ))}
      </nav>
    </div>
  );
}
