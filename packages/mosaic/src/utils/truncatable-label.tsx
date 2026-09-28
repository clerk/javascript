import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { reset } from './reset.styles';
import { truncationStyles } from './typography.styles';

// The ellipsis comes from `truncationStyles.singleLine`; this releases the flex-item min-width
// floor, without which the box never shrinks enough to clip.
const styles = stylex.create({
  label: {
    minWidth: 0,
  },
});

// Wrap the text children so they have a box of their own to truncate against — a bare text
// child is laid out in an anonymous flex item that no selector can reach. A whole run of
// adjacent text shares one box, or `Delete {name}` would split into two flex items with the
// container's `gap` opening up mid-sentence. Element children (icons) pass through untouched,
// so they stay direct flex items and `gap` still applies.
export function withTruncatableLabel(children: React.ReactNode): React.ReactNode {
  const result: React.ReactNode[] = [];
  let run: React.ReactNode[] = [];

  const flushRun = () => {
    if (run.length === 0) {
      return;
    }
    result.push(
      <span
        key={`label-${result.length}`}
        {...stylex.props(reset.base, truncationStyles.singleLine, styles.label)}
      >
        {run}
      </span>,
    );
    run = [];
  };

  // `toArray` rather than `forEach` so the elements it passes through carry the keys it
  // assigns, and the array this returns doesn't warn about missing ones.
  for (const child of React.Children.toArray(children)) {
    if (typeof child === 'string' || typeof child === 'number') {
      run.push(child);
    } else {
      flushRun();
      result.push(child);
    }
  }
  flushRun();

  return result;
}
