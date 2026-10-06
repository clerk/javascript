import * as stylex from '@stylexjs/stylex';
import type React from 'react';

import { skeletonStyles } from '../styles/skeleton.styles';

const webkitClone = { WebkitBoxDecorationBreak: 'clone' } as React.CSSProperties;

export function SkeletonText({ children }: { children: React.ReactNode }) {
  const props = stylex.props(skeletonStyles.text);
  return (
    <span
      aria-hidden
      className={props.className}
      style={{ ...props.style, ...webkitClone }}
    >
      {children}
    </span>
  );
}
