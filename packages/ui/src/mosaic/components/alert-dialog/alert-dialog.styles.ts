import * as stylex from '@stylexjs/stylex';

import { space } from '../../tokens.stylex';

export const styles = stylex.create({
  /**
   * The question and the detail under it are one block, not two paragraphs, so they keep only the
   * space their line heights give them rather than the popup's gap between every child.
   */
  header: {
    display: 'flex',
    flexDirection: 'column',
  },

  /**
   * The response row. An alert dialog exists to be answered, so its buttons are anatomy rather
   * than content — the one part `Dialog` deliberately does not ship, because a dialog's footer is
   * whatever the consumer composes and an alert dialog's is always the same two choices.
   *
   * One layout at every width, because that is the convention for a `prompt` generally rather than
   * a rule about alert dialogs: its buttons span the surface, one full width or two at even halves.
   * A right-aligned pair sized to its labels was tried first and is what the designs do not do.
   *
   * A GRID rather than a flex row, and that is what makes both cases the same declaration. Filling
   * the row needs `flex: 1` on each CHILD, which a parent cannot set — StyleX has no child
   * selector, and reaching into the children would mean every call site remembering to pass
   * something. `grid-auto-flow: column` with `grid-auto-columns: 1fr` puts it on the container
   * instead: every button takes an equal share of the row, so one fills it and two split it, with
   * no branch and nothing for a third to break.
   *
   * DOM order is the visual order: the cancel comes first, which is also what makes it the first
   * tabbable element and therefore what opens focused — the least destructive choice, with no
   * `initialFocus` plumbing. Keep it first; reversing the row visually would leave the keyboard
   * order disagreeing with the screen.
   */
  actions: {
    gap: space['3'],
    display: 'grid',
    gridAutoColumns: '1fr',
    gridAutoFlow: 'column',
    // On top of the popup's own `gap`, so the response separates from the question it answers
    // rather than reading as a third paragraph.
    marginBlockStart: space['2'],
  },
});
