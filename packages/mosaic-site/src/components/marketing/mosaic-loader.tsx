'use client';
import * as React from 'react';

import { ToolCanvas } from '@/components/marketing/tool-canvas';
import { useMode } from '@/components/use-mode';
import type { ToolSettings } from '@/lib/mosaic-tools/canvas';
import { PIXEL_LOADER_DEFAULTS } from '@/lib/mosaic-tools/pixel-loader';
import { cn } from '@/lib/utils';
const FADE_MS = 500;
export function MosaicLoader({ visible, className }: { visible: boolean; className?: string }) {
  const mode = useMode();
  const [drawn, setDrawn] = React.useState(true);
  React.useEffect(() => {
    if (visible) {
      return;
    }
    const timer = window.setTimeout(() => setDrawn(false), FADE_MS);
    return () => window.clearTimeout(timer);
  }, [visible]);
  const settings = React.useMemo(
    () =>
      ({
        ...PIXEL_LOADER_DEFAULTS,
        theme: mode,
        cellSize: 6,
        gap: 2,
        grid: 4,
        contrast: mode === 'light' ? 0.3 : 0.45,
      }) as ToolSettings,
    [mode],
  );
  return (
    <div
      aria-hidden='true'
      className={cn(
        'pointer-events-none absolute inset-0 z-10 bg-[var(--cl-color-page,var(--background))] transition-opacity duration-500 motion-reduce:transition-none',
        visible ? 'opacity-100' : 'opacity-0',
        className,
      )}
    >
      {visible || drawn ? (
        <ToolCanvas
          slug='pixel-loader'
          settings={settings}
          className='size-full'
        />
      ) : null}
    </div>
  );
}
