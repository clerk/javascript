import * as stylex from '@stylexjs/stylex';

import { space, typeScaleVars } from '../../tokens.stylex';

export const rootStyles = stylex.create({
  root: {
    gap: space['4'],
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    width: '100%',
  },
  height: (height: string) => ({ height }),
  // `Chart.Legend` renders here. Without one the host has no box, so the root's gap stays out.
  legendHost: {
    display: 'contents',
  },
  plotArea: {
    flexGrow: 1,
    position: 'relative',
    minHeight: 0,
  },
  plot: {
    fontSize: typeScaleVars['--cl-text-xs-size'],
    isolation: 'isolate',
  },
  overlay: {
    inset: 0,
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    position: 'absolute',
    zIndex: 2,
  },
  retry: {
    alignSelf: 'flex-start',
  },
});
