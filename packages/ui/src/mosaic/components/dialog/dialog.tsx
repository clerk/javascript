import type {
  DialogClosedBy,
  DialogFocusTarget,
  DialogHandle,
  DialogProps as HeadlessDialogProps,
} from '@clerk/headless/dialog';
import { Dialog as Primitive, useDialogContext as useHeadlessDialogContext } from '@clerk/headless/dialog';
import { useRender } from '@clerk/headless/utils';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { useAccessibleDescriptionWarning } from '../../hooks/useAccessibleDescriptionWarning';
import { useAccessibleNameWarning } from '../../hooks/useAccessibleNameWarning';
import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../utils/reset.styles';
import { Button } from '../button';
import { Heading } from '../heading';
import { Icon } from '../icon';
import { Text } from '../text';
import { type ConfirmHandle, createConfirmHandle } from './confirm-handle';
import { backdropMotion, closeInsets, popupMotion, sizes, styles, trackSizes, viewportSizes } from './dialog.styles';
import { acquireKeyboardInset } from './keyboard-inset';

/** Width of the dialog surface, and for `panel` its height too. */
export type DialogSize = keyof typeof sizes;

/**
 * The dialog surface a part is rendered inside, or `null` when there is none.
 *
 * The general answer to "am I in a dialog": a part reads it to take an id, or to adapt to the
 * surface, without branching on where it was rendered. `Card.Title` is the first consumer — it
 * takes `labelId` and so names the dialog, and carries no id at all outside one.
 *
 * Distinct from the headless `DialogContext`, which `Dialog.Root` provides. `Root` also spans the
 * trigger, so a part reading that one reports a dialog while sitting outside the popup, and would
 * claim ids that belong to the surface. This is published by the popup, which is the real boundary.
 *
 * It is also how a dialog learns about the one it renders inside: `Dialog.Popup` reads it before
 * publishing its own, and that is what decides whether two dialogs form a STACK — successive
 * prompts — or a nested dialog over a `panel` or `card`. The two want opposite backdrops.
 */
export interface DialogContextValue {
  /** Id the popup points `aria-labelledby` at. The part that names the dialog takes it. */
  labelId: string;
  /** Id the popup points `aria-describedby` at. The part that describes the dialog takes it. */
  descriptionId: string;
  /** Width, and for `panel` also height, of the surface. */
  size: DialogSize;
  /** Whether the surface is presented in its host rather than over the page — see `Dialog.Root`. */
  inline: boolean;
}

export const DialogContext = React.createContext<DialogContextValue | null>(null);

/**
 * What the root decided about how its dialog is presented, for the parts it does not render
 * itself. Only `Dialog.Popup` reads it; a consumer never sets it.
 */
const DialogPresentationContext = React.createContext<{ inline: boolean }>({ inline: false });

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
export type DialogActionsProps = MosaicComponentProps<'div'>;

export interface DialogPopupProps extends MosaicComponentProps<'div'> {
  /**
   * Width, and for `panel` also height, of the dialog surface. Ignored under
   * `role="alertdialog"`, which is always a `prompt`. @default 'prompt'
   */
  size?: DialogSize;
  /**
   * Where focus moves when the dialog opens. Default: the first tabbable element inside it —
   * or nowhere, for an `inline` dialog, which mounts with the page rather than in answer to a
   * gesture.
   */
  initialFocus?: DialogFocusTarget;
  /** Where focus returns when the dialog closes. Default: the trigger; nowhere for an `inline` dialog. */
  finalFocus?: DialogFocusTarget;
}

type DialogRootBaseProps<Payload> = Omit<HeadlessDialogProps<Payload>, 'role' | 'closedBy'> & {
  /**
   * Presents the dialog in its host rather than over the page: no portal, no scrim, no scroll
   * lock, no focus trap, and nothing dismisses it — it is open for as long as it is mounted.
   * For a surface that is the page's content, such as an account panel mounted in a layout slot.
   *
   * Implies `open`, `modal={false}` and `closedBy='none'`; those props are ignored. A dialog
   * opened from inside an inline one presents normally, over the page.
   */
  inline?: boolean;
};

/**
 * `role` decides the dismissal policy and the size, so the props that would contradict it are
 * narrowed away rather than checked at runtime:
 *
 * - `alertdialog` announces as an interruption rather than as a surface the user navigated to;
 * - it cannot be dismissed by an outside press. A dialog asking a question it needs an answer to
 *   must not be answerable by clicking next to it. Escape still closes, which is the keyboard's
 *   equivalent of the cancel button that is always present;
 * - it is always a `prompt`, the size that means "asks one thing and returns".
 */
