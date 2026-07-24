import type { PopoverProps as HeadlessPopoverProps } from '@clerk/headless/popover';
import { Popover as Primitive } from '@clerk/headless/popover';
import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import React from 'react';

import { mergeStyleProps, themeProps } from '../../props';
import { styles } from './popover.styles';

/**
 * Mosaic Popover: a reusable floating panel anchored to a trigger, styled on top
 * of the `@clerk/headless` popover primitive. The popup is a flexible card —
 * consumers drop in any inner content plus an optional `Popover.Footer`.
 *
 * Each styled part bridges the matching headless part and spreads
 * `themeProps` + `stylex.props` through `mergeStyleProps`, so it carries the
 * public `.cl-<slot>` class and StyleX atoms while the headless part keeps its
 * floating behavior, refs, and ARIA wiring.
 */

const Positioner = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof Primitive.Positioner>>(
  function PopoverPositioner({ className, style, ...rest }, ref) {
    return (
      <Primitive.Positioner
        ref={ref}
        {...mergeStyleProps(themeProps('popover-positioner'), stylex.props(styles.positioner), className, style)}
        {...rest}
      />
    );
  },
);

const Popup = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof Primitive.Popup>>(
  function PopoverPopup({ className, style, ...rest }, ref) {
    return (
      <Primitive.Popup
        ref={ref}
        {...mergeStyleProps(themeProps('popover-popup'), stylex.props(styles.popup), className, style)}
        {...rest}
      />
    );
  },
);

const Content = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(function PopoverContent(
  { className, style, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      {...mergeStyleProps(themeProps('popover-content'), stylex.props(styles.content), className, style)}
      {...rest}
    />
  );
});

const Footer = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(function PopoverFooter(
  { className, style, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      {...mergeStyleProps(themeProps('popover-footer'), stylex.props(styles.footer), className, style)}
      {...rest}
    />
  );
});

export interface PopoverProps extends Pick<
  HeadlessPopoverProps,
  'open' | 'defaultOpen' | 'onOpenChange' | 'modal' | 'placement' | 'sideOffset'
> {
  /** Rendered as the popover's anchor. Receives the trigger's props and open state. */
  trigger: React.ComponentProps<typeof Primitive.Trigger>['render'];
  /** Popup contents. Compose `Popover.Content` and `Popover.Footer`, or anything else. */
  children: ReactNode;
}

/**
 * Convenience composition: trigger + portalled, positioned popup. For custom
 * layouts, use the compound parts (`Popover.Root`, `Popover.Positioner`, …).
 */
export function Popover({
  trigger,
  children,
  open,
  defaultOpen,
  onOpenChange,
  modal,
  placement,
  sideOffset,
}: PopoverProps) {
  return (
    <Primitive.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      modal={modal}
      placement={placement}
      sideOffset={sideOffset}
    >
      <Primitive.Trigger render={trigger} />
      <Primitive.Portal>
        <Positioner>
          <Popup>{children}</Popup>
        </Positioner>
      </Primitive.Portal>
    </Primitive.Root>
  );
}

/** Compound parts for custom popover layouts. */
Popover.Root = Primitive.Root;
Popover.Trigger = Primitive.Trigger;
Popover.Portal = Primitive.Portal;
Popover.Positioner = Positioner;
Popover.Popup = Popup;
Popover.Content = Content;
Popover.Footer = Footer;
Popover.Arrow = Primitive.Arrow;
Popover.Title = Primitive.Title;
Popover.Description = Primitive.Description;
Popover.Close = Primitive.Close;
