'use client';

import { useTheme } from 'next-themes';

import { useMode, useSystemMode } from '@/components/use-mode';
import { cn } from '@/lib/utils';

const SUN =
  'M9.25 16.25L8.5627 15.5C8.05157 14.7984 7.75 13.9344 7.75 13C7.75 10.6528 9.65279 8.75 12 8.75C14.3472 8.75 16.25 10.6528 16.25 13C16.25 13.9344 15.9484 14.7984 15.4373 15.5L14.75 16.25M9.25 16.25H4.74023M9.25 16.25H14.75M14.75 16.25H19.2502M6.74023 19.25H17.2502M12 4.75V5.25M15.625 5.72132L15.375 6.15433M18.2787 8.375L17.8457 8.625M19.2501 12.0001H18.7501M5.24997 12H4.74997M6.15436 8.62501L5.72135 8.37501M8.625 6.15434L8.375 5.72133';
const MOON =
  'M18.25 15.0314C17.7575 15.1436 17.2459 15.2027 16.7209 15.2027C12.8082 15.2027 9.63607 11.9185 9.63607 7.86709C9.63607 6.75253 9.87614 5.69603 10.3057 4.75C7.12795 5.47387 4.75 8.40659 4.75 11.9143C4.75 15.9657 7.9221 19.25 11.8348 19.25C14.6711 19.25 17.1182 17.5242 18.25 15.0314Z';
const modeIcon = (path: string, className = 'size-4') => (
  <svg
    viewBox='0 0 24 24'
    className={className}
    fill='none'
    stroke='currentColor'
    strokeWidth='1.5'
    strokeLinecap='round'
    strokeLinejoin='round'
    aria-hidden='true'
  >
    <path d={path} />
  </svg>
);

export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme } = useTheme();
  const systemTheme = useSystemMode();
  const dark = useMode() === 'dark';
  const target = dark ? 'light' : 'dark';
  const label = `Switch to ${target} mode${target === systemTheme ? ' (system default)' : ''}`;

  return (
    <button
      type='button'
      aria-label={label}
      title={label}
      onClick={() => setTheme(target === systemTheme ? 'system' : target)}
      className={cn(
        'border-foreground/15 text-foreground hover:border-foreground/40 flex size-9 items-center justify-center rounded-full border transition-colors',
        className,
      )}
    >
      {dark ? modeIcon(SUN) : modeIcon(MOON, 'size-4 translate-x-px -translate-y-[0.5px]')}
    </button>
  );
}
