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
import { useTransition } from '../../hooks/use-transition';
import { DialogContext, type DialogContextValue } from './dialog-context';

export interface DialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** When true, the dialog traps focus and blocks interaction with the rest of the page. Default: true */
  modal?: boolean;
  children: ReactNode;
}

function DialogInner(props: DialogProps) {
  const nodeId = useFloatingNodeId();
  const { modal = true, children } = props;

  const [open, setOpen] = useControllableState(props.open, props.defaultOpen ?? false, props.onOpenChange);

  const labelId = useId();
  const descriptionId = useId();

  const popupRef = useRef<HTMLDivElement | null>(null);

  const { refs, context: floatingContext } = useFloating({
    nodeId,
    open,
    onOpenChange: setOpen,
  });

  const { mounted, transitionProps } = useTransition({
    open,
    ref: popupRef,
  });

  const click = useClick(floatingContext);
  const dismiss = useDismiss(floatingContext, {
    outsidePressEvent: 'mousedown',
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
      modal,
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
      modal,
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
        <DialogInner {...props} />
      </FloatingTree>
    );
  }

  return <DialogInner {...props} />;
}
