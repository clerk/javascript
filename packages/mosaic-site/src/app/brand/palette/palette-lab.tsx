'use client';

import { useEffect, useState } from 'react';

import { ThemeToggle } from '@/components/theme-toggle';
import { useMode } from '@/components/use-mode';

import { ElevationTuner } from './elevation-tuner';
import { GrayTuner } from './gray-tuner';
import { YellowLab } from './yellow-lab';

const SCALES: { name: string; tokens: string[] }[] = [
  {
    name: 'gray',
    tokens: [
      '--color-gray-25',
      '--color-gray-50',
      '--color-gray-100',
      '--color-gray-150',
      '--color-gray-200',
      '--color-gray-300',
      '--color-gray-400',
      '--color-gray-500',
      '--color-gray-600',
      '--color-gray-700',
      '--color-gray-750',
      '--color-gray-800',
      '--color-gray-850',
      '--color-gray-900',
      '--color-gray-950',
    ],
  },
  {
    name: 'neutral',
    tokens: [
      '--color-neutral-50',
      '--color-neutral-100',
      '--color-neutral-200',
      '--color-neutral-300',
      '--color-neutral-400',
      '--color-neutral-500',
      '--color-neutral-600',
      '--color-neutral-700',
      '--color-neutral-800',
      '--color-neutral-900',
      '--color-neutral-950',
    ],
  },
  {
    name: 'purple',
    tokens: [
      '--color-purple-50',
      '--color-purple-100',
      '--color-purple-200',
      '--color-purple-300',
      '--color-purple-400',
      '--color-purple-500',
      '--color-purple-600',
      '--color-purple-700',
      '--color-purple-800',
      '--color-purple-900',
      '--color-purple-950',
    ],
  },
  {
    name: 'sky',
    tokens: [
      '--color-sky-50',
      '--color-sky-100',
      '--color-sky-200',
      '--color-sky-300',
      '--color-sky-400',
      '--color-sky-500',
      '--color-sky-600',
      '--color-sky-700',
      '--color-sky-800',
      '--color-sky-900',
      '--color-sky-950',
    ],
  },
  {
    name: 'blue',
    tokens: [
      '--color-blue-50',
      '--color-blue-100',
      '--color-blue-200',
      '--color-blue-300',
      '--color-blue-400',
      '--color-blue-500',
      '--color-blue-600',
      '--color-blue-700',
      '--color-blue-800',
      '--color-blue-900',
      '--color-blue-950',
    ],
  },
  {
    name: 'orange',
    tokens: [
      '--color-orange-50',
      '--color-orange-100',
      '--color-orange-200',
      '--color-orange-300',
      '--color-orange-400',
      '--color-orange-500',
      '--color-orange-600',
      '--color-orange-700',
      '--color-orange-800',
      '--color-orange-900',
      '--color-orange-950',
    ],
  },
];

const ROLE_TOKENS = ['--ink', '--ink-subtle', '--background-subtle', '--border'];
const BASE = ['--background', '--foreground', ...ROLE_TOKENS];

const USAGE: Record<string, number> = {
  '--foreground': 149,
  '--background': 16,
  '--color-gray-50': 4,
  '--color-gray-100': 3,
  '--color-gray-200': 1,
  '--color-gray-400': 6,
  '--color-gray-500': 8,
  '--color-gray-600': 4,
  '--color-gray-700': 7,
  '--color-gray-750': 1,
  '--color-gray-800': 2,
  '--color-gray-850': 3,
  '--color-gray-900': 11,
  '--color-gray-950': 27,
  '--color-neutral-200': 2,
  '--color-neutral-300': 1,
  '--color-neutral-400': 23,
  '--color-neutral-500': 40,
  '--color-neutral-600': 16,
  '--color-neutral-700': 1,
  '--color-neutral-800': 2,
  '--color-neutral-900': 3,
  '--color-purple-500': 7,
  '--color-sky-400': 3,
  '--color-sky-950': 2,
  '--color-blue-200': 3,
  '--color-blue-500': 3,
  '--color-blue-950': 2,
  '--color-orange-300': 1,
  '--color-orange-500': 3,
  '--color-orange-700': 1,
};

