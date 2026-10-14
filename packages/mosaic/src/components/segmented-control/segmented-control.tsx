import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type {
  SegmentedControlItemProps as HeadlessSegmentedControlItemProps,
  SegmentedControlRootProps as HeadlessSegmentedControlRootProps,
} from '../../primitives/segmented-control';
import { SegmentedControl as Primitive } from '../../primitives/segmented-control';
import type { MosaicStyleProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { focusOutline } from '../../styles/focus-outline.styles';
import { reset } from '../../styles/reset.styles';
import { styles } from './segmented-control.styles';

type StyledProps<Props> = Omit<Props, 'className' | 'style'> & MosaicStyleProps;

export type SegmentedControlRootProps = StyledProps<HeadlessSegmentedControlRootProps>;
export type SegmentedControlItemProps = StyledProps<HeadlessSegmentedControlItemProps>;

const Root = React.forwardRef<HTMLDivElement, SegmentedControlRootProps>(function MosaicSegmentedControlRoot(
  { xstyle, children, ...rest },
  ref,
) {
  return (
    <Primitive.Root
      ref={ref}
      {...mergeStyleProps(themeProps('segmented-control-root'), stylex.props(reset.base, styles.root, xstyle), rest)}
    >
      <Primitive.Indicator
        {...mergeStyleProps(themeProps('segmented-control-indicator'), stylex.props(reset.base, styles.indicator))}
      />
      {children}
    </Primitive.Root>
  );
});

const Item = React.forwardRef<HTMLButtonElement, SegmentedControlItemProps>(function MosaicSegmentedControlItem(
  { xstyle, children, ...rest },
  ref,
) {
  return (
    <Primitive.Item
      ref={ref}
      {...mergeStyleProps(
        themeProps('segmented-control-item'),
        stylex.props(reset.base, styles.item, focusOutline.visible, xstyle),
        rest,
      )}
    >
      <Primitive.Indicator
        {...mergeStyleProps(
          themeProps('segmented-control-indicator'),
          stylex.props(reset.base, styles.fallbackIndicator),
        )}
      />
      {children}
    </Primitive.Item>
  );
});

export const SegmentedControl = {
  Root,
  Item,
};
