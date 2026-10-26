import * as stylex from '@stylexjs/stylex';

import { spacingVars } from '../../tokens.stylex';

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

const cutoutOffset = (leadSize: number, badgeSize: number, overhang: number) =>
  `calc(${step(leadSize - badgeSize + overhang)} - ${GAP_PX}px)`;

const cutoutSize = (badgeSize: number) => `calc(${step(badgeSize)} + ${GAP_PX * 2}px)`;

const lead = (leadSize: number, badgeSize: number, overhang: number) => ({
  ...square(leadSize),
  maskImage: `linear-gradient(#000 0 0), ${cutout}`,
  maskPosition: {
    default: `0 0, ${cutoutOffset(leadSize, badgeSize, overhang)} ${cutoutOffset(leadSize, badgeSize, overhang)}`,
    ':is([dir="rtl"] *)': `0 0, right ${cutoutOffset(leadSize, badgeSize, overhang)} top ${cutoutOffset(leadSize, badgeSize, overhang)}`,
  },
  maskSize: `100% 100%, ${cutoutSize(badgeSize)} ${cutoutSize(badgeSize)}`,
});

const badgeInset = (rootSize: number, leadSize: number, overhang: number) => ({
  insetBlockEnd: step(rootSize - leadSize - overhang),
  insetInlineEnd: step(rootSize - leadSize - overhang),
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

  badge: {
    display: 'flex',
    position: 'absolute',
  },
});

export const rootSizes = stylex.create({
  sm: dimensions(8),
  md: dimensions(10.5),
});

export const leadSizes = stylex.create({
  sm: lead(8, 3.5, 0.5),
  md: lead(9.5, 4, 1),
});

export const badgeInsets = stylex.create({
  sm: badgeInset(8, 8, 0.5),
  md: badgeInset(10.5, 9.5, 1),
});

export const badgeSizes = stylex.create({
  sm: square(3.5),
  md: square(4),
});
