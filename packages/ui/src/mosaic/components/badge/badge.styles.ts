import * as stylex from '@stylexjs/stylex';

import { colorVars, radiusVars, space, typeScaleVars } from '../../tokens.stylex';

// Every intent is the same recipe applied to one token: the token itself is the
// text color, a 12% mix is the fill and a 24% mix the border. Mixing toward
// `transparent` rather than a surface token keeps the badge legible on any
// background it's dropped onto.
export const styles = stylex.create({
  base: {
    borderRadius: radiusVars['--cl-radius-inner'],
    borderStyle: 'solid',
    borderWidth: '1px',
    gap: space['1'],
    paddingInline: space['1.5'],
    alignItems: 'center',
    boxSizing: 'border-box',
    display: 'inline-flex',
    fontFamily: 'inherit',
    fontSize: typeScaleVars['--cl-text-label-sm-size'],
    fontWeight: typeScaleVars['--cl-text-label-sm-weight'],
    justifyContent: 'center',
    lineHeight: typeScaleVars['--cl-text-label-sm-leading'],
    whiteSpace: 'nowrap',
    height: space['5'],
  },

  primary: {
    borderColor: `color-mix(in oklab, ${colorVars['--cl-color-primary']} 24%, transparent)`,
    backgroundColor: `color-mix(in oklab, ${colorVars['--cl-color-primary']} 12%, transparent)`,
    color: colorVars['--cl-color-primary'],
  },
  secondary: {
    borderColor: `color-mix(in oklab, ${colorVars['--cl-color-muted-foreground']} 24%, transparent)`,
    backgroundColor: `color-mix(in oklab, ${colorVars['--cl-color-muted-foreground']} 12%, transparent)`,
    color: colorVars['--cl-color-muted-foreground'],
  },
  warning: {
    borderColor: `color-mix(in oklab, ${colorVars['--cl-color-warning']} 24%, transparent)`,
    backgroundColor: `color-mix(in oklab, ${colorVars['--cl-color-warning']} 12%, transparent)`,
    color: colorVars['--cl-color-warning'],
  },
  destructive: {
    borderColor: `color-mix(in oklab, ${colorVars['--cl-color-destructive']} 24%, transparent)`,
    backgroundColor: `color-mix(in oklab, ${colorVars['--cl-color-destructive']} 12%, transparent)`,
    color: colorVars['--cl-color-destructive'],
  },
  success: {
    borderColor: `color-mix(in oklab, ${colorVars['--cl-color-success']} 24%, transparent)`,
    backgroundColor: `color-mix(in oklab, ${colorVars['--cl-color-success']} 12%, transparent)`,
    color: colorVars['--cl-color-success'],
  },
});
