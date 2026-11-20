const EASES = {
  enter: { label: 'enter (0, 0, .2, 1)', value: 'cubic-bezier(0, 0, 0.2, 1)' },
  inOut: { label: 'in-out (.645, .045, .355, 1)', value: 'cubic-bezier(0.645, 0.045, 0.355, 1)' },
  outQuint: { label: 'out-quint (.23, 1, .32, 1)', value: 'cubic-bezier(0.23, 1, 0.32, 1)' },
  outExpo: { label: 'out-expo (.19, 1, .22, 1)', value: 'cubic-bezier(0.19, 1, 0.22, 1)' },
  exit: { label: 'exit (.55, .085, .68, .53)', value: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)' },
  ease: { label: 'ease', value: 'ease' },
  linear: { label: 'linear', value: 'linear' },
} as const;

type EaseKey = keyof typeof EASES | 'spring';

const EASE_KEYS = ['spring', ...Object.keys(EASES)] as EaseKey[];

export interface MotionConfig {
  hMode: 'ease' | 'spring';
  hDur: number;
  hEase: EaseKey;
  springDur: number;
  bounce: number;
  outDur: number;
  outScale: number;
  outBlur: number;
  outEase: EaseKey;
  inDur: number;
  inDelay: number;
  inScale: number;
  inBlur: number;
  inEase: EaseKey;
  mScale: number;
  mBlur: number;
  mDur: number;
  mExit: number;
  mEase: EaseKey;
  slow: number;
  reduced: boolean;
  heightAware: boolean;
  growDelay: number;
  fullAt: number;
  minScale: number;
}

export const CLASSIC: MotionConfig = {
  hMode: 'ease',
  hDur: 250,
  hEase: 'enter',
  springDur: 0.5,
  bounce: 0,
  outDur: 150,
  outScale: 0.96,
  outBlur: 0,
  outEase: 'inOut',
  inDur: 250,
  inDelay: 75,
  inScale: 0.96,
  inBlur: 0,
  inEase: 'enter',
  mScale: 0.94,
  mBlur: 0,
  mDur: 200,
  mExit: 120,
  mEase: 'outQuint',
  slow: 1,
  reduced: false,
  heightAware: true,
  growDelay: 130,
  fullAt: 200,
  minScale: 0.6,
};

export const PRESETS: Record<string, Partial<MotionConfig>> = {
  'Classic (current)': {},
  Proposal: {
    hMode: 'spring',
    springDur: 0.24,
    bounce: 0,
    outDur: 125,
    outScale: 1,
    outBlur: 0,
    outEase: 'spring',
    inDur: 250,
    inDelay: 0,
    growDelay: 80,
    inScale: 1,
    inBlur: 0,
    inEase: 'spring',
    mScale: 1,
    mBlur: 2.5,
    mDur: 200,
    mExit: 120,
    mEase: 'outQuint',
  },
  'Proposal 2': {
    hMode: 'spring',
    springDur: 0.3,
    bounce: 0,
    outDur: 150,
    outScale: 1,
    outBlur: 0,
    outEase: 'spring',
    inDur: 420,
    inDelay: 0,
    growDelay: 60,
    inScale: 1,
    inBlur: 0,
    inEase: 'spring',
  },
};

export const NEW_PRESETS: string[] = ['Proposal 2'];

export const PRESET_NOTES: Record<string, string> = {
  'Classic (current)': "Today's Mosaic motion: a scale pulse with an overlapping crossfade.",
  Proposal:
    'One curve for everything: the height, the crossfade and the dialog share a single spring, and the content lands as the height settles.',
  'Proposal 2':
    'A crossfade on one spring (0.3s, no bounce) shared by the height and the content, with no scale, blur or delay. The exit is short so the old step does not ghost over the new one.',
};

const KEPT_KEYS = [
  'slow',
  'reduced',
  'heightAware',
  'fullAt',
  'minScale',
] as const satisfies readonly (keyof MotionConfig)[];

