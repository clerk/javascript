import { Dialog as Primitive, type DialogHandle } from '@clerk/headless/dialog';
import type { ReactNode } from 'react';

/** What a confirmation asks. Delivered to `<AlertDialog.Confirm>` as the dialog's payload. */
export interface ConfirmOptions {
  title: ReactNode;
  description: ReactNode;
  /** Label on the confirming button. @default 'Confirm' */
  actionLabel?: ReactNode;
  /** Label on the declining button. @default 'Cancel' */
  cancelLabel?: ReactNode;
  /** Colours the action as destructive, for a confirmation that discards or deletes. */
  destructive?: boolean;
}

/**
 * Links a `show()` call to the `<AlertDialog.Confirm>` that answers it. Create with
 * {@link createConfirmHandle}; `show` is the whole public surface.
 */
export interface ConfirmHandle {
  /**
   * Opens the confirmation and resolves with the user's answer: `true` for the action, `false`
   * for cancel or any dismissal.
   *
   * Calling it while a confirmation is already showing returns the IN-FLIGHT promise rather than
   * opening a second one — repeated Escapes against a guarded dialog would otherwise stack
   * confirmations, one per keypress. The options of the later call are ignored, since the
   * question on screen is already the one being answered.
   *
   * The `<AlertDialog.Confirm>` must be MOUNTED when this is called. It is what opens, and a
   * `dialog.open()` with no root attached is a no-op. Since the confirmation belongs inside the
   * dialog it guards, that means asking only from inside that dialog while it is open. Calling it
   * with nothing mounted resolves `false` and warns in development; a confirmation that unmounts
   * with a question in flight answers `false` too, rather than hanging.
   */
  show(options: ConfirmOptions): Promise<boolean>;
  /** The dialog handle `<AlertDialog.Confirm>` mounts against. @internal */
  readonly dialog: DialogHandle<ConfirmOptions>;
  /**
   * Resolves the in-flight promise, if any. Idempotent per question: the second call for the same
   * `show()` is a no-op, which is what lets the action settle `true` and then close through the
   * ordinary path without the close settling `false` on top of it. @internal
   */
  settle(confirmed: boolean): void;
}

/**
 * Creates a {@link ConfirmHandle}: an awaitable confirmation, in the shape of a promise rather
 * than a pair of state variables and a callback.
 *
 * ```ts
 * const confirm = createConfirmHandle();
 * if (await confirm.show({ title: 'Discard changes?', description: '…' })) {
 *   discard();
 * }
 * ```
 *
 * The dialog itself is still rendered as JSX — `<AlertDialog.Confirm handle={confirm} />` — and
 * where it is rendered matters: it belongs inside the dialog it guards, so the two are in the same
 * floating tree and escape ordering, the stacking styles and the refcounted scroll lock all apply.
 * A confirmation mounted app-globally would be a sibling of the dialog rather than a child of it,
 * and every one of those would break.
 *
 * Create one per guarded dialog, at module scope or in a `useMemo` — never inside the render body
 * without one, since a new handle each render would orphan the promise a `show()` is waiting on.
 */
export function createConfirmHandle(): ConfirmHandle {
  const dialog = Primitive.createHandle<ConfirmOptions>();
  let pending: { promise: Promise<boolean>; resolve: (confirmed: boolean) => void } | null = null;

  return {
    dialog,
    show(options) {
      if (pending) {
        return pending.promise;
      }
      // `dialog.open` is a no-op with no root attached, so storing `pending` first would leave a
      // promise nothing can ever settle — and every later `show()` would return that dead promise,
      // outliving the mistake. Answer no instead.
      if (!dialog.hasRoot) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(
            '[clerk] `confirm.show()` was called with no `<AlertDialog.Confirm>` mounted against this handle, so there is nothing to open. It resolved `false`. Render `<AlertDialog.Confirm handle={…} />` inside the dialog it guards, and ask only while that dialog is open.',
          );
        }
        return Promise.resolve(false);
      }
      let resolve!: (confirmed: boolean) => void;
      const promise = new Promise<boolean>(res => {
        resolve = res;
      });
      pending = { promise, resolve };
      // The options ride along as the dialog's payload rather than being held in state out here,
      // so what is on screen and what the promise resolves are the same object.
      dialog.open(options);
      return promise;
    },
    settle(confirmed) {
      const inFlight = pending;
      pending = null;
      inFlight?.resolve(confirmed);
    },
  };
}
