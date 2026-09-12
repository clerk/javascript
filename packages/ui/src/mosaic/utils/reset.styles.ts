import * as stylex from '@stylexjs/stylex';

// The minimal reset every Mosaic element composes, as the first atom of its `stylex.props(...)`.
// Carried per-element rather than injected as a stylesheet: the StyleX tier builds through the
// Emotion-free `styles/index.ts` barrel, which has no provider to inject anything.
//
// `margin`/`padding` are shorthands deliberately — StyleX ranks a longhand above a shorthand
// regardless of order, so a component's `paddingInline` wins without depending on argument order.
// The `inherit` longhands tie with a component's own value, so they rely on the reset going first.
export const reset = stylex.create({
  base: {
    margin: 0,
    padding: 0,
    boxSizing: 'border-box',
    color: 'inherit',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    fontWeight: 'inherit',
    lineHeight: 'inherit',
  },
});
