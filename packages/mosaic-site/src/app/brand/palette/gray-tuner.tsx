'use client';

import { useEffect, useMemo, useState } from 'react';

const STEPS: [string, number][] = [
  ['25', 0.985],
  ['50', 0.976],
  ['100', 0.95],
  ['150', 0.917],
  ['200', 0.887],
  ['300', 0.785],
  ['400', 0.67],
  ['500', 0.57],
  ['600', 0.49],
  ['700', 0.386],
  ['750', 0.343],
  ['800', 0.311],
  ['850', 0.275],
  ['900', 0.25],
  ['950', 0.188],
];

export type Settings = {
  peak: number;
  peakL: number;
  lightFalloff: number;
  darkFalloff: number;
  hueLight: number;
  hueDark: number;
};

export const PRESETS: { name: string; note: string; settings: Settings }[] = [
  {
    name: 'shipped (warm, subdued)',
    note: 'What globals.css uses now.',
    settings: { peak: 0.01, peakL: 0.39, lightFalloff: 0.65, darkFalloff: 0.85, hueLight: 85, hueDark: 58 },
  },
  {
    name: 'old (cool, flat hue)',
    note: 'Roughly the current light ramp: brand hue, peak at 500–600.',
    settings: { peak: 0.025, peakL: 0.55, lightFalloff: 1.6, darkFalloff: 1.1, hueLight: 286, hueDark: 282 },
  },
  {
    name: 'cool, peak mid-dark',
    note: 'Brand hue, peak moved to 600–700, lights near-neutral, darks keep some color.',
    settings: { peak: 0.018, peakL: 0.45, lightFalloff: 1.4, darkFalloff: 0.7, hueLight: 290, hueDark: 278 },
  },
  {
    name: 'warm (brief)',
    note: "Brand-ideation direction: warm grays toward purple's complement, so purple is the only cool color.",
    settings: { peak: 0.012, peakL: 0.47, lightFalloff: 0.8, darkFalloff: 0.6, hueLight: 85, hueDark: 58 },
  },
];

export function chroma(l: number, s: Settings) {
  if (l >= s.peakL) {
    return s.peak * Math.pow((1 - l) / (1 - s.peakL), s.lightFalloff);
  }
  return s.peak * Math.pow(l / s.peakL, s.darkFalloff);
}

export function toHex(l: number, c: number, h: number) {
  const rad = (h * Math.PI) / 180;
  const a = c * Math.cos(rad);
  const b = c * Math.sin(rad);
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const rgb = [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ];
  return `#${rgb
    .map(v => {
      const x = Math.min(1, Math.max(0, v));
      const g = x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
      return Math.round(g * 255)
        .toString(16)
        .padStart(2, '0');
    })
    .join('')}`;
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format = v => String(v),
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <div className='flex flex-col gap-1'>
      <span className='flex justify-between gap-2'>
        <span className='label-4 text-foreground'>{label}</span>
        <code className='mono-2 text-neutral-500'>{format(value)}</code>
      </span>
      <input
        type='range'
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={e => onChange(Number(e.target.value))}
      />
    </div>
  );
}