export type DialogRootProps<Payload = unknown> = DialogRootBaseProps<Payload> &
  (
    | {
        /** The popup's ARIA role. @default 'dialog' */
        role?: 'dialog';
        /** Which gestures dismiss the dialog. @default 'any' */
        closedBy?: DialogClosedBy;
      }
    | {
        role: 'alertdialog';
        /** An alert dialog never dismisses on an outside press. @default 'closerequest' */
        closedBy?: Exclude<DialogClosedBy, 'any'>;
      }
  );

/** Owns the open state and the decisions — role, presentation — every part reads. */
function Root<Payload = unknown>({
  inline = false,
  role = 'dialog',
  closedBy,
  open,
  defaultOpen,
  onOpenChange,
  modal,
  children,
  ...rest
}: DialogRootProps<Payload>) {
  const presentation = React.useMemo(() => ({ inline }), [inline]);
  const resolvedClosedBy = closedBy ?? (role === 'alertdialog' ? 'closerequest' : 'any');
  return (
    <DialogPresentationContext.Provider value={presentation}>
      <Primitive.Root<Payload>
        {...rest}
        role={role}
        // An inline dialog is open for as long as it is mounted and closes for nothing, so a
        // consumer's `onOpenChange` is withheld too: floating-ui asks a non-modal dialog to close
        // when focus leaves it, and that request would otherwise reach the consumer as a close.
        closedBy={inline ? 'none' : resolvedClosedBy}
        modal={inline ? false : modal}
        open={inline ? true : open}
        defaultOpen={inline ? undefined : defaultOpen}
        onOpenChange={inline ? undefined : onOpenChange}
      >
        {children}
      </Primitive.Root>
    </DialogPresentationContext.Provider>
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
 * Warns when the corner dismiss is rendered where it has no business being: inside an alert
 * dialog, where a corner X is a way out without answering, or an inline dialog, which nothing
 * closes.
 */
function useCloseButtonWarning(isAlert: boolean, inline: boolean) {
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'production' || !(isAlert || inline)) {
      return;
    }
    console.warn(
      isAlert
        ? '[clerk] <Dialog.CloseButton> is rendered inside an alert dialog. A corner X is a way out without answering; the cancel action in <Dialog.Actions> is the way out.'
        : '[clerk] <Dialog.CloseButton> is rendered inside an inline dialog, which nothing closes. It was not rendered.',
    );
  }, [isAlert, inline]);
}

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
  const surface = React.useContext(DialogContext);
  const { role } = useHeadlessDialogContext();
  const size = surface?.size ?? 'prompt';
  const inline = surface?.inline ?? false;
  useCloseButtonWarning(role === 'alertdialog', inline);
  if (inline) {
    return null;
  }
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

/**
 * The scrim behind the dialog. Owns no scroll lock or positioning — that is the viewport.
 * Rendered by `Dialog.Popup`, which is also what decides the two things it varies on.
 */
function Backdrop({ size, stacked, overInline }: { size: DialogSize; stacked: boolean; overInline: boolean }) {
  return (
    <Primitive.Backdrop
      {...mergeStyleProps(
        themeProps('dialog-backdrop'),
        // All in one `stylex.props` call so a later `backgroundColor` replaces the one in
        // `backdrop` outright — across two calls both would emit and the cascade would decide.
        stylex.props(
          reset.base,
          styles.backdrop,
          overInline && styles.backdropOverInline,
          stacked && styles.backdropStacked,
          backdropMotion[size],
        ),
      )}
    />
  );
}

/**
 * The box the popup is sized against and the query container its bands read, holding the track
 * that centres the popup and carries the inset. Two elements because a container cannot query
 * itself: the width-dependent rules have to sit one level inside the element that is the
 * container. Over the page the viewport also locks body scroll and — because the track is what
 * owns the inset — publishes the on-screen keyboard's share of the viewport for the track's
 * bottom padding to consume. See `keyboard-inset.ts`. Inline, it is a plain box that fills its host.
 */
function Viewport({ size, inline, children }: { size: DialogSize; inline: boolean; children: React.ReactNode }) {
  React.useEffect(() => (inline ? undefined : acquireKeyboardInset()), [inline]);
  return (
    <Primitive.Viewport
      overlay={!inline}
      lockScroll={!inline}
      {...mergeStyleProps(
        themeProps('dialog-viewport', { size, inline }),
        stylex.props(reset.base, styles.viewport, viewportSizes[size]),
      )}
    >
      <div
        {...mergeStyleProps(
          themeProps('dialog-track', { size, inline }),
          stylex.props(reset.base, styles.track, trackSizes[size], inline && styles.trackInline),
        )}
      >
        {children}
      </div>
    </Primitive.Viewport>
  );
}

