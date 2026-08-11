'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../../utils';
import { useOptionalDialogContext } from './dialog-context';
import type { DialogHandle } from './dialog-handle';

/** Props for {@link DialogTrigger}. */
export interface DialogTriggerProps<Payload = unknown> extends ComponentProps<'button'> {
  /**
   * Connects this trigger to a root rendered elsewhere in the tree. Create with
   * `Dialog.createHandle()` and pass the same handle to the `Dialog.Root`. A trigger nested
   * inside a root needs no handle.
   */
  handle?: DialogHandle<Payload>;
  /**
   * Data delivered to the root when this trigger opens the dialog, for per-trigger content:
   * the root's children-as-function receives it as `{ payload }`.
   */
  payload?: Payload;
}

/**
 * Button that opens the dialog. Registers itself with the root — directly when nested inside
 * one, through a `handle` when detached — which uses the trigger that opened it as the floating
 * reference element for ARIA and return focus. Give each trigger an `id`
 * to name it in controlled mode via the root's `triggerId`.
 */
export const DialogTrigger = React.forwardRef<HTMLButtonElement, DialogTriggerProps>(
  function DialogTrigger(props, ref) {
    const { render, handle, payload, ...otherProps } = props;
    const ctx = useOptionalDialogContext();
    const store = handle ?? ctx?.store;
    if (!store) {
      throw new Error('<Dialog.Trigger> must be nested in a <Dialog.Root> or given a `handle`.');
    }

    const autoId = React.useId();
    const triggerId = props.id ?? autoId;

    const {
      open,
      triggerId: activeTriggerId,
      popupId,
    } = React.useSyncExternalStore(
      React.useCallback(listener => store.subscribe(listener), [store]),
      () => store.getState(),
      () => store.getState(),
    );
    // A dialog opened with no attributed trigger (`defaultOpen`, a controlled open with no
    // `triggerId`) reads as open from every trigger; a named open reads as open only from the
    // trigger it is attributed to.
    const showsOpen = open && (activeTriggerId === null || activeTriggerId === triggerId);

    const elementRef = React.useRef<HTMLButtonElement | null>(null);
    React.useLayoutEffect(() => {
      const element = elementRef.current;
      if (!element) {
        return;
      }
      return store.registerTrigger({ id: triggerId, element, payload });
    }, [store, triggerId, payload]);

    const state = { open: showsOpen };

    const ownProps = {
      type: 'button',
      'aria-haspopup': 'dialog',
      'aria-expanded': showsOpen,
      ...(showsOpen && popupId ? { 'aria-controls': popupId } : null),
      onClick(event: React.MouseEvent) {
        if (showsOpen) {
          store.requestClose(triggerId, event.nativeEvent);
        } else {
          store.requestOpen(triggerId, event.nativeEvent);
        }
      },
    } satisfies DefaultProps<'button'>;

    return useRender({
      defaultTagName: 'button',
      render,
      ref: [elementRef, ref],
      state,
      stateAttributesMapping: {
        open: (v: boolean): Record<string, string> | null => (v ? { 'data-open': '' } : { 'data-closed': '' }),
      },
      props: mergeProps<'button'>(ownProps, otherProps),
    });
  },
) as <Payload = unknown>(
  props: DialogTriggerProps<Payload> & { ref?: React.Ref<HTMLButtonElement> },
) => React.ReactElement;
