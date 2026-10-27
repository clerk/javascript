import * as stylex from '@stylexjs/stylex';

import { spacingVars } from '../../tokens.stylex';

const step = (multiple: number) => `calc(${spacingVars['--cl-spacing']} * ${multiple})`;

const cutout = `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2 2'><circle cx='1' cy='1' r='1'/></svg>")`;

const cutoutEdge = 'calc(-1 * (var(--_cl-avatar-badge-offset) + var(--_cl-avatar-badge-gap)))';

const cutoutSize = 'calc(var(--_cl-avatar-badge-size) + var(--_cl-avatar-badge-gap) * 2)';

const leadSize = 'calc(100% - var(--_cl-avatar-inset))';

const badgeInset = 'calc(var(--_cl-avatar-inset) - var(--_cl-avatar-badge-offset))';

const size = (root: number, inset: number, badge: number, offset: number) => ({
  height: step(root),
  width: step(root),
  '--_cl-avatar-inset': step(inset),
  '--_cl-avatar-badge-size': `var(--cl-avatar-badge-size, ${step(badge)})`,
  '--_cl-avatar-badge-offset': `var(--cl-avatar-badge-offset, ${step(offset)})`,
});

export const styles = stylex.create({
  root: {
    '--_cl-avatar-badge-gap': 'var(--cl-avatar-badge-gap, 1px)',
    alignItems: 'flex-start',
    containerType: 'size',
    display: 'inline-flex',
    flexShrink: 0,
    position: 'relative',
  },

  lead: {
    fontSize: 'calc((100cqi - var(--_cl-avatar-inset)) * 0.4)',
    maskComposite: 'exclude',
    maskImage: `linear-gradient(#000 0 0), ${cutout}`,
    maskPosition: {
      default: `0 0, right ${cutoutEdge} bottom ${cutoutEdge}`,
      ':is([dir="rtl"] *)': `0 0, left ${cutoutEdge} bottom ${cutoutEdge}`,
    },
    maskRepeat: 'no-repeat',
    maskSize: `100% 100%, ${cutoutSize} ${cutoutSize}`,
    height: leadSize,
    width: leadSize,
  },

  badge: {
    display: 'flex',
    insetBlockEnd: badgeInset,
    insetInlineEnd: badgeInset,
    position: 'absolute',
  },

  badgeAvatar: {
    fontSize: 'calc(var(--_cl-avatar-badge-size) * 0.4)',
    height: 'var(--_cl-avatar-badge-size)',
    width: 'var(--_cl-avatar-badge-size)',
  },
});

export const sizes = stylex.create({
  sm: size(8, 0, 3.5, 0.5),
  md: size(10.5, 1, 4, 1),
});
