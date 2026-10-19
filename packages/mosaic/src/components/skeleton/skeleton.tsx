import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../styles/reset.styles';
import { skeletonStyles } from '../../styles/skeleton.styles';
import { shapes, size, styles } from './skeleton.styles';

export type SkeletonShape = 'rounded' | 'circle' | 'square';

export interface SkeletonProps extends Omit<MosaicComponentProps<'span'>, 'render'> {
  show?: boolean;
  visible?: boolean;
  shape?: SkeletonShape;
  width?: number | string;
  height?: number | string;
}

export const SkeletonContext = React.createContext<boolean | undefined>(undefined);

const toLength = (value: number | string | undefined, fallback: string) =>
  value === undefined ? fallback : typeof value === 'number' ? `${value}px` : value;

function isText(children: React.ReactNode) {
  const items = React.Children.toArray(children);
  return items.length > 0 && items.every(item => typeof item === 'string' || typeof item === 'number');
}

/**
 * A placeholder for content that is still loading. Wraps the content it stands in for: text becomes a
 * cap-height bar as wide as the text, and an element becomes a block the size of that element, hidden
 * underneath. `show` defaults to the nearest skeleton container, such as `Section.Group skeleton`.
 *
 * @example
 * <Section.Label><Skeleton>{device.name}</Skeleton></Section.Label>
 */
export const Skeleton = React.forwardRef<HTMLSpanElement, SkeletonProps>(function MosaicSkeleton(
  { show, visible = true, shape = 'rounded', width, height, xstyle, children, ...rest },
  ref,
) {
  const inherited = React.useContext(SkeletonContext);
  if (!(show ?? inherited ?? true)) {
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
          text ? styles.text : [styles.block, shapes[shape]],
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
