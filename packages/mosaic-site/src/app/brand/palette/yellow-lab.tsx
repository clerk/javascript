'use client';

import { MosaicGlyph } from '@/components/marketing/mosaic-glyph';

import { toHex } from './gray-tuner';

type Candidate = { name: string; note: string; l: number; c: number; p3: number; h: number };

const CANDIDATES: Candidate[] = [
  { name: 'electric', note: 'sRGB max chroma at this hue, a touch warm', l: 0.87, c: 0.178, p3: 0.206, h: 96 },
  { name: 'electric, lemon', note: 'brighter, greener, sRGB max', l: 0.9, c: 0.186, p3: 0.216, h: 100 },
  { name: 'electric, gold', note: 'warmer, toward the grays’ hue', l: 0.87, c: 0.178, p3: 0.204, h: 92 },
  { name: 'electric, deep', note: 'darker, more saturated-looking', l: 0.84, c: 0.172, p3: 0.198, h: 96 },
  { name: 'butter', note: 'the earlier soft option, for reference', l: 0.9, c: 0.12, p3: 0.12, h: 95 },
];

const PURPLE = { light: 'var(--color-purple-500)', dark: 'var(--color-purple-400)' };
const INK = { light: '#151311', dark: '#151311' };

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map(i => {
    const x = parseInt(hex.slice(i, i + 2), 16) / 255;
    return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const contrast = (a: string, b: string) => {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

function Eyebrow({ mode, fill }: { mode: 'light' | 'dark'; fill: string }) {
  return (
    <div
      className='tag-2 inline-grid'
      style={{ color: mode === 'light' ? 'var(--color-gray-500)' : '#9c9a96' }}
    >
      <div className='flex items-center justify-between gap-2'>
        <span className='inline-flex items-center gap-1.5'>
          <span aria-hidden='true'>[</span>
          <span
            className='inline-flex items-center gap-1.5'
            style={{ color: PURPLE[mode] }}
          >
            <MosaicGlyph />
            <span>Mosaic</span>
          </span>
          <span aria-hidden='true'>]</span>
        </span>
        <span
          className='inline-block rounded-[1px] px-1 leading-[10px]'
          style={{ background: fill, color: INK[mode] }}
        >
          Beta
        </span>
      </div>
    </div>
  );
}

export function YellowLab() {
  return (
    <section className='flex flex-col gap-6'>
      <div>
        <h2 className='label-2 text-neutral-500'>yellow candidates</h2>
        <p className='body-4 mt-1 max-w-2xl text-neutral-500'>
          For the hero&apos;s Beta badge. The electric ones sit at the sRGB chroma limit like purple-500 does, with a P3
          boost on wide-gamut screens (this page shows the P3 value; headless and sRGB screens see the hex). Hue 92–100
          sits across the wheel from purple (286). Contrast is gray-950 ink on the yellow.
        </p>
      </div>
      <div className='grid gap-3'>
        {CANDIDATES.map(y => {
          const hex = toHex(y.l, y.c, y.h);
          const p3 = `oklch(${y.l} ${y.p3} ${y.h})`;
          return (
            <div
              key={y.name}
              className='grid items-center gap-4 sm:grid-cols-[14rem_1fr_1fr]'
            >
              <div className='flex flex-col gap-1'>
                <span className='label-4 text-foreground'>{y.name}</span>
                <span className='body-4 text-neutral-500'>{y.note}</span>
                <code className='mono-2 text-foreground'>
                  oklch({y.l} {y.c} {y.h}) · {hex}
                </code>
                <code className='mono-2 text-neutral-500'>
                  p3 C {y.p3} · ink {contrast(hex, INK.light).toFixed(1)}:1
                </code>
              </div>
              {(['light', 'dark'] as const).map(mode => (
                <div
                  key={mode}
                  className='flex items-center justify-between gap-4 rounded-lg p-5'
                  style={{ background: mode === 'light' ? 'var(--color-gray-50)' : '#0f0d0b' }}
                >
                  <div className='origin-left scale-[2]'>
                    <Eyebrow
                      mode={mode}
                      fill={p3}
                    />
                  </div>
                  <div className='flex gap-1'>
                    <span
                      className='size-8 rounded-sm'
                      style={{ background: p3 }}
                    />
                    <span
                      className='size-8 rounded-sm'
                      style={{ background: PURPLE[mode] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}
