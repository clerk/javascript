import * as stylex from '@stylexjs/stylex';

import { space } from '../../tokens.stylex';

export const styles = stylex.create({
  /**
   * The response row. An alert dialog exists to be answered, so its buttons are anatomy rather
   * than content — the one part `Dialog` deliberately does not ship, because a dialog's footer is
   * whatever the consumer composes and an alert dialog's is always the same two choices.
   *
   * A GRID rather than a flex row, and that is what buys the phone layout without touching the
   * buttons. Full-width buttons need `flex: 1` on each CHILD, which a parent cannot set — StyleX
   * has no child selector, and reaching into the children would mean every call site remembering
   * to pass something. `grid-auto-flow: column` + `grid-auto-columns` moves the same decision onto
   * the container: `1fr` gives every button an equal share of the row, `auto` sizes each to its
   * label. One property, two layouts.
   *
   * Under the phone band the row therefore splits evenly and spans the sheet; from 48rem up the
   * tracks shrink to their labels and `justify-content: end` puts them at the inline end. The
   * buttons never sit hard against one edge on a phone, where the row is the width of the screen
   * and a right-aligned pair reads as floating.
   *
   * DOM order is the visual order in both: the cancel comes first, which is also what makes it the
   * first tabbable element and therefore what opens focused — the least destructive choice, with
   * no `initialFocus` plumbing. Keep it first; reversing the row visually would leave the keyboard
   * order disagreeing with the screen.
   */
  actions: {
    gap: space['2'],
    display: 'grid',
    gridAutoColumns: { default: '1fr', '@media (min-width: 48rem)': 'auto' },
    gridAutoFlow: 'column',
    justifyContent: { default: null, '@media (min-width: 48rem)': 'end' },
    // On top of the popup's own `gap`, so the response separates from the question it answers
    // rather than reading as a third paragraph.
    marginBlockStart: space['2'],
  },
});
