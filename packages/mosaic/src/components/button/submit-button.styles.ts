import * as stylex from '@stylexjs/stylex';

export const styles = stylex.create({
  // The containing block the spinner centers against. Unconditional, so the button's stacking
  // and its coarse-pointer `::after` overlay behave the same in both states.
  root: {
    position: 'relative',
  },
  // Button gates its hover and pressed fills on `:enabled`, which a pending button still is —
  // `aria-disabled` keeps it focusable, so the native attribute is out. Dropping pointer events
  // stops `:hover` and `:active` matching for the pointer in one line, across every variant cell.
  // Unlike `disabled` there's nothing lost by it: pending is self-explanatory and brief, so the
  // button isn't carrying a tooltip that has to stay hoverable to explain itself.
  //
  // It doesn't cover the keyboard, though — a focused button still takes `:active` from space and
  // enter with no pointer involved. That half is handled where the fills are declared, by the
  // `:not([data-pending])` on each cell's active selector in `button.styles.ts`.
  rootPending: {
    pointerEvents: 'none',
  },

  // One box around every child, so the whole content fades as a unit rather than per-run. It
  // stands in for the button's own content row — `gap` picks up whatever the size axis set —
  // so an icon and its label keep their spacing across the extra nesting level.
  content: {
    gap: 'inherit',
    alignItems: 'center',
    display: 'inline-flex',
    // Releases the flex-item min-width floor so the label boxes inside can still clip.
    minWidth: 0,
  },
  // Opacity rather than unmounting the label or swapping in the spinner: the content keeps its
  // box, so the button holds its width and nothing around it reflows when the state flips.
  contentPending: {
    opacity: 0,
  },

  // Out of flow and centered by `inset: 0` + `margin: auto`, which resolves against the padding
  // box on both axes without a transform and stays correct under any writing mode.
  spinner: {
    margin: 'auto',
    insetBlock: 0,
    insetInline: 0,
    position: 'absolute',
  },
  // The spinner mounts the instant the action starts but waits out `useSpinDelay` before it is
  // drawn, so a fast action never flashes one. Hiding it with `opacity` rather than by not
  // rendering it is what keeps the progressbar in the accessibility tree for the whole action —
  // `visibility: hidden` or `display: none` would take it back out.
  spinnerHidden: {
    opacity: 0,
  },
});
