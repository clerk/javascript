import type { TooltipProps as HeadlessTooltipProps } from '@clerk/headless/tooltip';
import { Tooltip as Primitive } from '@clerk/headless/tooltip';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../utils/reset.styles';
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
          {...mergeStyleProps(themeProps('tooltip-popup'), stylex.props(reset.base, styles.popup, xstyle), rest)}
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
