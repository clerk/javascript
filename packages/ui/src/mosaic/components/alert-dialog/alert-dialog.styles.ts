import * as stylex from '@stylexjs/stylex';

import { space } from '../../tokens.stylex';

export const styles = stylex.create({
  // Grid, not flex: an even split needs `flex: 1` on each CHILD, and StyleX has no child selector
  // to set it from the container. Keep DOM order visual order — the cancel is first so it is the
  // first tabbable element, which is what opens it focused without any `initialFocus` plumbing.
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
