import type { DialogFocusTarget, DialogHandle, DialogProps as HeadlessDialogProps } from '@clerk/headless/dialog';
import { Dialog as Primitive, useDialogContext } from '@clerk/headless/dialog';
import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import React from 'react';

import { useAccessibleNameWarning } from '../../hooks/useAccessibleNameWarning';
import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { Button } from '../button';
import { Icon } from '../icon';
import { reset } from '../reset.styles';
import { backdropMotion, closeInsets, popupMotion, sizes, styles, viewportSizes } from './dialog.styles';
import { acquireKeyboardInset } from './keyboard-inset';

/** Width of the dialog surface, and for `panel` its height too. */
export type DialogSize = keyof typeof sizes;

export interface DialogRootProps<Payload = unknown> extends HeadlessDialogProps<Payload> {
  /** Width, and for `panel` also height, of the dialog surface. @default 'prompt' */
  size?: DialogSize;
}

/**
 * `size` lives on the Root rather than on the Popup because the Backdrop needs it too — the
 * two sizes animate differently, and a backdrop that outlives its popup gets cut off
 * mid-fade. Popover puts `size` on its Popup because that part renders the whole floating
 * tree; Dialog's parts are siblings, so the Root is the only place both can read.
 */
const DialogSizeContext = React.createContext<DialogSize>('prompt');

/**
 * The headless parts type their props (and the `render` callback's argument) against
 * the raw tag props, which carry the non-standard HTML `color` attribute typed
 * `string`. Re-typing them through `MosaicComponentProps` drops it, so a `render`
 * callback can spread straight into a Mosaic component whose own `color` is a narrow
 * variant union.
 */
export type DialogTriggerProps<Payload = unknown> = MosaicComponentProps<'button'> & {
  /**
   * Connects this trigger to a root rendered elsewhere in the tree. Create with
   * `Dialog.createHandle()` and pass the same handle to the `Dialog.Root`.
   */
  handle?: DialogHandle<Payload>;
  /**
   * Delivered to the root when this trigger opens it, for per-trigger content: the root's
   * children-as-function receives it as `{ payload }`.
   */
  payload?: Payload;
};
export type DialogCloseProps = MosaicComponentProps<'button'>;
/** `id` is owned by the primitive, which wires it to the popup's `aria-labelledby`. */
export type DialogTitleProps = Omit<MosaicComponentProps<'h2'>, 'id'>;
/** `id` is owned by the primitive, which wires it to the popup's `aria-describedby`. */
export type DialogDescriptionProps = Omit<MosaicComponentProps<'p'>, 'id'>;
export interface DialogCloseButtonProps extends MosaicComponentProps<'button'> {
  /**
   * Names the button for assistive technology. Defaults to English; pass a localized string
   * once one is available — no other change is needed when localization lands.
   */
  'aria-label'?: string;
}
export type DialogBackdropProps = MosaicComponentProps<'div'>;
export interface DialogViewportProps extends MosaicComponentProps<'div'> {
  /** When true, locks body scroll while the dialog is open. @default true */
  lockScroll?: boolean;
}
export type DialogPopupProps = MosaicComponentProps<'div'> & {
  /** Where focus moves when the dialog opens. Default: the first tabbable element inside it. */
  initialFocus?: DialogFocusTarget;
  /** Where focus returns when the dialog closes. Default: the trigger. */
  finalFocus?: DialogFocusTarget;
};

/** Owns the open state and the size both the backdrop and the popup read. */
function Root<Payload = unknown>({ size = 'prompt', children, ...rest }: DialogRootProps<Payload>) {
  return (
    <DialogSizeContext.Provider value={size}>
      <Primitive.Root<Payload> {...rest}>{children}</Primitive.Root>
    </DialogSizeContext.Provider>
  );
}

/** Opens the dialog. Renders a `<button>`; `render` swaps in another element. */
const Trigger = React.forwardRef<HTMLButtonElement, DialogTriggerProps>(function DialogTrigger(props, ref) {
  return (
    <Primitive.Trigger
      ref={ref}
      {...props}
    />
  );
}) as <Payload = unknown>(
  props: DialogTriggerProps<Payload> & { ref?: React.Ref<HTMLButtonElement> },
) => React.ReactElement;

