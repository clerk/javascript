'use client';
import { motion } from 'motion/react';
import * as React from 'react';

import { BLOOM, CRAZE, MOTTLE, SPECKS } from '@/components/marketing/glaze-textures';
import { usePalette, useTileTune } from '@/components/marketing/tile-settings';

const GAP = 0.012;
const POP = [0.22, 1, 0.36, 1] as const;
const BEVEL =
  'inset 0 1.5px 0 rgba(255,255,255,0.75), inset 1.5px 0 0 rgba(255,255,255,0.35), inset 0 -2.5px 3px rgba(0,0,0,0.3), inset -2px 0 3px rgba(0,0,0,0.18), inset 0 0 0 1px rgba(0,0,0,0.16)';

export type Stagger = { kind: 'random' | 'scan' | 'column' | 'ripple'; span: number };

const DEFAULT_STAGGER: Stagger = { kind: 'random', span: 0.9 };

const staggerDelay = (column: number, row: number, seed: number, columns: number, rows: number, stagger: Stagger) => {
  switch (stagger.kind) {
    case 'scan':
      return ((row * columns + column) / Math.max(1, columns * rows - 1)) * stagger.span;
    case 'column':
      return (column / Math.max(1, columns - 1)) * stagger.span + row * 0.08;
    case 'ripple': {
      const reach = Math.hypot((columns - 1) / 2, (rows - 1) / 2) || 1;
      return (Math.hypot(column - (columns - 1) / 2, row - (rows - 1) / 2) / reach) * stagger.span;
    }
    default:
      return seed * stagger.span;
  }
};

const BEVEL_BOTTOM =
  'inset 0 -1.5px 0 rgba(255,255,255,0.75), inset 0 2.5px 3px rgba(40,25,90,0.3), inset 1.5px 0 0 rgba(255,255,255,0.2), inset -2px 0 3px rgba(40,25,90,0.14), inset 0 0 0 1px rgba(40,25,90,0.16)';