const ONE_OFFS: { hex: string; where: string }[] = [
  { hex: '#191C21', where: 'ui/button.tsx (ring)' },
  { hex: '#d4d4d4', where: 'gallery/detail.tsx' },
  { hex: '#2a2a2a', where: 'gallery/detail.tsx' },
  { hex: '#ececec', where: 'gallery/detail.tsx' },
  { hex: '#1a1a1a', where: 'gallery/detail.tsx' },
  { hex: '#0b0b0d', where: 'gallery/detail.tsx' },
  { hex: '#181D16', where: 'gallery/docs.tsx (shadow, alpha)' },
  { hex: '#e5e5e5', where: 'gallery/custom-profile-card.tsx' },
  { hex: '#F7F7F8', where: 'prompt-bar/logos.tsx' },
  { hex: '#262626', where: 'prompt-bar/agent-brand.ts' },
  { hex: '#ededed', where: 'prompt-bar/agent-brand.ts' },
  { hex: '#cfc8e2', where: 'lib/tile-settings.ts' },
  { hex: '#a08cff', where: 'lib/tile-settings.ts' },
  { hex: '#7a5cff', where: 'lib/tile-settings.ts' },
  { hex: '#5a42e0', where: 'lib/tile-settings.ts' },
  { hex: '#4a4080', where: 'lib/tile-settings.ts' },
  { hex: '#35314f', where: 'lib/tile-settings.ts' },
  { hex: '#25223a', where: 'lib/tile-settings.ts' },
];

const FOREGROUND_FILLS = [
  { label: '/5', className: 'bg-foreground/5' },
  { label: '/10', className: 'bg-foreground/10' },
  { label: '/15', className: 'bg-foreground/15' },
  { label: '/20', className: 'bg-foreground/20' },
  { label: '/25', className: 'bg-foreground/25' },
  { label: '/40', className: 'bg-foreground/40' },
  { label: '/60', className: 'bg-foreground/60' },
  { label: '/80', className: 'bg-foreground/80' },
];

const FOREGROUND_BORDERS = [
  { label: 'border /10', className: 'border-foreground/10' },
  { label: 'border /15', className: 'border-foreground/15' },
  { label: 'border /20', className: 'border-foreground/20' },
  { label: 'border /40', className: 'border-foreground/40' },
];

type Values = { light: Record<string, string>; dark: Record<string, string> };

function collect(rules: CSSRuleList, out: Values) {
  for (const rule of Array.from(rules)) {
    if (rule instanceof CSSStyleRule) {
      const selector = rule.selectorText.trim();
      const target = selector.startsWith(':root') ? out.light : selector === '.dark' ? out.dark : null;
      if (target) {
        for (const prop of Array.from(rule.style)) {
          if (prop.startsWith('--color-') || BASE.includes(prop)) {
            target[prop] = rule.style.getPropertyValue(prop).trim();
          }
        }
      }
    }
    if (rule instanceof CSSMediaRule) {
      continue;
    }
    if ('cssRules' in rule && (rule as CSSGroupingRule).cssRules) {
      collect((rule as CSSGroupingRule).cssRules, out);
    }
  }
}

function readValues(): Values {
  const out: Values = { light: {}, dark: {} };
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      collect(sheet.cssRules, out);
    } catch {
      continue;
    }
  }
  for (const mode of ['light', 'dark'] as const) {
    for (const token of Object.keys(out[mode])) {
      let value = out[mode][token];
      for (let depth = 0; depth < 5; depth++) {
        const ref = value.match(/^var\((--[\w-]+)\)$/)?.[1];
        if (!ref) {
          break;
        }
        value = (mode === 'dark' ? (out.dark[ref] ?? out.light[ref]) : out.light[ref]) ?? value;
      }
      out[mode][token] = value;
    }
  }
  return out;
}

function useValues() {
  const [values, setValues] = useState<Values>({ light: {}, dark: {} });
  useEffect(() => {
    const update = () => setValues(readValues());
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, []);
  return values;
}

function rgb(hex: string): [number, number, number] | null {
  const m = hex.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) {
    return null;
  }
  const h = m[1].length === 3 ? [...m[1]].map(c => c + c).join('') : m[1];
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}