/**
 * Warns when a `panel` opens inside another dialog.
 *
 * A `panel` is a root-level surface: it hosts what opens over it and is never the thing that
 * opens. Inside a dialog it renders at a size that assumes it owns the viewport, over a surface it
 * was meant to replace. A `prompt` or a `card` — a confirmation holding a `Card`, say — is what
 * opens over a panel, and either is fine.
 */
function useNestedSizeWarning(isNestedInDialog: boolean, size: DialogSize) {
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'production' || !isNestedInDialog || size !== 'panel') {
      return;
    }
    console.warn(
      '[clerk] a size="panel" Dialog opened inside another Dialog. A panel is a root-level surface that hosts what opens over it; open a prompt or a card instead.',
    );
  }, [isNestedInDialog, size]);
}

/** Warns when a size other than `prompt` is asked of an alert dialog, which ignores it. */
function useAlertSizeWarning(isAlert: boolean, size: DialogSize | undefined) {
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'production' || !isAlert || size === undefined || size === 'prompt') {
      return;
    }
    console.warn(
      `[clerk] <Dialog.Popup size="${size}"> is inside a role="alertdialog" root, which is always a prompt. The size was ignored.`,
    );
  }, [isAlert, size]);
}

/**
 * The dialog surface: `role="dialog"` (or `alertdialog`, from the root), focus-trapped, and the
 * element that paints — and the whole floating tree around it. Over the page that is a portal,
 * a scrim, and a centering viewport; inline it is the viewport alone, in place. Neither is a
 * part a consumer composes, so they stay out of the public API.
 */
const Popup = React.forwardRef<HTMLDivElement, DialogPopupProps>(function DialogPopup(
  { size: sizeProp, initialFocus, finalFocus, className, style, ...rest },
  ref,
) {
  const { inline } = React.useContext(DialogPresentationContext);
  // The dialog this one renders inside, read before this popup publishes its own.
  const host = React.useContext(DialogContext);
  // The headless flag, not the stack check below — the size rule is about opening a dialog inside
  // ANY dialog, which is broader than the prompt-on-prompt case the stacking styles cover.
  const { role, isStacked: isNestedInDialog, labelId, descriptionId } = useHeadlessDialogContext();
  const isAlert = role === 'alertdialog';
  const size: DialogSize = isAlert ? 'prompt' : (sizeProp ?? 'prompt');
  useAlertSizeWarning(isAlert, sizeProp);
  useNestedSizeWarning(isNestedInDialog, size);

  const surface = React.useMemo(
    () => ({ labelId, descriptionId, size, inline }),
    [labelId, descriptionId, size, inline],
  );
  // Observed through state rather than a plain ref, because the warnings have to re-run when the
  // node arrives and a ref mutation does not re-render.
  const [node, setNode] = React.useState<HTMLDivElement | null>(null);
  useAccessibleNameWarning(node, 'Dialog');
  // A name alone is enough for an ordinary dialog; an alert is announced as an interruption and
  // its description is what says which decision is being asked for.
  useAccessibleDescriptionWarning(isAlert ? node : null, 'Dialog');

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

  const popup = (
    <DialogContext.Provider value={surface}>
      <Primitive.Popup
        ref={mergedRef}
        initialFocus={inline ? (initialFocus ?? false) : initialFocus}
        finalFocus={inline ? (finalFocus ?? false) : finalFocus}
        {...mergeStyleProps(
          themeProps('dialog-popup', { size, inline }),
          stylex.props(reset.base, styles.popup, sizes[size], popupMotion[size]),
          className,
          style,
        )}
        {...rest}
        // After the spread on purpose: `mergeProps` lets consumer props win, so a `role` passed
        // here would otherwise downgrade the alert back to a plain dialog.
        {...(isAlert ? { role: 'alertdialog' } : null)}
      />
    </DialogContext.Provider>
  );

  if (inline) {
    return (
      <Viewport
        size={size}
        inline
      >
        {popup}
      </Viewport>
    );
  }

  return (
    <Primitive.Portal>
      <Backdrop
        size={size}
        // A prompt stacked on a prompt paints no scrim of its own — one serves the whole stack.
        // Decided here rather than keyed on `data-stacked`, because whether this is a stack
        // depends on the size of the dialog beneath, which the headless layer has no notion of.
        stacked={isNestedInDialog && host?.size === 'prompt'}
        // The nested scrim is solved to composite over the host's own; an inline host has none.
        overInline={host?.inline ?? false}
      />
      <Viewport
        size={size}
        inline={false}
      >
        {popup}
      </Viewport>
    </Primitive.Portal>
  );
});

