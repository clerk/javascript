'use client';

'use client';

import { inertProps } from '@clerk/shared/inert';
import clsx from 'clsx';
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react';
import { type PointerEvent as ReactPointerEvent, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

import { ActiveDot } from '@/components/ui/active-dot';
import { restoreFocusRing } from '@/components/ui/restore-focus-ring';

export type SegmentedOption<T extends string> = { id: T; label: string; icon?: React.ReactNode };

interface SegmentedControlProps<T extends string> {
  className?: string;
  label: string;
  options: SegmentedOption<T>[];
  value: T;
  onChange: (id: T) => void;
  cellWidth?: number;
  fill?: boolean;
}

const FAST_SPRING = { type: 'spring', stiffness: 70 * 7, damping: 14 * Math.sqrt(7), mass: 1 } as const;
const SLOW_SPRING = { type: 'spring', stiffness: 70 * 3, damping: 14 * Math.sqrt(3), mass: 1 } as const;
const X_SLOW_SPRING = { type: 'spring', stiffness: 70 * 1.6, damping: 14 * Math.sqrt(1.6), mass: 1 } as const;

const CHEAT_SPRING = { stiffness: 1000, damping: 40, mass: 1 };
const NEAR_BAND = { max: 16, tension: 0.05 };
const FAR_BAND = { max: 10, tension: 0.025 };

const rubberBand = (distance: number, { max, tension }: { max: number; tension: number }) =>
  max * (1 - 1 / ((distance * tension) / max + 1));

const NAV_CHROME_FILL = clsx(
  '[background:linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.03)_100%),rgba(231,231,235,0.95)]',
  'dark:[background:linear-gradient(180deg,rgba(255,255,255,0.04)_10%,rgba(255,255,255,0)_90%),rgba(33,33,38,0.9)]',
);

const PILL_SHADOW_DARK =
  'inset 0px 0.5px 0 0.5px rgba(255 255 255 / 0.12), 0 0 0 0.5px rgba(0 0 0 / 0.6), 0 2px 6px -2px rgba(0 0 0 / 0.3), 0 6px 12px -4px rgba(0 0 0 / 0.4)';
const PILL_SHADOW =
  'inset -4px -5px 8px 4px rgba(255 255 255 / 1), inset 0px 0.5px 0 0.5px rgba(255 255 255 / 1), 0 0 0 0.5px rgba(0 0 0 / 0.12), 0 2px 6px -2px rgba(0 0 0 / 0.06), 0 6px 12px -4px rgba(0 0 0 / 0.12)';
const PILL = clsx(
  'pointer-events-none absolute z-20 rounded-full',
  'after:absolute after:inset-0 after:z-10 after:rounded-[inherit]',
  'after:[box-shadow:var(--after-box-shadow)]',
  `[--after-box-shadow:${PILL_SHADOW.replaceAll(' ', '_')}]`,
  `dark:[--after-box-shadow:${PILL_SHADOW_DARK.replaceAll(' ', '_')}]`,
);
const FILL = clsx(
  'pointer-events-none absolute z-10 bg-linear-to-b from-white to-gray-50 [clip-path:inset(0_round_9999px)] dark:from-gray-700 dark:to-gray-750',
);
const LIT = clsx('pointer-events-none absolute inset-0 z-10');
const LIT_OPTION = clsx('relative gap-1 text-xs/4 font-medium lg:text-sm');
const TRACK = clsx('relative isolate', NAV_CHROME_FILL);
const TRACK_FOCUS =
  'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gray-950/45 dark:has-[:focus-visible]:outline-white/50';
const TRACK_SHADOW = clsx(
  '[box-shadow:0_0_0_0.5px_rgba(0_0_0/0.12),inset_2px_3px_4px_-3px_rgba(0_0_0/0.08),inset_2px_4px_15px_-8px_rgba(0_0_0/0.03)]',
  'dark:[box-shadow:0_0_0_0.5px_rgba(255_255_255/0.1),inset_2px_3px_4px_-3px_rgba(0_0_0/0.3)]',
);

function LitFace({
  option,
  active,
  instant,
  showLabel,
}: {
  option: SegmentedOption<string>;
  active: boolean;
  instant?: boolean;
  showLabel?: boolean;
}) {
  return (
    <span
      className={clsx(
        'group flex h-8 w-full origin-center scale-[1.025] items-center justify-center gap-1 whitespace-nowrap',
        !instant && 'transition-colors',
        active ? 'text-gray-950 dark:text-white' : 'text-gray-500 dark:text-gray-400',
      )}
    >
      {option.icon ?? (
        <ActiveDot
          active={active}
          className='mr-0.5'
          instant={instant}
        />
      )}
      {(!option.icon || showLabel) && option.label}
    </span>
  );
}

export function SegmentedControl<T extends string>({
  className,
  label,
  options,
  value,
  onChange,
  cellWidth = 32,
  fill = false,
}: SegmentedControlProps<T>) {
  const name = useId();
  const [keyboard, setKeyboard] = useState(false);
  useEffect(() => {
    const onKey = () => setKeyboard(true);
    const onPointer = () => setKeyboard(false);
    document.addEventListener('keydown', onKey, true);
    document.addEventListener('pointerdown', onPointer, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      document.removeEventListener('pointerdown', onPointer, true);
    };
  }, []);
  const active = Math.max(
    0,
    options.findIndex(option => option.id === value),
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLLabelElement | null)[]>([]);
  const activeRef = useRef(active);
  const boxes = useRef<{ left: number; right: number }[]>([]);
  const reduceMotion = useReducedMotion() ?? false;

  const left = useMotionValue(0);
  const right = useMotionValue(0);
  const top = useMotionValue(0);
  const bottom = useMotionValue(0);
  const radius = useMotionValue(0);
  const measured = useMotionValue(0);
  const [standIn, setStandIn] = useState(true);

  const leftCheat = useSpring(0, CHEAT_SPRING);
  const rightCheat = useSpring(0, CHEAT_SPRING);
  const leftFinal = useTransform(() => left.get() + leftCheat.get());
  const rightFinal = useTransform(() => right.get() + rightCheat.get());
  const driftX = useTransform(() => (leftCheat.get() - rightCheat.get()) / 2);
  const clipPath = useMotionTemplate`inset(${top}px ${rightFinal}px ${bottom}px ${leftFinal}px round ${radius}px)`;
  const overlayOpacity = useTransform(() => {
    leftFinal.get();
    rightFinal.get();
    clipPath.get();
    return measured.get();
  });
  const standInOpacity = useTransform(() => 1 - overlayOpacity.get());
  useMotionValueEvent(standInOpacity, 'change', opacity => {
    if (opacity === 0) {
      setStandIn(false);
    }
  });

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const measure = () => {
      const c = container.getBoundingClientRect();
      if (c.width === 0) {
        return;
      }
      boxes.current = labelRefs.current.map(el => {
        if (!el) {
          return { left: 0, right: 0 };
        }
        const r = el.getBoundingClientRect();
        return { left: r.left - c.left, right: c.right - r.right };
      });
      const box = boxes.current[activeRef.current];
      if (box) {
        left.jump(box.left);
        right.jump(box.right);
      }
      const el = labelRefs.current[0];
      if (el) {
        const r = el.getBoundingClientRect();
        top.set(r.top - c.top);
        bottom.set(c.bottom - r.bottom);
        radius.set(Math.min(parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0, r.height / 2));
      }
      measured.set(1);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return () => ro.disconnect();
  }, [left, right, top, bottom, radius, measured]);

  const select = (i: number) => {
    onChange(options[i].id);
  };

  useEffect(() => {
    const box = boxes.current[active];
    if (box && active !== activeRef.current) {
      if (reduceMotion) {
        left.jump(box.left);
        right.jump(box.right);
      } else {
        const movingRight = active > activeRef.current;
        animate(left, box.left, movingRight ? SLOW_SPRING : FAST_SPRING);
        animate(right, box.right, movingRight ? FAST_SPRING : SLOW_SPRING);
      }
    }
    leftCheat.set(0);
    rightCheat.set(0);
    activeRef.current = active;
  }, [active, left, right, leftCheat, rightCheat, reduceMotion]);

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (reduceMotion) {
      return;
    }
    const box = boxes.current[activeRef.current];
    if (!box) {
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const activeLeft = box.left;
    const activeRight = rect.width - box.right;
    if (cursorX > activeRight) {
      const dist = cursorX - activeRight;
      rightCheat.set(-rubberBand(dist, NEAR_BAND));
      leftCheat.set(rubberBand(dist, FAR_BAND));
    } else if (cursorX < activeLeft) {
      const dist = activeLeft - cursorX;
      leftCheat.set(-rubberBand(dist, NEAR_BAND));
      rightCheat.set(rubberBand(dist, FAR_BAND));
    } else {
      leftCheat.set(0);
      rightCheat.set(0);
    }
  };

  const onPointerLeave = () => {
    leftCheat.set(0);
    rightCheat.set(0);
  };

  return (
    <div
      ref={containerRef}
      role='radiogroup'
      aria-label={label}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={clsx(
        TRACK,
        TRACK_SHADOW,
        keyboard && TRACK_FOCUS,
        fill ? 'flex w-full' : 'inline-flex',
        'gap-0.5 rounded-full p-0.5',
        className,
      )}
    >
      <motion.div
        {...inertProps(true)}
        aria-hidden
        style={{
          left: leftFinal,
          right: rightFinal,
          opacity: overlayOpacity,
        }}
        className={clsx(PILL, 'inset-y-0.5')}
      />
      <motion.div
        {...inertProps(true)}
        aria-hidden
        style={{ left: leftFinal, right: rightFinal, opacity: overlayOpacity }}
        className={clsx(FILL, 'inset-y-0.5')}
      />

      <motion.div
        {...inertProps(true)}
        aria-hidden
        className={LIT}
        style={{ clipPath, opacity: overlayOpacity }}
      >
        <motion.div
          className='flex h-full gap-0.5 p-0.5'
          style={{ x: driftX }}
        >
          {options.map((option, i) => (
            <motion.div
              key={option.id}
              className={clsx(LIT_OPTION, !option.icon && 'px-4', fill && 'flex-1')}
              style={!fill && cellWidth && option.icon ? { width: cellWidth } : undefined}
              animate={{
                x: i === active || (option.icon && !fill) ? 0 : 12 * (active - i),
              }}
              transition={reduceMotion ? { duration: 0 } : X_SLOW_SPRING}
            >
              <LitFace
                option={option}
                active={i === active}
                showLabel={fill}
              />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
      {options.map((option, i) => (
        <label
          key={option.id}
          style={!fill && cellWidth && option.icon ? { width: cellWidth } : undefined}
          aria-label={option.icon ? option.label : undefined}
          ref={el => {
            labelRefs.current[i] = el;
          }}
          className={clsx(
            'group relative flex h-8 cursor-pointer items-center gap-1 whitespace-nowrap rounded-full text-xs/4 font-medium lg:text-sm',
            'transition-colors',
            'after:absolute after:inset-y-0 after:-left-1 after:-right-1 first-of-type:after:left-0 last-of-type:after:right-0',
            option.icon ? 'justify-center' : 'px-4',
            fill && 'flex-1',
            i === active
              ? 'text-gray-950 dark:text-white'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
          )}
        >
          <input
            type='radio'
            name={name}
            value={option.id}
            checked={i === active}
            onChange={event => {
              restoreFocusRing(event);
              select(i);
            }}
            tabIndex={0}
            className='sr-only'
          />
          {option.icon ?? (
            <ActiveDot
              active={i === active}
              className='mr-0.5'
            />
          )}
          {(!option.icon || fill) && option.label}
          {standIn && i === active && (
            <motion.span
              {...inertProps(true)}
              aria-hidden
              style={{ opacity: standInOpacity }}
              className='pointer-events-none absolute inset-0'
            >
              <span className={clsx(PILL, 'inset-0')} />
              <span className={clsx(FILL, 'inset-0')} />
              <span className={clsx(LIT, '[clip-path:inset(0_round_9999px)]')}>
                <span
                  className={clsx(LIT_OPTION, 'block', !option.icon && 'px-4', fill && 'w-full')}
                  style={!fill && cellWidth && option.icon ? { width: cellWidth } : undefined}
                >
                  <LitFace
                    option={option}
                    active
                    showLabel={fill}
                  />
                </span>
              </span>
            </motion.span>
          )}
        </label>
      ))}
    </div>
  );
}
