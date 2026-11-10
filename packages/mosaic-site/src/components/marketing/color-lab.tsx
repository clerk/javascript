'use client';
import { Badge } from '@clerk/mosaic/components/badge';
import { Banner } from '@clerk/mosaic/components/banner';
import { Button } from '@clerk/mosaic/components/button';
import { Input } from '@clerk/mosaic/components/input';
import * as React from 'react';

import { CodeBlock } from '@/components/gallery/docs';
import { COLOR_TOKEN_GROUPS } from '@/lib/components/color-tokens';
import { cn } from '@/lib/utils';
const COLS = 28;
const ROWS = 9;
const HOLD_MS = 1100;
const heading = { fontFamily: 'var(--font-heading)' };
type Scheme = 'light' | 'dark';
type SeedKey = 'brand' | 'negative' | 'positive' | 'warning' | 'page';
const SEEDS: { key: SeedKey; label: string; token: string }[] = [
  { key: 'brand', label: 'Brand', token: '--cl-color-brand' },
  { key: 'negative', label: 'Negative', token: '--cl-color-negative' },
  { key: 'positive', label: 'Positive', token: '--cl-color-positive' },
  { key: 'warning', label: 'Warning', token: '--cl-color-warning' },
  { key: 'page', label: 'Page', token: '--cl-color-page' },
];
const HUES: Record<Exclude<SeedKey, 'page'>, (string | null)[]> = {
  brand: [null, '#6C47FF', '#2563EB', '#0D9488', '#EA580C', '#DB2777'],
  negative: [null, '#DC2626', '#E11D48', '#BE123C'],
  positive: [null, '#16A34A', '#059669', '#0D9488'],
  warning: [null, '#D97706', '#CA8A04', '#EA580C'],
};
const PAGES: Record<Scheme, (string | null)[]> = {
  light: [null, '#FBF7F0', '#F0F4FA', '#EFF7F3'],
  dark: [null, '#1A1714', '#12161C', '#101714'],
};
type Choice = Record<SeedKey, number>;
const DEFAULT_CHOICE: Choice = { brand: 0, negative: 0, positive: 0, warning: 0, page: 0 };
const POOL: [string, number][] = [
  ['--cl-color-surface', 20],
  ['--cl-color-surface-subtle', 28],
  ['--cl-color-border', 16],
  ['--cl-color-foreground-secondary', 5],
  ['--cl-color-brand-subtle', 6],
  ['--cl-color-brand', 10],
  ['--cl-color-negative', 4],
  ['--cl-color-positive', 5],
  ['--cl-color-warning', 4],
];
const TOTAL = POOL.reduce((sum, [, weight]) => sum + weight, 0);
const pickToken = (roll: number) => {
  let rest = roll * TOTAL;
  for (const [token, weight] of POOL) {
    rest -= weight;
    if (rest < 0) {
      return token;
    }
  }
  return POOL[0][0];
};
const seeded = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
type Tile = { home: string; over: string | null };
const layout = (random: () => number): Tile[] =>
  Array.from({ length: COLS * ROWS }, () => ({ home: pickToken(random()), over: null }));
