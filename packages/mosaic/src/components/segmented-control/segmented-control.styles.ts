import * as stylex from '@stylexjs/stylex';

import {
  colorVars,
  durationVars,
  easingVars,
  fontFamilyVars,
  fontWeightVars,
  radiusVars,
  shadowVars,
  space,
  typeScaleVars,
} from '../../tokens.stylex';

const anchors = '@supports (anchor-scope: all) and (not (-moz-appearance: none))' as const;
const noAnchors = '@supports not ((anchor-scope: all) and (not (-moz-appearance: none)))' as const;
const reduceMotion = '@media (prefers-reduced-motion: reduce)' as const;
const activeAnchor = '--_cl-segmented-control-active';

const lead = durationVars['--cl-duration-slow'];
const trail = durationVars['--cl-duration-slower'];

const scaleIn = stylex.keyframes({
  from: { transform: 'scale(0.94)' },
  to: { transform: 'scale(1)' },
});

const surface = {
  borderRadius: radiusVars['--cl-radius-md'],
  backgroundColor: colorVars['--cl-color-background'],
  boxShadow: shadowVars['--cl-shadow-sm'],
} as const;

export const styles = stylex.create({
  root: {
    // eslint-disable-next-line @stylexjs/valid-styles -- `anchor-scope`: anchor positioning postdates StyleX's property allowlist; it compiles and emits correctly.
    anchorScope: activeAnchor,
    padding: space['0.5'],
    borderRadius: `calc(${radiusVars['--cl-radius-md']} + ${space['0.5']})`,
    alignItems: 'center',
    backgroundColor: colorVars['--cl-color-background-subtle'],
    display: 'inline-flex',
    isolation: 'isolate',
    position: 'relative',
  },
  indicator: {
    ...surface,
    // eslint-disable-next-line @stylexjs/valid-styles -- `position-anchor`: anchor positioning postdates StyleX's property allowlist; it compiles and emits correctly.
    positionAnchor: activeAnchor,
    display: {
      [anchors]: { default: 'none', ':has(~ [data-selected])': 'block' },
      default: 'none',
    },
    insetBlockEnd: 'anchor(end)',
    insetBlockStart: 'anchor(start)',
    insetInlineEnd: 'anchor(end)',
    insetInlineStart: 'anchor(start)',
    pointerEvents: 'none',
    position: 'absolute',
    transitionDuration: {
      default: `${trail}, ${lead}`,
      [reduceMotion]: {
        default: durationVars['--cl-duration-instant'],
        ':where([data-direction="backward"])': durationVars['--cl-duration-instant'],
      },
      ':where([data-direction="backward"])': `${lead}, ${trail}`,
    },
    transitionProperty: 'inset-inline-start, inset-inline-end',
    transitionTimingFunction: easingVars['--cl-ease-default'],
  },
  item: {
    // eslint-disable-next-line @stylexjs/valid-styles -- `anchor-name`: anchor positioning postdates StyleX's property allowlist; it compiles and emits correctly.
    anchorName: { default: null, ':where([data-selected])': activeAnchor },
    borderRadius: radiusVars['--cl-radius-md'],
    borderStyle: 'none',
    paddingInline: space['3'],
    alignItems: 'center',
    appearance: 'none',
    backgroundColor: 'transparent',
    color: {
      default: colorVars['--cl-color-foreground-secondary'],
      ':where([data-selected])': colorVars['--cl-color-foreground'],
      '@media (hover: hover)': {
        default: null,
        ':hover:not([data-selected]):not([data-disabled])': colorVars['--cl-color-foreground'],
      },
    },
    cursor: { default: 'pointer', ':is([data-disabled])': 'not-allowed' },
    display: 'inline-flex',
    flexShrink: 0,
    fontFamily: fontFamilyVars['--cl-font-family-sans'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    fontWeight: fontWeightVars['--cl-font-medium'],
    justifyContent: 'center',
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    opacity: { default: 1, ':is([data-disabled])': 0.5 },
    position: 'relative',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    zIndex: { default: null, ':focus-visible': 1 },
    height: space['8'],
  },
  fallbackIndicator: {
    ...surface,
    inset: 0,
    animationDuration: durationVars['--cl-duration-slow'],
    animationName: { default: scaleIn, [reduceMotion]: 'none' },
    animationTimingFunction: easingVars['--cl-ease-default'],
    display: {
      default: 'none',
      [noAnchors]: { default: 'none', ':where([data-selected] > *)': 'block' },
    },
    pointerEvents: 'none',
    position: 'absolute',
    zIndex: -1,
  },
});