export function withPreset(name: string, previous: MotionConfig): MotionConfig {
  const kept = Object.fromEntries(KEPT_KEYS.map(key => [key, previous[key]]));
  return { ...CLASSIC, ...PRESETS[name], ...kept };
}

export function springCurve(duration: number, bounce: number) {
  const w0 = (2 * Math.PI) / duration;
  const zeta = 1 - bounce;
  const dt = 1 / 480;
  let x = 0;
  let v = 0;
  let t = 0;
  const xs = [0];
  while (t < duration * 4) {
    const a = -w0 * w0 * (x - 1) - 2 * zeta * w0 * v;
    v += a * dt;
    x += v * dt;
    t += dt;
    xs.push(x);
  }
  let end = xs.length - 1;
  while (end > 0 && Math.abs(xs[end] - 1) < 0.002) {
    end--;
  }
  end = Math.min(xs.length - 1, end + 1);
  const n = Math.max(12, Math.min(64, Math.round(end / 8)));
  const points: number[] = [];
  for (let i = 0; i <= n; i++) {
    points.push(+xs[Math.round((i / n) * end)].toFixed(4));
  }
  points[points.length - 1] = 1;
  return { css: `linear(${points.join(', ')})`, ms: Math.round(end * dt * 100) * 10 };
}

export function baseHeightMs(c: MotionConfig) {
  const ms = c.hMode === 'spring' ? springCurve(c.springDur, c.bounce).ms : c.hDur;
  return ms / c.slow;
}

function easing(c: MotionConfig, key: EaseKey) {
  return key === 'spring' ? springCurve(c.springDur, c.bounce).css : EASES[key].value;
}

const BOOST = ':not(#\\#)'.repeat(8);

function time(value: number, speed: number) {
  return `${+(value / speed).toFixed(1)}ms`;
}

function flowRules(c: MotionConfig) {
  const height =
    c.hMode === 'spring'
      ? (() => {
          const spring = springCurve(c.springDur, c.bounce);
          return { duration: time(spring.ms, c.slow), easing: spring.css };
        })()
      : { duration: time(c.hDur, c.slow), easing: easing(c, c.hEase) };

  const heightDuration = c.heightAware
    ? `calc(${height.duration} * (${c.minScale} + ${+(1 - c.minScale).toFixed(3)} * var(--motion-p, 1)))`
    : height.duration;

  const rules = [
    `.cl-flow-root${BOOST} { transition-duration: ${heightDuration}; transition-timing-function: ${height.easing}; }`,
    `.cl-flow-root[data-initial]${BOOST} { transition-duration: 0s; }`,
    `.cl-flow-step${BOOST} { opacity: 1; transform: scale(1); filter: blur(0px); transition-property: opacity, transform, filter; transition-duration: ${time(c.inDur, c.slow)}; transition-delay: ${time(c.inDelay, c.slow)}; transition-timing-function: ${easing(c, c.inEase)}; }`,
    `.cl-flow-step[data-starting-style]${BOOST} { opacity: 0; transform: scale(${c.inScale}); filter: blur(${c.inBlur}px); }`,
    `.cl-flow-step[data-ending-style]${BOOST} { opacity: 0; transform: scale(${c.outScale}); filter: blur(${c.outBlur}px); transition-duration: ${time(c.outDur, c.slow)}; transition-delay: 0ms; transition-timing-function: ${easing(c, c.outEase)}; }`,
  ];

  if (c.heightAware) {
    rules.push(
      `.cl-flow-root[data-height-change] .cl-flow-step:not([data-ending-style])${BOOST} { transition-delay: calc(${time(c.growDelay, c.slow)} * var(--motion-p, 1)); }`,
    );
  }

  return rules;
}

