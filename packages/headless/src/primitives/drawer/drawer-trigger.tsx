'use client';

import React, { useCallback, useContext, useSyncExternalStore } from 'react';

import { type ComponentProps, mergeProps, useRender } from '../../utils';
import { DrawerContext } from './drawer-context';
import type { DrawerHandle } from './drawer-handle';

/** Props for {@link DrawerTrigger}. */
export interface DrawerTriggerProps extends ComponentProps<'button'> {
  /**
   * When provided, the trigger drives this detached handle instead of the
   * surrounding `Drawer.Root` context — letting it live anywhere in the tree.
   */
  handle?: DrawerHandle;
}

const noopSubscribe = (): (() => void) => () => {};

/**
 * Button that opens the drawer. Inside `Drawer.Root` it wires to Floating UI's
 * reference element (like Dialog); given a `handle`, it instead toggles that
 * detached handle and may be rendered outside the root.
 */
export const DrawerTrigger = React.forwardRef<HTMLButtonElement, DrawerTriggerProps>(
  function DrawerTrigger(props, ref) {
    const { render, handle, ...otherProps } = props;
    const ctx = useContext(DrawerContext);

    // Detached open state (only consulted when `handle` is provided).
    const detachedOpen = useSyncExternalStore(
      useCallback((cb: () => void) => handle?.subscribe(cb) ?? noopSubscribe(), [handle]),
      () => handle?.isOpen ?? false,
      () => handle?.isOpen ?? false,
    );

    if (!handle && !ctx) {
      throw new Error('Drawer.Trigger must be used within <Drawer.Root> or be given a `handle`');
    }

    const open = handle ? detachedOpen : (ctx?.open ?? false);

    const defaultProps = handle
      ? {
          type: 'button' as const,
          onClick: () => handle.toggle(),
        }
      : { type: 'button' as const, ...ctx?.getReferenceProps() };

    // floating-ui types `setReference` as a method signature, but at runtime it's
    // a stable callback that doesn't use `this`, so the unbound-method check is a
    // false positive here.
    const finalRef = handle
      ? ref
      : [
          // eslint-disable-next-line @typescript-eslint/unbound-method
          ctx?.refs.setReference,
          ref,
        ];

    return useRender({
      defaultTagName: 'button',
      render,
      ref: finalRef,
      state: { open },
      stateAttributesMapping: {
        open: (v: boolean): Record<string, string> | null => (v ? { 'data-cl-open': '' } : { 'data-cl-closed': '' }),
      },
      props: mergeProps<'button'>(defaultProps, otherProps),
    });
  },
);