/** Dismisses the dialog. Renders a `<button>`; `render` swaps in another element. */
const Close = React.forwardRef<HTMLButtonElement, DialogCloseProps>(function DialogClose(props, ref) {
  return (
    <Primitive.Close
      ref={ref}
      {...props}
    />
  );
});

/** Names the dialog. Renders an `<h2>` wired to the popup's `aria-labelledby`. */
const Title = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(function DialogTitle(props, ref) {
  return (
    <Primitive.Title
      ref={ref}
      {...props}
    />
  );
});

/** Describes the dialog. Renders a `<p>` wired to the popup's `aria-describedby`. */
const Description = React.forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  function DialogDescription(props, ref) {
    return (
      <Primitive.Description
        ref={ref}
        {...props}
      />
    );
  },
);

/**
 * The corner dismiss affordance: a ghost circular button holding the close glyph, anchored to
 * the popup's top-inline-end corner.
 *
 * A part rather than a `closeButton` flag on the popup, because where it sits in the DOM decides
 * where it sits in the TAB ORDER — and rendering it first makes it the first tabbable element,
 * which is the focus every dialog opens on until `initialFocus` exists. A boolean would take that
 * choice away from the consumer.
 */
const CloseButton = React.forwardRef<HTMLButtonElement, DialogCloseButtonProps>(function DialogCloseButton(
  { 'aria-label': ariaLabel = 'Close', className, style, ...rest },
  ref,
) {
  const size = React.useContext(DialogSizeContext);
  return (
    <span {...stylex.props(styles.closeButton, closeInsets[size])}>
      <Primitive.Close
        ref={ref}
        aria-label={ariaLabel}
        render={props => (
          <Button
            variant='ghost'
            shape='circle'
            size='sm'
            {...props}
          />
        )}
        {...mergeStyleProps(themeProps('dialog-close-button'), className, style)}
        {...rest}
      >
        <Icon name='close' />
      </Primitive.Close>
    </span>
  );
});

/** The scrim behind the dialog. Owns no scroll lock or positioning — that is `Dialog.Viewport`. */
const Backdrop = React.forwardRef<HTMLDivElement, DialogBackdropProps>(function DialogBackdrop(
  { className, style, ...rest },
  ref,
) {
  const size = React.useContext(DialogSizeContext);
  return (
    <Primitive.Backdrop
      ref={ref}
      {...mergeStyleProps(
        themeProps('dialog-backdrop'),
        stylex.props(reset.base, styles.backdrop, backdropMotion[size]),
        className,
        style,
      )}
      {...rest}
    />
  );
});

/**
 * Centering container for the popup. Locks body scroll while the dialog is open, and — because it
 * is the element that owns the inset — publishes the on-screen keyboard's share of the viewport
 * for its own bottom padding to consume. See `keyboard-inset.ts`.
 */
const Viewport = React.forwardRef<HTMLDivElement, DialogViewportProps>(function DialogViewport(
  { className, style, ...rest },
  ref,
) {
  const size = React.useContext(DialogSizeContext);
  React.useEffect(() => acquireKeyboardInset(), []);
  return (
    <Primitive.Viewport
      ref={ref}
      {...mergeStyleProps(
        themeProps('dialog-viewport', { size }),
        stylex.props(reset.base, styles.viewport, viewportSizes[size]),
        className,
        style,
      )}
      {...rest}
    />
  );
});

/**
 * Warns when a dialog stacked on another one is not a `prompt`.
 *
 * Only `prompt` stacks. `panel` and `card` are root-level surfaces: they host a stack, and the
 * styles that make one work — dropping the scrim, receding behind the surface above — exist for
 * `prompt` alone, so a `panel` opened inside a dialog silently renders with neither.
 *
 * One rule stated on the child covers every case, without having to enumerate which sizes may
 * host what.
 */