function flowReducedRules(c: MotionConfig) {
  return [
    `.cl-flow-root${BOOST} { transition-property: none; }`,
    `.cl-flow-step${BOOST} { transition-property: opacity; transition-duration: ${time(150, c.slow)}; transition-delay: 0ms; }`,
    `.cl-flow-step[data-ending-style]${BOOST} { transition-duration: ${time(120, c.slow)}; }`,
    `.cl-flow-step[data-starting-style]${BOOST}, .cl-flow-step[data-ending-style]${BOOST} { transform: none; filter: none; }`,
    `.cl-flow-root[data-height-change] .cl-flow-step:not([data-ending-style])${BOOST} { transition-delay: 0ms; }`,
  ];
}

function dialogRules(c: MotionConfig) {
  const popup = `.cl-dialog-popup[data-variant='card']`;
  return [
    `${popup}${BOOST} { filter: blur(0px); transition-property: opacity, transform, filter; transition-duration: ${time(c.mDur, c.slow)}; transition-timing-function: ${easing(c, c.mEase)}; }`,
    `${popup}[data-starting-style]${BOOST} { opacity: 0; transform: scale(${c.mScale}); filter: blur(${c.mBlur}px); }`,
    `${popup}[data-ending-style]${BOOST} { opacity: 0; transform: scale(${c.mScale}); filter: blur(${c.mBlur}px); transition-duration: ${time(c.mExit, c.slow)}; transition-timing-function: ${EASES.exit.value}; }`,
  ];
}

function dialogReducedRules(c: MotionConfig) {
  const popup = `.cl-dialog-popup[data-variant='card']`;
  return [
    `${popup}${BOOST} { transition-property: opacity; transition-duration: ${time(150, c.slow)}; }`,
    `${popup}[data-starting-style]${BOOST}, ${popup}[data-ending-style]${BOOST} { transform: none; filter: none; }`,
  ];
}

export function buildMotionCss(c: MotionConfig) {
  const reduced = [...flowReducedRules(c), ...dialogReducedRules(c)].join('\n');
  const base = [...flowRules(c), ...dialogRules(c)].join('\n');
  return c.reduced ? `${base}\n${reduced}` : `${base}\n@media (prefers-reduced-motion: reduce) {\n${reduced}\n}`;
}

type NumberControl = {
  kind: 'range';
  key: keyof MotionConfig;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  hint?: string;
  when?: (c: MotionConfig) => boolean;
};

type SelectControl = {
  kind: 'select';
  key: keyof MotionConfig;
  label: string;
  options: { value: string; label: string }[];
  when?: (c: MotionConfig) => boolean;
};

type CheckControl = { kind: 'check'; key: keyof MotionConfig; label: string; hint?: string };

export type MotionControl = NumberControl | SelectControl | CheckControl;

const easeOptions = EASE_KEYS.map(key => ({
  value: key,
  label: key === 'spring' ? 'spring (same curve as the height)' : EASES[key].label,
}));

