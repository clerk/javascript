'use client';
import * as React from 'react';

import { FadingGrid } from '@/components/marketing/graphite-stage';
import { ToolCanvas } from '@/components/marketing/tool-canvas';
import { useMode } from '@/components/use-mode';
import type { ToolSettings } from '@/lib/mosaic-tools/canvas';
import { SUBTLE_PRESETS } from '@/lib/mosaic-tools/hero-presets';
import { PIXEL_RESOLVE_DEFAULTS } from '@/lib/mosaic-tools/pixel-resolve';
export function HeroReshuffle({ className }: { className?: string }) {
  const mode = useMode();
  const settings = React.useMemo(
    () => ({ ...PIXEL_RESOLVE_DEFAULTS, theme: mode, fontSize: 200, tileSize: 12, grout: 1.5 }) as ToolSettings,
    [mode],
  );
  return (
    <>
      <FadingGrid
        tone={mode}
        opacity={SUBTLE_PRESETS[mode].gridOpacity}
        className='pointer-events-none absolute inset-0 -z-10'
      />
      <ToolCanvas
        slug='pixel-resolve'
        settings={settings}
        className={className}
      />
    </>
  );
}
