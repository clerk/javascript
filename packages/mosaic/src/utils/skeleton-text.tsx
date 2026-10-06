import * as stylex from '@stylexjs/stylex';
import type React from 'react';

import { skeletonStyles } from '../styles/skeleton.styles';

export function SkeletonText({ children }: { children?: React.ReactNode }) {
  return (
    <span
      aria-hidden
      {...stylex.props(skeletonStyles.text)}
    >
      {children}
    </span>
  );
}
