import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { useAccessibleNameWarning } from '../../hooks/useAccessibleNameWarning';
import type { PopoverFocusTarget, PopoverProps as HeadlessPopoverProps } from '../../primitives/popover';
import { Popover as Primitive } from '../../primitives/popover';
import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../utils/reset.styles';
import { sizes, styles } from './popover.styles';

export type PopoverSize = 'sm' | 'md' | 'lg' | 'anchor';

export type PopoverRootProps = HeadlessPopoverProps;

// Drops the raw `color: string` attr so a `render` callback can spread into a Mosaic component.
export type PopoverTriggerProps = MosaicComponentProps<'button'>;
export type PopoverCloseProps = MosaicComponentProps<'button'>;
export type PopoverTitleProps = MosaicComponentProps<'h2'>;
export type PopoverDescriptionProps = MosaicComponentProps<'p'>;

const Trigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>(function PopoverTrigger(
  { xstyle, ...rest },
  ref,
) {
  return (
    <Primitive.Trigger
      ref={ref}
      {...mergeStyleProps(themeProps('popover-trigger'), stylex.props(xstyle), rest)}
    />
  );
});

const Close = React.forwardRef<HTMLButtonElement, PopoverCloseProps>(function PopoverClose({ xstyle, ...rest }, ref) {
  return (
    <Primitive.Close
      ref={ref}
      {...mergeStyleProps(stylex.props(xstyle), rest)}
    />
  );
});

const Title = React.forwardRef<HTMLHeadingElement, PopoverTitleProps>(function PopoverTitle({ xstyle, ...rest }, ref) {
  return (
    <Primitive.Title
      ref={ref}
      {...mergeStyleProps(stylex.props(xstyle), rest)}
    />
  );
});

const Description = React.forwardRef<HTMLParagraphElement, PopoverDescriptionProps>(function PopoverDescription(
  { xstyle, ...rest },
  ref,
) {
  return (
    <Primitive.Description
      ref={ref}
      {...mergeStyleProps(stylex.props(xstyle), rest)}
    />
  );
});

function Positioner({ children, ...rest }: React.ComponentPropsWithoutRef<typeof Primitive.Positioner>) {
  const [node, setNode] = React.useState<HTMLDivElement | null>(null);
  useAccessibleNameWarning(node, 'Popover');

  return (
    <Primitive.Positioner
      ref={setNode}
      {...mergeStyleProps(themeProps('popover-positioner'), stylex.props(reset.base, styles.positioner))}
      {...rest}
    >
      {children}
    </Primitive.Positioner>
  );
}

export interface PopoverPopupProps extends MosaicComponentProps<'div'> {
  /** Positions against this element instead of the trigger; with no trigger, it acts as one. */
  anchor?: HTMLElement | null;
  finalFocus?: PopoverFocusTarget;
  size?: PopoverSize;
  /** Required unless the contents render a `Popover.Title`. */
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

// Paints no surface of its own; supply one inside it, usually a `Card`.
const Popup = React.forwardRef<HTMLDivElement, PopoverPopupProps>(function PopoverPopup(
  { anchor, finalFocus, xstyle, size = 'md', 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledby, ...rest },
  ref,
) {
  return (
    <Primitive.Portal>
      {/* Spread conditionally: an explicit `undefined` would drop the `Popover.Title`'s label. */}
      <Positioner
        anchor={anchor}
        finalFocus={finalFocus}
        {...(ariaLabel == null ? {} : { 'aria-label': ariaLabel })}
        {...(ariaLabelledby == null ? {} : { 'aria-labelledby': ariaLabelledby })}
      >
        <Primitive.Popup
          ref={ref}
          {...mergeStyleProps(
            themeProps('popover-popup', { size }),
            stylex.props(reset.base, styles.popup, sizes[size], xstyle),
            rest,
          )}
        />
      </Positioner>
    </Primitive.Portal>
  );
});

/** A floating box anchored to a trigger. */
export const Popover = {
  Root: Primitive.Root,
  Trigger,
  Popup,
  Title,
  Description,
  Close,
};
