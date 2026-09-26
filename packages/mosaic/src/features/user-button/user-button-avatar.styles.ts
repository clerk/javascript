import * as stylex from '@stylexjs/stylex';

import { colorVars, focusVars, radiusVars, space, spacingVars } from '../../tokens.stylex';

const GAP_PX = 1;
const DEFAULT_SPACING_PX = 4;
const BADGE_RADIUS = 0.25;

const step = (multiple: number) => `calc(${spacingVars['--cl-spacing']} * ${multiple})`;

const cutoutPx = (frame: number) => frame * DEFAULT_SPACING_PX;

const cutout = (frame: number) =>
  `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${cutoutPx(frame)} ${cutoutPx(frame)}'><rect width='${cutoutPx(frame)}' height='${cutoutPx(frame)}' rx='${(cutoutPx(frame) - GAP_PX * 2) * BADGE_RADIUS + GAP_PX}'/></svg>")`;

const square = (multiple: number) => ({
  fontSize: `calc(${step(multiple)} * 0.4)`,
  height: step(multiple),
  width: step(multiple),
});

const lead = (box: number, frame: number) => ({
  ...square(box - 1),
  maskImage: `linear-gradient(#000 0 0), ${cutout(frame)}`,
  maskPosition: {
    default: `0 0, ${step(box - frame)} ${step(box - frame)}`,
    ':is([dir="rtl"] *)': `0 0, right ${step(box - frame)} top ${step(box - frame)}`,
  },
  maskSize: `100% 100%, ${step(frame)} ${step(frame)}`,
});

const ring = (box: number) => ({
  height: step(box - 1),
  width: step(box - 1),
});

const badge = (frame: number) => ({
  '--_cl-avatar-radius': `${BADGE_RADIUS * 100}%`,
  fontSize: `calc((${step(frame)} - ${GAP_PX * 2}px) * 0.4)`,
  height: `calc(${step(frame)} - ${GAP_PX * 2}px)`,
  width: `calc(${step(frame)} - ${GAP_PX * 2}px)`,
});

export const styles = stylex.create({
  root: {
    alignItems: 'flex-start',
    display: 'inline-flex',
    flexShrink: 0,
    position: 'relative',
  },

  lead: {
    maskComposite: 'exclude',
    maskRepeat: 'no-repeat',
  },

  ring: {
    borderRadius: radiusVars['--cl-radius-full'],
    insetBlockStart: 0,
    insetInlineStart: 0,
    outlineColor: { default: null, ':is(:focus-visible *)': colorVars['--cl-color-ring'] },
    outlineOffset: { default: null, ':is(:focus-visible *)': focusVars['--cl-focus-outline-offset'] },
    outlineStyle: { default: null, ':is(:focus-visible *)': focusVars['--cl-focus-outline-style'] },
    outlineWidth: { default: null, ':is(:focus-visible *)': focusVars['--cl-focus-outline-width'] },
    pointerEvents: 'none',
    position: 'absolute',
  },

  badge: {
    display: 'flex',
    insetBlockEnd: `${GAP_PX}px`,
    insetInlineEnd: `${GAP_PX}px`,
    position: 'absolute',
  },
});

export const sizes = stylex.create({
  xs: { height: space['6'], width: space['6'] },
  sm: { height: space['8'], width: space['8'] },
});

export const leadSizes = stylex.create({
  xs: lead(6, 3),
  sm: lead(8, 3.5),
});

export const ringSizes = stylex.create({
  xs: ring(6),
  sm: ring(8),
});

export const badgeSizes = stylex.create({
  xs: badge(3),
  sm: badge(3.5),
});
