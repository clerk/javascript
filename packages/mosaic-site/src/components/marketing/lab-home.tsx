'use client';
import Link from 'next/link';
import * as React from 'react';

import { BrowserFrame } from '@/components/marketing/browser-frame';
import { HeroLogo } from '@/components/marketing/hero-logo';
import { MosaicLogoCanvas } from '@/components/marketing/mosaic-logo-canvas';
import { MosaicMark, MosaicWordmark } from '@/components/marketing/mosaic-mark';
import { ToolCanvas } from '@/components/marketing/tool-canvas';
import { ThemeToggle } from '@/components/theme-toggle';
import { useMode } from '@/components/use-mode';
import { DEFAULT_FRAME } from '@/lib/components/frame';
import { DEFAULT_MOSAIC_SETTINGS } from '@/lib/mosaic-logo/settings';
import type { ToolSettings } from '@/lib/mosaic-tools/canvas';
import { LIGHT_HERO_CELL_TRAIL } from '@/lib/mosaic-tools/hero-presets';
import { TOOL_META, type ToolMeta } from '@/lib/mosaic-tools/meta';
import { TOOLS } from '@/lib/mosaic-tools/registry';
const lightPreview = {
  ...LIGHT_HERO_CELL_TRAIL,
  cellSize: 40,
  intensity: 0.12,
  autoplay: true,
} as ToolSettings;
const logoPreview = { ...DEFAULT_MOSAIC_SETTINGS, autoplay: true, tilt: 6 };
export function Preview({ slug }: { slug: string }) {
  const mode = useMode();
  const definition = TOOLS[slug];
  const settings = React.useMemo((): ToolSettings => {
    const base = definition ? ({ ...definition.defaults, ...definition.preview } as ToolSettings) : {};
    return 'theme' in base ? { ...base, theme: mode } : base;
  }, [definition, mode]);
  const modeCellTrail = React.useMemo(() => ({ ...lightPreview, theme: mode }) as ToolSettings, [mode]);
  if (slug === 'brand') {
    return (
      <div className='flex size-full items-center justify-center'>
        <MosaicMark className='text-foreground w-1/3 max-w-40' />
      </div>
    );
  }
  if (slug === 'hero-graphite-subtle') {
    return (
      <div className='bg-background relative isolate size-full'>
        <HeroLogo className='relative size-full' />
      </div>
    );
  }
  if (slug === 'browser-frame') {
    return (
      <div className='flex size-full items-center justify-center p-4'>
        <BrowserFrame
          config={DEFAULT_FRAME}
          className='w-full'
        />
      </div>
    );
  }
  if (slug === 'hero-cell-trail') {
    return (
      <div className='bg-background size-full'>
        <ToolCanvas
          slug='cell-trail'
          settings={modeCellTrail}
          className='size-full'
        />
      </div>
    );
  }
  if (!definition) {
    return (
      <MosaicLogoCanvas
        settings={logoPreview}
        className='size-full'
      />
    );
  }
  return (
    <ToolCanvas
      slug={slug}
      settings={settings}
      className='size-full'
    />
  );
}
function ToolCard({ tool }: { tool: ToolMeta }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className='border-foreground/12 bg-foreground/[0.02] hover:border-foreground/30 group flex flex-col overflow-hidden rounded-2xl border transition-colors'
    >
      <div className='border-foreground/10 bg-background relative aspect-[4/3] overflow-hidden border-b'>
        <Preview slug={tool.slug} />
      </div>
      <div className='flex flex-col gap-2 p-5'>
        <span className='font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-500'>{tool.tag}</span>
        <h2
          className='text-foreground text-2xl font-semibold tracking-[-0.03em]'
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {tool.title}
        </h2>
        <p className='text-sm leading-5 text-neutral-600 dark:text-neutral-400'>{tool.description}</p>
        <span className='text-foreground mt-2 text-sm font-medium transition-transform group-hover:translate-x-1'>
          Open →
        </span>
      </div>
    </Link>
  );
}
export function LabHome() {
  return (
    <div className='min-h-svh'>
      <header className='mx-auto flex max-w-[1120px] items-center justify-between px-6 py-6'>
        <Link
          href='/'
          aria-label='Mosaic Components home'
        >
          <MosaicWordmark />
        </Link>
        <div className='flex items-center gap-4'>
          <span className='font-mono text-[11px] uppercase tracking-[0.08em] text-neutral-500'>Mosaic Lab</span>
          <ThemeToggle />
        </div>
      </header>
      <main className='mx-auto max-w-[1120px] px-6 pb-24 pt-10'>
        <h1
          className='text-foreground max-w-[720px] text-[clamp(40px,6vw,72px)] font-semibold leading-[1] tracking-[-0.045em]'
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Brand concept tools
        </h1>
        <p className='mt-5 max-w-[560px] text-lg leading-[30px] text-neutral-600 dark:text-neutral-400'>
          Small, tweakable studies of the mosaic idea: pieces that resolve, scatter and snap together. Pick a tool, play
          with it, and copy the settings into the site.
        </p>
        <div className='mt-14 grid gap-5 sm:grid-cols-2'>
          {TOOL_META.map(tool => (
            <ToolCard
              key={tool.slug}
              tool={tool}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
