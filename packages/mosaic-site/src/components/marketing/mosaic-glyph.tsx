'use client';
import { motion, useReducedMotion } from 'motion/react';
import * as React from 'react';

const SIZE = 6;
const HALF = SIZE / 2;
const SPREAD = 0.5;
const DIM = 0.3;
const CORNERS: Array<[number, number]> = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
];
const IDLE_MIN_MS = 8000;
const IDLE_JITTER_MS = 4000;
const STEP_MS = 220;
const SPRING = { type: 'spring', stiffness: 420, damping: 34, mass: 0.5 } as const;
const FADE = { duration: 0.18, ease: 'easeOut' } as const;

type Frame = { split: boolean; turn: number; lit: number[] };

const REST: Frame = { split: false, turn: 0, lit: [1, 1, 1, 1] };

function blink(turn: number): Frame[] {
  const rest = { ...REST, turn };
  const dim = { ...rest, lit: [DIM, DIM, DIM, DIM] };
  return [dim, rest, dim, rest];
}

function rotate(turn: number): Frame[] {
  return [1, 2, 3, 4]
    .map(step => ({ split: true, turn: turn + step, lit: [1, 1, 1, 1] }))
    .concat({
      ...REST,
      turn: turn + 4,
    });
}

function loader(turn: number): Frame[] {
  const frames: Frame[] = [{ split: false, turn, lit: [DIM, DIM, DIM, DIM] }];
  for (let count = 1; count <= 4; count += 1) {
    frames.push({ split: false, turn, lit: CORNERS.map((_, corner) => (corner < count ? 1 : DIM)) });
  }
  return frames;
}

function split(turn: number): Frame[] {
  const rest = { ...REST, turn };
  return [{ ...rest, split: true }, { ...rest, split: true }, rest];
}

export function MosaicGlyph({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const ref = React.useRef<HTMLSpanElement>(null);
  const [frame, setFrame] = React.useState<Frame>(REST);

  React.useEffect(() => {
    const glyph = ref.current;
    const target = glyph?.parentElement;
    if (reduced || !target) {
      return;
    }
    const timers = new Set<number>();
    let idle = 0;
    let turn = 0;
    let next = 0;
    let playing = false;
    const later = (callback: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        callback();
      }, ms);
      timers.add(id);
      return id;
    };
    const play = (frames: Frame[], done?: () => void) => {
      playing = true;
      frames.forEach((value, index) => later(() => setFrame(value), STEP_MS * (index + 1)));
      later(
        () => {
          playing = false;
          done?.();
        },
        STEP_MS * (frames.length + 1),
      );
    };
    const scheduleBlink = () => {
      idle = later(
        () => {
          if (playing) {
            scheduleBlink();
            return;
          }
          play(blink(turn), scheduleBlink);
        },
        IDLE_MIN_MS + Math.random() * IDLE_JITTER_MS,
      );
    };
    const onEnter = () => {
      if (playing) {
        return;
      }
      window.clearTimeout(idle);
      timers.delete(idle);
      const pick = next;
      next = (next + 1) % 3;
      const frames = pick === 0 ? rotate(turn) : pick === 1 ? loader(turn) : split(turn);
      if (pick === 0) {
        turn += 4;
      }
      play(frames, scheduleBlink);
    };
    scheduleBlink();
    target.addEventListener('pointerenter', onEnter);
    return () => {
      target.removeEventListener('pointerenter', onEnter);
      timers.forEach(window.clearTimeout);
    };
  }, [reduced]);

  return (
    <span
      ref={ref}
      aria-hidden='true'
      className={`relative inline-block shrink-0 ${className ?? ''}`}
      style={{ width: SIZE, height: SIZE }}
    >
      {CORNERS.map((_, index) => {
        const corner = (index + frame.turn) % 4;
        const [cx, cy] = CORNERS[corner];
        const offset = frame.split ? SPREAD : 0;
        return (
          <motion.span
            key={index}
            className='absolute left-0 top-0 bg-current'
            style={{ width: HALF, height: HALF }}
            initial={false}
            animate={{
              x: cx * HALF + (cx * 2 - 1) * offset,
              y: cy * HALF + (cy * 2 - 1) * offset,
              scale: frame.split ? 0.9 : 1,
              opacity: frame.lit[corner],
            }}
            transition={{ x: SPRING, y: SPRING, scale: SPRING, opacity: FADE }}
          />
        );
      })}
    </span>
  );
}
