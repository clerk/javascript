'use client';

import { useState } from 'react';

import { chroma, PRESETS, toHex } from './gray-tuner';

type Mode = 'light' | 'dark';
type Level = 'subtle' | 'base' | 'raised' | 'overlay';
type ModeSettings = Record<Level, number> & { highlight: number; shade: number; divider: number; shadow: number };

const LEVELS: Level[] = ['subtle', 'base', 'raised', 'overlay'];
const CURVE = PRESETS[0].settings;
const INK: Record<Mode, { ink: number; subtle: number }> = {
  light: { ink: 0.188, subtle: 0.386 },
  dark: { ink: 0.985, subtle: 0.785 },
};

const DEFAULTS: Record<Mode, ModeSettings> = {
  light: { subtle: 0.905, base: 0.95, raised: 1, overlay: 1, highlight: 0, shade: 0.08, divider: 0.07, shadow: 0.06 },
  dark: {
    subtle: 0.245,
    base: 0.2,
    raised: 0.26,
    overlay: 0.295,
    highlight: 0.07,
    shade: 0.04,
    divider: 0.07,
    shadow: 0.4,
  },
};

const gray = (l: number) => {
  const c = Math.max(0, chroma(l, CURVE));
  const h = CURVE.hueDark + (CURVE.hueLight - CURVE.hueDark) * l;
  return toHex(l, l >= 0.999 ? 0 : c, h);
};

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

const alpha = (hex: string, a: number) =>
  `${hex}${Math.round(a * 255)
    .toString(16)
    .padStart(2, '0')}`;

function tokens(mode: Mode, s: ModeSettings) {
  const light = gray(0.985);
  const dark = gray(0.188);
  return {
    subtle: gray(s.subtle),
    base: gray(s.base),
    raised: gray(s.raised),
    overlay: gray(s.overlay),
    ink: gray(INK[mode].ink),
    inkSubtle: gray(INK[mode].subtle),
    highlight: alpha(light, s.highlight),
    shade: alpha(dark, s.shade),
    divider: alpha(mode === 'light' ? dark : light, s.divider),
    shadow: alpha(mode === 'light' ? dark : '#000000', s.shadow),
  };
}

const edge = (t: ReturnType<typeof tokens>, lift: number) =>
  [
    `inset 0 1px 0 ${t.highlight}`,
    `inset 0 0 0 1px ${t.shade}`,
    `0 ${lift}px ${lift * 3}px -${lift}px ${t.shadow}`,
    `0 1px 2px ${t.shadow}`,
  ].join(', ');