export function GrayTuner() {
  const [settings, setSettings] = useState<Settings>(PRESETS[0].settings);
  const [apply, setApply] = useState(false);
  const [copyFormat, setCopyFormat] = useState<'settings' | 'css' | 'both'>('both');
  const [copied, setCopied] = useState(false);
  const set = (key: keyof Settings) => (v: number) => setSettings(s => ({ ...s, [key]: v }));

  const ramp = useMemo(
    () =>
      STEPS.map(([name, l]) => {
        const c = Math.max(0, chroma(l, settings));
        const h = settings.hueDark + (settings.hueLight - settings.hueDark) * l;
        return { name, l, c, h, hex: toHex(l, c, h) };
      }),
    [settings],
  );

  useEffect(() => {
    if (!apply) {
      return;
    }
    const root = document.documentElement;
    const props = ramp.flatMap(step => [
      [`--color-gray-${step.name}`, step.hex],
      [`--color-neutral-${step.name}`, step.hex],
    ]);
    for (const [prop, value] of props) {
      root.style.setProperty(prop, value);
    }
    return () => {
      for (const [prop] of props) {
        root.style.removeProperty(prop);
      }
    };
  }, [apply, ramp]);

  const css = ramp
    .map(
      step =>
        `  --color-gray-${step.name}: oklch(${step.l} ${step.c.toFixed(4)} ${Math.round(step.h)}); /* ${step.hex} */`,
    )
    .join('\n');
  const max = Math.max(...ramp.map(step => step.c), 0.001);
  const copyText = () => {
    const knobs = `gray tuner settings:\n${JSON.stringify(settings, null, 2)}`;
    if (copyFormat === 'settings') {
      return knobs;
    }
    if (copyFormat === 'css') {
      return css;
    }
    return `${knobs}\n\nramp:\n${css}`;
  };
  const copy = async () => {
    const text = copyText();
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      const area = document.createElement('textarea');
      area.value = text;
      document.body.appendChild(area);
      area.select();
      ok = document.execCommand('copy');
      area.remove();
    }
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    }
  };

  return (
    <section className='flex flex-col gap-6'>
      <div>
        <h2 className='label-2 text-neutral-500'>gray tuner</h2>
        <p className='body-4 mt-1 max-w-2xl text-neutral-500'>
          One ramp for both modes. Lightness per step is kept from today&apos;s light ramp. Chroma follows a curve that
          peaks at a chosen lightness and falls off toward white and black. Hue can drift from the dark end to the light
          end. &quot;Apply to page&quot; overrides gray and neutral on this page in both modes.
        </p>
      </div>

      <div className='flex flex-wrap gap-2'>
        {PRESETS.map(preset => (
          <button
            key={preset.name}
            type='button'
            title={preset.note}
            onClick={() => setSettings(preset.settings)}
            className='label-4 border-foreground/15 text-foreground hover:border-foreground/40 rounded-full border px-3 py-1'
          >
            {preset.name}
          </button>
        ))}
        <div className='ml-auto flex items-center gap-2'>
          <select
            aria-label='Copy format'
            value={copyFormat}
            onChange={e => setCopyFormat(e.target.value as 'settings' | 'css' | 'both')}
            className='label-4 border-foreground/15 text-foreground bg-background rounded-full border px-3 py-1'
          >
            <option value='both'>settings + CSS</option>
            <option value='settings'>settings</option>
            <option value='css'>CSS</option>
          </select>
          <button
            type='button'
            onClick={() => void copy()}
            className='label-4 bg-foreground text-background rounded-full px-3 py-1'
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <label className='label-4 text-foreground flex items-center gap-2'>
          <input
            type='checkbox'
            checked={apply}
            onChange={e => setApply(e.target.checked)}
          />
          Apply to page
        </label>
      </div>

      <div className='grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3'>
        <Slider
          label='peak chroma'
          value={settings.peak}
          min={0}
          max={0.04}
          step={0.001}
          onChange={set('peak')}
          format={v => v.toFixed(3)}
        />
        <Slider
          label='peak at lightness'
          value={settings.peakL}
          min={0.25}
          max={0.75}
          step={0.01}
          onChange={set('peakL')}
          format={v => v.toFixed(2)}
        />
        <div />
        <Slider
          label='falloff toward white'
          value={settings.lightFalloff}
          min={0.2}
          max={3}
          step={0.05}
          onChange={set('lightFalloff')}
          format={v => v.toFixed(2)}
        />
        <Slider
          label='falloff toward black'
          value={settings.darkFalloff}
          min={0.2}
          max={3}
          step={0.05}
          onChange={set('darkFalloff')}
          format={v => v.toFixed(2)}
        />
        <div />
        <Slider
          label='hue at the light end'
          value={settings.hueLight}
          min={0}
          max={360}
          step={1}
          onChange={set('hueLight')}
        />
        <Slider
          label='hue at the dark end'
          value={settings.hueDark}
          min={0}
          max={360}
          step={1}
          onChange={set('hueDark')}
        />
      </div>

      <div className='grid grid-cols-[repeat(15,minmax(0,1fr))] gap-1'>
        {ramp.map(step => (
          <div
            key={step.name}
            className='flex min-w-0 flex-col gap-1'
          >
            <div className='bg-foreground/5 flex h-20 items-end rounded-sm'>
              <div
                className='w-full rounded-sm'
                style={{ height: `${(step.c / max) * 100}%`, background: `oklch(0.6 0.15 ${step.h})` }}
              />
            </div>
            <div
              className='h-12 rounded-sm'
              style={{ background: step.hex, boxShadow: 'inset 0 0 0 1px rgb(128 128 128 / 0.2)' }}
            />
            <code className='mono-2 text-foreground truncate text-center'>{step.name}</code>
            <code className='mono-2 truncate text-center text-neutral-500'>{Math.round(step.c * 1000)}</code>
            <code className='mono-2 truncate text-center text-neutral-500'>{Math.round(step.h)}</code>
          </div>
        ))}
      </div>

      <div className='grid gap-3 md:grid-cols-2'>
        {(['light', 'dark'] as const).map(mode => {
          const g = Object.fromEntries(ramp.map(step => [step.name, step.hex]));
          const roles =
            mode === 'light'
              ? { bg: g['50'], subtle: g['100'], border: g['150'], ink: g['950'], inkSubtle: g['700'] }
              : { bg: g['950'], subtle: g['900'], border: g['800'], ink: g['25'], inkSubtle: g['300'] };
          return (
            <div
              key={mode}
              className='flex flex-col gap-3 rounded-lg p-5'
              style={{ background: roles.bg, color: roles.ink }}
            >
              <span className='mono-2 opacity-60'>{mode}</span>
              <div
                className='flex flex-col gap-1 rounded-md p-4'
                style={{ background: roles.subtle, boxShadow: `inset 0 0 0 1px ${roles.border}` }}
              >
                <span className='label-2'>Active devices</span>
                <span
                  className='body-3'
                  style={{ color: roles.inkSubtle }}
                >
                  Chrome on macOS · Last active 2 minutes ago
                </span>
              </div>
              <div
                className='flex items-center justify-between rounded-md p-4'
                style={{ boxShadow: `inset 0 0 0 1px ${roles.border}` }}
              >
                <span className='body-3'>Email address</span>
                <span
                  className='body-3'
                  style={{ color: roles.inkSubtle }}
                >
                  max@example.com
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <details>
        <summary className='label-4 text-foreground cursor-pointer'>CSS</summary>
        <pre className='mono-2 bg-foreground/5 text-foreground mt-2 overflow-x-auto rounded-md p-4'>{css}</pre>
      </details>
    </section>
  );
}
