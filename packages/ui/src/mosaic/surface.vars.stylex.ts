import * as stylex from '@stylexjs/stylex';

// The scale factor currently applied to the nearest scaling ancestor, published so a surface
// painted INSIDE it can divide the scale back out of its own `border-radius`. `scale` scales the
// RENDERED radius along with everything else, so `r` drawn at `s` renders as `r * s` and the
// roundness visibly drifts for the whole transition; `r / s` renders as `r`. Overlays scale on the
// element that floats and paint on a descendant (`Popover.Popup` holds a `Card`), so the two ends
// of that correction cannot sit on one element — this carries the factor between them.
//
// `stylex.types.number` rather than a plain value, for the `@property` registration: an
// unregistered custom property does not interpolate, it flips. The var would jump to `1` on the
// first frame while the ancestor's scale is still ramping, stepping the radius to its full value
// and reinstating the drift — with both endpoints still looking perfect. Registration also brings
// `inherits: true` (the correction has to reach a descendant) and `initial-value: 1`, which is what
// makes it an exact no-op for every surface with no scaling ancestor.
//
// `--_cl-` rather than `--cl-`: plumbing between a container and its contents, not a themable knob.
export const surfaceVars = stylex.defineVars({
  '--_cl-surface-scale': stylex.types.number(1),
});
