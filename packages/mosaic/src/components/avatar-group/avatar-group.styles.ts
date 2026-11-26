import * as stylex from '@stylexjs/stylex';

import { colorVars, fontFamilyVars, fontWeightVars, space } from '../../tokens.stylex';

const size = 'var(--_cl-avatar-group-size)';
const overlap = 'var(--_cl-avatar-group-overlap)';
const gap = 'var(--_cl-avatar-group-gap)';
const radius = 'var(--_cl-avatar-group-radius)';

const cutoutRadius = `(${radius} + ${gap})`;
const cutoutDiameter = `calc(2 * ${cutoutRadius})`;
const cutoutStart = `calc(${size} - ${overlap} - ${gap})`;
const cutoutTop = `calc(-1 * ${gap})`;
const cutoutBottomCorner = `calc(${size} + ${gap} - 2 * ${cutoutRadius})`;
const cutoutColumn = `calc(${cutoutStart} + ${cutoutRadius})`;

const disc = 'radial-gradient(closest-side, #000 calc(100% - 0.5px), transparent)';
const fill = 'linear-gradient(#000 0 0)';

const ltrPosition = `left 0px top 0px, left ${cutoutStart} top ${cutoutTop}, left ${cutoutStart} top ${cutoutBottomCorner}, left ${cutoutColumn} top ${cutoutTop}, left ${cutoutStart} top ${radius}`;
const ltrCenter = `left ${cutoutColumn} top 50%`;
const rtlCenter = `right ${cutoutColumn} top 50%`;
const rtlPosition = `right 0px top 0px, right ${cutoutStart} top ${cutoutTop}, right ${cutoutStart} top ${cutoutBottomCorner}, right ${cutoutColumn} top ${cutoutTop}, right ${cutoutStart} top ${radius}`;

const shapeSupport = '@supports (clip-path: shape(from 0 0, line to 0 0))' as const;

const cutoutBottom = `calc(100% + ${gap})`;
const cutoutCornerTop = `calc(${cutoutTop} + ${cutoutRadius})`;
const cutoutCornerBottom = `calc(${cutoutBottom} - ${cutoutRadius})`;
const cutoutArc = `calc(${cutoutRadius})`;
const outerShape = 'shape(evenodd from 0 0, hline to 100%, vline to 100%, hline to 0, close';
const ltrShape = `${outerShape}, move to ${cutoutBottom} ${cutoutTop}, hline to ${cutoutColumn}, arc to ${cutoutStart} ${cutoutCornerTop} of ${cutoutArc} ccw, vline to ${cutoutCornerBottom}, arc to ${cutoutColumn} ${cutoutBottom} of ${cutoutArc} ccw, hline to ${cutoutBottom}, close)`;
const rtlShape = `${outerShape}, move to ${cutoutTop} ${cutoutTop}, hline to calc(100% - ${cutoutColumn}), arc to calc(100% - ${cutoutStart}) ${cutoutCornerTop} of ${cutoutArc} cw, vline to ${cutoutCornerBottom}, arc to calc(100% - ${cutoutColumn}) ${cutoutBottom} of ${cutoutArc} cw, hline to ${cutoutTop}, close)`;

export const styles = stylex.create({
  root: {
    '--_cl-avatar-group-gap': '2px',
    '--_cl-avatar-group-overlap': `calc(${size} * 0.25)`,
    alignItems: 'center',
    display: 'inline-flex',
    verticalAlign: 'middle',
  },

  item: {
    '--_cl-avatar-group-cutout-center': { default: ltrCenter, ':is([dir="rtl"] *)': rtlCenter },
    '--_cl-avatar-group-mask-position': { default: ltrPosition, ':is([dir="rtl"] *)': rtlPosition },
    marginInlineStart: { default: `calc(-1 * ${overlap})`, ':first-child': 0 },
  },

  overflow: {
    paddingInline: space['1.5'],
    alignItems: 'center',
    backgroundColor: colorVars['--cl-color-surface'],
    backgroundImage: `linear-gradient(${colorVars['--cl-color-neutral-alpha-200']}, ${colorVars['--cl-color-neutral-alpha-200']})`,
    boxSizing: 'border-box',
    color: colorVars['--cl-color-foreground-secondary'],
    display: 'inline-flex',
    flexShrink: 0,
    fontFamily: fontFamilyVars['--cl-font-family-sans'],
    fontVariantNumeric: 'tabular-nums',
    fontWeight: fontWeightVars['--cl-font-medium'],
    justifyContent: 'center',
    lineHeight: 1,
    position: 'relative',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    minWidth: size,
    width: 'auto',
  },
});

export const sizes = stylex.create({
  xs: { '--_cl-avatar-group-size': space['6'] },
  sm: { '--_cl-avatar-group-size': space['8'] },
  md: { '--_cl-avatar-group-size': space['10'] },
  lg: { '--_cl-avatar-group-size': space['12'] },
});

export const itemShapes = stylex.create({
  circle: {
    '--_cl-avatar-group-radius': `calc(${size} / 2)`,
    maskImage: {
      default: null,
      ':not(:last-child)': `radial-gradient(circle at var(--_cl-avatar-group-cutout-center), transparent calc(${cutoutRadius} - 0.5px), #000 calc(${cutoutRadius}))`,
    },
  },
  square: {
    '--_cl-avatar-group-cutout-shape': { default: ltrShape, ':is([dir="rtl"] *)': rtlShape },
    '--_cl-avatar-group-radius': 'var(--_cl-media-radius)',
    clipPath: {
      default: null,
      [shapeSupport]: { default: null, ':not(:last-child)': 'var(--_cl-avatar-group-cutout-shape)' },
    },
    // eslint-disable-next-line @stylexjs/valid-styles -- the rule only admits a single keyword; a per-layer list is valid CSS and compiles as written.
    maskComposite: { default: null, ':not(:last-child)': 'exclude, add, add, add, add' },
    maskImage: {
      default: null,
      [shapeSupport]: { default: null, ':not(:last-child)': 'none' },
      ':not(:last-child)': `${fill}, ${disc}, ${disc}, ${fill}, ${fill}`,
    },
    maskPosition: { default: null, ':not(:last-child)': 'var(--_cl-avatar-group-mask-position)' },
    maskRepeat: { default: null, ':not(:last-child)': 'no-repeat' },
    maskSize: {
      default: null,
      ':not(:last-child)': `100% 100%, ${cutoutDiameter} ${cutoutDiameter}, ${cutoutDiameter} ${cutoutDiameter}, ${size} calc(${size} + 2 * ${gap}), ${size} calc(${size} - 2 * ${radius})`,
    },
  },
});