/**
 * The row holding an alert dialog's answer. Render the cancel first — see `dialog.styles.ts` for
 * why that ordering is what focuses it on open.
 */
const Actions = React.forwardRef<HTMLDivElement, DialogActionsProps>(function DialogActions(
  { render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('dialog-actions'), stylex.props(reset.base, styles.actions), className, style),
      ...rest,
    },
  });
});

export interface DialogConfirmProps {
  /** Shared with the `show()` call, or with `useConfirmedClose`, that raises this confirmation. */
  handle: ConfirmHandle;
  /**
   * Where focus goes when the confirmation closes. Worth passing: the confirmation has no trigger,
   * so by default there is nothing for focus to return to. Point it at the field the question was
   * about and declining puts the caret back in it.
   */
  finalFocus?: DialogFocusTarget;
}

/**
 * The dialog half of `createConfirmHandle` — an alert dialog rendered from whatever the `show()`
 * call asked, and closed by answering it.
 *
 * Render it INSIDE the dialog it guards (anywhere in its popup). That is what puts the two in one
 * floating tree, which is what escape ordering, the stacking styles and the refcounted scroll
 * lock all read.
 */
function Confirm({ handle, finalFocus }: DialogConfirmProps) {
  // A question can only be answered while the thing that asks it is on screen. Going away with one
  // in flight would leave the promise unresolved forever, and `show()` short-circuits on an
  // in-flight question — so the handle would never open a confirmation again, and a guarded dialog
  // whose closes route through one could no longer be closed at all.
  React.useEffect(() => () => handle.settle(false), [handle]);

  return (
    <Root
      handle={handle.dialog}
      role='alertdialog'
      onOpenChange={open => {
        // Every close that is not the action lands here — cancel, Escape, a programmatic close —
        // and they all mean no. The action settles `true` BEFORE closing, and `settle` is a no-op
        // once the question is answered, so this cannot overwrite it.
        if (!open) {
          handle.settle(false);
        }
      }}
    >
      {({ payload }) =>
        payload ? (
          <Popup finalFocus={finalFocus}>
            <Title render={<Heading size='sm' />}>{payload.title}</Title>
            <Description render={<Text />}>{payload.description}</Description>
            <Actions>
              <Close render={<Button variant='outline' />}>{payload.cancelLabel ?? 'Cancel'}</Close>
              <Button
                color={payload.destructive ? 'negative' : undefined}
                onClick={() => {
                  handle.settle(true);
                  handle.dialog.close();
                }}
              >
                {payload.actionLabel ?? 'Confirm'}
              </Button>
            </Actions>
          </Popup>
        ) : null
      }
    </Root>
  );
}

/**
 * Mosaic `Dialog` — a modal surface built on the `@clerk/headless` dialog primitive, composed
 * via dot syntax:
 *
 * ```tsx
 * <Dialog.Root>
 *   <Dialog.Trigger render={<Button />}>Open</Dialog.Trigger>
 *   <Dialog.Popup size='prompt'>
 *     <Dialog.CloseButton />
 *     <Dialog.Title>…</Dialog.Title>
 *     <Dialog.Description>…</Dialog.Description>
 *   </Dialog.Popup>
 * </Dialog.Root>
 * ```
 *
 * `Dialog.Popup` renders the portal, the scrim and the centering viewport itself, so those are
 * not parts. `role='alertdialog'` on the root makes it an alert dialog — one that interrupts to
 * ask for a decision and waits for one — with `Dialog.Actions` for the answer and
 * `Dialog.Confirm` for a whole confirmation raised from a `show()` call. `inline` on the root
 * presents it in its host instead of over the page.
 *
 * Each styled part spreads `themeProps` + `stylex.props` through `mergeStyleProps`, so it
 * carries the public `.cl-<slot>` class and StyleX atoms while the headless part keeps its focus
 * management, scroll lock, and ARIA wiring.
 */
export const Dialog = {
  Root,
  Trigger,
  Popup,
  Title,
  Description,
  Close,
  CloseButton,
  Actions,
  Confirm,
  /** Creates a handle linking detached `Dialog.Trigger`s to a `Dialog.Root` anywhere in the tree. */
  createHandle: Primitive.createHandle,
  /** Creates the handle pairing an awaitable `show()` with a `<Dialog.Confirm>`. */
  createConfirmHandle,
};
