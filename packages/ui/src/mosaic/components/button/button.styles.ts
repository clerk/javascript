import * as stylex from '@stylexjs/stylex';

import { colorVars, radiusVars, sizeVars, spacingVars, typeScaleVars } from '../../tokens.stylex';

export const styles = stylex.create({
  base: {
    borderColor: 'transparent',
    borderRadius: radiusVars['--cl-radius-element'],
    borderStyle: 'solid',
    borderWidth: '1px',
    gap: spacingVars['--cl-spacing-2'],
    outline: {
      default: 'none',
      ':focus-visible': `2px solid color-mix(in oklab, ${colorVars['--cl-color-primary']} 50%, transparent)`,
    },
    alignItems: 'center',
    boxSizing: 'border-box',
    cursor: 'pointer',
    display: 'inline-flex',
    fontFamily: 'inherit',
    fontWeight: typeScaleVars['--cl-text-label-weight'],
    justifyContent: 'center',
    outlineOffset: '2px',
    transitionDuration: '150ms',
    transitionProperty: 'background-color, border-color, color, opacity',
  },

  // intent × variant
  filledPrimary: {
    backgroundColor: {
      default: colorVars['--cl-color-primary'],
      ':hover': `color-mix(in oklab, ${colorVars['--cl-color-primary']}, ${colorVars['--cl-color-primary-foreground']} 12%)`,
      ':active': `color-mix(in oklab, ${colorVars['--cl-color-primary']}, ${colorVars['--cl-color-primary-foreground']} 24%)`,
    },
    color: colorVars['--cl-color-primary-foreground'],
  },
  filledDestructive: {
    backgroundColor: {
      default: colorVars['--cl-color-destructive'],
      ':hover': `color-mix(in oklab, ${colorVars['--cl-color-destructive']}, ${colorVars['--cl-color-destructive-foreground']} 12%)`,
      ':active': `color-mix(in oklab, ${colorVars['--cl-color-destructive']}, ${colorVars['--cl-color-destructive-foreground']} 24%)`,
    },
    color: colorVars['--cl-color-destructive-foreground'],
  },
  outlinePrimary: {
    borderColor: colorVars['--cl-color-border'],
    backgroundColor: 'transparent',
    color: colorVars['--cl-color-primary'],
  },
  outlineDestructive: {
    borderColor: colorVars['--cl-color-border'],
    backgroundColor: 'transparent',
    color: colorVars['--cl-color-destructive'],
  },
  ghostPrimary: {
    backgroundColor: 'transparent',
    color: colorVars['--cl-color-primary'],
  },
  ghostDestructive: {
    backgroundColor: 'transparent',
    color: colorVars['--cl-color-destructive'],
  },

  // size — height-driven; padding sets only the inline axis
  sizeSm: {
    paddingInline: spacingVars['--cl-spacing-2'],
    fontSize: typeScaleVars['--cl-text-label-sm-size'],
    lineHeight: typeScaleVars['--cl-text-label-sm-leading'],
    height: sizeVars['--cl-size-element-sm'],
  },
  sizeMd: {
    paddingInline: spacingVars['--cl-spacing-3'],
    fontSize: typeScaleVars['--cl-text-label-size'],
    lineHeight: typeScaleVars['--cl-text-label-leading'],
    height: sizeVars['--cl-size-element-md'],
  },

  // shape — icon buttons zero their inline padding; width tracks the height
  shapeSquare: {
    borderRadius: radiusVars['--cl-radius-element'],
    paddingInline: 0,
  },
  shapeCircle: {
    borderRadius: radiusVars['--cl-radius-full'],
    paddingInline: 0,
  },
  iconSizeSm: { width: sizeVars['--cl-size-element-sm'] },
  iconSizeMd: { width: sizeVars['--cl-size-element-md'] },

  // state / modifiers
  fullWidth: { width: '100%' },
  disabled: { cursor: 'not-allowed', opacity: 0.5, pointerEvents: 'none' },
});
