import * as stylex from '@stylexjs/stylex';

import { colorVars, durationVars, fontWeightVars, radiusVars, space, typeScaleVars } from '../../tokens.stylex';

export const styles = stylex.create({
  accountIdentifier: {
    fontWeight: fontWeightVars['--cl-font-medium'],
  },
  rowAvatar: {
    '--_cl-avatar-radius': radiusVars['--cl-radius-sm'],
    fontSize: '0.5rem',
    height: space['5'],
    width: space['5'],
  },
  workspaceAvatar: {
    display: 'inline-grid',
    gridTemplateColumns: `auto ${space['0.5']}`,
    gridTemplateRows: `auto ${space['0.5']}`,
  },
  workspaceAvatarLead: {
    gridColumnStart: '1',
    gridRowStart: '1',
  },
  workspaceAvatarLeadMd: {
    height: space['7.5'],
    width: space['7.5'],
  },
  nestedAvatar: {
    borderRadius: '2px',
    alignSelf: 'end',
    gridColumnEnd: '-1',
    gridColumnStart: '1',
    gridRowEnd: '-1',
    gridRowStart: '1',
    justifySelf: 'end',
  },
  nestedAvatarSm: {
    fontSize: '0.3125rem',
    height: space['2.5'],
    width: space['2.5'],
  },
  nestedAvatarMd: {
    fontSize: '0.375rem',
    height: space['3.5'],
    width: space['3.5'],
  },
  trigger: {
    padding: 0,
    borderRadius: radiusVars['--cl-radius-md'],
    borderStyle: 'none',
    alignItems: 'center',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    display: 'inline-flex',
    transitionDuration: durationVars['--cl-duration-base'],
  },

  triggerLabelled: {
    padding: space['1'],
    gap: space['1.5'],
    backgroundColor: {
      default: 'transparent',
      ':is([data-open])': `color-mix(in oklab, ${colorVars['--cl-color-neutral']} 4%, transparent)`,
      '@media (hover: hover)': {
        ':hover': `color-mix(in oklab, ${colorVars['--cl-color-neutral']} 4%, transparent)`,
      },
    },
    transitionProperty: 'background-color',
  },

  triggerAvatarOnly: {
    opacity: {
      default: 1,
      ':is([data-open])': 0.8,
      '@media (hover: hover)': {
        ':hover': 0.8,
      },
    },
    transitionProperty: 'opacity',
  },

  triggerRound: {
    borderRadius: radiusVars['--cl-radius-full'],
  },

  // Matches `Item.Label`, so the trigger names a workspace the same way its row does. Capped,
  // because the trigger sits in a host app's chrome and a long workspace name would push it apart.
  triggerName: {
    color: colorVars['--cl-color-foreground'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    fontWeight: fontWeightVars['--cl-font-medium'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    maxWidth: '12rem',
  },

  triggerCaret: {
    '--_cl-icon-color': colorVars['--cl-color-foreground-secondary'],
    marginInlineEnd: space['1'],
  },

  // The workspace list scrolls; the header and footer stay put. The scroll area carries the
  // overflow, the edge fades, the scrollbar and the scroll padding they need, so only the cap
  // is ours.
  scroll: {
    maxHeight: '18rem',
  },

  // The trailing column is as wide as the `⋯` menu button that owns it, so whatever stands in
  // that button's place — the active check, a spinner — lands on the same centre line and the
  // right edge of every row holds still as rows change state.
  trailing: {
    justifyContent: 'center',
    width: space['7'],
  },
});
