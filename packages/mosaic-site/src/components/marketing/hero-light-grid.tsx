'use client';
import Link from 'next/link';

import { MosaicWordmark } from '@/components/marketing/mosaic-mark';
import { ToolCanvas } from '@/components/marketing/tool-canvas';
import { ThemeToggle } from '@/components/theme-toggle';
import type { ToolSettings } from '@/lib/mosaic-tools/canvas';
import { LIGHT_HERO_CELL_TRAIL } from '@/lib/mosaic-tools/hero-presets';
const settings = LIGHT_HERO_CELL_TRAIL as ToolSettings;
export function HeroLightGrid() {
  return (
    <section className='bg-background text-foreground relative flex min-h-svh flex-col overflow-hidden'>
      <ToolCanvas
        slug='cell-trail'
        settings={settings}
        className='absolute inset-0'
      />

      <div className='pointer-events-none relative z-10 flex flex-1 flex-col'>
        <header className='mx-auto flex w-full max-w-[1120px] items-center justify-between px-6 py-6'>
          <Link
            href='/'
            aria-label='Mosaic Components home'
            className='pointer-events-auto'
          >
            <MosaicWordmark />
          </Link>
          <nav className='text-foreground pointer-events-auto flex items-center gap-8 text-[15px]'>
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

        <div className='flex flex-1 flex-col items-center justify-center px-6 pb-24 text-center'>
          <span className='border-foreground/10 bg-background/80 rounded-full border px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-500 backdrop-blur'>
            By Clerk
          </span>
          <h1
            className='mt-7 text-[clamp(48px,8vw,104px)] font-semibold leading-[0.96] tracking-[-0.045em]'
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Auth without
            <br />
            limits
          </h1>
          <p className='mt-7 max-w-[540px] text-lg leading-[30px] text-neutral-500'>
            Composable components, built for agents and made to be rearranged, restyled and replaced.
          </p>
          <div className='pointer-events-auto mt-10 flex items-center gap-7'>
            <Link
              href='/tools'
              className='bg-foreground text-background rounded-full px-7 py-4 text-base font-medium transition-transform hover:scale-[1.03]'
            >
              Explore the lab
            </Link>
            <Link
              href='/tools/brand'
              className='text-foreground text-base font-medium transition-colors hover:text-neutral-500'
            >
              Brand overview →
            </Link>
          </div>
        </div>
      </div>

      <Link
        href='/tools'
        className='hover:text-foreground pointer-events-auto absolute bottom-5 left-6 z-10 font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-600 dark:text-neutral-400'
      >
        ← Mosaic Lab
      </Link>
    </section>
  );
}
