import * as stylex from '@stylexjs/stylex';

import { colorVars, fontWeightVars, radiusVars, space, typeScaleVars } from '../../tokens.stylex';

// Literals: StyleX cannot import them. Must match `tabs.styles.ts`.
const anchors = '@supports (anchor-scope: all) and (not (-moz-appearance: none))' as const;
const targetAnchor = '--_cl-profile-search-target';
const gap = space['3'];

const fade = stylex.keyframes({
  from: { opacity: 1 },
  to: { opacity: 0 },
});

export const styles = stylex.create({
  search: {
    flexShrink: 0,
    marginBlockEnd: space['3'],
    width: '100%',
  },

  results: {
    padding: 0,
    gap: space['3'],
    flexGrow: 1,
    maxHeight: 'none',
    minHeight: 0,
  },

  group: {
    gap: space['0.5'],
    display: 'flex',
    flexDirection: 'column',
  },

  groupLabel: {
    gap: space['1.5'],
    paddingBlock: space['1'],
    paddingInline: space['2'],
    alignItems: 'center',
    color: colorVars['--cl-color-foreground-secondary'],
    display: 'flex',
    fontSize: typeScaleVars['--cl-text-xs-size'],
    fontWeight: fontWeightVars['--cl-font-medium'],
    lineHeight: typeScaleVars['--cl-text-xs-leading'],
  },

  groupIcon: {
    alignItems: 'center',
    display: 'inline-flex',
    flexShrink: 0,
  },

  match: {
    backgroundColor: 'transparent',
    color: 'inherit',
    fontWeight: fontWeightVars['--cl-font-semibold'],
  },

  target: {
    outline: 'none',
    scrollMarginBlockStart: space['12'],
  },

  targetHighlighted: {
    // eslint-disable-next-line @stylexjs/valid-styles -- `anchor-name`: anchor positioning postdates StyleX's property allowlist; it compiles and emits correctly.
    anchorName: targetAnchor,
  },

  highlightScope: {
    // eslint-disable-next-line @stylexjs/valid-styles -- `anchor-scope`: anchor positioning postdates StyleX's property allowlist; it compiles and emits correctly.
    anchorScope: targetAnchor,
    isolation: 'isolate',
    position: 'relative',
  },

  highlight: {
    // eslint-disable-next-line @stylexjs/valid-styles -- `position-anchor`: anchor positioning postdates StyleX's property allowlist; it compiles and emits correctly.
    positionAnchor: targetAnchor,
    borderRadius: `calc(${radiusVars['--cl-radius-xl']} + ${gap})`,
    animationDuration: '1.5s',
    animationFillMode: 'forwards',
    animationName: fade,
    animationTimingFunction: 'linear',
    backgroundColor: colorVars['--cl-color-neutral-alpha-100'],
    insetBlockEnd: `calc(anchor(end) - ${gap})`,
    insetBlockStart: `calc(anchor(start) - ${gap})`,
    insetInlineEnd: `calc(anchor(end) - ${gap})`,
    insetInlineStart: `calc(anchor(start) - ${gap})`,
    pointerEvents: 'none',
    position: 'absolute',
    visibility: { [anchors]: 'visible', default: 'hidden' },
    zIndex: -1,
  },
});
