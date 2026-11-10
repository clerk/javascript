'use client';

import { useTheme } from 'next-themes';

import { SegmentedControl } from '@/components/gallery/segmented-control';
import { useMode } from '@/components/use-mode';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme } = useTheme();
  const dark = useMode() === 'dark';

  return (
    <button
      type='button'
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      className={cn(
        'border-foreground/15 text-foreground hover:border-foreground/40 flex size-9 items-center justify-center rounded-full border transition-colors',
        className,
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
        {dark ? (
          <path d='M12 3V2M12 22V21M18.3598 5.64005L19.0698 4.93005M4.93016 19.07L5.64016 18.36M21 12H22M2 12H3M18.3598 18.36L19.0698 19.07M4.93016 4.93005L5.64016 5.64005M15.5355 8.46447C17.4882 10.4171 17.4882 13.5829 15.5355 15.5355C13.5829 17.4882 10.4171 17.4882 8.46447 15.5355C6.51185 13.5829 6.51185 10.4171 8.46447 8.46447C10.4171 6.51185 13.5829 6.51185 15.5355 8.46447Z' />
        ) : (
          <path d='M20.9638 12.7674C19.8361 13.5447 18.4693 13.9998 16.9961 13.9998C13.1301 13.9998 9.99609 10.8657 9.99609 6.99975C9.99609 5.52667 10.4511 4.15987 11.2283 3.03223C6.61911 3.42277 3 7.28768 3 11.9979C3 16.9674 7.0286 20.996 11.9981 20.996C16.7084 20.996 20.5734 17.3767 20.9638 12.7674Z' />
        )}
      </svg>
    </button>
  );
}

const SUN =
  'M12 3V2M12 22V21M18.3598 5.64005L19.0698 4.93005M4.93016 19.07L5.64016 18.36M21 12H22M2 12H3M18.3598 18.36L19.0698 19.07M4.93016 4.93005L5.64016 5.64005M15.5355 8.46447C17.4882 10.4171 17.4882 13.5829 15.5355 15.5355C13.5829 17.4882 10.4171 17.4882 8.46447 15.5355C6.51185 13.5829 6.51185 10.4171 8.46447 8.46447C10.4171 6.51185 13.5829 6.51185 15.5355 8.46447Z';
const MOON =
  'M20.9638 12.7674C19.8361 13.5447 18.4693 13.9998 16.9961 13.9998C13.1301 13.9998 9.99609 10.8657 9.99609 6.99975C9.99609 5.52667 10.4511 4.15987 11.2283 3.03223C6.61911 3.42277 3 7.28768 3 11.9979C3 16.9674 7.0286 20.996 11.9981 20.996C16.7084 20.996 20.5734 17.3767 20.9638 12.7674Z';
const modeIcon = (path: string) => (
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
    <path d={path} />
  </svg>
);
const MODE_OPTIONS = [
  { id: 'light' as const, label: 'Light', icon: modeIcon(SUN) },
  { id: 'dark' as const, label: 'Dark', icon: modeIcon(MOON) },
];
export function ModeSwitch() {
  const { setTheme } = useTheme();
  const mode = useMode();
  return (
    <SegmentedControl
      label='Color mode'
      value={mode}
      options={MODE_OPTIONS}
      onChange={setTheme}
      fill
    />
  );
}
