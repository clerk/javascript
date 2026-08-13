import { useDialogContext } from '@clerk/headless/dialog';
import { useRender } from '@clerk/headless/utils';
import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import React from 'react';

import { useAccessibleDescriptionWarning } from '../../hooks/useAccessibleDescriptionWarning';
import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
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
// Deep import: the part-name context is how one Mosaic component wraps another and is
// deliberately absent from `../dialog`'s public surface.
import { DialogPartNameContext } from '../dialog/dialog';
import { reset } from '../reset.styles';
import { styles } from './alert-dialog.styles';

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
export type AlertDialogPopupProps = DialogPopupProps;
export type AlertDialogTitleProps = DialogTitleProps;
export type AlertDialogDescriptionProps = DialogDescriptionProps;
export type AlertDialogCloseProps = DialogCloseProps;
export type AlertDialogActionsProps = MosaicComponentProps<'div'>;

/** Owns the open state, and pins the three props that make a dialog an alert dialog. */
function Root<Payload = unknown>({ children, ...rest }: AlertDialogRootProps<Payload>) {
  return (
    <DialogPartNameContext.Provider value='AlertDialog'>
      <Dialog.Root<Payload>
        {...rest}
        role='alertdialog'
        closedBy='closerequest'
        size='prompt'
      >
        {children}
      </Dialog.Root>
    </DialogPartNameContext.Provider>
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

  return (
    <Dialog.Popup
      ref={mergedRef}
      {...props}
    />
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

function AlertDialogContent({ children }: { children: AlertDialogProps['children'] }) {
  const { setOpen } = useDialogContext();
  if (typeof children !== 'function') {
    return <>{children}</>;
  }
  // Routed through the primitive's close funnel, so a controlled consumer's `onOpenChange` sees
  // this close the same as Escape does — and can decline it.
  return <>{children({ close: () => setOpen(false) })}</>;
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
            <AlertDialogContent>{children}</AlertDialogContent>
          </Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
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
