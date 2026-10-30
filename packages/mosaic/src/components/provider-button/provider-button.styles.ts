import * as stylex from '@stylexjs/stylex';

import { space } from '../../tokens.stylex';
import { inlineGroupScope } from './provider-button.markers.stylex';

const gap = space['2'];
const threeColumns = `0 0 calc((100% - 2 * ${gap}) / 3)`;
const fourColumns = `0 0 calc((100% - 3 * ${gap}) / 4)`;
const fiveColumns = `0 0 calc((100% - 4 * ${gap}) / 5)`;

const narrow = '@container (max-width: 20rem)' as const;

export const groupStyles = stylex.create({
  base: {
    gap,
    containerType: 'inline-size',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  stacked: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
  },
});

export const buttonStyles = stylex.create({
  root: {
    flex: {
      default: '1 1 0',
      // eslint-disable-next-line @stylexjs/valid-styles -- The rule rejects a computed key on a nested condition; the compiler accepts it and the browser test covers the output.
      [stylex.when.ancestor(':has(> :last-child:nth-child(2))', inlineGroupScope)]: {
        default: '1 1 0',
        [narrow]: '1 1 100%',
      },
      [stylex.when.ancestor(':has(> :last-child:nth-child(6))', inlineGroupScope)]: threeColumns,
      [stylex.when.ancestor(':has(> :last-child:nth-child(n+11):nth-child(-n+12))', inlineGroupScope)]: fourColumns,
      [stylex.when.ancestor(':has(> :last-child:nth-child(n+13))', inlineGroupScope)]: fiveColumns,
      [stylex.when.ancestor(':has(> :last-child:nth-child(n+7):nth-child(-n+8))', inlineGroupScope)]: fourColumns,
      [stylex.when.ancestor(':has(> :last-child:nth-child(n+9):nth-child(-n+10))', inlineGroupScope)]: fiveColumns,
    },
    position: 'relative',
    minWidth: 0,
  },
  rootPending: {
    opacity: 1,
    pointerEvents: 'none',
  },

  iconSlot: {
    placeItems: 'center',
    display: 'inline-grid',
    flexShrink: 0,
  },
  icon: {
    gridColumn: '1',
    gridRow: '1',
    display: 'inline-flex',
  },
  iconPending: {
    opacity: 0,
  },
  spinner: {
    gridColumn: '1',
    gridRow: '1',
  },
  spinnerHidden: {
    opacity: 0,
  },

  longLabel: {
    display: {
      default: 'block',
      [stylex.when.ancestor(':has(> :nth-child(2))', inlineGroupScope)]: 'none',
    },
    minWidth: 0,
  },
  shortLabel: {
    display: {
      default: 'none',
      [stylex.when.ancestor(':has(> :last-child:nth-child(2))', inlineGroupScope)]: 'block',
    },
    minWidth: 0,
  },
});
