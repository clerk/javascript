import type { PopoverProps as HeadlessPopoverProps } from '@clerk/headless/popover';
import { Popover as Primitive } from '@clerk/headless/popover';
import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import React from 'react';

import { mergeStyleProps, themeProps } from '../../props';
import { sizes, styles } from './popover.styles';

/**
 * Mosaic Popover: a floating box anchored to a trigger, built on the
 * `@clerk/headless` popover primitive.
 *
 * The popover owns only what it means to float — trigger wiring, ARIA, focus
 * management, positioning, stacking, viewport clamps, and the enter/exit
 * transition. It paints no surface of its own: background, border, radius,
 * shadow and padding come from whatever is rendered inside it (typically a
 * `Card`), so the two never both draw a border.
 *
 * Each styled part bridges the matching headless part and spreads
 * `themeProps` + `stylex.props` through `mergeStyleProps`, so it carries the
 * public `.cl-<slot>` class and StyleX atoms while the headless part keeps its
 * floating behavior, refs, and ARIA wiring.
 */

export type PopoverSize = 'sm' | 'md' | 'lg';

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
        '[clerk] <Popover> renders a dialog with no accessible name. Pass `aria-label`, or render a `<Popover.Title>` inside it.',
      );
    }, 0);

    return () => clearTimeout(timer);
  }, [node]);
}

const Positioner = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof Primitive.Positioner>>(
  function PopoverPositioner({ className, style, ...rest }, ref) {
    const [node, setNode] = React.useState<HTMLDivElement | null>(null);
    useAccessibleNameWarning(node);

    const setRefs = React.useCallback(
      (value: HTMLDivElement | null) => {
        setNode(value);
        if (typeof ref === 'function') {
          ref(value);
        } else if (ref) {
          ref.current = value;
        }
      },
      [ref],
    );

    return (
      <Primitive.Positioner
        ref={setRefs}
        {...mergeStyleProps(themeProps('popover-positioner'), stylex.props(styles.positioner), className, style)}
        {...rest}
      />
    );
  },
);

export interface PopoverPopupProps extends React.ComponentPropsWithoutRef<typeof Primitive.Popup> {
  /** Width of the floating box. */
  size?: PopoverSize;
}

const Popup = React.forwardRef<HTMLDivElement, PopoverPopupProps>(function PopoverPopup(
  { className, style, size = 'md', ...rest },
  ref,
) {
  return (
    <Primitive.Popup
      ref={ref}
      {...mergeStyleProps(
        themeProps('popover-popup', { size }),
        stylex.props(styles.popup, sizes[size]),
        className,
        style,
      )}
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
  /** Popup contents. Supply the surface — usually a `Card`. */
  children: ReactNode;
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
  size,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
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
        {/*
          Spread conditionally: the headless positioner merges these over its own
          `aria-labelledby` (set once a `Popover.Title` mounts), so passing an explicit
          `undefined` would delete the Title's label rather than leave it alone.
        */}
        <Positioner
          {...(ariaLabel == null ? {} : { 'aria-label': ariaLabel })}
          {...(ariaLabelledby == null ? {} : { 'aria-labelledby': ariaLabelledby })}
        >
          <Popup size={size}>{children}</Popup>
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
Popover.Title = Primitive.Title;
Popover.Description = Primitive.Description;
Popover.Close = Primitive.Close;
