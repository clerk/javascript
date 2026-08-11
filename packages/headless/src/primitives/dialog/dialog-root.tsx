'use client';

import {
  FloatingNode,
  FloatingTree,
  useClick,
  useDismiss,
  useFloating,
  useFloatingNodeId,
  useFloatingParentNodeId,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import { type ReactNode, useId, useMemo, useRef } from 'react';

import { useControllableState } from '../../hooks/use-controllable-state';
import { useReturnFocus } from '../../hooks/use-return-focus';
import { useTransition } from '../../hooks/use-transition';
import { DialogContext, type DialogContextValue } from './dialog-context';

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

export interface DialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** When true, the dialog traps focus and blocks interaction with the rest of the page. Default: true */
  modal?: boolean;
  /** Which gestures dismiss the dialog. Default: `any` */
  closedBy?: DialogClosedBy;
  children: ReactNode;
}

function DialogInner(props: DialogProps & { isNested: boolean }) {
  const nodeId = useFloatingNodeId();
  const { modal = true, closedBy = 'any', isNested, children } = props;

  const [open, setOpen] = useControllableState(props.open, props.defaultOpen ?? false, props.onOpenChange);

  const labelId = useId();
  const descriptionId = useId();

  const popupRef = useRef<HTMLDivElement | null>(null);

  const { refs, context: floatingContext } = useFloating({
    nodeId,
    open,
    onOpenChange: setOpen,
  });

  const returnFocusRef = useReturnFocus(floatingContext);

  const { mounted, transitionProps } = useTransition({
    open,
    ref: popupRef,
  });

  const click = useClick(floatingContext);
  const dismiss = useDismiss(floatingContext, {
    outsidePressEvent: 'mousedown',
    escapeKey: closedBy !== 'none',
    outsidePress: closedBy === 'any',
  });
  const role = useRole(floatingContext);

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  const contextValue = useMemo<DialogContextValue>(
    () => ({
      open,
      setOpen,
      floatingContext,
      refs,
      getReferenceProps,
      getFloatingProps,
      popupRef,
      returnFocusRef,
      modal,
      isNested,
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
      getReferenceProps,
      getFloatingProps,
      returnFocusRef,
      modal,
      isNested,
      labelId,
      descriptionId,
      mounted,
      transitionProps,
    ],
  );

  return (
    <FloatingNode id={nodeId}>
      <DialogContext.Provider value={contextValue}>{children}</DialogContext.Provider>
    </FloatingNode>
  );
}

export function DialogRoot(props: DialogProps) {
  const parentId = useFloatingParentNodeId();

  if (parentId === null) {
    return (
      <FloatingTree>
        <DialogInner
          {...props}
          isNested={false}
        />
      </FloatingTree>
    );
  }

  return (
    <DialogInner
      {...props}
      isNested
    />
  );
}
