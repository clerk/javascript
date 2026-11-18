import * as stylex from '@stylexjs/stylex';

import { colorVars, durationVars, fontWeightVars, radiusVars, space, typeScaleVars } from '../../tokens.stylex';

export const styles = stylex.create({
  trigger: {
    padding: 0,
    borderRadius: radiusVars['--cl-radius-md'],
    borderStyle: 'none',
    alignItems: 'center',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    display: 'inline-flex',
    transitionDuration: {
      default: durationVars['--cl-duration-base'],
      '@media (hover: hover)': {
        default: null,
        ':hover:not(:disabled, [data-disabled], [aria-disabled="true"])': durationVars['--cl-duration-instant'],
      },
    },
    transitionTimingFunction: 'linear',
    maxWidth: '100%',
    minWidth: 0,
  },

  triggerLabelled: {
    padding: space['1.5'],
    borderRadius: radiusVars['--cl-radius-xl'],
    gap: space['1.5'],
    backgroundColor: {
      default: 'transparent',
      ':is([data-open])': `color-mix(in oklab, ${colorVars['--cl-color-neutral']} 4%, transparent)`,
      '@media (hover: hover)': {
        ':hover:not(:disabled, [data-disabled], [aria-disabled="true"])': `color-mix(in oklab, ${colorVars['--cl-color-neutral']} 4%, transparent)`,
      },
    },
    transitionProperty: 'background-color',
  },

  triggerAvatarOnly: {
    opacity: {
      default: 1,
      ':is([data-open])': 0.8,
      '@media (hover: hover)': {
        ':hover:not(:disabled, [data-disabled], [aria-disabled="true"])': 0.8,
      },
    },
    transitionProperty: 'opacity',
  },

  triggerRound: {
    borderRadius: radiusVars['--cl-radius-full'],
  },

  // Capped, because the trigger sits in a host app's chrome and a long organization name would push it apart.
  triggerName: {
    color: colorVars['--cl-color-foreground'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    fontWeight: fontWeightVars['--cl-font-medium'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    maxWidth: '12rem',
  },

  triggerCaret: {
    '--_cl-icon-color': colorVars['--cl-color-foreground-secondary'],
    marginInline: space['1'],
  },
});