const unit = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export function TileWall({
  columns,
  rows,
  built,
  fromOpener,
  run,
  seedOrigin,
  stagger = DEFAULT_STAGGER,
  appear = 'scatter',
  lightFrom = 'top',
  matte = false,
  render,
}: {
  columns: number;
  rows: number;
  built: boolean;
  fromOpener: boolean;
  run: number;
  seedOrigin?: { column: number; row: number };
  stagger?: Stagger;
  appear?: 'scatter' | 'fade' | 'static';
  lightFrom?: 'top' | 'bottom';
  matte?: boolean;
  render: (column: number, row: number) => React.ReactNode;
}) {
  const id = React.useId().replace(/:/g, '');
  const palette = usePalette();
  const tune = useTileTune();
  const matteBevel = `inset 0 ${lightFrom === 'bottom' ? '-1px' : '1px'} 0 rgba(255,255,255,${tune.bevelHighlight}), inset 0 ${lightFrom === 'bottom' ? '2px' : '-2px'} 3px rgba(40,25,90,${tune.bevelShadow}), inset 0 0 0 1px rgba(40,25,90,${tune.bevelEdge})`;
  const tiles = React.useMemo(
    () =>
      Array.from({ length: columns * rows }, (_, index) => {
        const column = index % columns;
        const row = Math.floor(index / columns);
        return {
          column,
          row,
          seed: unit((column + (seedOrigin?.column ?? 0)) * 13.7 + (row + (seedOrigin?.row ?? 0)) * 5.3 + run),
        };
      }),
    [columns, rows, run, seedOrigin?.column, seedOrigin?.row],
  );
  return (
    <div
      className='absolute inset-0 grid'
      style={{
        gridTemplate: `repeat(${rows}, minmax(0, 1fr)) / repeat(${columns}, minmax(0, 1fr))`,
      }}
    >
      <svg
        width='0'
        height='0'
        className='absolute'
        aria-hidden='true'
      >
        <filter
          id={`${id}-glaze`}
          x='-4%'
          y='-4%'
          width='108%'
          height='108%'
        >
          <feTurbulence
            type='fractalNoise'
            baseFrequency={matte ? tune.warpScale : 0.022}
            numOctaves='2'
            seed='5'
            result='noise'
          />
          <feDisplacementMap
            in='SourceGraphic'
            in2='noise'
            scale={matte ? tune.warp : 1.8}
            xChannelSelector='R'
            yChannelSelector='G'
          />
        </filter>
      </svg>
      {tiles.map(tile => {
        const away =
          appear === 'static'
            ? { opacity: 1 }
            : appear === 'fade'
              ? { opacity: 0 }
              : {
                  opacity: 0,
                  scale: 0.4,
                  x: (tile.seed - 0.5) * (matte ? tune.scatter : 300),
                  y: (unit(tile.seed * 91) - 0.5) * (matte ? tune.scatter : 300),
                  rotate: (tile.seed - 0.5) * 90,
                };
        const tone = unit(tile.seed * 53 + 7);
        return (
          <motion.div
            key={`${tile.column},${tile.row}`}
            style={{ padding: `${(matte ? tune.gap : GAP) * 100}%`, background: matte ? tune.grout : palette.grout }}
            initial={away}
            animate={built ? { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 } : away}
            transition={{
              duration: appear === 'fade' ? 0.8 : fromOpener ? (matte ? tune.tileDuration : 1.1) : 0.8,
              delay: built
                ? appear === 'fade'
                  ? 0
                  : fromOpener
                    ? staggerDelay(tile.column, tile.row, tile.seed, columns, rows, stagger)
                    : Math.hypot(tile.column - (columns - 1) / 2, tile.row - (rows - 1) / 2) * 0.03
                : 0,
              ease: POP,
            }}
          >
            <div
              className='relative size-full overflow-hidden'
              style={{ borderRadius: `${matte ? tune.radius : 2.5}%` }}
            >
              <div
                className='size-full'
                style={{ filter: `url("#${id}-glaze")` }}
              >
                {render(tile.column, tile.row)}
              </div>
              <div
                aria-hidden='true'
                className='pointer-events-none absolute inset-0 mix-blend-multiply'
                style={{
                  opacity: matte ? tune.mottle : 0.14,
                  backgroundImage: MOTTLE,
                  backgroundSize: '300px 300px',
                  backgroundPosition: `${tile.seed * 300}px ${tone * 300}px`,
                }}
              />
              <div
                aria-hidden='true'
                className='pointer-events-none absolute inset-0 mix-blend-soft-light'
                style={{
                  opacity: matte ? tune.bloom : 0.45,
                  backgroundImage: BLOOM,
                  backgroundSize: '260px 260px',
                  backgroundPosition: `${tone * 260}px ${tile.seed * 260}px`,
                }}
              />
              <div
                aria-hidden='true'
                className='pointer-events-none absolute inset-0 mix-blend-multiply'
                style={{
                  opacity: matte ? tune.specks : 0.2,
                  backgroundImage: SPECKS,
                  backgroundSize: '200px 200px',
                  backgroundPosition: `${tone * 200}px ${tile.seed * 200}px`,
                }}
              />
              <div
                aria-hidden='true'
                className='pointer-events-none absolute inset-0 mix-blend-multiply'
                style={{
                  opacity: matte ? tune.craze : 0.07,
                  backgroundImage: CRAZE,
                  backgroundSize: '360px 360px',
                  backgroundPosition: `${tile.seed * 360}px ${tone * 360}px`,
                }}
              />
              <div
                aria-hidden='true'
                className='pointer-events-none absolute inset-0'
                style={{
                  background:
                    lightFrom === 'bottom'
                      ? `linear-gradient(to top, rgba(255,255,255,${matte ? tune.gloss : palette.gloss}) 0%, rgba(255,255,255,0) 40%, rgba(0,0,0,${matte ? tune.shadeBase + tone * tune.shadeRange : 0.1 + tone * 0.1}) 100%)`
                      : `linear-gradient(135deg, rgba(255,255,255,${matte ? tune.gloss : palette.gloss}) 0%, rgba(255,255,255,0) 38%, rgba(0,0,0,${matte ? tune.shadeBase + tone * tune.shadeRange : 0.1 + tone * 0.1}) 100%)`,
                  boxShadow: matte ? matteBevel : lightFrom === 'bottom' ? BEVEL_BOTTOM : BEVEL,
                }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