const initialTiles = () => {
  let n = 0;
  return layout(() => seeded(++n));
};
const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map(start => parseInt(hex.slice(start, start + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const seedVars = (seed: string, hex: string, scheme: Scheme): Record<string, string> => {
  const wash = (percent: number) => `color-mix(in oklab, ${hex} ${percent}%, transparent)`;
  return {
    [`--cl-color-${seed}`]: hex,
    [`--cl-color-${seed}-foreground`]: luminance(hex) > 0.6 ? '#0a0a0a' : '#ffffff',
    [`--cl-color-${seed}-alpha-100`]: wash(6),
    [`--cl-color-${seed}-alpha-200`]: wash(8),
    [`--cl-color-${seed}-alpha-300`]: wash(12),
    [`--cl-color-${seed}-subtle`]: wash(scheme === 'dark' ? 12 : 8),
    [`--cl-color-${seed}-border`]: wash(12),
  };
};
const pageVars = (hex: string, scheme: Scheme): Record<string, string> => {
  const surface = `color-mix(in oklab, #fff ${scheme === 'dark' ? 5 : 60}%, ${hex})`;
  return {
    '--cl-color-page': hex,
    '--cl-color-surface': surface,
    '--cl-color-surface-subtle': `color-mix(in oklab, ${scheme === 'dark' ? '#fff 4%' : '#000 3%'}, ${surface})`,
  };
};
const themeVars = (choice: Choice, scheme: Scheme) => {
  let vars: Record<string, string> = {};
  for (const key of ['brand', 'negative', 'positive', 'warning'] as const) {
    const hex = HUES[key][choice[key]];
    if (hex) {
      vars = { ...vars, ...seedVars(key, hex, scheme) };
    }
  }
  const page = PAGES[scheme][choice.page];
  if (page) {
    vars = { ...vars, ...pageVars(page, scheme) };
  }
  return vars;
};
const pill =
  'border-foreground/15 hover:border-foreground/40 text-foreground rounded-full border px-4 py-2 text-sm transition-colors';
function Preview() {
  return (
    <div className='flex flex-col gap-4 rounded-xl border border-[var(--cl-color-border-subtle)] bg-[var(--cl-color-surface)] p-5'>
      <Banner.Root color='positive'>
        <Banner.Label>Password updated</Banner.Label>
        <Banner.Description>You were signed out of your other devices.</Banner.Description>
      </Banner.Root>
      <div className='flex flex-col gap-1.5'>
        <span className='text-sm font-medium text-[var(--cl-color-foreground)]'>Email address</span>
        <Input
          aria-label='Email address'
          placeholder='you@example.com'
        />
      </div>
      <div className='flex flex-wrap gap-2'>
        <Button>Continue</Button>
        <Button variant='outline'>Cancel</Button>
        <Button color='negative'>Delete account</Button>
      </div>
      <div className='flex flex-wrap gap-2'>
        <Badge>Primary</Badge>
        <Badge color='neutral'>Neutral</Badge>
        <Badge color='positive'>Positive</Badge>
        <Badge color='warning'>Warning</Badge>
        <Badge color='negative'>Negative</Badge>
      </div>
      <div className='-mx-5 -mb-5 rounded-b-xl bg-[var(--cl-color-surface-subtle)] px-5 py-3 text-[13px] text-[var(--cl-color-foreground-secondary)]'>
        Footer on surface-subtle
      </div>
    </div>
  );
}
export function ColorLab() {
  const [scheme, setScheme] = React.useState<Scheme>('light');
  const [choice, setChoice] = React.useState<Choice>(DEFAULT_CHOICE);
  const [brush, setBrush] = React.useState<SeedKey>('brand');
  const [tiles, setTiles] = React.useState<Tile[]>(initialTiles);
  const timers = React.useRef(new Map<number, number>());
  const board = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(window.clearTimeout);
  }, []);
  const clearTimers = () => {
    timers.current.forEach(window.clearTimeout);
    timers.current.clear();
  };
  const setOver = (index: number, over: string | null) =>
    setTiles(previous => previous.map((tile, at) => (at === index ? { ...tile, over } : tile)));
  const paint = (index: number) => {
    setOver(index, SEEDS.find(seed => seed.key === brush)?.token ?? null);
    window.clearTimeout(timers.current.get(index));
    timers.current.set(
      index,
      window.setTimeout(() => {
        setOver(index, null);
        timers.current.delete(index);
      }, HOLD_MS),
    );
  };
  const onMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = board.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    const col = Math.floor(((event.clientX - rect.left) / rect.width) * COLS);
    const row = Math.floor(((event.clientY - rect.top) / rect.height) * ROWS);
    if (col >= 0 && col < COLS && row >= 0 && row < ROWS) {
      paint(row * COLS + col);
    }
  };
  const scatter = () => {
    clearTimers();
    const hue = (key: Exclude<SeedKey, 'page'>) => 1 + Math.floor(Math.random() * (HUES[key].length - 1));
    setChoice({
      brand: hue('brand'),
      negative: hue('negative'),
      positive: hue('positive'),
      warning: hue('warning'),
      page: Math.floor(Math.random() * PAGES[scheme].length),
    });
    setTiles(layout(Math.random));
  };
  const rearrange = () => {
    clearTimers();
    setTiles(previous => {
      const next = previous.map(tile => ({ ...tile, over: null }));
      for (let n = next.length - 1; n > 0; n--) {
        const m = Math.floor(Math.random() * (n + 1));
        [next[n], next[m]] = [next[m], next[n]];
      }
      return next;
    });
  };
  const resolve = () => {
    clearTimers();
    setChoice(DEFAULT_CHOICE);
    setTiles(initialTiles());
  };
  const vars = themeVars(choice, scheme);
  const scoped = { colorScheme: scheme, ...vars } as React.CSSProperties;
  const swatches = brush === 'page' ? PAGES[scheme] : HUES[brush];
  const css = Object.entries(vars)
    .filter(([name]) => !/-(foreground|alpha-\d+|subtle|border)$/.test(name) || name === '--cl-color-surface-subtle')
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n');
  return (
    <div className='mx-auto w-full max-w-[1000px] px-6 pb-32 pt-16'>
      <h1
        className='text-[clamp(40px,6vw,64px)] font-semibold leading-[1] tracking-[-0.045em]'
        style={heading}
      >
        Colors
      </h1>
      <p className='mt-5 max-w-[620px] text-[17px] leading-[1.7] text-neutral-600 dark:text-neutral-400'>
        Components never hardcode a color. They read <code className='font-mono text-[15px]'>--cl-color-*</code> tokens
        built from six seeds, so a handful of values re-lays the whole interface. Drag across the board to paint tiles,
        or change a seed and watch every piece follow.
      </p>
      <div
        style={scoped}
        className='border-foreground/10 mt-10 overflow-hidden rounded-3xl border bg-[var(--cl-color-page)] p-3 transition-colors sm:p-4'
      >
        <div
          ref={board}
          onPointerMove={onMove}
          onPointerDown={onMove}
          className='grid cursor-crosshair touch-none select-none gap-[2px]'
          style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`, aspectRatio: `${COLS} / ${ROWS}` }}
          role='img'
          aria-label='Interactive mosaic of theme tiles'
        >
          {tiles.map((tile, index) => (
            <span
              key={`${Math.floor(index / COLS)}-${index % COLS}`}
              className={cn('rounded-[3px] transition-colors', tile.over ? 'duration-75' : 'duration-[900ms]')}
              style={{ backgroundColor: `var(${tile.over ?? tile.home})` }}
            />
          ))}
        </div>
      </div>
      <div className='mt-5 flex flex-wrap items-center gap-2'>
        <button
          type='button'
          onClick={scatter}
          className={pill}
        >
          Scatter
        </button>
        <button
          type='button'
          onClick={rearrange}
          className={pill}
        >
          Rearrange
        </button>
        <button
          type='button'
          onClick={resolve}
          className={pill}
        >
          Resolve
        </button>
        <div
          role='group'
          aria-label='Preview color scheme'
          className='border-foreground/15 ml-auto flex rounded-full border p-0.5'
        >
          {(['light', 'dark'] as const).map(value => (
            <button
              key={value}
              type='button'
              aria-pressed={scheme === value}
              onClick={() => {
                setScheme(value);
                setChoice(previous => ({ ...previous, page: 0 }));
              }}
              className={cn(
                'rounded-full px-3 py-1.5 text-sm capitalize transition-colors',
                scheme === value ? 'bg-foreground text-background' : 'text-neutral-500 hover:text-neutral-900',
              )}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
      <div className='mt-14 grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]'>
        <div>
          <h2
            className='text-[28px] font-medium leading-[1.1] tracking-[-0.03em]'
            style={heading}
          >
            Pick a seed
          </h2>
          <p className='mt-3 text-[15px] leading-[1.7] text-neutral-600 dark:text-neutral-400'>
            The selected seed is also your brush. Everything derived from it, its foreground, wash and border, follows.
          </p>
          <div
            role='group'
            aria-label='Seed'
            className='mt-5 flex flex-wrap gap-2'
          >
            {SEEDS.map(seed => (
              <button
                key={seed.key}
                type='button'
                aria-pressed={brush === seed.key}
                onClick={() => setBrush(seed.key)}
                style={scoped}
                className={cn(
                  'flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors',
                  brush === seed.key
                    ? 'border-foreground bg-foreground/[0.05] text-foreground'
                    : 'border-foreground/15 hover:border-foreground/40 text-neutral-600 dark:text-neutral-400',
                )}
              >
                <span
                  aria-hidden='true'
                  className='border-foreground/20 size-3.5 rounded-full border'
                  style={{ backgroundColor: `var(${seed.token})` }}
                />
                {seed.label}
              </button>
            ))}
          </div>
          <div className='mt-4 flex flex-wrap gap-2'>
            {swatches.map((hex, index) => (
              <button
                key={hex ?? 'default'}
                type='button'
                aria-label={hex ?? 'Default'}
                aria-pressed={choice[brush] === index}
                onClick={() => setChoice(previous => ({ ...previous, [brush]: index }))}
                className={cn(
                  'border-foreground/20 flex size-9 items-center justify-center rounded-[10px] border text-xs text-neutral-500 transition-transform hover:scale-105',
                  choice[brush] === index && 'ring-foreground ring-2 ring-offset-2 ring-offset-[var(--background)]',
                )}
                style={{ backgroundColor: hex ?? undefined }}
              >
                {hex ? null : 'Aa'}
              </button>
            ))}
          </div>
          <CodeBlock code={`:root {\n${css || '  --cl-color-brand: oklch(0.2046 0 0);'}\n}`} />
        </div>
        <div
          style={scoped}
          className='border-foreground/10 overflow-hidden rounded-2xl border bg-[var(--cl-color-page)] p-4 transition-colors sm:p-5'
        >
          <Preview />
        </div>
      </div>
      <h2
        className='mt-24 text-[34px] font-medium leading-[1.1] tracking-[-0.03em]'
        style={heading}
      >
        Every token
      </h2>
      <p className='mt-4 max-w-[620px] text-[17px] leading-[1.7] text-neutral-600 dark:text-neutral-400'>
        Override any of these at <code className='font-mono text-[15px]'>:root</code>, or on one element to retint just
        that scope.
      </p>
      <div
        style={scoped}
        className='mt-10 flex flex-col gap-10'
      >
        {COLOR_TOKEN_GROUPS.map(group => (
          <section key={group.title}>
            <div className='flex items-baseline gap-4'>
              <h3
                className='text-[22px] font-medium leading-[1.2] tracking-[-0.02em]'
                style={heading}
              >
                {group.title}
              </h3>
              <p className='text-[14px] text-neutral-500'>{group.lead}</p>
            </div>
            <ul className='mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3'>
              {group.tokens.map(token => (
                <li
                  key={token.name}
                  className='border-foreground/10 flex items-start gap-3 rounded-xl border bg-[var(--cl-color-page)] p-3'
                >
                  <span
                    aria-hidden='true'
                    className='size-8 shrink-0 rounded-md border border-black/10 dark:border-white/10'
                    style={{ backgroundColor: `var(${token.name})` }}
                  />
                  <div className='flex min-w-0 flex-col gap-0.5'>
                    <code className='truncate font-mono text-[12px] text-[var(--cl-color-foreground)]'>
                      {token.name.replace('--cl-color-', '')}
                    </code>
                    <span className='text-[13px] leading-5 text-[var(--cl-color-foreground-secondary)]'>
                      {token.use}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
