'use client';
import clsx from 'clsx';
import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion } from 'motion/react';
import * as React from 'react';

import { BigTileArt } from '@/components/marketing/big-tile-wall';
import { PALETTE } from '@/lib/brand/tile-palettes';
import { createTileScene, FOCUS_SCALE, type TileScene } from '@/lib/tiles3d/scene';
import { renderDesign } from '@/lib/tiles3d/textures';

const EASE = [0.22, 1, 0.36, 1] as const;
const ALL = [
  'diamonds',
  'petals',
  'mosaic',
  'scales',
  'chevrons',
  'clerk',
  'stars',
  'arches',
  'shield',
  'quatrefoil',
  'bands',
  'keyhole',
  'checker',
  'dots',
  'user',
  'triangles',
  'lattice',
  'pinwheel',
  'organizations',
  'rings',
  'billing',
];
const INTERACTIVE = 'a,button,input,select,textarea,[role="button"]';

function Thumb({ design, active, onPick }: { design: string; active: boolean; onPick: () => void }) {
  const palette = PALETTE;
  const id = React.useId().replace(/:/g, '');
  return (
    <button
      type='button'
      onClick={onPick}
      aria-label={`Use the ${design} tile`}
      aria-pressed={active}
      className={clsx(
        'relative size-11 shrink-0 overflow-hidden rounded-md transition-transform duration-200 hover:-translate-y-0.5',
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

function Tray({ current, onPick }: { current: string; onPick: (design: string) => void }) {
  const [width] = React.useState(() => Math.min(260, window.innerWidth - 120));
  const limit = Math.max(0, ALL.length * 44 + (ALL.length - 1) * 8 + 8 - width);
  const x = useMotionValue(-Math.min(limit, Math.max(0, ALL.indexOf(current) - 2) * 52));
  const [edges, setEdges] = React.useState({ start: x.get() >= -1, end: x.get() <= -limit + 1 });
  const moved = React.useRef(false);
  const settle = React.useRef(0);
  useMotionValueEvent(x, 'change', value => {
    setEdges({ start: value >= -1, end: value <= -limit + 1 });
  });
  const glide = (target: number) =>
    void animate(x, Math.min(0, Math.max(-limit, target)), { type: 'spring', stiffness: 320, damping: 34 });
  return (
    <div className='bg-background/85 flex items-center gap-1 rounded-full p-1.5 shadow-[0_14px_40px_-14px_rgba(30,18,80,0.45)] ring-1 ring-black/10 backdrop-blur-xl'>
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
          className='flex w-max cursor-grab gap-2 px-1 py-1 active:cursor-grabbing'
          style={{ x }}
        >
          {ALL.map(item => (
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

export function TileStage({
  anchorRef,
  designs,
  onFail,
}: {
  anchorRef: React.RefObject<HTMLElement | null>;
  designs: string[];
  onFail: () => void;
}) {
  const reduced = Boolean(useReducedMotion());
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const sceneRef = React.useRef<TileScene | null>(null);
  const draggingRef = React.useRef(false);
  const [current, setCurrent] = React.useState(designs);
  const [selected, setSelected] = React.useState<number | null>(null);
  const [closing, setClosing] = React.useState(false);
  const [dock, setDock] = React.useState({ x: 0, y: 0 });
  const selectedRef = React.useRef<number | null>(null);
  const closingRef = React.useRef(false);
  const consumeClick = React.useRef(false);
  const closeTimer = React.useRef(0);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const anchor = anchorRef.current;
    if (!canvas || !anchor) {
      return;
    }
    let scene: TileScene;
    try {
      scene = createTileScene(canvas, { anchor, designs, load: renderDesign, reduced });
    } catch {
      onFail();
      return;
    }
    sceneRef.current = scene;
    scene.start();
    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, [anchorRef, designs, reduced, onFail]);

  const close = React.useCallback(() => {
    if (selectedRef.current === null || closingRef.current) {
      return;
    }
    closingRef.current = true;
    setClosing(true);
    sceneRef.current?.release();
    closeTimer.current = window.setTimeout(() => {
      selectedRef.current = null;
      closingRef.current = false;
      setSelected(null);
      setClosing(false);
    }, 400);
  }, []);

  React.useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const scene = sceneRef.current;
      if (!scene) {
        return;
      }
      if (selectedRef.current !== null) {
        if (draggingRef.current) {
          scene.dragMove(event.clientX, event.clientY);
        }
        return;
      }
      if (event.pointerType !== 'mouse') {
        return;
      }
      const hit = scene.hover(event.clientX, event.clientY);
      document.documentElement.style.cursor = hit === null ? '' : 'pointer';
    };
    const onUp = () => {
      if (draggingRef.current) {
        draggingRef.current = false;
        sceneRef.current?.dragEnd();
      }
    };
    const onClick = (event: MouseEvent) => {
      const scene = sceneRef.current;
      if (consumeClick.current) {
        consumeClick.current = false;
        return;
      }
      if (!scene || (selectedRef.current !== null && !closingRef.current)) {
        return;
      }
      if (event.target instanceof Element && event.target.closest(INTERACTIVE)) {
        return;
      }
      const hit = scene.pick(event.clientX, event.clientY);
      if (hit !== null) {
        window.clearTimeout(closeTimer.current);
        closingRef.current = false;
        setClosing(false);
        selectedRef.current = hit;
        const area = anchorRef.current?.getBoundingClientRect();
        if (area) {
          const pitch = area.width / 6;
          const half = (pitch * FOCUS_SCALE) / 2;
          const x = area.left + ((hit % 6) + 0.5) * pitch;
          const y = area.top + (Math.floor(hit / 6) + 0.5) * pitch;
          setDock({ x: Math.min(Math.max(x, 190), window.innerWidth - 190), y: y + half + 14 });
        }
        setSelected(hit);
        scene.elevate(hit);
        document.documentElement.style.cursor = '';
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('click', onClick);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('click', onClick);
      window.removeEventListener('keydown', onKey);
      document.documentElement.style.cursor = '';
    };
  }, [close, anchorRef]);

  React.useEffect(() => {
    if (selected === null) {
      return;
    }
    const html = document.documentElement;
    const previous = html.style.overflow;
    html.style.overflow = 'hidden';
    return () => {
      html.style.overflow = previous;
    };
  }, [selected]);

  React.useEffect(() => {
    if (selected === null || closing) {
      return;
    }
    const html = document.documentElement;
    html.dataset.tileOpen = 'true';
    return () => html.removeAttribute('data-tile-open');
  }, [selected, closing]);

  const choose = async (design: string) => {
    const scene = sceneRef.current;
    const index = selectedRef.current;
    if (!scene || index === null || closingRef.current || current[index] === design) {
      return;
    }
    await scene.swapTo(design);
    setCurrent(items => items.map((item, position) => (position === index ? design : item)));
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden='true'
        className={clsx(
          'pointer-events-none size-full',
          selected === null ? 'absolute inset-0 z-20' : 'fixed inset-0 z-[45]',
        )}
      />
      {selected !== null ? (
        <>
          <motion.div
            className='bg-background/60 fixed inset-0 z-40 cursor-grab backdrop-blur-[3px] active:cursor-grabbing'
            initial={{ opacity: 0 }}
            animate={{ opacity: closing ? 0 : 1 }}
            transition={{ duration: closing ? 0.3 : 0.35, ease: EASE }}
            onPointerDown={event => {
              const scene = sceneRef.current;
              if (scene?.pickElevated(event.clientX, event.clientY)) {
                draggingRef.current = true;
                scene.dragStart(event.clientX, event.clientY);
              } else {
                consumeClick.current = true;
                window.setTimeout(() => (consumeClick.current = false), 400);
                close();
              }
            }}
          />
          <motion.div
            className='fixed left-0 z-50'
            style={{ left: dock.x, top: dock.y, x: '-50%' }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: closing ? 0 : 1, y: closing ? 14 : 0 }}
            transition={{ duration: closing ? 0.2 : 0.4, delay: closing ? 0 : 0.3, ease: EASE }}
          >
            <Tray
              current={current[selected]}
              onPick={design => void choose(design)}
            />
          </motion.div>
        </>
      ) : null}
    </>
  );
}
