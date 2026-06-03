'use client';

import {
  arrow,
  autoUpdate,
  FloatingNode,
  FloatingTree,
  flip,
  offset,
  type Placement,
  shift,
  useDelayGroup,
  useDismiss,
  useFloating,
  useFloatingNodeId,
  useFloatingParentNodeId,
  useFocus,
  useHover,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import { type ReactNode, useMemo, useRef } from 'react';
import { useControllableState } from '../../hooks/use-controllable-state';
import { useTransition } from '../../hooks/use-transition';
import { cssVars } from '../../utils/css-vars';
import { TooltipContext, type TooltipContextValue } from './tooltip-context';

export interface TooltipProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: Placement;
  sideOffset?: number;
  /** Delay in ms before the tooltip opens on hover. Default: 200 */
  delay?: number;
  /** Delay in ms before the tooltip closes on hover out. Default: 0 */
  closeDelay?: number;
  children: ReactNode;
}

function TooltipInner(props: TooltipProps) {
  const nodeId = useFloatingNodeId();

  const { placement: placementProp = 'top', sideOffset = 4, delay = 200, closeDelay = 0, children } = props;

  const [open, setOpen] = useControllableState(props.open, props.defaultOpen ?? false, props.onOpenChange);

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
        fallbackAxisSideDirection: 'start',
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

  useDelayGroup(floatingContext, { id: nodeId });

  const hover = useHover(floatingContext, {
    move: false,
    delay: { open: delay, close: closeDelay },
  });
  const focus = useFocus(floatingContext);
  const dismiss = useDismiss(floatingContext);
  const role = useRole(floatingContext, { role: 'tooltip' });

  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role]);

  const contextValue = useMemo<TooltipContextValue>(
    () => ({
      open,
      floatingContext,
      refs,
      floatingStyles,
      placement,
      getReferenceProps,
      getFloatingProps,
      popupRef,
      arrowRef,
      mounted,
      transitionProps,
    }),
    [
      open,
      floatingContext,
      refs,
      floatingStyles,
      placement,
      getReferenceProps,
      getFloatingProps,
      mounted,
      transitionProps,
    ],
  );

  return (
    <FloatingNode id={nodeId}>
      <TooltipContext.Provider value={contextValue}>{children}</TooltipContext.Provider>
    </FloatingNode>
  );
}

export function TooltipRoot(props: TooltipProps) {
  const parentId = useFloatingParentNodeId();

  if (parentId === null) {
    return (
      <FloatingTree>
        <TooltipInner {...props} />
      </FloatingTree>
    );
  }

  return <TooltipInner {...props} />;
}