function Range({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className='flex flex-col gap-1'>
      <span className='flex justify-between gap-2'>
        <span className='label-4 text-foreground'>{label}</span>
        <code className='mono-2 text-neutral-500'>{value.toFixed(3)}</code>
      </span>
      <input
        type='range'
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function Preview({ mode, s }: { mode: Mode; s: ModeSettings }) {
  const t = tokens(mode, s);
  return (
    <div
      className='flex flex-col gap-4 rounded-lg p-5'
      style={{ background: t.base, color: t.ink }}
    >
      <span className='mono-2 opacity-60'>{mode} · base</span>
      <div
        className='rounded-md p-4'
        style={{ background: t.subtle }}
      >
        <span className='label-3'>Subtle box, no border</span>
        <p
          className='body-3 mt-1'
          style={{ color: t.inkSubtle }}
        >
          Defined only by its fill against the base.
        </p>
      </div>
      <div
        className='relative rounded-lg'
        style={{ background: t.raised, boxShadow: edge(t, 4) }}
      >
        <div className='p-4'>
          <span className='label-3'>Raised card</span>
          <p
            className='body-3 mt-1'
            style={{ color: t.inkSubtle }}
          >
            Bevel edge: top highlight, faint shade, soft shadow.
          </p>
        </div>
        <div
          className='h-px'
          style={{ background: t.divider }}
        />
        <div className='flex items-center justify-between gap-3 p-4'>
          <span className='body-3'>Email</span>
          <span
            className='body-3 rounded-md px-3 py-1.5'
            style={{ background: t.subtle, color: t.inkSubtle, boxShadow: `inset 0 1px 0 ${t.shade}` }}
          >
            max@example.com
          </span>
        </div>
        <div
          className='absolute right-3 top-3 w-44 rounded-md p-3'
          style={{ background: t.overlay, boxShadow: edge(t, 10) }}
        >
          <span className='label-4'>Overlay</span>
          <p
            className='body-4 mt-0.5'
            style={{ color: t.inkSubtle }}
          >
            Popover / menu
          </p>
        </div>
      </div>
    </div>
  );
}

function Readout({ mode, s }: { mode: Mode; s: ModeSettings }) {
  const t = tokens(mode, s);
  return (
    <table className='mono-2 text-foreground w-full text-left'>
      <thead className='text-neutral-500'>
        <tr>
          <th className='py-1 pr-3 font-normal'>{mode}</th>
          <th className='py-1 pr-3 font-normal'>hex</th>
          <th className='py-1 pr-3 font-normal'>ΔL vs base</th>
          <th className='py-1 pr-3 font-normal'>ratio vs base</th>
          <th className='py-1 pr-3 font-normal'>ink</th>
          <th className='py-1 pr-3 font-normal'>ink-subtle</th>
        </tr>
      </thead>
      <tbody>
        {LEVELS.map(level => {
          const dl = s[level] - s.base;
          const sub = contrast(t.inkSubtle, t[level]);
          return (
            <tr
              key={level}
              className='border-foreground/10 border-t'
            >
              <td className='py-1 pr-3'>{level}</td>
              <td className='py-1 pr-3'>
                <span className='flex items-center gap-2'>
                  <span
                    className='ring-foreground/15 size-3 rounded-sm ring-1'
                    style={{ background: t[level] }}
                  />
                  {t[level]}
                </span>
              </td>
              <td
                className={`py-1 pr-3 ${level !== 'base' && Math.abs(dl) < 0.04 ? 'text-orange-700 dark:text-orange-300' : ''}`}
              >
                {level === 'base' ? '–' : `${dl >= 0 ? '+' : ''}${dl.toFixed(3)}`}
              </td>
              <td className='py-1 pr-3'>{level === 'base' ? '–' : contrast(t[level], t.base).toFixed(2)}</td>
              <td className='py-1 pr-3'>{contrast(t.ink, t[level]).toFixed(1)}</td>
              <td className={`py-1 pr-3 ${sub < 7 ? 'text-orange-700 dark:text-orange-300' : ''}`}>
                {sub.toFixed(1)}
                {sub < 7 ? ' ✗' : ''}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function ElevationTuner() {
  const [settings, setSettings] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);
  const set = (mode: Mode, key: keyof ModeSettings) => (v: number) =>
    setSettings(s => ({ ...s, [mode]: { ...s[mode], [key]: v } }));

  const copy = async () => {
    const block = (mode: Mode) => {
      const t = tokens(mode, settings[mode]);
      return [
        `  --background-subtle: ${t.subtle};`,
        `  --background: ${t.base};`,
        `  --surface-raised: ${t.raised};`,
        `  --surface-overlay: ${t.overlay};`,
        `  --edge-highlight: ${t.highlight};`,
        `  --edge-shade: ${t.shade};`,
        `  --divider: ${t.divider};`,
        `  --shadow-color: ${t.shadow};`,
      ].join('\n');
    };
    const text = `elevation settings:\n${JSON.stringify(settings, null, 2)}\n\n:root {\n${block('light')}\n}\n\n.dark {\n${block('dark')}\n}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className='flex flex-col gap-6'>
      <div className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <h2 className='label-2 text-neutral-500'>elevation tuner</h2>
          <p className='body-4 mt-1 max-w-2xl text-neutral-500'>
            Surfaces are OKLCH lightness on the shipped warm curve. Subtle boxes are flat fills with no border (darker
            than base in light, lighter in dark), so aim for |ΔL| ≥ 0.04 between neighbors (orange below that).
            Ink-subtle must stay ≥ 7 on every level. Edges are translucent warm white (highlight, top) and warm ink
            (shade, all sides).
          </p>
        </div>
        <div className='flex gap-2'>
          <button
            type='button'
            onClick={() => setSettings(DEFAULTS)}
            className='label-4 border-foreground/15 text-foreground hover:border-foreground/40 rounded-full border px-3 py-1'
          >
            Reset
          </button>
          <button
            type='button'
            onClick={() => void copy()}
            className='label-4 bg-foreground text-background rounded-full px-3 py-1'
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      <div className='grid gap-8 lg:grid-cols-2'>
        {(['light', 'dark'] as const).map(mode => (
          <div
            key={mode}
            className='flex flex-col gap-4'
          >
            <Preview
              mode={mode}
              s={settings[mode]}
            />
            <Readout
              mode={mode}
              s={settings[mode]}
            />
            <div className='grid grid-cols-2 gap-x-6 gap-y-3'>
              {LEVELS.map(level => (
                <Range
                  key={level}
                  label={level}
                  value={settings[mode][level]}
                  min={mode === 'light' ? 0.8 : 0.1}
                  max={mode === 'light' ? 1 : 0.4}
                  step={0.005}
                  onChange={set(mode, level)}
                />
              ))}
              <Range
                label='edge highlight'
                value={settings[mode].highlight}
                min={0}
                max={0.3}
                step={0.005}
                onChange={set(mode, 'highlight')}
              />
              <Range
                label='edge shade'
                value={settings[mode].shade}
                min={0}
                max={0.3}
                step={0.005}
                onChange={set(mode, 'shade')}
              />
              <Range
                label='divider'
                value={settings[mode].divider}
                min={0}
                max={0.3}
                step={0.005}
                onChange={set(mode, 'divider')}
              />
              <Range
                label='shadow'
                value={settings[mode].shadow}
                min={0}
                max={0.8}
                step={0.01}
                onChange={set(mode, 'shadow')}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
