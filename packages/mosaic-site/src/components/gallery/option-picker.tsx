'use client';
import * as React from 'react';
import { createPortal } from 'react-dom';

import { Address, ToolbarIcon } from '@/components/marketing/browser-frame';
import { cn } from '@/lib/utils';

const PAGE_WIDTH = 1100;
const TILE_WIDTH = 232;
const TILE_HEIGHT = 168;
const SHOT_WIDTH = 260;
const SHOT_HEIGHT = 140;
const SHOT_LEFT = 16;
const SHOT_TOP = 48;
const CHROME_HEIGHT = 12;
const SCALE = SHOT_WIDTH / PAGE_WIDTH;
const EXIT_MS = 220;
const CELL = 4;
const GAP = 1.5;
const CELLS = [1, 0.45, 0.8, 0.6, 1, 0.4, 0.8, 0.5, 1].map((opacity, id) => ({ id, opacity }));
const HOME = CELLS.map(cell => cell.id);
const SHUFFLE_MS = 420;
const shuffled = (order: number[]) => {
  const next = [...order];
  for (let index = next.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [next[index], next[other]] = [next[other], next[index]];
  }
  return next;
};
export type PickerOption = { id: string; label: string; soon?: boolean };
export function RemixIcon({ active }: { active: boolean }) {
  const [order, setOrder] = React.useState(HOME);
  React.useEffect(() => {
    if (!active || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const first = window.setTimeout(() => setOrder(current => shuffled(current)), 0);
    const timer = window.setInterval(() => setOrder(current => shuffled(current)), SHUFFLE_MS);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
    };
  }, [active]);
  const positions = active ? order : HOME;
  const size = CELL * 3 + GAP * 2;
  return (
    <span
      aria-hidden='true'
      className='relative block'
      style={{ width: size, height: size }}
    >
      {CELLS.map(cell => {
        const slot = positions[cell.id];
        return (
          <span
            key={cell.id}
            className='bg-foreground absolute left-0 top-0 rounded-[1.5px] transition-transform duration-[380ms] ease-[cubic-bezier(0.65,0,0.35,1)]'
            style={{
              width: CELL,
              height: CELL,
              opacity: cell.opacity,
              transform: `translate(${(slot % 3) * (CELL + GAP)}px, ${Math.floor(slot / 3) * (CELL + GAP)}px)`,
            }}
          />
        );
      })}
    </span>
  );
}
function Tile({
  label,
  query,
  slug,
  selected,
  index,
  shown,
  soon,
  onSelect,
}: {
  label: string;
  query: string;
  slug: string;
  selected: boolean;
  index: number;
  shown: boolean;
  soon?: boolean;
  onSelect: () => void;
}) {
  const [loaded, setLoaded] = React.useState(false);
  return (
    <button
      type='button'
      role='radio'
      aria-checked={selected}
      aria-disabled={soon || undefined}
      onClick={soon ? undefined : onSelect}
      style={{ transitionDelay: shown ? `${index * 30}ms` : '0ms', width: TILE_WIDTH, height: TILE_HEIGHT }}
      className={cn(
        'group relative block shrink-0 overflow-hidden rounded-2xl text-left ring-1 transition-[translate,opacity,background-color] duration-[240ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none',
        soon
          ? 'bg-background ring-foreground/10 cursor-not-allowed'
          : selected
            ? 'bg-foreground/[0.08] ring-foreground/10'
            : 'bg-background ring-foreground/10 hover:bg-foreground/[0.04]',
        shown ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
      )}
    >
      <span className='absolute left-4 top-3.5 flex items-center gap-2 text-[17px] font-medium tracking-[-0.01em]'>
        {label}
        {selected ? <span className='bg-foreground size-1.5 rounded-full' /> : null}
      </span>
      {soon ? (
        <span className='bg-foreground/[0.06] absolute bottom-4 left-4 rounded-full px-2.5 py-1 text-[12px] font-medium text-neutral-500'>
          Coming soon
        </span>
      ) : (
        <span
          className='ring-foreground/10 absolute block origin-top-left -rotate-1 overflow-hidden rounded-tl-lg bg-[var(--cl-color-page,#fff)] shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35)] ring-1 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:-rotate-2 motion-reduce:transition-none'
          style={{ left: SHOT_LEFT, top: SHOT_TOP, width: SHOT_WIDTH, height: SHOT_HEIGHT }}
        >
          <span
            className='border-foreground/10 bg-background flex items-center gap-1.5 border-b px-1.5 text-neutral-500'
            style={{ height: CHROME_HEIGHT }}
          >
            <ToolbarIcon
              path='M3 5h18v14H3zM9 5v14'
              className='size-1.5'
            />
            <ToolbarIcon
              path='M15 18l-6-6 6-6'
              className='size-1.5'
            />
            <ToolbarIcon
              path='M9 18l6-6-6-6'
              className='size-1.5 opacity-40'
            />
            <Address
              url='app.acme.com/account'
              className='text-[5px]'
            />
          </span>
          <span
            className='relative block overflow-hidden'
            style={{ height: SHOT_HEIGHT - CHROME_HEIGHT }}
          >
            <iframe
              src={`/embed/${slug}?${query}&preview=1`}
              title={`${label} preview`}
              tabIndex={-1}
              aria-hidden='true'
              scrolling='no'
              onLoad={() => setLoaded(true)}
              className={cn(
                'pointer-events-none absolute left-0 top-0 origin-top-left border-0 transition-opacity duration-500 motion-reduce:transition-none',
                loaded ? 'opacity-100' : 'opacity-0',
              )}
              style={{
                width: PAGE_WIDTH,
                height: (SHOT_HEIGHT - CHROME_HEIGHT) / SCALE,
                transform: `scale(${SCALE})`,
              }}
            />
          </span>
        </span>
      )}
    </button>
  );
}
export function OptionPicker({
  label,
  slug,
  options,
  value,
  onChange,
  previewQuery,
  icon,
  pillClass,
  header,
  placement = 'above',
}: {
  label: string;
  slug: string;
  options: PickerOption[];
  value: string;
  onChange: (value: string) => void;
  previewQuery: (id: string) => string;
  icon: (active: boolean) => React.ReactNode;
  pillClass: string;
  header?: React.ReactNode;
  placement?: 'above' | 'below';
}) {
  const [mounted, setMounted] = React.useState(false);
  const [shown, setShown] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    const id = window.setTimeout(() => setReady(true), 1500);
    return () => window.clearTimeout(id);
  }, []);
  const timer = React.useRef<number>(0);
  const trigger = React.useRef<HTMLButtonElement>(null);
  const [box, setBox] = React.useState({ bottom: 76, left: 0, width: 0, top: 0, right: 0 });
  const measure = React.useCallback(() => {
    const bar =
      placement === 'above'
        ? (trigger.current?.closest('[data-toolbar]') ?? trigger.current)
        : (trigger.current?.parentElement ?? trigger.current);
    const rect = bar?.getBoundingClientRect();
    if (rect) {
      setBox({
        bottom: window.innerHeight - rect.top + 8,
        left: rect.left + rect.width / 2,
        width: rect.width,
        top: rect.bottom + 8,
        right: document.documentElement.clientWidth - rect.right,
      });
    }
  }, [placement]);
  const open = () => {
    window.clearTimeout(timer.current);
    measure();
    setMounted(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
  };
  const close = React.useCallback(() => {
    setShown(false);
    timer.current = window.setTimeout(() => setMounted(false), EXIT_MS);
  }, []);
  React.useEffect(() => {
    if (!mounted) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mounted, close]);
  React.useEffect(() => {
    if (!mounted) {
      return;
    }
    let frame = 0;
    const follow = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    window.addEventListener('scroll', follow, true);
    window.addEventListener('resize', follow);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', follow, true);
      window.removeEventListener('resize', follow);
    };
  }, [mounted, measure]);
  React.useEffect(() => () => window.clearTimeout(timer.current), []);
  return (
    <div className={pillClass}>
      <button
        ref={trigger}
        type='button'
        aria-haspopup='dialog'
        aria-expanded={mounted}
        aria-label={value ? `${label}, ${value}` : label}
        title={value ? `${label} · ${value}` : label}
        onClick={() => (mounted ? close() : open())}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        className='dark:hover:bg-gray-850 flex h-9 items-center gap-2 rounded-[inherit] pl-3.5 pr-4 text-sm font-medium transition-colors hover:bg-gray-100'
      >
        {icon(hovered)}
        <span className='text-sm'>{label}</span>
      </button>
      {ready || mounted
        ? createPortal(
            <>
              {mounted ? (
                <button
                  type='button'
                  tabIndex={-1}
                  aria-hidden='true'
                  onClick={close}
                  className='fixed inset-0 z-30 cursor-default'
                />
              ) : null}
              <div
                role='dialog'
                aria-label={label}
                style={
                  placement === 'below'
                    ? { top: box.top, right: box.right }
                    : {
                        bottom: box.bottom,
                        left: box.left,
                        minWidth: box.width,
                        width: header && options.length === 0 ? box.width : undefined,
                      }
                }
                className={cn(
                  'border-foreground/10 bg-background/90 fixed z-40 flex flex-col gap-3 rounded-[28px] border p-2.5 shadow-2xl backdrop-blur-xl transition-[translate,scale,opacity,visibility] duration-[240ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none',
                  placement === 'below' ? 'origin-top-right' : 'origin-bottom -translate-x-1/2',
                  shown
                    ? 'visible translate-y-0 scale-100 opacity-100'
                    : cn(
                        'pointer-events-none invisible opacity-0',
                        placement === 'below'
                          ? '-translate-y-1.5 scale-[0.97]'
                          : 'translate-y-6 scale-x-[0.97] scale-y-[0.88]',
                      ),
                )}
              >
                {header ? <div className='px-3.5 pb-1 pt-3'>{header}</div> : null}
                {options.length > 0 ? (
                  <div
                    role='radiogroup'
                    aria-label={options.length > 0 && header ? 'Theme' : label}
                    className='flex flex-col gap-2'
                  >
                    {options.map((item, index) => (
                      <Tile
                        key={item.id}
                        query={previewQuery(item.id)}
                        label={item.label}
                        slug={slug}
                        selected={item.id === value}
                        index={index}
                        shown={shown}
                        soon={item.soon}
                        onSelect={() => {
                          onChange(item.id);
                          close();
                        }}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            </>,
            document.body,
          )
        : null}
    </div>
  );
}
export function ThemeIcon() {
  return (
    <svg
      viewBox='0 0 16 16'
      className='size-4'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.5'
      aria-hidden='true'
    >
      <circle
        cx='8'
        cy='8'
        r='6'
      />
      <path
        d='M8 2a6 6 0 0 1 0 12z'
        fill='currentColor'
      />
    </svg>
  );
}
