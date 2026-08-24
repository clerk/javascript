import type { DialogFocusTarget } from '@clerk/headless/dialog';
import { useRender } from '@clerk/headless/utils';
import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import React from 'react';

import { useAccessibleDescriptionWarning } from '../../hooks/useAccessibleDescriptionWarning';
import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { Button } from '../button';
import type {
  DialogBackdropProps,
  DialogCloseProps,
  DialogDescriptionProps,
  DialogPopupProps,
  DialogRootProps,
  DialogTitleProps,
  DialogTriggerProps,
  DialogViewportProps,
} from '../dialog';
import { Dialog } from '../dialog';
// Deep import: the part-name context and the content resolver are how one Mosaic component wraps
// another and are deliberately absent from `../dialog`'s public surface.
import { DialogContent, DialogPartNameContext } from '../dialog/dialog';
import { Heading } from '../heading';
import { reset } from '../reset.styles';
import { Text } from '../text';
import { styles } from './alert-dialog.styles';
import { type ConfirmHandle, createConfirmHandle } from './confirm-handle';

/**
 * An alert dialog is a `Dialog` with three decisions already made, so the props that would make
 * them are not offered:
 *
 * - `role` is `alertdialog`, which is the whole point — assistive technology announces it as an
 *   interruption rather than as a surface the user navigated to;
 * - `closedBy` is `closerequest`, so an outside press cannot dismiss it. A dialog asking a
 *   question it needs an answer to must not be answerable by clicking next to it. Escape still
 *   closes, which is not negotiable either: it is the keyboard's equivalent of the cancel button,
 *   and the cancel button is always present here;
 * - `size` is `prompt`, the size that means "asks one thing and returns".
 */
export type AlertDialogRootProps<Payload = unknown> = Omit<DialogRootProps<Payload>, 'closedBy' | 'role' | 'size'>;

export type AlertDialogTriggerProps<Payload = unknown> = DialogTriggerProps<Payload>;
export type AlertDialogBackdropProps = DialogBackdropProps;
export type AlertDialogViewportProps = DialogViewportProps;
export type AlertDialogPopupProps = Omit<DialogPopupProps, 'role'>;
export type AlertDialogTitleProps = DialogTitleProps;
export type AlertDialogDescriptionProps = DialogDescriptionProps;
export type AlertDialogCloseProps = DialogCloseProps;
export type AlertDialogActionsProps = MosaicComponentProps<'div'>;

/** Owns the open state, and pins the three props that make a dialog an alert dialog. */
function Root<Payload = unknown>({ children, ...rest }: AlertDialogRootProps<Payload>) {
  return (
    <Dialog.Root<Payload>
      {...rest}
      role='alertdialog'
      closedBy='closerequest'
      size='prompt'
    >
      {children}
    </Dialog.Root>
  );
}

/**
 * The alert surface. Identical to `Dialog.Popup` — same styles, same focus trap, same stacking —
 * plus the description check, which is a requirement here rather than a nicety.
 *
 * No `Dialog.CloseButton` counterpart, and that omission is the design: a corner X is a way out
 * without answering, and an alert dialog has no such path. The cancel button is the way out.
 */
const Popup = React.forwardRef<HTMLDivElement, AlertDialogPopupProps>(function AlertDialogPopup(props, ref) {
  // Observed through state rather than a plain ref, for the same reason `Dialog.Popup` does it:
  // the warning has to re-run when the node arrives, and a ref mutation does not re-render.
  const [node, setNode] = React.useState<HTMLDivElement | null>(null);
  useAccessibleDescriptionWarning(node, 'AlertDialog');

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

  // Scoped to the popup rather than to the whole root: this is the only place the name is read,
  // and a plain `Dialog` nested inside an alert would otherwise inherit it and have its own
  // warnings name `AlertDialog` parts that do not exist at that call site.
  return (
    <DialogPartNameContext.Provider value='AlertDialog'>
      {/* After the spread on purpose: `mergeProps` lets consumer props win, so a `role` passed
          here would otherwise downgrade the alert back to a plain dialog. */}
      <Dialog.Popup
        ref={mergedRef}
        {...props}
        role='alertdialog'
      />
    </DialogPartNameContext.Provider>
  );
});

/**
 * The row holding the answer. Render the cancel first — see `alert-dialog.styles.ts` for why that
 * ordering is what focuses it on open.
 */
const Actions = React.forwardRef<HTMLDivElement, AlertDialogActionsProps>(function AlertDialogActions(
  { render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('alert-dialog-actions'),
        stylex.props(reset.base, styles.actions),
        className,
        style,
      ),
      ...rest,
    },
  });
});

