'use client';
import clsx from 'clsx';
import { animate, motion, useMotionValue, useMotionValueEvent } from 'motion/react';
import * as React from 'react';

import { BigTileArt } from '@/components/marketing/big-tile-wall';
import { usePalette } from '@/components/marketing/tile-settings';

export const PATTERNS = [
  'diamonds',
  'petals',
  'scales',
  'chevrons',
  'stars',
  'quatrefoil',
  'bands',
  'checker',
  'dots',
  'triangles',
  'lattice',
  'pinwheel',
  'rings',
];

function Thumb({ design, active, onPick }: { design: string; active: boolean; onPick: () => void }) {
  const palette = usePalette();
  const id = React.useId().replace(/:/g, '');
  return (
    <button
      type='button'
      onClick={onPick}
      aria-label={`Use the ${design} tile`}
      aria-pressed={active}
      className={clsx(
        'relative size-11 shrink-0 overflow-hidden rounded-md transition-[transform,box-shadow] duration-100 ease-out hover:-translate-y-0.5 motion-reduce:transition-none',
        active ? 'ring-2 ring-[#6c47ff] ring-offset-2 ring-offset-transparent' : 'ring-1 ring-black/10',
      )}
    >
      <svg
        viewBox='0 0 200 200'
        className='size-full'
        aria-hidden='true'
      >
        <rect
          width='200'
          height='200'
          fill={palette.paper}
        />
        <BigTileArt
          design={design}
          id={id}
        />
      </svg>
    </button>
  );
}

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      viewBox='0 0 16 16'
      className='size-3.5'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.6'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <path d={direction === 'left' ? 'M10 3.5 5.5 8l4.5 4.5' : 'M6 3.5 10.5 8 6 12.5'} />
    </svg>
  );
}

export function Tray({ current, onPick }: { current: string; onPick: (design: string) => void }) {
  const [width] = React.useState(() => Math.min(260, window.innerWidth - 120));
  const limit = Math.max(0, PATTERNS.length * 44 + (PATTERNS.length - 1) * 8 + 8 - width);
  const x = useMotionValue(-Math.min(limit, Math.max(0, PATTERNS.indexOf(current) - 2) * 52));
  const [edges, setEdges] = React.useState({ start: x.get() >= -1, end: x.get() <= -limit + 1 });
  const moved = React.useRef(false);
  const settle = React.useRef(0);
  useMotionValueEvent(x, 'change', value => {
    setEdges({ start: value >= -1, end: value <= -limit + 1 });
  });
  const glide = (target: number) =>
    void animate(x, Math.min(0, Math.max(-limit, target)), { type: 'spring', stiffness: 320, damping: 34 });
  return (
    <div className='bg-background/85 flex items-center gap-1 rounded-full px-1.5 py-0.5 shadow-[0_14px_40px_-14px_rgba(30,18,80,0.45)] ring-1 ring-black/10 backdrop-blur-xl'>
      <button
        type='button'
        aria-label='Previous tiles'
        disabled={edges.start}
        onClick={() => glide(x.get() + 52 * 4)}
        className='hover:bg-foreground/[0.08] flex size-7 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-30'
      >
        <Chevron direction='left' />
      </button>
      <div
        className='overflow-hidden'
        style={{ width }}
        onWheel={event => {
          const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
          const next = x.get() - delta * (event.deltaMode === 1 ? 16 : 1);
          const over = next > 0 ? next : next < -limit ? next + limit : 0;
          x.stop();
          x.set(next - over * 0.65);
          window.clearTimeout(settle.current);
          settle.current = window.setTimeout(() => glide(x.get()), 90);
        }}
      >
        <motion.div
          drag='x'
          dragConstraints={{ left: -limit, right: 0 }}
          dragElastic={0.2}
          dragTransition={{ power: 0.3, timeConstant: 260, bounceStiffness: 280, bounceDamping: 32 }}
          onDragStart={() => (moved.current = true)}
          onDragEnd={() => window.setTimeout(() => (moved.current = false), 0)}
          className='flex w-max cursor-grab gap-2 px-1 py-2 active:cursor-grabbing'
          style={{ x }}
        >
          {PATTERNS.map(item => (
            <Thumb
              key={item}
              design={item}
              active={item === current}
              onPick={() => {
                if (!moved.current) {
                  onPick(item);
                }
              }}
            />
          ))}
        </motion.div>
      </div>
      <button
        type='button'
        aria-label='Next tiles'
        disabled={edges.end}
        onClick={() => glide(x.get() - 52 * 4)}
        className='hover:bg-foreground/[0.08] flex size-7 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-30'
      >
        <Chevron direction='right' />
      </button>
    </div>
  );
}
