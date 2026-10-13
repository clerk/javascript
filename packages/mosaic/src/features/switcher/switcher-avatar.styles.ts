import * as stylex from '@stylexjs/stylex';

import { space, spacingVars } from '../../tokens.stylex';

const GAP_PX = 1;

const step = (multiple: number) => `calc(${spacingVars['--cl-spacing']} * ${multiple})`;

const cutout = `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2 2'><circle cx='1' cy='1' r='1'/></svg>")`;

const square = (multiple: number) => ({
  height: step(multiple),
  width: step(multiple),
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

const BOX = 10.5;
const BADGE = 4;

export const styles = stylex.create({
  root: {
    alignItems: 'flex-start',
    display: 'inline-flex',
    flexShrink: 0,
    position: 'relative',
    height: space['10.5'],
    width: space['10.5'],
  },

  lead: {
    ...lead(BOX, BADGE),
    maskComposite: 'exclude',
    maskRepeat: 'no-repeat',
  },

  badge: {
    display: 'flex',
    insetBlockEnd: 0,
    insetInlineEnd: 0,
    position: 'absolute',
  },

  badgeAvatar: square(BADGE),
});