export interface AlertDialogProps
  extends
    Pick<AlertDialogRootProps, 'open' | 'defaultOpen' | 'onOpenChange' | 'modal'>,
    /**
     * Focus, forwarded to the popup. `finalFocus` earns its place on the wrapper rather than only
     * on the part: an alert is usually raised by something that happened rather than by a trigger,
     * and with no trigger there is nothing for focus to return to when it closes. Answering
     * "keep editing" should put the caret back in the field the question was about.
     */
    Pick<AlertDialogPopupProps, 'finalFocus' | 'initialFocus'> {
  /**
   * Renders the button that opens the alert. Omit for alerts driven entirely by `open` — the
   * common case, since an alert is usually raised by something that already happened rather than
   * by a button that exists to raise it.
   */
  trigger?: MosaicComponentProps<'button'>['render'];
  children: ReactNode | ((ctx: { close: () => void }) => ReactNode);
}

/**
 * Mosaic `AlertDialog` — a `Dialog` that interrupts to ask for a decision, and waits for one.
 *
 * Reach for it when continuing depends on the answer: confirming something destructive, or
 * warning that leaving loses work. Anything the user can simply read and dismiss is a `Dialog`.
 *
 * Composed from the same parts, so everything true of `Dialog` is true here — the surface, the
 * motion, the stacking over another dialog, the scroll lock. What differs is what it announces
 * itself as, that an outside press does not dismiss it, and that it carries a `Title`, a
 * `Description`, and an `Actions` row rather than arbitrary content. Both are checked in
 * development; neither is enforceable in the type system, since parts arrive as children.
 *
 * Drop to the compound parts (`AlertDialog.Root` and friends) for layouts this wrapper does not
 * cover.
 *
 * @example
 * <AlertDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   trigger={props => <Button {...props} color='negative'>Delete</Button>}
 * >
 *   <AlertDialog.Title>Delete this key?</AlertDialog.Title>
 *   <AlertDialog.Description>Applications using it will stop working immediately.</AlertDialog.Description>
 *   <AlertDialog.Actions>
 *     <AlertDialog.Close render={<Button variant='outline' />}>Cancel</AlertDialog.Close>
 *     <Button color='negative' onClick={remove}>Delete key</Button>
 *   </AlertDialog.Actions>
 * </AlertDialog>
 */
export function AlertDialog({
  trigger,
  children,
  open,
  defaultOpen,
  onOpenChange,
  modal,
  initialFocus,
  finalFocus,
}: AlertDialogProps) {
  return (
    <Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      modal={modal}
    >
      {trigger ? <Dialog.Trigger render={trigger} /> : null}
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Viewport>
          <Popup
            initialFocus={initialFocus}
            finalFocus={finalFocus}
          >
            <DialogContent>{children}</DialogContent>
          </Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Root>
  );
}

export interface AlertDialogConfirmProps {
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
 * The dialog half of {@link createConfirmHandle} — an alert dialog rendered from whatever the
 * `show()` call asked, and closed by answering it.
 *
 * Render it INSIDE the dialog it guards (anywhere in its children; outside its `Portal` is fine).
 * That is what puts the two in one floating tree, which is what escape ordering, the stacking
 * styles and the refcounted scroll lock all read.
 */
function Confirm({ handle, finalFocus }: AlertDialogConfirmProps) {
  // A question can only be answered while the thing that asks it is on screen. Going away with one
  // in flight would leave the promise unresolved forever, and `show()` short-circuits on an
  // in-flight question — so the handle would never open a confirmation again, and a guarded dialog
  // whose closes route through one could no longer be closed at all.
  React.useEffect(() => () => handle.settle(false), [handle]);

  return (
    <Root
      handle={handle.dialog}
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
          <Dialog.Portal>
            <Dialog.Backdrop />
            <Dialog.Viewport>
              <Popup finalFocus={finalFocus}>
                <Dialog.Title render={<Heading size='sm' />}>{payload.title}</Dialog.Title>
                <Dialog.Description render={<Text />}>{payload.description}</Dialog.Description>
                <Actions>
                  <Dialog.Close render={<Button variant='outline' />}>{payload.cancelLabel ?? 'Cancel'}</Dialog.Close>
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
            </Dialog.Viewport>
          </Dialog.Portal>
        ) : null
      }
    </Root>
  );
}

/**
 * Compound parts. The ones an alert dialog does not change are `Dialog`'s own — same components,
 * not wrappers around them, so there is one implementation of each and no way for the two to
 * drift.
 */
AlertDialog.Root = Root;
AlertDialog.Trigger = Dialog.Trigger;
/** Creates a handle linking detached `AlertDialog.Trigger`s to an `AlertDialog.Root` anywhere in the tree. */
AlertDialog.createHandle = Dialog.createHandle;
AlertDialog.Portal = Dialog.Portal;
AlertDialog.Backdrop = Dialog.Backdrop;
AlertDialog.Viewport = Dialog.Viewport;
AlertDialog.Popup = Popup;
AlertDialog.Title = Dialog.Title;
AlertDialog.Description = Dialog.Description;
AlertDialog.Close = Dialog.Close;
AlertDialog.Actions = Actions;
AlertDialog.Confirm = Confirm;
/** Creates the handle pairing an awaitable `show()` with an `<AlertDialog.Confirm>`. */
AlertDialog.createConfirmHandle = createConfirmHandle;