function nearest(hex: string, pool: Record<string, string>) {
  const target = rgb(hex);
  if (!target) {
    return null;
  }
  let best: { token: string; value: string; distance: number } | null = null;
  for (const [token, value] of Object.entries(pool)) {
    const c = rgb(value);
    if (!c) {
      continue;
    }
    const distance = Math.hypot(c[0] - target[0], c[1] - target[1], c[2] - target[2]);
    if (!best || distance < best.distance) {
      best = { token, value, distance };
    }
  }
  return best;
}

function oklch(hex: string) {
  const c = rgb(hex);
  if (!c) {
    return null;
  }
  const [r, g, b] = c.map(v => {
    const x = v / 255;
    return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  });
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return {
    l: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    c: Math.hypot(A, B),
    h: ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360,
  };
}

const short = (token: string) => token.replace(/^--color-/, '').replace(/^--/, '');

type Mode = 'light' | 'dark';
type Spec = { token: string } | { alpha: number } | { hex: string };
type Candidate = { label: string; count: number; light: Spec; dark: Spec };
type Role = { name: string; kind: 'text' | 'fill' | 'border'; candidates: Candidate[] };

const ROLES: Role[] = [
  {
    name: 'ink',
    kind: 'text',
    candidates: [
      { label: 'text-foreground', count: 46, light: { token: '--foreground' }, dark: { token: '--foreground' } },
      {
        label: 'text-gray-950 dark:text-white',
        count: 18,
        light: { token: '--color-gray-950' },
        dark: { hex: '#ffffff' },
      },
    ],
  },
  {
    name: 'ink-subtle',
    kind: 'text',
    candidates: [
      {
        label: 'text-neutral-500',
        count: 52,
        light: { token: '--color-neutral-500' },
        dark: { token: '--color-neutral-500' },
      },
      {
        label: 'text-neutral-600 dark:text-neutral-400',
        count: 14,
        light: { token: '--color-neutral-600' },
        dark: { token: '--color-neutral-400' },
      },
      {
        label: 'text-gray-500',
        count: 10,
        light: { token: '--color-gray-500' },
        dark: { token: '--color-gray-500' },
      },
      {
        label: 'text-gray-600 dark:text-gray-400',
        count: 6,
        light: { token: '--color-gray-600' },
        dark: { token: '--color-gray-400' },
      },
      {
        label: 'text-neutral-400',
        count: 6,
        light: { token: '--color-neutral-400' },
        dark: { token: '--color-neutral-400' },
      },
    ],
  },
  {
    name: 'bg',
    kind: 'fill',
    candidates: [
      { label: 'bg-background', count: 12, light: { token: '--background' }, dark: { token: '--background' } },
      { label: 'bg-white', count: 3, light: { hex: '#ffffff' }, dark: { hex: '#ffffff' } },
    ],
  },
  {
    name: 'bg-subtle',
    kind: 'fill',
    candidates: [
      { label: 'bg-foreground/[0.06]', count: 14, light: { alpha: 0.06 }, dark: { alpha: 0.06 } },
      { label: 'bg-foreground/[0.07]', count: 6, light: { alpha: 0.07 }, dark: { alpha: 0.07 } },
      { label: 'bg-foreground/[0.03]', count: 5, light: { alpha: 0.03 }, dark: { alpha: 0.03 } },
      { label: 'bg-foreground/[0.04]', count: 5, light: { alpha: 0.04 }, dark: { alpha: 0.04 } },
      { label: 'bg-foreground/[0.08]', count: 3, light: { alpha: 0.08 }, dark: { alpha: 0.08 } },
      { label: 'bg-foreground/[0.05]', count: 2, light: { alpha: 0.05 }, dark: { alpha: 0.05 } },
      {
        label: 'bg-gray-100 dark:bg-gray-900',
        count: 2,
        light: { token: '--color-gray-100' },
        dark: { token: '--color-gray-900' },
      },
    ],
  },
  {
    name: 'border',
    kind: 'border',
    candidates: [
      { label: 'border-foreground/10', count: 32, light: { alpha: 0.1 }, dark: { alpha: 0.1 } },
      { label: 'border-foreground/15 (= /10 in dark)', count: 6, light: { alpha: 0.15 }, dark: { alpha: 0.1 } },
      { label: 'border-foreground/40', count: 5, light: { alpha: 0.4 }, dark: { alpha: 0.4 } },
      { label: 'border-foreground/20', count: 3, light: { alpha: 0.2 }, dark: { alpha: 0.2 } },
    ],
  },
];

