import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { TooltipProps as HeadlessTooltipProps } from '../../primitives/tooltip';
import { Tooltip as Primitive } from '../../primitives/tooltip';
import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../utils/reset.styles';
import { tooltipSurface } from '../../utils/tooltip-surface.styles';
import { styles } from './tooltip.styles';

export type TooltipRootProps = HeadlessTooltipProps;

export type TooltipTriggerProps = MosaicComponentProps<'button'>;

export type TooltipPopupProps = MosaicComponentProps<'div'>;

const Trigger = React.forwardRef<HTMLButtonElement, TooltipTriggerProps>(function TooltipTrigger(
  { xstyle, ...rest },
  ref,
) {
  return (
    <Primitive.Trigger
      ref={ref}
      {...mergeStyleProps(themeProps('tooltip-trigger'), stylex.props(xstyle), rest)}
    />
  );
});

const Popup = React.forwardRef<HTMLDivElement, TooltipPopupProps>(function TooltipPopup({ xstyle, ...rest }, ref) {
  return (
    <Primitive.Portal>
      <Primitive.Positioner
        {...mergeStyleProps(themeProps('tooltip-positioner'), stylex.props(reset.base, styles.positioner))}
      >
        <Primitive.Popup
          ref={ref}
          {...mergeStyleProps(themeProps('tooltip-popup'), stylex.props(reset.base, tooltipSurface.base, xstyle), rest)}
        />
      </Primitive.Positioner>
    </Primitive.Portal>
  );
});

export const Tooltip = {
  Root: Primitive.Root,
  Group: Primitive.Group,
  Trigger,
  Popup,
};
