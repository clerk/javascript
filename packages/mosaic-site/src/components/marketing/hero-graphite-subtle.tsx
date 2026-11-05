'use client';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import * as React from 'react';

import { FadingGrid, GraphiteStage } from '@/components/marketing/graphite-stage';
import { Chip, PanelLabel, SliderField } from '@/components/marketing/lab-ui';
import { MosaicWordmark } from '@/components/marketing/mosaic-mark';
import { ThemeToggle } from '@/components/theme-toggle';
import { useMode } from '@/components/use-mode';
import {
  SUBTLE_LIGHTING_SLIDERS,
  SUBTLE_PRESETS,
  SUBTLE_SHARED_SLIDERS,
  type SubtleConfig,
  type SubtleLighting,
  type SubtleShared,
} from '@/lib/mosaic-tools/hero-presets';
import { cn } from '@/lib/utils';
const gray = (level: number) => {
  const channel = Math.round(level * 255);
  return `rgb(${channel} ${channel} ${channel})`;
};
export function HeroGraphiteSubtle() {
  const theme = useMode();
  const { setTheme } = useTheme();
  const [config, setConfig] = React.useState<SubtleConfig>(SUBTLE_PRESETS);
  const [open, setOpen] = React.useState(true);
  const [copied, setCopied] = React.useState(false);
  const dark = theme === 'dark';
  const lighting = config[theme];
  const overrides = React.useMemo(
    () => ({
      ...config.shared,
      ...config[theme],
      theme,
      tint: theme === 'dark' ? ('graphite' as const) : ('white' as const),
    }),
    [theme, config],
  );
  const patchShared = (key: keyof SubtleShared, value: number) =>
    setConfig(current => ({ ...current, shared: { ...current.shared, [key]: value } }));
  const patchLighting = (key: keyof SubtleLighting, value: number) =>
    setConfig(current => ({ ...current, [theme]: { ...current[theme], [key]: value } }));
  const copy = () => {
    void navigator.clipboard.writeText(JSON.stringify(config, null, 2)).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    });
  };
  const muted = dark ? 'text-neutral-600 dark:text-neutral-400' : 'text-neutral-500';
  const strong = dark ? 'text-foreground' : 'text-foreground';
  const solid = dark ? 'bg-foreground text-background' : 'bg-foreground text-background';
  return (
    <section
      className={cn('relative flex min-h-svh flex-col overflow-hidden', strong)}
      style={{ backgroundColor: gray(lighting.page) }}
    >
      <FadingGrid
        tone={dark ? 'dark' : 'light'}
        opacity={lighting.gridOpacity}
        className='pointer-events-none absolute inset-0'
      />

      <aside
        aria-label='Hero settings'
        className={cn(
          'border-foreground/10 bg-background/95 text-foreground fixed inset-y-0 left-0 z-30 flex w-[300px] flex-col gap-5 overflow-y-auto border-r p-5 backdrop-blur transition-transform duration-300 ease-out motion-reduce:transition-none',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className='flex flex-col gap-3'>
          <PanelLabel>Mode</PanelLabel>
          <div className='flex gap-2'>
            {(['light', 'dark'] as const).map(item => (
              <Chip
                key={item}
                active={theme === item}
                onClick={() => setTheme(item)}
              >
                {item === 'light' ? 'Light' : 'Dark'}
              </Chip>
            ))}
          </div>
        </div>
        <PanelLabel>{dark ? 'Dark lighting' : 'Light lighting'}</PanelLabel>
        {SUBTLE_LIGHTING_SLIDERS.map(slider => (
          <SliderField
            key={slider.key}
            label={slider.label}
            min={slider.min}
            max={slider.max}
            step={slider.step}
            value={lighting[slider.key]}
            onChange={value => patchLighting(slider.key, value)}
          />
        ))}
        <PanelLabel>Shared</PanelLabel>
        {SUBTLE_SHARED_SLIDERS.map(slider => (
          <SliderField
            key={slider.key}
            label={slider.label}
            min={slider.min}
            max={slider.max}
            step={slider.step}
            value={config.shared[slider.key]}
            onChange={value => patchShared(slider.key, value)}
          />
        ))}
        <div className='mt-auto flex gap-2 pt-2'>
          <button
            type='button'
            onClick={copy}
            className='bg-foreground text-background flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-transform hover:scale-[1.02]'
          >
            {copied ? 'Copied' : 'Copy settings'}
          </button>
          <button
            type='button'
            onClick={() => setConfig(SUBTLE_PRESETS)}
            className='border-foreground/15 hover:border-foreground/40 rounded-lg border px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300'
          >
            Reset
          </button>
        </div>
      </aside>

      <button
        type='button'
        aria-expanded={open}
        onClick={() => setOpen(value => !value)}
        className={cn(
          'border-foreground/15 bg-foreground hover:text-background fixed top-1/2 z-40 -translate-y-1/2 rounded-r-lg border border-l-0 px-2 py-4 font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-700 transition-[left] duration-300 ease-out [writing-mode:vertical-rl] motion-reduce:transition-none dark:text-neutral-300',
          open ? 'left-[300px]' : 'left-0',
        )}
      >
        {open ? 'Hide settings' : 'Settings'}
      </button>

      <header className='relative z-10 mx-auto flex w-full max-w-[1120px] items-center justify-between px-6 py-6'>
        <Link
          href='/'
          aria-label='Mosaic Components home'
        >
          <MosaicWordmark />
        </Link>
        <nav className={cn('flex items-center gap-8 text-[15px]', strong)}>
          <Link
            href='/tools/brand'
            className='hover:text-neutral-500'
          >
            Brand
          </Link>
          <Link
            href='/tools'
            className='hover:text-neutral-500'
          >
            Lab
          </Link>
          <ThemeToggle />
        </nav>
      </header>

      <div className='relative z-10 flex flex-1 flex-col items-center px-6 pb-16 text-center'>
        <GraphiteStage
          shape='clerk'
          overrides={overrides}
          className='h-[min(50vh,520px)] w-full max-w-[920px]'
        />

        <h1
          className='mt-8 text-[clamp(44px,7vw,88px)] font-semibold leading-[0.98] tracking-[-0.045em]'
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Identity without limits
        </h1>
        <p className={cn('mt-5 max-w-[540px] text-lg leading-[30px]', muted)}>
          Sign-in, profiles, consent and agent experiences. Composable components made to be rearranged, restyled and
          replaced.
        </p>
        <div className='mt-8 flex items-center gap-7'>
          <Link
            href='/tools'
            className={cn(
              'rounded-full px-7 py-4 text-base font-medium transition-transform hover:scale-[1.03]',
              solid,
            )}
          >
            Explore the lab
          </Link>
          <Link
            href='/tools/brand'
            className={cn('text-base font-medium transition-colors hover:text-neutral-500', strong)}
          >
            Brand overview →
          </Link>
        </div>
      </div>
    </section>
  );
}
