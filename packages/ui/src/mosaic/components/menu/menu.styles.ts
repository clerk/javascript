import * as stylex from '@stylexjs/stylex';

import { colorVars, radiusVars, space, targetVars } from '../../tokens.stylex';

// Unlike the popover, a menu's popup *is* its surface — there is no inner card to
// paint the chrome, so the popup owns background, border, radius and shadow. Width
// is intrinsic (menus size to their longest label) with a floor, rather than the
// popover's fixed size scale.
export const popup = stylex.create({
  base: {
    padding: space['1'],
    borderColor: colorVars['--cl-color-border'],
    borderRadius: radiusVars['--cl-radius-container'],
    borderStyle: 'solid',
    borderWidth: '1px',
    backgroundColor: colorVars['--cl-color-card'],
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)',
    color: colorVars['--cl-color-card-foreground'],
    minWidth: '12rem',
    overflowY: 'auto',
  },
});

const hoverBackground = `color-mix(in oklab, ${colorVars['--cl-color-neutral']} 4%, transparent)`;
const pressedBackground = `color-mix(in oklab, ${colorVars['--cl-color-neutral']} 8%, transparent)`;

// Rows reuse `item.styles.ts` for geometry and typography; only the background
// belongs here, because a menu row highlights on `data-active` (the roving-focus
// position the primitive moves with the arrow keys) as well as on hover. StyleX
// merges by property, so a single `backgroundColor` declaration has to cover every
// state — splitting it across two style objects would drop whichever lost.
export const item = stylex.create({
  base: {
    backgroundColor: {
      default: null,
      ':where([data-active])': hoverBackground,
      ':active': pressedBackground,
      '@media (hover: hover)': { ':hover:not(:active)': hoverBackground },
    },
    cursor: 'pointer',
    // A row is a control, so its hit area takes the coarse-pointer floor even though
    // the row itself is deliberately compact.
    minHeight: { default: null, '@media (pointer: coarse)': targetVars['--cl-target-coarse'] },
  },
  disabled: {
    backgroundColor: null,
    cursor: 'default',
    opacity: 0.5,
  },
});

// A nested submenu's trigger is a row like any other, but it never receives
// `data-active` — the primitive only maps `open` on a trigger. It stays highlighted
// while its submenu is open instead, so `data-open` joins the same declaration.
export const subTrigger = stylex.create({
  base: {
    backgroundColor: {
      default: null,
      ':where([data-active], [data-open])': hoverBackground,
      ':active': pressedBackground,
      '@media (hover: hover)': { ':hover:not(:active)': hoverBackground },
    },
    cursor: 'pointer',
  },
});

export const separator = stylex.create({
  base: {
    borderStyle: 'none',
    marginBlock: space['1'],
    marginInline: `calc(${space['1']} * -1)`,
    backgroundColor: colorVars['--cl-color-border-faded'],
    blockSize: '1px',
    flexShrink: 0,
  },
});
