import * as stylex from '@stylexjs/stylex';

import { spacingVars } from '../../tokens.stylex';

const step = (multiple: number) => `calc(${spacingVars['--cl-spacing']} * ${multiple})`;

const gap = 'var(--cl-avatar-badge-gap, 1px)';

const badgeSize = (multiple: number) => `var(--cl-avatar-badge-size, ${step(multiple)})`;

const badgeOffset = (multiple: number) => `var(--cl-avatar-badge-offset, ${step(multiple)})`;

const cutout = `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2 2'><circle cx='1' cy='1' r='1'/></svg>")`;

const dimensions = (multiple: number) => ({
  height: step(multiple),
  width: step(multiple),
});

const cutoutEdge = (offset: number) => `calc(-1 * (${badgeOffset(offset)} + ${gap}))`;

const cutoutSize = (badge: number) => `calc(${badgeSize(badge)} + ${gap} * 2)`;

const lead = (inset: number, badge: number, offset: number) => ({
  fontSize: `calc((100cqi - ${step(inset)}) * 0.4)`,
  height: `calc(100% - ${step(inset)})`,
  width: `calc(100% - ${step(inset)})`,
  maskPosition: {
    default: `0 0, right ${cutoutEdge(offset)} bottom ${cutoutEdge(offset)}`,
    ':is([dir="rtl"] *)': `0 0, left ${cutoutEdge(offset)} bottom ${cutoutEdge(offset)}`,
  },
  maskSize: `100% 100%, ${cutoutSize(badge)} ${cutoutSize(badge)}`,
});

const badgeInset = (inset: number, offset: number) => ({
  insetBlockEnd: `calc(${step(inset)} - ${badgeOffset(offset)})`,
  insetInlineEnd: `calc(${step(inset)} - ${badgeOffset(offset)})`,
});

const badgeDimensions = (badge: number) => ({
  fontSize: `calc(${badgeSize(badge)} * 0.4)`,
  height: badgeSize(badge),
  width: badgeSize(badge),
});

export const styles = stylex.create({
  root: {
    alignItems: 'flex-start',
    containerType: 'size',
    display: 'inline-flex',
    flexShrink: 0,
    position: 'relative',
  },

  lead: {
    maskComposite: 'exclude',
    maskImage: `linear-gradient(#000 0 0), ${cutout}`,
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
  sm: lead(0, 3.5, 0.5),
  md: lead(1, 4, 1),
});

export const badgeInsets = stylex.create({
  sm: badgeInset(0, 0.5),
  md: badgeInset(1, 1),
});

export const badgeSizes = stylex.create({
  sm: badgeDimensions(3.5),
  md: badgeDimensions(4),
});
