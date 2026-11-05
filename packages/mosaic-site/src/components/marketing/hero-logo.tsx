'use client';
import * as React from 'react';

import { FadingGrid, GraphiteStage } from '@/components/marketing/graphite-stage';
import { useMode } from '@/components/use-mode';
import { SUBTLE_PRESETS } from '@/lib/mosaic-tools/hero-presets';
export function HeroLogo({ className }: { className?: string }) {
  const mode = useMode();
  const overrides = React.useMemo(
    () => ({
      ...SUBTLE_PRESETS.shared,
      ...SUBTLE_PRESETS[mode],
      theme: mode,
      tint: mode === 'dark' ? ('graphite' as const) : ('white' as const),
    }),
    [mode],
  );
  return (
    <>
      <FadingGrid
        tone={mode}
        opacity={SUBTLE_PRESETS[mode].gridOpacity}
        className='pointer-events-none absolute inset-0 -z-10'
      />
      <GraphiteStage
        shape='clerk'
        overrides={overrides}
        className={className}
      />
    </>
  );
}
