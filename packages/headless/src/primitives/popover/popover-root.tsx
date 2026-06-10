'use client';

import {
  arrow,
  autoUpdate,
  flip,
  FloatingNode,
  FloatingTree,
  offset,
  type Placement,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useFloatingNodeId,
  useFloatingParentNodeId,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import { type ReactNode, useCallback, useId, useMemo, useRef, useState } from 'react';

import { useControllableState } from '../../hooks/use-controllable-state';
import { useTransition } from '../../hooks/use-transition';
import { cssVars } from '../../utils/css-vars';
import { PopoverContext, type PopoverContextValue } from './popover-context';

export interface PopoverProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: Placement;
  sideOffset?: number;
  modal?: boolean;
  children: ReactNode;
}

function PopoverInner(props: PopoverProps) {
  const nodeId = useFloatingNodeId();
  const { placement: placementProp = 'bottom', sideOffset = 4, modal = false, children } = props;

  const [open, setOpen] = useControllableState(props.open, props.defaultOpen ?? false, props.onOpenChange);

  const labelId = useId();
  const descriptionId = useId();
  const [hasTitle, setHasTitle] = useState(false);
  const [hasDescription, setHasDescription] = useState(false);
  const setHasTitleCb = useCallback((v: boolean) => setHasTitle(v), []);
  const setHasDescriptionCb = useCallback((v: boolean) => setHasDescription(v), []);

  const arrowRef = useRef<SVGSVGElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);

  const {
    refs,
    floatingStyles,
    context: floatingContext,
    placement,
  } = useFloating({
    nodeId,
    open,
    onOpenChange: setOpen,
    placement: placementProp,
    middleware: [
      offset(sideOffset),
      flip({
        crossAxis: placementProp.includes('-'),
        fallbackAxisSideDirection: 'end',
        padding: 5,
      }),
      shift({ padding: 5 }),
      arrow({ element: arrowRef }),
      cssVars({ sideOffset }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const { mounted, transitionProps } = useTransition({
    open,
    ref: popupRef,
  });

  const click = useClick(floatingContext);
  const dismiss = useDismiss(floatingContext);
  const role = useRole(floatingContext);

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  const contextValue = useMemo<PopoverContextValue>(
    () => ({
      open,
      setOpen,
      floatingContext,
      refs,
      floatingStyles,
      placement,
      getReferenceProps,
      getFloatingProps,
      popupRef,
      arrowRef,
      modal,
      labelId,
      descriptionId,
      hasTitle,
      hasDescription,
      setHasTitle: setHasTitleCb,
      setHasDescription: setHasDescriptionCb,
      mounted,
      transitionProps,
    }),
    [
      open,
      setOpen,
      floatingContext,
      refs,
      floatingStyles,
      placement,
      getReferenceProps,
      getFloatingProps,
      modal,
      labelId,
      descriptionId,
      hasTitle,
      hasDescription,
      setHasTitleCb,
      setHasDescriptionCb,
      mounted,
      transitionProps,
    ],
  );

  return (
    <FloatingNode id={nodeId}>
      <PopoverContext.Provider value={contextValue}>{children}</PopoverContext.Provider>
    </FloatingNode>
  );
}

export function PopoverRoot(props: PopoverProps) {
  const parentId = useFloatingParentNodeId();

  if (parentId === null) {
    return (
      <FloatingTree>
        <PopoverInner {...props} />
      </FloatingTree>
    );
  }

  return <PopoverInner {...props} />;
}
