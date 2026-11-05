'use client';
import * as React from 'react';

import { ToolCanvas } from '@/components/marketing/tool-canvas';
import { useMode } from '@/components/use-mode';
import type { ToolSettings } from '@/lib/mosaic-tools/canvas';
import { MOSAIC_SHADER_DEFAULTS, type MosaicShaderSettings } from '@/lib/mosaic-tools/mosaic-shader';
export type GraphiteShape = MosaicShaderSettings['shape'];
export const GRAPHITE_SETTINGS: MosaicShaderSettings = {
  ...MOSAIC_SHADER_DEFAULTS,
  material: 'ceramic',
  tint: 'graphite',
  theme: 'light',
  transparent: true,
  tiles: 30,
  size: 0.86,
  autoplay: true,
};
export function FadingGrid({
  className,
  tone,
  opacity = 0.09,
}: {
  className?: string;
  tone?: 'light' | 'dark';
  opacity?: number;
}) {
  const mode = useMode();
  const resolvedTone = tone ?? mode;
  const mask = 'radial-gradient(ellipse 62% 58% at 50% 45%, #000 18%, transparent 100%)';
  const line = `${resolvedTone === 'light' ? 'rgba(10,10,10,' : 'rgba(255,255,255,'}${opacity})`;
  return (
    <div
      aria-hidden='true'
      className={className}
      style={{
        backgroundImage: `linear-gradient(to right, ${line} 1px, transparent 1px), linear-gradient(to bottom, ${line} 1px, transparent 1px)`,
        backgroundSize: '64px 64px',
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    />
  );
}
export function GraphiteStage({
  shape,
  className,
  overrides,
}: {
  shape: GraphiteShape;
  className?: string;
  overrides?: Partial<MosaicShaderSettings>;
}) {
  const settings = React.useMemo(
    () => ({ ...GRAPHITE_SETTINGS, ...overrides, shape }) as unknown as ToolSettings,
    [shape, overrides],
  );
  return (
    <ToolCanvas
      slug='mosaic-shader'
      settings={settings}
      className={className}
    />
  );
}
