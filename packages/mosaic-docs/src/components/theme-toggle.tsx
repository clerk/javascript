'use client';

import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const dark = hydrated && resolvedTheme === 'dark';

  return (
    <button
      type='button'
      aria-label={hydrated ? (dark ? 'Switch to light mode' : 'Switch to dark mode') : 'Toggle theme'}
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      className='text-muted-foreground hover:bg-muted hover:text-foreground inline-flex size-9 shrink-0 items-center justify-center rounded-full transition-colors'
    >
      <svg
        aria-hidden='true'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        className='size-4.5 in-data-[theme=dark]:block hidden'
      >
        <circle
          cx='12'
          cy='12'
          r='4'
        />
        <path d='M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41' />
      </svg>
      <svg
        aria-hidden='true'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        className='size-4.5 in-data-[theme=dark]:hidden block'
      >
        <path d='M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401' />
      </svg>
    </button>
  );
}

function subscribe(): () => void {
  return () => {};
}
