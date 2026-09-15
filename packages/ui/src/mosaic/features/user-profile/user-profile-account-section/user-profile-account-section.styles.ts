import * as stylex from '@stylexjs/stylex';

import { space } from '../../../tokens.stylex';

export const styles = stylex.create({
  sections: {
    gap: space['8'],
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
});

export const motionStyles = stylex.create({
  // `view-transition-name` is a document-global ident, so it has to come from the render
  // rather than a static atom.
  name: (name: string | null) => ({ viewTransitionName: name }),
});
