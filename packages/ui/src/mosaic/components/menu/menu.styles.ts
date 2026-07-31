import * as stylex from '@stylexjs/stylex';

import { colorVars, fontWeightVars, radiusVars, space, typeScaleVars } from '../../tokens.stylex';

export const styles = stylex.create({
  // Positioning is applied inline by the headless positioner; this only clears the
  // focus outline it receives. No z-index: the portalled, fixed positioner already
  // paints above page content, and consumers own their own stacking order.
  positioner: {
    outline: 'none',
  },

  popup: {
    borderRadius: radiusVars['--cl-radius-lg'],
    gap: space['0.5'],
    outline: 'none',
    paddingBlock: space['0.5'],
    paddingInline: space['0.5'],
    backgroundColor: colorVars['--cl-color-card'],
    boxShadow: `0 12px 12px -7px oklch(0.2046 0 0 / 12%),
                0 24px 24px -10px oklch(0.2046 0 0 / 4%),
                0 0 0 1px oklch(0.2046 0 0 / 4%)`,
    boxSizing: 'border-box',
    color: colorVars['--cl-color-card-foreground'],
    display: 'flex',
    flexDirection: 'column',
    opacity: {
      default: 1,
      ':is([data-ending-style])': 0,
      ':is([data-starting-style])': 0,
    },
    scale: {
      default: 1,
      ':is([data-ending-style])': 0.96,
      ':is([data-starting-style])': 0.96,
    },
    // `--cl-transform-origin` is set on the positioner by the headless `cssVars`
    // middleware, so the popup scales out of the edge nearest its trigger.
    transformOrigin: 'var(--cl-transform-origin)',
    transitionDuration: {
      default: '150ms',
      '@media (prefers-reduced-motion: reduce)': '0.01ms',
    },
    transitionProperty: 'opacity, scale',
    transitionTimingFunction: 'ease-out',
    maxHeight: 'var(--cl-available-height)',
    minWidth: '12.5rem',
    overflowY: 'auto',
  },

  item: {
    borderRadius: '0.375rem',
    borderStyle: 'none',
    gap: space['1'],
    outline: 'none',
    paddingBlock: space['1'],
    paddingInline: space['2'],
    alignItems: 'center',
    backgroundColor: {
      default: 'transparent',
      ':is([data-active])': `color-mix(in oklab, ${colorVars['--cl-color-neutral']} 4%, transparent)`,
      '@media (hover: hover)': {
        ':hover': `color-mix(in oklab, ${colorVars['--cl-color-neutral']} 4%, transparent)`,
      },
    },
    boxSizing: 'border-box',
    color: 'inherit',
    cursor: { default: 'pointer', ':is([data-disabled])': 'not-allowed' },
    display: 'flex',
    fontFamily: 'inherit',
    fontSize: typeScaleVars['--cl-text-sm-size'],
    fontWeight: fontWeightVars['--cl-font-medium'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    opacity: { default: 1, ':is([data-disabled])': 0.5 },
    position: 'relative',
    textAlign: 'start',
    transitionDuration: {
      default: '150ms',
      '@media (prefers-reduced-motion: reduce)': '0.01ms',
    },
    transitionProperty: 'background-color',
    height: space['7'],
    width: '100%',
    '::before': {
      insetBlock: `calc(-1 * ${space['0.5']})`,
      insetInline: `calc(-1 * ${space['0.5']})`,
      content: '""',
      position: 'absolute',
    },
  },

  itemNegative: {
    backgroundColor: {
      default: 'transparent',
      ':is([data-active])': `color-mix(in oklab, ${colorVars['--cl-color-negative']} 8%, transparent)`,
      '@media (hover: hover)': {
        ':hover': `color-mix(in oklab, ${colorVars['--cl-color-negative']} 8%, transparent)`,
      },
    },
    color: colorVars['--cl-color-negative'],
  },

  separator: {
    // Full-bleed across the popup: cancel the popup's inline padding.
    marginBlock: space['0.5'],
    marginInline: `calc(-1 * ${space['0.5']})`,
    backgroundColor: colorVars['--cl-color-border'],
    blockSize: '1px',
  },
});
