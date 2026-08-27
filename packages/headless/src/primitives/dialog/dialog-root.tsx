'use client';

import {
  FloatingNode,
  FloatingTree,
  useDismiss,
  useFloating,
  useFloatingNodeId,
  useFloatingParentNodeId,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import { type ReactNode, useCallback, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { useControllableState } from '../../hooks/use-controllable-state';
import { useReturnFocus } from '../../hooks/use-return-focus';
import { useTransition } from '../../hooks/use-transition';
import { DialogContext, type DialogContextValue } from './dialog-context';
import { createDialogHandle, type DialogHandle } from './dialog-handle';
import { DialogNestingContext, useDialogNesting } from './dialog-nesting';

/**
 * Which gestures dismiss the dialog, mirroring the native `<dialog closedby>` attribute.
 *
 * - `any` — Escape and outside press
 * - `closerequest` — Escape only
 * - `none` — neither; the dialog closes only programmatically
 *
 * A single ordered enum rather than two booleans, so the fourth combination — outside press
 * dismisses but Escape does not — stays unrepresentable. Dismissing by pointer but not by
 * keyboard is not something to offer.
 */
export type DialogClosedBy = 'any' | 'closerequest' | 'none';

/**
 * The popup's ARIA role. `alertdialog` is for a dialog interrupting the user to confirm or warn,
 * which assistive technology announces more urgently; everything else is a `dialog`.
 */
export type DialogRole = 'dialog' | 'alertdialog';

/** What accompanies an `onOpenChange` call, mirroring Base UI's event details. */
export interface DialogOpenChangeDetails {
  /**
   * The trigger element behind the change — on open, the trigger that was activated. `null`
   * when no trigger drove the change (Escape, outside press, a programmatic close), which is
   * what lets a controlled consumer clear its `triggerId` on close.
   */
  trigger: HTMLElement | null;
  /** That trigger's id, or `null`. */
  triggerId: string | null;
  /** The DOM event behind the change; programmatic changes carry none. */
  event: Event | undefined;
}

export interface DialogProps<Payload = unknown> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, details: DialogOpenChangeDetails) => void;
  /** When true, the dialog traps focus and blocks interaction with the rest of the page. Default: true */
  modal?: boolean;
  /** Which gestures dismiss the dialog. Default: `any` */
  closedBy?: DialogClosedBy;
  /** The popup's ARIA role. Default: `dialog` */
  role?: DialogRole;
  /**
   * Connects this root to triggers rendered outside it. Create with `Dialog.createHandle()`
   * and pass the same handle to each `Dialog.Trigger`.
   */
  handle?: DialogHandle<Payload>;
  /**
   * Controls which trigger the open is attributed to, by the trigger's `id`. Leave undefined
   * to let the root track it automatically; pass it (driven from `onOpenChange`'s
   * `details.triggerId`) when `open` is controlled and more than one trigger exists, or to
   * open programmatically as if a given trigger had been activated.
   */
  triggerId?: string | null;
  /** Content, or a function of `{ payload }` — the active trigger's, or the one `handle.open()` supplied. */
  children: ReactNode | ((ctx: { payload: Payload | undefined }) => ReactNode);
}

