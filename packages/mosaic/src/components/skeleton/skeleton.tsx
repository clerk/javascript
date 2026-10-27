import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../styles/reset.styles';
import { skeletonStyles } from '../../styles/skeleton.styles';
import { shapes, size, styles } from './skeleton.styles';

export type SkeletonShape = 'rounded' | 'pill' | 'square';

export interface SkeletonProps extends Omit<MosaicComponentProps<'span'>, 'render'> {
  show?: boolean;
  visible?: boolean;
  inline?: boolean;
  shape?: SkeletonShape;
  width?: number | string;
  height?: number | string;
}

const toLength = (value: number | string | undefined, fallback: string) =>
  value === undefined ? fallback : typeof value === 'number' ? `${value}px` : value;

function isText(children: React.ReactNode) {
  const items = React.Children.toArray(children);
  return items.length > 0 && items.every(item => typeof item === 'string' || typeof item === 'number');
}

/**
 * A placeholder for content that is still loading. Wraps the content it stands in for: text becomes a
 * cap-height bar as wide as the text, and an element becomes a block the size of that element, hidden
 * underneath.
 *
 * @example
 * <Section.Label><Skeleton>{device.name}</Skeleton></Section.Label>
 */
export const Skeleton = React.forwardRef<HTMLSpanElement, SkeletonProps>(function MosaicSkeleton(
  { show = true, visible = true, inline = false, shape = 'rounded', width, height, xstyle, children, ...rest },
  ref,
) {
  if (!show) {
    return <>{children}</>;
  }
  const text = isText(children);
  const sized = width !== undefined || height !== undefined;
  return (
    <span
      ref={ref}
      aria-hidden
      {...mergeStyleProps(
        themeProps('skeleton', { shape: text ? undefined : shape, text, visible }),
        stylex.props(
          reset.base,
          styles.frame,
          text ? [styles.text, inline && styles.inline] : [styles.block, shapes[shape]],
          sized && size.fixed(toLength(width, 'fit-content'), toLength(height, 'auto')),
          visible && (text ? skeletonStyles.textBar : [skeletonStyles.fill, skeletonStyles.shimmer]),
          xstyle,
        ),
        rest,
      )}
    >
      {children}
    </span>
  );
});
