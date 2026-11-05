'use client';
import * as React from 'react';

import { LOGO_PARTS, LOGO_SIZE } from '@/lib/mosaic-logo/clerk-logo';
import { MosaicLogoScene } from '@/lib/mosaic-logo/scene';
import type { MosaicSettings } from '@/lib/mosaic-logo/settings';
export function MosaicLogoCanvas({ settings, className }: { settings: MosaicSettings; className?: string }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const sceneRef = React.useRef<MosaicLogoScene | null>(null);
  const initialSettings = React.useRef(settings);
  const [failed, setFailed] = React.useState(false);
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    try {
      sceneRef.current = new MosaicLogoScene(container, initialSettings.current);
    } catch (error) {
      console.error('Mosaic logo: WebGL unavailable', error);
      queueMicrotask(() => setFailed(true));
      return;
    }
    return () => {
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);
  React.useEffect(() => {
    sceneRef.current?.update(settings);
  }, [settings]);
  if (failed) {
    return (
      <div className={className}>
        <svg
          viewBox={`0 0 ${LOGO_SIZE} ${LOGO_SIZE}`}
          className='mx-auto h-full max-h-[420px]'
          aria-label='Clerk'
        >
          {LOGO_PARTS.map(part => (
            <path
              key={part.id}
              d={part.d}
              fill='#fff'
              opacity={part.tone === 1 ? 1 : 0.5}
            />
          ))}
        </svg>
      </div>
    );
  }
  return (
    <div
      ref={containerRef}
      className={className}
    />
  );
}
