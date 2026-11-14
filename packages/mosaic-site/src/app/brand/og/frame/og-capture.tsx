'use client';
import * as React from 'react';

import { OG_VARIANTS, type OgOptions, type OgVariantId } from '../og-config';
import { OgFrame } from '../og-frame';

declare global {
  interface Window {
    ogSetPhase?: (phase: number) => Promise<void>;
  }
}

const nextFrame = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

export function OgCapture({ variant, options }: { variant: OgVariantId; options: OgOptions }) {
  const phaseRef = React.useRef<number | null>(null);
  const frame = OG_VARIANTS.find(item => item.id === variant) ?? OG_VARIANTS[0];
  React.useEffect(() => {
    window.ogSetPhase = async phase => {
      phaseRef.current = phase;
      await nextFrame();
      await nextFrame();
      await nextFrame();
    };
    return () => {
      delete window.ogSetPhase;
    };
  }, []);
  return (
    <>
      <style>{'body { margin: 0; } nextjs-portal { display: none !important; }'}</style>
      <OgFrame
        variant={frame}
        options={options}
        phaseRef={phaseRef}
      />
    </>
  );
}