export const CONTROL_GROUPS: { title: string; note?: string; controls: MotionControl[] }[] = [
  {
    title: 'Height morph',
    controls: [
      {
        kind: 'select',
        key: 'hMode',
        label: 'Mode',
        options: [
          { value: 'ease', label: 'Ease' },
          { value: 'spring', label: 'Spring' },
        ],
      },
      {
        kind: 'range',
        key: 'hDur',
        label: 'Duration',
        min: 0,
        max: 800,
        step: 10,
        unit: 'ms',
        when: c => c.hMode === 'ease',
      },
      { kind: 'select', key: 'hEase', label: 'Easing', options: easeOptions, when: c => c.hMode === 'ease' },
      {
        kind: 'range',
        key: 'springDur',
        label: 'Spring dur',
        min: 0.15,
        max: 1.2,
        step: 0.01,
        unit: 's',
        when: c => c.hMode === 'spring',
      },
      {
        kind: 'range',
        key: 'bounce',
        label: 'Bounce',
        min: 0,
        max: 0.4,
        step: 0.01,
        unit: '',
        when: c => c.hMode === 'spring',
      },
    ],
  },
  {
    title: 'Outgoing content',
    controls: [
      { kind: 'range', key: 'outDur', label: 'Duration', min: 0, max: 500, step: 5, unit: 'ms' },
      { kind: 'range', key: 'outScale', label: 'Scale', min: 0.8, max: 1.1, step: 0.005, unit: '' },
      { kind: 'range', key: 'outBlur', label: 'Blur', min: 0, max: 20, step: 0.5, unit: 'px' },
      { kind: 'select', key: 'outEase', label: 'Easing', options: easeOptions },
    ],
  },
  {
    title: 'Incoming content',
    controls: [
      { kind: 'range', key: 'inDur', label: 'Duration', min: 0, max: 600, step: 5, unit: 'ms' },
      { kind: 'range', key: 'inDelay', label: 'Delay', min: 0, max: 400, step: 5, unit: 'ms' },
      { kind: 'range', key: 'inScale', label: 'Scale', min: 0.8, max: 1.1, step: 0.005, unit: '' },
      { kind: 'range', key: 'inBlur', label: 'Blur', min: 0, max: 20, step: 0.5, unit: 'px' },
      { kind: 'select', key: 'inEase', label: 'Easing', options: easeOptions },
    ],
  },
  {
    title: 'Dialog open / close',
    controls: [
      { kind: 'range', key: 'mScale', label: 'Scale', min: 0.8, max: 1, step: 0.005, unit: '' },
      { kind: 'range', key: 'mBlur', label: 'Blur', min: 0, max: 20, step: 0.5, unit: 'px' },
      { kind: 'range', key: 'mDur', label: 'Enter', min: 0, max: 600, step: 10, unit: 'ms' },
      { kind: 'range', key: 'mExit', label: 'Exit', min: 0, max: 400, step: 10, unit: 'ms' },
      { kind: 'select', key: 'mEase', label: 'Easing', options: easeOptions },
    ],
  },
  {
    title: 'Height-aware timing',
    note: "This is the one part that uses JavaScript. CSS can't read how far the height changed, so a small script sets one CSS variable (--motion-p) and retimes the running height animation. Everything else on this page is plain CSS. Turn the switch off to see the CSS-only result.",
    controls: [
      {
        kind: 'check',
        key: 'heightAware',
        label: 'Height-aware timing',
        hint: 'Scales the height animation and the grow wait by how much the height changes. Turn it off to see every step use the same full timing.',
      },
      {
        kind: 'range',
        key: 'growDelay',
        label: 'Content delay (grow and shrink)',
        hint: 'How long the incoming content waits while the card resizes, whether it grows or shrinks. The wait scales down for small height changes.',
        min: 0,
        max: 400,
        step: 5,
        unit: 'ms',
      },
      {
        kind: 'range',
        key: 'fullAt',
        label: 'Full size at',
        hint: 'The height change, in pixels, at which the full timing applies. Smaller changes are scaled down toward the shortest length.',
        min: 60,
        max: 500,
        step: 10,
        unit: 'px',
      },
      {
        kind: 'range',
        key: 'minScale',
        label: 'Shortest length',
        hint: 'How short the height animation and the grow wait get for a tiny change, as a fraction of their normal length.',
        min: 0.3,
        max: 1,
        step: 0.05,
        unit: '×',
      },
    ],
  },
  {
    title: 'Playback',
    controls: [
      {
        kind: 'select',
        key: 'slow',
        label: 'Speed',
        options: [
          { value: '1', label: '1×' },
          { value: '0.5', label: '0.5×' },
          { value: '0.25', label: '0.25×' },
          { value: '0.1', label: '0.1×' },
        ],
      },
      { kind: 'check', key: 'reduced', label: 'Reduced motion' },
    ],
  },
];
