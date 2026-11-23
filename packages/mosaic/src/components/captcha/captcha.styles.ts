import * as stylex from '@stylexjs/stylex';

export const styles = stylex.create({
  root: {
    position: {
      default: 'absolute',
      ':where([data-cl-interactive])': 'static',
    },
  },
});