function DialogInner<Payload>(props: DialogProps<Payload> & { isNested: boolean }) {
  const nodeId = useFloatingNodeId();
  const { modal = true, closedBy = 'any', role: ariaRole = 'dialog', isNested, children, onOpenChange } = props;

  const fallbackStore = useMemo(() => createDialogHandle<Payload>(), []);
  const store = props.handle ?? fallbackStore;

  const [open, setOpenState] = useControllableState(props.open, props.defaultOpen ?? false);
  const [activeTriggerId, setActiveTriggerId] = useControllableState<string | null>(props.triggerId, null);
  const [activePayload, setActivePayload] = useState<Payload | undefined>(undefined);

  const labelId = useId();
  const descriptionId = useId();

  const popupRef = useRef<HTMLDivElement | null>(null);

  // Details for a change initiated through a trigger, staged by the controller below and
  // consumed by the floating `onOpenChange` the request funnels into.
  const pendingDetailsRef = useRef<DialogOpenChangeDetails | null>(null);

  // The payload of the most recent programmatic `handle.open(payload)`, kept so the registry
  // lookup below has something to fall back to when no trigger is involved.
  const directPayloadRef = useRef<Payload | undefined>(undefined);

  // Every open/close funnels through `floatingContext.onOpenChange` — trigger activations,
  // dismissals, and programmatic `setOpen` alike. floating-ui emits its `openchange` event
  // synchronously before invoking this callback, which is what lets listeners (`useReturnFocus`,
  // the popup's `finalFocus` resolution) see the change and its event before any focus
  // restoration can run.
  const { refs, context: floatingContext } = useFloating({
    nodeId,
    open,
    onOpenChange: (nextOpen, event) => {
      const details = pendingDetailsRef.current ?? { trigger: null, triggerId: null, event };
      pendingDetailsRef.current = null;
      setOpenState(nextOpen);
      onOpenChange?.(nextOpen, details);
    },
  });

  useLayoutEffect(() => {
    return store.setRoot({
      openFromTrigger: (id, event) => {
        const registration = store.getTrigger(id);
        setActiveTriggerId(id);
        // A trigger names its own payload, so it supersedes anything a previous programmatic
        // open supplied — otherwise the stale one would resurface through the effect below.
        directPayloadRef.current = undefined;
        setActivePayload(registration?.getPayload());
        if (registration) {
          refs.setReference(registration.element);
        }
        pendingDetailsRef.current = { trigger: registration?.element ?? null, triggerId: id, event };
        floatingContext.onOpenChange(true, event, 'click');
      },
      closeFromTrigger: (id, event) => {
        const registration = store.getTrigger(id);
        pendingDetailsRef.current = { trigger: registration?.element ?? null, triggerId: id, event };
        floatingContext.onOpenChange(false, event, 'click');
      },
      setOpen: (nextOpen, payload) => {
        // Held in a ref as well as in state because the payload effect below re-runs on `open`
        // and would otherwise resolve a trigger-less open to `undefined`, wiping this a commit
        // after it was set. Cleared on close as well, so the next payload-less open does not
        // resurface this one.
        directPayloadRef.current = payload;
        // Published only on the way IN. A close carries no payload, and writing it would blank
        // the children-as-function while the popup is still mounted for its exit transition —
        // rendering the dialog empty as it leaves, or throwing in a consumer that dereferences
        // the payload. The next open sets it afresh.
        if (nextOpen) {
          setActivePayload(payload);
        }
        floatingContext.onOpenChange(nextOpen);
      },
    });
    // `floatingContext` is rebuilt on open/element changes; re-registering is an idempotent swap.
  }, [store, refs, floatingContext, setActiveTriggerId]);

  // The floating reference is the ACTIVE trigger — return focus and outside-press exclusion
  // both read `elements.domReference`. With no active trigger the first
  // registered one stands in, preserving single-trigger behaviour for `defaultOpen` dialogs.
  //
  // Subscribed imperatively rather than through `useSyncExternalStore`, so triggers mounting
  // and unmounting re-resolve the reference without re-rendering the root.
  useLayoutEffect(() => {
    const resolve = () => {
      const active = activeTriggerId != null ? store.getTrigger(activeTriggerId) : undefined;
      refs.setReference(active?.element ?? store.getFirstTrigger()?.element ?? null);
    };
    resolve();
    return store.subscribe(resolve);
  }, [store, activeTriggerId, refs]);

  // For opens that arrive without a trigger activation — a controlled `open`/`triggerId` pair,
  // `defaultOpen` — the payload is looked up from the registry once the dialog is open. Runs
  // after the children's layout effects, so triggers rendered inside the root are registered by
  // the time it reads, and the pre-paint re-render delivers their payload on the first frame.
  //
  // An explicit programmatic payload wins over the registry lookup: `activeTriggerId` is never
  // reset on close, so once any trigger has opened the dialog the lookup would otherwise overwrite
  // every later `handle.open(payload)` with that trigger's payload. The mirror already holds —
  // `openFromTrigger` clears `directPayloadRef`, so a trigger wins the other way.
  useLayoutEffect(() => {
    if (open) {
      const direct = directPayloadRef.current;
      setActivePayload(
        direct !== undefined
          ? direct
          : activeTriggerId != null
            ? store.getTrigger(activeTriggerId)?.getPayload()
            : undefined,
      );
    }
  }, [store, open, activeTriggerId]);

  // What detached triggers render their open state and ARIA wiring from.
  useLayoutEffect(() => {
    store.publishState({ open, triggerId: activeTriggerId, popupId: floatingContext.floatingId });
  }, [store, open, activeTriggerId, floatingContext.floatingId]);
  useLayoutEffect(() => {
    return () => store.publishState({ open: false, triggerId: null, popupId: undefined });
  }, [store]);

  const returnFocusRef = useReturnFocus(floatingContext);

  const { mounted, transitionProps } = useTransition({
    open,
    ref: popupRef,
  });

  // Below `useTransition` because it needs `mounted`: what a stacked child has to key off is
  // whether this dialog is still on screen, not whether it is still open.
  const nesting = useDialogNesting(open, mounted);

  const dismiss = useDismiss(floatingContext, {
    outsidePressEvent: 'mousedown',
    escapeKey: closedBy !== 'none',
    outsidePress: closedBy === 'any',
  });
  const role = useRole(floatingContext, { role: ariaRole });

  const { getFloatingProps } = useInteractions([dismiss, role]);

  const setOpen = useCallback(
    (nextOpen: boolean, event?: Event) => floatingContext.onOpenChange(nextOpen, event),
    [floatingContext],
  );

  const contextValue = useMemo<DialogContextValue>(
    () => ({
      open,
      setOpen,
      floatingContext,
      refs,
      getFloatingProps,
      popupRef,
      returnFocusRef,
      store,
      modal,
      isNested,
      isStacked: nesting.isStacked,
      stackedChildCount: nesting.stackedChildCount,
      labelId,
      descriptionId,
      mounted,
      transitionProps,
    }),
    [
      open,
      setOpen,
      floatingContext,
      refs,
      getFloatingProps,
      returnFocusRef,
      store,
      modal,
      isNested,
      nesting.isStacked,
      nesting.stackedChildCount,
      labelId,
      descriptionId,
      mounted,
      transitionProps,
    ],
  );

  const content = typeof children === 'function' ? children({ payload: activePayload }) : children;

  return (
    <FloatingNode id={nodeId}>
      <DialogContext.Provider value={contextValue}>
        <DialogNestingContext.Provider value={nesting.context}>{content}</DialogNestingContext.Provider>
      </DialogContext.Provider>
    </FloatingNode>
  );
}

export function DialogRoot<Payload = unknown>(props: DialogProps<Payload>) {
  const parentId = useFloatingParentNodeId();

  if (parentId === null) {
    return (
      <FloatingTree>
        <DialogInner<Payload>
          {...props}
          isNested={false}
        />
      </FloatingTree>
    );
  }

  return (
    <DialogInner<Payload>
      {...props}
      isNested
    />
  );
}
