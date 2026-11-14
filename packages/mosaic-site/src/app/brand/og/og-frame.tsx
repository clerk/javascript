'use client';
import * as React from 'react';

import { ClerkUILogo } from '@/components/marketing/clerk-logo';
import { HeroMicrographic } from '@/components/marketing/hero-micrographic';
import bake from '@/components/marketing/mosaic-bake.json';

import { MosaicFrame } from './mosaic-frame';
import type { OgOptions, OgVariant } from './og-config';

const MAJOR = 32;
const MINOR = 8;

const GRID = { color: 'var(--foreground)', major: 7, minor: 3 };

const line = (direction: string, color: string, weight: number, step: number) =>
  `repeating-linear-gradient(${direction}, color-mix(in srgb, ${color} ${weight}%, transparent) 0 1px, transparent 1px ${step}px)`;

function layout({ width, height }: OgVariant, caption: boolean) {
  const unit = Math.min(width, height) / 630;
  const scale = Math.min((width * 0.86) / bake.width, (height * 0.9) / bake.height);
  const top = (height - bake.height * scale) / 2;
  const logo = (caption ? 48 : 56) * unit;
  return {
    unit,
    scale,
    logo,
    logoTop: top + bake.height * scale * 0.82 - logo / 2 + 20 * unit,
    focus: { x: width / 2, y: top - bake.offsetY * scale },
  };
}

export function OgFrame({
  variant,
  options,
  phaseRef,
}: {
  variant: OgVariant;
  options: OgOptions;
  phaseRef?: React.RefObject<number | null>;
}) {
  const caption = options.caption.trim();
  const { unit, scale, logo, logoTop, focus } = layout(variant, caption.length > 0);
  const maskY = `${Math.round((focus.y / variant.height) * 100)}%`;
  return (
    <div
      data-og-frame={variant.id}
      className='bg-background text-foreground dark relative isolate overflow-hidden'
      style={{ width: variant.width, height: variant.height, colorScheme: 'dark' }}
    >
      <div
        aria-hidden='true'
        className='absolute inset-0 -z-10'
        style={{
          backgroundImage: [
            line('to right', GRID.color, GRID.major, MAJOR),
            line('to bottom', GRID.color, GRID.major, MAJOR),
            line('to right', GRID.color, GRID.minor, MINOR),
            line('to bottom', GRID.color, GRID.minor, MINOR),
          ].join(', '),
          backgroundPosition: `${variant.width / 2}px ${focus.y}px`,
          maskImage: `radial-gradient(ellipse 60% 75% at 50% ${maskY}, black 45%, transparent 100%)`,
        }}
      />
      <MosaicFrame
        mode='dark'
        focus={focus}
        scale={scale}
        sceneWidth={variant.width}
        loopMs={options.loopSeconds * 1000}
        swaySteps={options.swaySteps}
        swayGain={options.swayGain}
        ripple={options.ripple}
        phaseRef={phaseRef}
      />
      <div
        className='absolute inset-x-0 flex flex-col items-center'
        style={{ top: logoTop, gap: 14 * unit }}
      >
        <ClerkUILogo
          className='w-auto text-white'
          style={{ height: logo }}
        />
        {caption ? (
          <p
            className='font-sans text-gray-400'
            style={{ fontSize: 22 * unit, letterSpacing: '-0.01em' }}
          >
            {caption}
          </p>
        ) : null}
      </div>
      {options.beta ? (
        <div
          className='absolute'
          style={{ right: 32 * unit, top: 32 * unit }}
        >
          <div
            className='[&>*]:!mt-0 [&>*]:!flex'
            style={{ zoom: 3 * unit }}
          >
            <HeroMicrographic />
          </div>
        </div>
      ) : null}
    </div>
  );
}
