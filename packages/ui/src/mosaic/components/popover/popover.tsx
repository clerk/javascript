import type { PopoverProps as HeadlessPopoverProps } from '@clerk/headless/popover';
import { Popover as Primitive } from '@clerk/headless/popover';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../reset.styles';
import { sizes, styles } from './popover.styles';

export type PopoverSize = 'sm' | 'md' | 'lg';

export type PopoverRootProps = HeadlessPopoverProps;

/**
 * The headless parts type their props (and the `render` callback's argument) against
 * the raw tag props, which carry the non-standard HTML `color` attribute typed
 * `string`. Re-typing them through `MosaicComponentProps` drops it, so a `render`
 * callback can spread straight into a Mosaic component whose own `color` is a narrow
 * variant union.
 */
export type PopoverTriggerProps = MosaicComponentProps<'button'>;
export type PopoverCloseProps = MosaicComponentProps<'button'>;
export type PopoverTitleProps = MosaicComponentProps<'h2'>;
export type PopoverDescriptionProps = MosaicComponentProps<'p'>;

/** The anchor. Renders a `<button>`; `render` swaps in another element. */
const Trigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>(function PopoverTrigger(
  { className, style, ...props },
  ref,
) {
  return (
    <Primitive.Trigger
      ref={ref}
      {...mergeStyleProps(themeProps('popover-trigger'), className, style)}
      {...props}
    />
  );
});

/** Dismisses the popover. Renders a `<button>`; `render` swaps in another element. */
const Close = React.forwardRef<HTMLButtonElement, PopoverCloseProps>(function PopoverClose(props, ref) {
  return (
    <Primitive.Close
      ref={ref}
      {...props}
    />
  );
});

/** Names the dialog. Renders an `<h2>` wired to the popup's `aria-labelledby`. */
const Title = React.forwardRef<HTMLHeadingElement, PopoverTitleProps>(function PopoverTitle(props, ref) {
  return (
    <Primitive.Title
      ref={ref}
      {...props}
    />
  );
});

/** Describes the dialog. Renders a `<p>` wired to the popup's `aria-describedby`. */
const Description = React.forwardRef<HTMLParagraphElement, PopoverDescriptionProps>(
  function PopoverDescription(props, ref) {
    return (
      <Primitive.Description
        ref={ref}
        {...props}
      />
    );
  },
);

/**
 * Mosaic Popover: a floating box anchored to a trigger, built on the
 * `@clerk/headless` popover primitive. Composed via dot syntax:
 * `Popover.Root`, `Popover.Trigger`, `Popover.Popup`, plus `Popover.Title`,
 * `Popover.Description` and `Popover.Close` for the popup's contents.
 *
 * The popover owns only what it means to float — trigger wiring, ARIA, focus
 * management, positioning, stacking, viewport clamps, and the enter/exit
 * transition. It paints no surface of its own: background, border, radius,
 * shadow and padding come from whatever is rendered inside it (typically a
 * `Card`), so the two never both draw a border.
 *
 * `Popover.Popup` renders the portal and the floating positioner itself —
 * neither is a part a consumer composes, so they stay out of the public API.
 * Each styled part spreads `themeProps` + `stylex.props` through
 * `mergeStyleProps`, so it carries the public `.cl-<slot>` class and StyleX
 * atoms while the headless part keeps its floating behavior, refs, and ARIA
 * wiring.
 */

/**
 * The headless positioner is always `role="dialog"`, but it only gains
 * `aria-labelledby` once a `Popover.Title` mounts — so a popover with neither a
 * Title nor an `aria-label` is an unnamed dialog. The check has to run after mount
 * and read the DOM: `hasTitle` starts `false` in the primitive's root state, so a
 * render-time check would warn on every popover that does use a Title.
 */
function useAccessibleNameWarning(node: HTMLElement | null) {
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'production' || !node) {
      return;
    }
    // Deferred by a task, not checked inline: `Popover.Title` reports itself through an
    // effect, so on the commit that mounts the positioner the label is legitimately not
    // there yet. Checking immediately would warn on every popover that does have a Title.
    const timer = setTimeout(() => {
      if (!node.isConnected || node.getAttribute('role') !== 'dialog') {
        return;
      }
      if (node.hasAttribute('aria-label') || node.hasAttribute('aria-labelledby')) {
        return;
      }
      console.warn(
        '[clerk] <Popover.Popup> renders a dialog with no accessible name. Pass `aria-label`, or render a `<Popover.Title>` inside it.',
      );
    }, 0);

    return () => clearTimeout(timer);
  }, [node]);
}

function Positioner({ children, ...rest }: React.ComponentPropsWithoutRef<typeof Primitive.Positioner>) {
  const [node, setNode] = React.useState<HTMLDivElement | null>(null);
  useAccessibleNameWarning(node);

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
  /** Width of the floating box. */
  size?: PopoverSize;
  /**
   * Names the dialog for assistive technology. Required unless the contents render a
   * `Popover.Title`, which wires `aria-labelledby` instead.
   */
  'aria-label'?: string;
  /** Names the dialog from an existing element. Alternative to `aria-label`. */
  'aria-labelledby'?: string;
}

/**
 * The floating box. Portals itself out of the tree and positions against
 * `Popover.Trigger`; supply the surface inside it, usually a `Card`.
 */
const Popup = React.forwardRef<HTMLDivElement, PopoverPopupProps>(function PopoverPopup(
  { className, style, size = 'md', 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledby, ...rest },
  ref,
) {
  return (
    <Primitive.Portal>
      {/*
        The positioner is the `role="dialog"` element, so the accessible name belongs on
        it rather than on the popup. Spread conditionally: the headless positioner merges
        these over its own `aria-labelledby` (set once a `Popover.Title` mounts), so
        passing an explicit `undefined` would delete the Title's label rather than leave
        it alone.
      */}
      <Positioner
        {...(ariaLabel == null ? {} : { 'aria-label': ariaLabel })}
        {...(ariaLabelledby == null ? {} : { 'aria-labelledby': ariaLabelledby })}
      >
        <Primitive.Popup
          ref={ref}
          {...mergeStyleProps(
            themeProps('popover-popup', { size }),
            stylex.props(reset.base, styles.popup, sizes[size]),
            className,
            style,
          )}
          {...rest}
        />
      </Positioner>
    </Primitive.Portal>
  );
});

/**
 * Mosaic `Popover` — a floating box anchored to a trigger. Composed via dot
 * syntax: `Popover.Root`, `Popover.Trigger`, `Popover.Popup`, `Popover.Title`,
 * `Popover.Description`, `Popover.Close`.
 */
export const Popover = {
  Root: Primitive.Root,
  Trigger,
  Popup,
  Title,
  Description,
  Close,
};
