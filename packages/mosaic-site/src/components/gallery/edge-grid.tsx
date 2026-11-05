'use client';
import * as React from 'react';

import { ToolCanvas } from '@/components/marketing/tool-canvas';
import { useMode } from '@/components/use-mode';
import type { ToolSettings } from '@/lib/mosaic-tools/canvas';
import { LIGHT_HERO_CELL_TRAIL } from '@/lib/mosaic-tools/hero-presets';
const MASKS = {
  radial: 'radial-gradient(ellipse 60% 55% at 50% 50%, transparent 38%, #000 100%)',
  sides: 'linear-gradient(to right, #000 0%, transparent 26%, transparent 74%, #000 100%)',
};
export function EdgeGrid({ className, variant = 'sides' }: { className?: string; variant?: keyof typeof MASKS }) {
  const mode = useMode();
  const settings = React.useMemo(() => ({ ...LIGHT_HERO_CELL_TRAIL, theme: mode }) as ToolSettings, [mode]);
  return (
    <div
      className={className}
      style={{ maskImage: MASKS[variant], WebkitMaskImage: MASKS[variant] }}
    >
      <ToolCanvas
        slug='cell-trail'
        settings={settings}
        className='size-full'
        trackWindow
      />
    </div>
  );
}