const ROLE_COLORS: Record<string, string> = {
  ink: '#6c47ff',
  'ink-subtle': '#00aee3',
  bg: '#f36b16',
  'bg-subtle': '#15892b',
  border: '#e02e2e',
};

const GRAY = SCALES[0].tokens;

const pick = (values: Values, mode: Mode, token: string) =>
  mode === 'dark' ? (values.dark[token] ?? values.light[token]) : values.light[token];

function mix(top: string, bottom: string, alpha: number) {
  const a = rgb(top);
  const b = rgb(bottom);
  if (!a || !b) {
    return top;
  }
  return `#${a
    .map((c, i) =>
      Math.round(c * alpha + b[i] * (1 - alpha))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}

function resolve(spec: Spec, values: Values, mode: Mode) {
  if ('token' in spec) {
    return pick(values, mode, spec.token) ?? '';
  }
  if ('hex' in spec) {
    return spec.hex;
  }
  return mix(pick(values, mode, '--foreground') ?? '#000', pick(values, mode, '--background') ?? '#fff', spec.alpha);
}

function grayPool(values: Values, mode: Mode) {
  return Object.fromEntries(GRAY.map(token => [token, pick(values, mode, token) ?? '']));
}

function Ramp({ values, mode }: { values: Values; mode: Mode }) {
  const pool = grayPool(values, mode);
  const marks: Record<string, { role: string; primary: boolean; label: string }[]> = {};
  for (const role of ROLES) {
    role.candidates.forEach((candidate, index) => {
      const match = nearest(resolve(candidate[mode], values, mode), pool);
      if (match) {
        (marks[match.token] ??= []).push({ role: role.name, primary: index === 0, label: candidate.label });
      }
    });
  }
  const steps = GRAY;
  return (
    <div
      className='rounded-lg p-4'
      style={{ background: pick(values, mode, '--background'), color: pick(values, mode, '--foreground') }}
    >
      <div className='mono-2 mb-3 opacity-60'>{mode}</div>
      <div className='grid grid-cols-[repeat(15,minmax(0,1fr))] gap-1'>
        {steps.map(token => (
          <div
            key={token}
            className='flex min-w-0 flex-col gap-1'
          >
            <div
              className='h-10 rounded-sm'
              style={{ background: pool[token], boxShadow: 'inset 0 0 0 1px rgb(128 128 128 / 0.25)' }}
              title={`${short(token)} ${pool[token]}`}
            />
            <code className='mono-2 truncate text-center opacity-60'>{short(token).split('-').pop()}</code>
            <div className='flex flex-col items-center gap-0.5'>
              {(marks[token] ?? []).map(mark => (
                <span
                  key={mark.label}
                  title={mark.label}
                  className='size-2 rounded-full'
                  style={{
                    background: mark.primary ? ROLE_COLORS[mark.role] : 'transparent',
                    boxShadow: `inset 0 0 0 1.5px ${ROLE_COLORS[mark.role]}`,
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoleSample({
  role,
  candidate,
  values,
  mode,
}: {
  role: Role;
  candidate: Candidate;
  values: Values;
  mode: Mode;
}) {
  const value = resolve(candidate[mode], values, mode);
  const bg = pick(values, mode, '--background');
  const match = nearest(value, grayPool(values, mode));
  return (
    <div
      className='flex items-center gap-3 rounded-md px-3 py-2'
      style={{ background: bg, color: pick(values, mode, '--foreground') }}
    >
      {role.kind === 'text' ? (
        <span
          className='label-2 w-10 shrink-0'
          style={{ color: value }}
        >
          Aa
        </span>
      ) : (
        <span
          className='h-6 w-10 shrink-0 rounded-sm'
          style={
            role.kind === 'border'
              ? { boxShadow: `inset 0 0 0 1px ${value}` }
              : { background: value, boxShadow: 'inset 0 0 0 1px rgb(128 128 128 / 0.2)' }
          }
        />
      )}
      <code className='mono-2 w-16 shrink-0'>{value}</code>
      {match && (
        <code className='mono-2 truncate opacity-60'>
          ≈ {short(match.token)}
          {match.distance >= 1 ? ` Δ${Math.round(match.distance)}` : ''}
        </code>
      )}
    </div>
  );
}

function Roles({ values }: { values: Values }) {
  return (
    <section className='flex flex-col gap-6'>
      <div>
        <h2 className='label-2 text-neutral-500'>roles → grayscale</h2>
        <p className='body-4 mt-1 max-w-2xl text-neutral-500'>
          How the site uses grays today, grouped into proposed roles. Each role lists every pattern in use, most used
          first. Alphas are flattened over the background. Dots on the ramp: filled = most used pattern, ring = other
          patterns.
        </p>
      </div>
      <div className='flex flex-wrap gap-4'>
        {ROLES.map(role => (
          <span
            key={role.name}
            className='label-4 text-foreground flex items-center gap-1.5'
          >
            <span
              className='size-2 rounded-full'
              style={{ background: ROLE_COLORS[role.name] }}
            />
            {role.name}
          </span>
        ))}
      </div>
      <div className='grid gap-3'>
        <Ramp
          values={values}
          mode='light'
        />
        <Ramp
          values={values}
          mode='dark'
        />
      </div>
      <div className='flex flex-col'>
        {ROLES.map(role => (
          <div
            key={role.name}
            className='border-foreground/10 grid gap-x-6 gap-y-2 border-t py-4 lg:grid-cols-[9rem_1fr]'
          >
            <div className='label-3 text-foreground flex items-center gap-2 self-start'>
              <span
                className='size-2 rounded-full'
                style={{ background: ROLE_COLORS[role.name] }}
              />
              {role.name}
            </div>
            <div className='flex flex-col gap-2'>
              {role.candidates.map(candidate => (
                <div
                  key={candidate.label}
                  className='grid items-center gap-2 md:grid-cols-[minmax(0,16rem)_1fr_1fr]'
                >
                  <div className='flex min-w-0 items-baseline gap-2'>
                    <code className='mono-2 text-foreground truncate'>{candidate.label}</code>
                    <span className='mono-2 shrink-0 text-neutral-500'>{candidate.count}×</span>
                  </div>
                  <RoleSample
                    role={role}
                    candidate={candidate}
                    values={values}
                    mode='light'
                  />
                  <RoleSample
                    role={role}
                    candidate={candidate}
                    values={values}
                    mode='dark'
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Swatch({ token, values }: { token: string; values: Values }) {
  const light = values.light[token];
  const dark = values.dark[token] ?? light;
  const overridden = token in values.dark;
  const uses = USAGE[token] ?? 0;
  return (
    <div className='flex min-w-0 flex-col gap-1.5'>
      <div
        className={`flex h-16 flex-col overflow-hidden rounded-md ${uses === 0 ? 'border-foreground/30 border border-dashed' : 'ring-foreground/10 ring-1'}`}
      >
        <div
          className='flex-1'
          style={{ background: light }}
          title={`light ${light}`}
        />
        <div
          className='flex-1'
          style={{ background: dark }}
          title={`dark ${dark}`}
        />
      </div>
      <div className='flex items-baseline justify-between gap-1'>
        <code className={`mono-2 truncate ${uses === 0 ? 'text-neutral-500' : 'text-foreground'}`}>
          {token.startsWith('--color-') ? short(token).split('-').pop() : short(token)}
        </code>
        <span className={`mono-2 ${uses === 0 ? 'text-neutral-500/60' : 'text-neutral-500'}`}>{uses}×</span>
      </div>
      <code className='mono-2 text-neutral-500'>{light ?? 'missing'}</code>
      <code className={`mono-2 ${overridden ? 'text-orange-700 dark:text-orange-300' : 'text-neutral-500'}`}>
        {overridden ? dark : '—'}
      </code>
    </div>
  );
}

function Scale({ name, tokens, values }: { name: string; tokens: string[]; values: Values }) {
  return (
    <section className='flex flex-col gap-3'>
      <h2 className='label-2 text-neutral-500'>{name}</h2>
      <div className='grid grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))] gap-3'>
        {tokens.map(token => (
          <Swatch
            key={token}
            token={token}
            values={values}
          />
        ))}
      </div>
    </section>
  );
}

function GrayVsNeutral({ values }: { values: Values }) {
  const shades = [
    '25',
    '50',
    '100',
    '150',
    '200',
    '300',
    '400',
    '500',
    '600',
    '700',
    '750',
    '800',
    '850',
    '900',
    '950',
  ];
  const cell = (token: string, mode: 'light' | 'dark') => {
    const value = mode === 'light' ? values.light[token] : (values.dark[token] ?? values.light[token]);
    return value ? (
      <span className='flex items-center gap-2'>
        <span
          className='ring-foreground/10 size-4 shrink-0 rounded-sm ring-1'
          style={{ background: value }}
        />
        <code className='mono-2'>{value}</code>
      </span>
    ) : (
      <span className='mono-2 text-neutral-500'>—</span>
    );
  };
  return (
    <section className='flex flex-col gap-3'>
      <h2 className='label-2 text-neutral-500'>gray vs neutral</h2>
      <div className='overflow-x-auto'>
        <table className='w-full min-w-[40rem] border-collapse text-left'>
          <thead>
            <tr className='label-4 text-neutral-500'>
              <th className='py-2 pr-4 font-medium'>shade</th>
              <th className='py-2 pr-4 font-medium'>gray light</th>
              <th className='py-2 pr-4 font-medium'>neutral light</th>
              <th className='py-2 pr-4 font-medium'>gray dark</th>
              <th className='py-2 pr-4 font-medium'>neutral dark</th>
            </tr>
          </thead>
          <tbody>
            {shades.map(shade => {
              const g = `--color-gray-${shade}`;
              const n = `--color-neutral-${shade}`;
              const lightDiff = values.light[g] !== values.light[n];
              const darkDiff = (values.dark[g] ?? values.light[g]) !== (values.dark[n] ?? values.light[n]);
              return (
                <tr
                  key={shade}
                  className='border-foreground/10 text-foreground border-t'
                >
                  <td className='mono-2 py-2 pr-4'>{shade}</td>
                  <td className={`py-2 pr-4 ${lightDiff ? 'bg-orange-500/10' : ''}`}>{cell(g, 'light')}</td>
                  <td className={`py-2 pr-4 ${lightDiff ? 'bg-orange-500/10' : ''}`}>{cell(n, 'light')}</td>
                  <td className={`py-2 pr-4 ${darkDiff ? 'bg-orange-500/10' : ''}`}>{cell(g, 'dark')}</td>
                  <td className={`py-2 pr-4 ${darkDiff ? 'bg-orange-500/10' : ''}`}>{cell(n, 'dark')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ForegroundAlphas() {
  return (
    <section className='flex flex-col gap-3'>
      <h2 className='label-2 text-neutral-500'>foreground alphas (current mode)</h2>
      <div className='grid grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))] gap-3'>
        {FOREGROUND_FILLS.map(fill => (
          <div
            key={fill.label}
            className='flex flex-col gap-1.5'
          >
            <div className={`h-16 rounded-md ${fill.className}`} />
            <code className='mono-2 text-foreground'>{fill.label}</code>
          </div>
        ))}
      </div>
      <div className='grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-3'>
        {FOREGROUND_BORDERS.map(border => (
          <div
            key={border.label}
            className={`flex h-16 items-center justify-center rounded-md border ${border.className}`}
          >
            <code className='mono-2 text-foreground'>{border.label}</code>
          </div>
        ))}
      </div>
    </section>
  );
}

function OneOffs({ values }: { values: Values }) {
  const pool = Object.fromEntries(
    Object.entries(values.light).filter(([token]) => /--color-(gray|neutral|purple|sky|blue|orange)-/.test(token)),
  );
  const darkPool = Object.fromEntries(
    Object.keys(pool).map(token => [`${token} (dark)`, values.dark[token] ?? pool[token]]),
  );
  return (
    <section className='flex flex-col gap-3'>
      <h2 className='label-2 text-neutral-500'>one-off hex colors</h2>
      <div className='grid gap-x-6 gap-y-2 md:grid-cols-2'>
        {ONE_OFFS.map(item => {
          const match = nearest(item.hex, { ...pool, ...darkPool });
          return (
            <div
              key={`${item.hex}-${item.where}`}
              className='border-foreground/10 text-foreground flex items-center gap-3 border-t py-2'
            >
              <span
                className='ring-foreground/10 size-6 shrink-0 rounded-sm ring-1'
                style={{ background: item.hex }}
              />
              <code className='mono-2 w-16 shrink-0'>{item.hex}</code>
              <span className='body-4 min-w-0 flex-1 truncate text-neutral-500'>{item.where}</span>
              {match && (
                <span className='flex shrink-0 items-center gap-2'>
                  <span
                    className='ring-foreground/10 size-4 rounded-sm ring-1'
                    style={{ background: match.value }}
                  />
                  <code className='mono-2 text-neutral-500'>
                    {short(match.token)} Δ{Math.round(match.distance)}
                  </code>
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function PaletteLab() {
  const values = useValues();
  const mode = useMode();

  return (
    <div className='mx-auto flex max-w-6xl flex-col gap-16 px-6 py-16'>
      <header className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <span className='tag-1 text-neutral-500'>Temporary</span>
          <h1 className='heading-3 text-foreground mt-2'>Palette</h1>
          <p className='body-3 mt-2 max-w-xl text-neutral-500'>
            Each swatch: top half light, bottom half dark. Orange hex = overridden in <code>.dark</code>. Faded =
            unused. Counts are a snapshot from a grep; values are read live from the stylesheet.
          </p>
        </div>
        <div className='flex items-center gap-4'>
          <span className='label-3 text-neutral-500'>{mode}</span>
          <ThemeToggle />
        </div>
      </header>

      <YellowLab />
      <GrayTuner />
      <ElevationTuner />
      <Roles values={values} />
      <Saturation values={values} />
      <Scale
        name='base'
        tokens={BASE}
        values={values}
      />
      {SCALES.map(scale => (
        <Scale
          key={scale.name}
          name={scale.name}
          tokens={scale.tokens}
          values={values}
        />
      ))}
      <GrayVsNeutral values={values} />
      <ForegroundAlphas />
      <OneOffs values={values} />
    </div>
  );
}

const CHROMA_MAX = 0.03;

function Saturation({ values }: { values: Values }) {
  const brand = oklch(values.light['--color-purple-500'] ?? '');
  return (
    <section className='flex flex-col gap-4'>
      <div>
        <h2 className='label-2 text-neutral-500'>gray saturation (oklch)</h2>
        <p className='body-4 mt-1 max-w-2xl text-neutral-500'>
          Bar height = chroma (0 to {CHROMA_MAX}). Numbers under each bar: chroma × 1000, then hue.
          {brand ? ` purple-500 hue is ${Math.round(brand.h)}.` : ''}
        </p>
      </div>
      {(['light', 'dark'] as const).map(mode => (
        <div
          key={mode}
          className='flex flex-col gap-2'
        >
          <span className='mono-2 text-neutral-500'>{mode}</span>
          <div className='grid grid-cols-[repeat(15,minmax(0,1fr))] gap-1'>
            {GRAY.map(token => {
              const value = pick(values, mode, token) ?? '';
              const o = oklch(value);
              return (
                <div
                  key={token}
                  className='flex min-w-0 flex-col gap-1'
                >
                  <div className='bg-foreground/5 flex h-24 items-end rounded-sm'>
                    <div
                      className='w-full rounded-sm'
                      style={{
                        height: `${Math.min(1, (o?.c ?? 0) / CHROMA_MAX) * 100}%`,
                        background: o ? `oklch(0.6 0.15 ${o.h})` : 'transparent',
                      }}
                    />
                  </div>
                  <code className='mono-2 text-foreground truncate text-center'>{short(token).split('-').pop()}</code>
                  <code className='mono-2 truncate text-center text-neutral-500'>
                    {o ? Math.round(o.c * 1000) : '–'}
                  </code>
                  <code className='mono-2 truncate text-center text-neutral-500'>
                    {o && o.c > 0.0005 ? Math.round(o.h) : '–'}
                  </code>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
