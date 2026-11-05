export type Swatch = {
  name: string;
  hex: string;
  role: string;
  note: string;
  on: 'light' | 'dark';
};
export const SWATCHES: Swatch[] = [
  {
    name: 'Ink',
    hex: '#050505',
    role: 'Page background in dark mode',
    note: '20.4:1 with white',
    on: 'light',
  },
  {
    name: 'Graphite',
    hex: '#0A0A0A',
    role: 'Surfaces, and the mark on light backgrounds',
    note: '20:1 with white',
    on: 'light',
  },
  {
    name: 'White',
    hex: '#FFFFFF',
    role: 'Primary text, the mark on dark, light-mode page',
    note: '20.4:1 on Ink',
    on: 'dark',
  },
  {
    name: 'Fog',
    hex: '#A3A3A3',
    role: 'Secondary text on dark',
    note: '8.1:1 on Ink',
    on: 'dark',
  },
  {
    name: 'Smoke',
    hex: '#6B6B6B',
    role: 'Labels and captions on light',
    note: '5.3:1 on White',
    on: 'light',
  },
  {
    name: 'Grout',
    hex: '#2E2E2E',
    role: 'Seams, dividers, hairline borders',
    note: 'Decorative only',
    on: 'light',
  },
  {
    name: 'Violet',
    hex: '#6C47FF',
    role: 'The accent. One moment per view',
    note: '5.3:1 on White · use Violet Light for text on dark',
    on: 'light',
  },
  {
    name: 'Violet Light',
    hex: '#8F74FF',
    role: 'Accent text and icons on dark',
    note: '5.9:1 on Ink',
    on: 'dark',
  },
];
export const PROPORTIONS = [
  { label: 'Ink / White', value: 88, color: '#FFFFFF' },
  { label: 'Greys', value: 10, color: '#6B6B6B' },
  { label: 'Violet', value: 2, color: '#6C47FF' },
];
export const TYPE_ROLES = [
  {
    role: 'Display & headings',
    family: 'Geist',
    cssVar: 'var(--font-heading)',
    spec: 'Semibold 600 · tracking -0.045em above 48px, -0.03em below',
    sample: 'Auth without limits',
    className: 'text-5xl font-semibold tracking-[-0.045em]',
  },
  {
    role: 'Body',
    family: 'Inter',
    cssVar: 'var(--font-sans)',
    spec: 'Regular 400 · 16–20px · line height 1.5',
    sample: 'Composable components, built for agents and made to be rearranged.',
    className: 'text-xl leading-8',
  },
  {
    role: 'Labels & code',
    family: 'Geist Mono',
    cssVar: 'var(--font-mono)',
    spec: 'Regular 400 · 11–12px · uppercase · tracking 0.08em',
    sample: 'AIO · PAGE · SECTION · BLOCK',
    className: 'text-sm tracking-[0.08em]',
  },
];
export const THEME_IDEAS = [
  {
    toolSlug: 'mosaic-shader',
    name: 'Pieces',
    mosaic: 'Tesserae',
    product: 'Components',
    body: 'A mosaic is thousands of small, simple pieces. Mosaic is the same: tiers of small parts, each one easy to understand, that add up to a whole surface.',
  },
  {
    toolSlug: 'hero-cell-trail',
    name: 'Grout',
    mosaic: 'The seams between tiles',
    product: 'Space & lines',
    body: 'Pieces are separated by consistent hairline gaps. Dashed grids and 1px seams are how the brand shows structure without adding weight.',
  },
  {
    toolSlug: 'drifting-squares',
    name: 'Rearrange',
    mosaic: 'Re-laying a pattern',
    product: 'Composability',
    body: 'The same tiles can form a different picture. Blocks, sections and pages can be swapped and reordered, by you or by an agent.',
  },
  {
    toolSlug: 'pixel-resolve',
    name: 'Resolve',
    mosaic: 'Coarse to fine',
    product: 'Progressive detail',
    body: 'A mosaic only makes sense from a distance. Our motion starts coarse and resolves, so a surface shows its shape first and its detail second.',
  },
];
export const VOICE_TRAITS = [
  {
    name: 'Plain',
    body: 'Say what a thing does, in the fewest words. If a sentence works without an adjective, drop the adjective.',
    do: 'Rearrange any block.',
    dont: 'Leverage our best-in-class composable paradigm.',
  },
  {
    name: 'Precise',
    body: "Use the product's own vocabulary and use it consistently: AIO, page, section, block, component, primitive.",
    do: 'Swap a block in the Security page.',
    dont: 'Tweak the little pieces of the account thing.',
  },
  {
    name: 'Quietly confident',
    body: 'State the benefit and stop. Mosaic puns are allowed, once per page, and only when they carry meaning.',
    do: 'Every piece fits.',
    dont: "Tile-ly awesome, you'll be grout-ing with excitement!",
  },
];
export const HEADLINES = [
  'Auth without limits.',
  'Built piece by piece.',
  'Every piece, yours.',
  'Layer by layer.',
  'Rearrange everything.',
];
export const WORD_LISTS = {
  use: ['piece', 'block', 'compose', 'rearrange', 'swap', 'yours', 'agent'],
  avoid: ['leverage', 'seamless', 'revolutionary', 'synergy', 'effortless', 'best-in-class'],
};
export const MOTION_PRINCIPLES = [
  {
    name: "Pieces move, they don't fade",
    body: 'Prefer translate, scale and rotate over opacity. Tiles slide, flip and settle; they rarely just appear.',
  },
  {
    name: 'Fast for touch, slow for ambient',
    body: 'Responses to the pointer land in under 250ms. Ambient loops run six seconds or longer.',
  },
  {
    name: 'Arrive with ease-out, settle with a spring',
    body: 'Things decelerate into place. Anything that snaps into a mosaic settles with a small overshoot.',
  },
  {
    name: 'Always honour reduced motion',
    body: 'With reduced motion on, drift, tilt and bob stop. Hover states still change, instantly.',
  },
];
export const LOGO_RULES = {
  do: [
    'Use Graphite on light and White on dark.',
    'Keep clearspace of one leg width (x) on every side.',
    'Use the mark alone below 120px of lockup width.',
    'Show the five pieces separately only in motion.',
  ],
  dont: [
    "Don't recolour the mark with gradients or the accent.",
    "Don't rotate, skew or outline the mark.",
    "Don't add joins or gaps between the pieces.",
    "Don't set the wordmark in another typeface.",
  ],
};
