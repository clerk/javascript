import * as stylex from '@stylexjs/stylex';

// Content stays in the accessibility tree — `display: none` and `visibility: hidden` remove it.
// `clip: rect(...)` rather than `clip-path` because the deprecated property is the one every
// assistive-tech/browser combination honours.
export const visuallyHidden = stylex.create({
  base: {
    margin: -1,
    padding: 0,
    borderStyle: 'none',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    insetBlockStart: 0,
    insetInlineStart: 0,
    pointerEvents: 'none',
    position: 'absolute',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    height: 1,
    width: 1,
  },
});
