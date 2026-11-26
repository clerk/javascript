import * as stylex from '@stylexjs/stylex';

const OVERFLOWING = '@container cl-middle-truncate (height > 1lh)' as const;

export const styles = stylex.create({
  root: {
    borderRadius: '2px',
    overflow: 'hidden',
    display: 'inline-flex',
    verticalAlign: 'bottom',
    maxWidth: '100%',
    minWidth: 0,
  },
  head: {
    overflow: 'hidden',
    display: 'grid',
    gridTemplateColumns: 'minmax(0, max-content)',
    height: '1lh',
    minWidth: 0,
  },
  sizer: {
    gridColumn: '1',
    gridRow: '1',
    userSelect: 'none',
    visibility: 'hidden',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  },
  clip: {
    gridColumn: '1',
    gridRow: '1',
    containerName: 'cl-middle-truncate',
    containerType: 'size',
    display: 'flex',
    minWidth: 0,
  },
  text: {
    overflow: 'hidden',
    maskImage: {
      [OVERFLOWING]: {
        default: 'linear-gradient(to left, transparent, black 0.6em)',
        ':dir(rtl)': 'linear-gradient(to right, transparent, black 0.6em)',
      },
      default: null,
    },
    whiteSpace: 'pre',
    minWidth: 0,
  },
  ellipsis: {
    display: {
      [OVERFLOWING]: 'inline',
      default: 'none',
    },
    flexShrink: 0,
    userSelect: 'none',
  },
  tail: {
    flexShrink: 0,
    whiteSpace: 'pre',
  },
});
