import * as stylex from '@stylexjs/stylex';

import { colorVars, focusVars, radiusVars, space, spacingVars } from '../../tokens.stylex';

const GAP_PX = 1;

const step = (multiple: number) => `calc(${spacingVars['--cl-spacing']} * ${multiple})`;

const cutout = `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2 2'><circle cx='1' cy='1' r='1'/></svg>")`;

const dimensions = (multiple: number) => ({
  height: step(multiple),
  width: step(multiple),
});

const square = (multiple: number) => ({
  ...dimensions(multiple),
  fontSize: `calc(${step(multiple)} * 0.4)`,
});

const cutoutOffset = (box: number, badgeSize: number) => `calc(${step(box - badgeSize)} - ${GAP_PX}px)`;

const cutoutSize = (badgeSize: number) => `calc(${step(badgeSize)} + ${GAP_PX * 2}px)`;

const lead = (box: number, badgeSize: number) => ({
  ...square(box - 1),
  maskImage: `linear-gradient(#000 0 0), ${cutout}`,
  maskPosition: {
    default: `0 0, ${cutoutOffset(box, badgeSize)} ${cutoutOffset(box, badgeSize)}`,
    ':is([dir="rtl"] *)': `0 0, right ${cutoutOffset(box, badgeSize)} top ${cutoutOffset(box, badgeSize)}`,
  },
  maskSize: `100% 100%, ${cutoutSize(badgeSize)} ${cutoutSize(badgeSize)}`,
});

export const styles = stylex.create({
  root: {
    alignItems: 'flex-start',
    display: 'inline-flex',
    flexShrink: 0,
    position: 'relative',
  },

  labelled: {
    transform: `translateY(${step(0.5)})`,
  },

  lead: {
    maskComposite: 'exclude',
    maskRepeat: 'no-repeat',
  },

  ring: {
    borderRadius: radiusVars['--cl-radius-md'],
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
    insetBlockEnd: 0,
    insetInlineEnd: 0,
    position: 'absolute',
  },
});

export const sizes = stylex.create({
  sm: { height: space['8'], width: space['8'] },
  md: { height: space['9.5'], width: space['9.5'] },
});

export const leadSizes = stylex.create({
  sm: lead(8, 3.5),
  md: lead(9.5, 4),
});

export const ringSizes = stylex.create({
  sm: dimensions(7),
  md: dimensions(8.5),
});

export const badgeSizes = stylex.create({
  sm: square(3.5),
  md: square(4),
});
