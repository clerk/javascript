'use client';
import { useReducedMotion } from 'motion/react';
import * as React from 'react';

import { type Mode, useMode } from '@/components/use-mode';

const MAJOR = 32;
const MINOR = 8;
const SPAN = 160 * MAJOR;

type GridLook = { color: string; major: number; minor: number; mask: string; trail: string; trailAlpha: number };

const TRAIL_ENABLED = true;
const TRAIL_LIFE = 260;
const EYEBROW_PAD = 8;

const TOP_FADE = 'linear-gradient(to bottom, transparent, black 20rem)';

const LOOKS: Record<Mode, GridLook> = {
  light: {
    color: 'oklch(0.6 0.15 255)',
    major: 13,
    minor: 5.5,
    trail: '--color-purple-500',
    trailAlpha: 0.45,
    mask: [
      'radial-gradient(ellipse 55% 65% at 50% 32%, black 25%, transparent 100%)',
      'radial-gradient(ellipse 22rem 18rem at 50% 38%, rgb(0 0 0 / 0.3) 0%, black 100%)',
      TOP_FADE,
    ].join(', '),
  },
  dark: {
    color: 'var(--foreground)',
    major: 7,
    minor: 3,
    trail: '--color-purple-400',
    trailAlpha: 0.55,
    mask: ['radial-gradient(ellipse 65% 75% at 50% 34%, black 40%, transparent 100%)', TOP_FADE].join(', '),
  },
};

const line = (direction: string, color: string, weight: number, step: number) =>
  `repeating-linear-gradient(${direction}, color-mix(in srgb, ${color} ${weight}%, transparent) 0 1px, transparent 1px ${step}px)`;

function background({ color, major, minor }: GridLook) {
  return [
    line('to right', color, major, MAJOR),
    line('to bottom', color, major, MAJOR),
    line('to right', color, minor, MINOR),
    line('to bottom', color, minor, MINOR),
  ].join(', ');
}

function useGridTrail(
  wrapperRef: React.RefObject<HTMLDivElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  top: number | null,
  look: GridLook,
) {
  const reduced = useReducedMotion();

  React.useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d', { desynchronized: true });
    if (!TRAIL_ENABLED || !wrapper || !canvas || !context || reduced || top === null) {
      return;
    }
    const color = getComputedStyle(document.documentElement).getPropertyValue(look.trail).trim() || '#7344fd';
    const cells = new Map<string, number>();
    let frame = 0;
    let last: { x: number; y: number } | null = null;
    let width = 0;
    let height = 0;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = wrapper.clientWidth;
      height = wrapper.clientHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const originX = () => (((width / 2) % MINOR) + MINOR) % MINOR;
    const originY = () => ((top % MINOR) + MINOR) % MINOR;

    const draw = () => {
      frame = 0;
      const now = performance.now();
      context.clearRect(0, 0, width, height);
      context.fillStyle = color;
      context.globalAlpha = look.trailAlpha;
      for (const [key, born] of cells) {
        if (now - born >= TRAIL_LIFE) {
          cells.delete(key);
          continue;
        }
        const [cx, cy] = key.split(',').map(Number);
        context.fillRect(originX() + cx * MINOR + 1, originY() + cy * MINOR + 1, MINOR - 1, MINOR - 1);
      }
      context.globalAlpha = 1;
      if (cells.size > 0) {
        frame = requestAnimationFrame(draw);
      }
    };

    const eyebrow = wrapper.parentElement?.querySelector<HTMLElement>('[data-hero-eyebrow]');
    let keepOut: DOMRect | null = null;

    const mark = (x: number, y: number, now: number) => {
      const cx = Math.floor((x - originX()) / MINOR);
      const cy = Math.floor((y - originY()) / MINOR);
      const left = originX() + cx * MINOR;
      const top = originY() + cy * MINOR;
      if (
        keepOut &&
        left + MINOR > keepOut.left &&
        left < keepOut.right &&
        top + MINOR > keepOut.top &&
        top < keepOut.bottom
      ) {
        return;
      }
      cells.set(`${cx},${cy}`, now);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') {
        return;
      }
      const rect = wrapper.getBoundingClientRect();
      const box = eyebrow?.getBoundingClientRect();
      keepOut = box
        ? new DOMRect(
            box.left - rect.left - EYEBROW_PAD,
            box.top - rect.top - EYEBROW_PAD,
            box.width + EYEBROW_PAD * 2,
            box.height + EYEBROW_PAD * 2,
          )
        : null;
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (x < 0 || y < 0 || x > width || y > height) {
        last = null;
        return;
      }
      const now = performance.now();
      const from = last ?? { x, y };
      const steps = Math.max(1, Math.ceil(Math.hypot(x - from.x, y - from.y) / (MINOR / 2)));
      for (let step = 1; step <= steps; step += 1) {
        mark(from.x + ((x - from.x) * step) / steps, from.y + ((y - from.y) * step) / steps, now);
      }
      last = { x, y };
      cancelAnimationFrame(frame);
      draw();
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(wrapper);
    const moveEvent = 'onpointerrawupdate' in window ? 'pointerrawupdate' : 'pointermove';
    window.addEventListener(moveEvent, onMove as EventListener, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener(moveEvent, onMove as EventListener);
      cancelAnimationFrame(frame);
      context.clearRect(0, 0, width, height);
    };
  }, [wrapperRef, canvasRef, top, look, reduced]);
}

export function HeroGrid() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [top, setTop] = React.useState<number | null>(null);
  const look = LOOKS[useMode()];
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  useGridTrail(ref, canvasRef, top, look);

  React.useEffect(() => {
    const section = ref.current?.parentElement;
    const headline = section?.querySelector('h1');
    if (!section || !headline) {
      return;
    }
    const measure = () => setTop(headline.offsetTop);
    const observer = new ResizeObserver(measure);
    observer.observe(section);
    observer.observe(headline);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden='true'
      className='pointer-events-none absolute inset-0 -z-20 [-webkit-mask-image:var(--grid-mask-light)] [mask-image:var(--grid-mask-light)] dark:[-webkit-mask-image:var(--grid-mask-dark)] dark:[mask-image:var(--grid-mask-dark)]'
      style={
        {
          '--grid-mask-light': LOOKS.light.mask,
          '--grid-mask-dark': LOOKS.dark.mask,
          maskComposite: 'intersect',
          WebkitMaskComposite: 'source-in',
        } as React.CSSProperties
      }
    >
      <div
        className='absolute [background-image:var(--grid-bg-light)] dark:[background-image:var(--grid-bg-dark)]'
        style={
          {
            left: `calc(50% - ${SPAN / 2}px)`,
            width: SPAN,
            top: (top ?? 0) - SPAN / 2,
            height: SPAN,
            '--grid-bg-light': background(LOOKS.light),
            '--grid-bg-dark': background(LOOKS.dark),
          } as React.CSSProperties
        }
      />
      <canvas
        ref={canvasRef}
        className='absolute inset-0 size-full'
      />
    </div>
  );
}
