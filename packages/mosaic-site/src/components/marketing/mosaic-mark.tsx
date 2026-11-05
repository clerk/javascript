'use client';
import * as React from 'react';

import { MARK_FILLETS, MARK_PIECES, MARK_VIEWBOX } from '@/lib/brand/mark';
import { cn } from '@/lib/utils';
const LEG_SLOTS = [0, 20, 40];
const TOP_SLOTS = [0, 30];
type Offsets = [number, number][];
const HOME: Offsets = MARK_PIECES.map(() => [0, 0]);
const legOffsets = (order: number[]) => order.map((slot, leg) => LEG_SLOTS[slot] - LEG_SLOTS[leg]);
const shuffleStep = (tops: boolean, legs: number[], lifts: number[]): Offsets => {
  const top = tops ? TOP_SLOTS[1] - TOP_SLOTS[0] : 0;
  const leg = legOffsets(legs);
  return [[top, 0], [-top, 0], ...leg.map((dx, index): [number, number] => [dx, lifts[index]])];
};
const SEQUENCE: Offsets[] = [
  shuffleStep(true, [2, 0, 1], [-10, 0, -10]),
  shuffleStep(false, [1, 2, 0], [0, -10, 0]),
  HOME,
];
const STEP_MS = 340;
export function MosaicMark({
  className,
  offsets,
  ...props
}: React.ComponentProps<'svg'> & {
  offsets?: Offsets;
}) {
  const moving = offsets !== undefined && offsets !== HOME;
  return (
    <svg
      viewBox={MARK_VIEWBOX}
      fill='currentColor'
      aria-hidden='true'
      className={cn('h-auto w-9', className)}
      {...props}
    >
      {MARK_PIECES.map((d, index) => (
        <path
          key={d}
          d={d}
          style={
            offsets
              ? {
                  transform: `translate(${offsets[index][0]}px, ${offsets[index][1]}px)`,
                  transition: `transform ${STEP_MS - 40}ms cubic-bezier(0.65, 0, 0.35, 1) ${index * 18}ms`,
                }
              : undefined
          }
        />
      ))}
      {MARK_FILLETS.map(d => (
        <path
          key={d}
          d={d}
          style={offsets ? { opacity: moving ? 0 : 1, transition: 'opacity 120ms linear' } : undefined}
        />
      ))}
    </svg>
  );
}
export function MosaicWordmark({
  className,
  onLight = false,
  size = 28,
}: {
  className?: string;
  onLight?: boolean;
  size?: number;
}) {
  const unit = size / 50;
  const [offsets, setOffsets] = React.useState<Offsets>(HOME);
  const timers = React.useRef<number[]>([]);
  React.useEffect(
    () => () => {
      timers.current.forEach(window.clearTimeout);
    },
    [],
  );
  const reshuffle = () => {
    if (timers.current.length > 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    timers.current = SEQUENCE.map((step, index) =>
      window.setTimeout(() => {
        setOffsets(step);
        if (index === SEQUENCE.length - 1) {
          timers.current = [];
        }
      }, index * STEP_MS),
    );
  };
  return (
    <span
      onPointerEnter={reshuffle}
      className={cn('flex items-center whitespace-nowrap', onLight ? 'text-neutral-950' : 'text-foreground', className)}
      style={{ fontFamily: 'var(--font-heading)', fontSize: unit * 40, gap: unit * 10, lineHeight: 1 }}
    >
      <MosaicMark
        style={{ width: size }}
        offsets={offsets}
      />
      <span className='font-semibold tracking-[-0.035em]'>
        Mosaic{' '}
        <span className={cn('font-normal', onLight ? 'text-neutral-500' : 'text-neutral-500 dark:text-neutral-400')}>
          Components
        </span>
      </span>
    </span>
  );
}