function useStackedSizeWarning(isStacked: boolean, size: DialogSize) {
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'production' || !isStacked || size === 'prompt') {
      return;
    }
    console.warn(
      `Mosaic: a Dialog opened inside another Dialog should be size="prompt", but this one is size="${size}". ` +
        'Only prompts are styled to stack — this dialog will paint no backdrop and the surface beneath it will not recede.',
    );
  }, [isStacked, size]);
}

/** The dialog surface: `role="dialog"`, focus-trapped, and the element that paints. */
const Popup = React.forwardRef<HTMLDivElement, DialogPopupProps>(function DialogPopup(
  { className, style, ...rest },
  ref,
) {
  const size = React.useContext(DialogSizeContext);
  const { isStacked } = useDialogContext();
  // Observed through state rather than a plain ref, because the warning has to re-run when the
  // node arrives and a ref mutation does not re-render.
  const [node, setNode] = React.useState<HTMLDivElement | null>(null);
  useAccessibleNameWarning(node, 'Dialog');
  useStackedSizeWarning(isStacked, size);

  const mergedRef = React.useCallback(
    (element: HTMLDivElement | null) => {
      setNode(element);
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
    },
    [ref],
  );

  return (
    <Primitive.Popup
      ref={mergedRef}
      {...mergeStyleProps(
        themeProps('dialog-popup', { size }),
        stylex.props(reset.base, styles.popup, sizes[size], popupMotion[size]),
        className,
        style,
      )}
      {...rest}
    />
  );
});

export interface DialogProps extends Pick<
  HeadlessDialogProps,
  'open' | 'defaultOpen' | 'onOpenChange' | 'modal' | 'closedBy'
> {
  /**
   * Renders the button that opens the dialog. Omit for dialogs driven entirely by `open` —
   * opened from a menu item, a route, or a state machine — where there is no trigger to render.
   */
  trigger?: MosaicComponentProps<'button'>['render'];
  children: ReactNode | ((ctx: { close: () => void }) => ReactNode);
  /** Width, and for `panel` also height, of the dialog surface. @default 'prompt' */
  size?: DialogSize;
}

function DialogContent({ children }: { children: DialogProps['children'] }) {
  const { setOpen } = useDialogContext();
  if (typeof children !== 'function') {
    return <>{children}</>;
  }
  return <>{children({ close: () => setOpen(false) })}</>;
}

/**
 * Mosaic `Dialog` — a modal surface built on the `@clerk/headless` dialog primitive.
 * Flattens the required nesting (Root, Portal, Backdrop, Viewport, Popup) into one
 * component and hands `children` a `close` callback through a render prop.
 *
 * Each styled part spreads `themeProps` + `stylex.props` through `mergeStyleProps`, so
 * it carries the public `.cl-<slot>` class and StyleX atoms while the headless part
 * keeps its focus management, scroll lock, and ARIA wiring. Drop to the compound parts
 * (`Dialog.Root` and friends) for layouts this wrapper does not cover.
 */
export function Dialog({ trigger, children, size, open, defaultOpen, onOpenChange, modal, closedBy }: DialogProps) {
  return (
    <Root
      size={size}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      modal={modal}
      closedBy={closedBy}
    >
      {trigger ? <Primitive.Trigger render={trigger} /> : null}
      <Primitive.Portal>
        <Backdrop />
        <Viewport>
          <Popup>
            <DialogContent>{children}</DialogContent>
          </Popup>
        </Viewport>
      </Primitive.Portal>
    </Root>
  );
}

/** Compound parts for power-user / custom dialog layouts. */
Dialog.Root = Root;
Dialog.Trigger = Trigger;
/** Creates a handle linking detached `Dialog.Trigger`s to a `Dialog.Root` anywhere in the tree. */
Dialog.createHandle = Primitive.createHandle;
Dialog.Portal = Primitive.Portal;
Dialog.Backdrop = Backdrop;
Dialog.Viewport = Viewport;
Dialog.Popup = Popup;
Dialog.Title = Title;
Dialog.Description = Description;
Dialog.Close = Close;
Dialog.CloseButton = CloseButton;
