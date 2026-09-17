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

/** The anchor. Renders a `<button>`; `render` swaps in another element. */
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

/**
 * The floating label. Portals itself out of the tree and positions against
 * `Tooltip.Trigger`; the surface, type and enter/exit transition are its own.
 */
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

/**
 * Mosaic `Tooltip` — a short label shown on hover or focus, built on the
 * `@clerk/headless` tooltip primitive. Composed via dot syntax: `Tooltip.Root`,
 * `Tooltip.Trigger`, `Tooltip.Popup`, plus `Tooltip.Group` to share a delay
 * across neighbouring tooltips.
 */
export const Tooltip = {
  Root: Primitive.Root,
  Group: Primitive.Group,
  Trigger,
  Popup,
};
