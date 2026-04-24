'use client';

import {
  arrow,
  autoUpdate,
  type ExtendedRefs,
  FloatingArrow,
  type FloatingContext,
  FloatingDelayGroup,
  FloatingNode,
  FloatingPortal,
  FloatingTree,
  flip,
  offset,
  type Placement,
  type ReferenceType,
  shift,
  type UseInteractionsReturn,
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
import { type CSSProperties, createContext, type ReactNode, useContext, useMemo, useRef } from 'react';
import { useControllableState } from '../../hooks/use-controllable-state';
import { type TransitionProps, useTransition } from '../../hooks/use-transition';
import { cssVars } from '../../utils/css-vars';
import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface TooltipContextValue {
  open: boolean;
  floatingContext: FloatingContext;
  refs: ExtendedRefs<ReferenceType>;
  floatingStyles: CSSProperties;
  placement: Placement;
  getReferenceProps: UseInteractionsReturn['getReferenceProps'];
  getFloatingProps: UseInteractionsReturn['getFloatingProps'];
  popupRef: React.RefObject<HTMLDivElement | null>;
  arrowRef: React.MutableRefObject<SVGSVGElement | null>;
  mounted: boolean;
  transitionProps: TransitionProps;
}

const TooltipContext = createContext<TooltipContextValue | null>(null);

function useTooltipContext() {
  const ctx = useContext(TooltipContext);
  if (!ctx) {
    throw new Error('Tooltip compound components must be used within <Tooltip>');
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Tooltip (root)
// ---------------------------------------------------------------------------

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

  // Integrate with FloatingDelayGroup when inside a Tooltip.Group.
  // Safe to call unconditionally — no-op without a parent provider.
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

function TooltipRoot(props: TooltipProps) {
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

// ---------------------------------------------------------------------------
// Tooltip.Trigger
// ---------------------------------------------------------------------------

export interface TooltipTriggerProps extends ComponentProps<'button'> {}

function TooltipTrigger(props: TooltipTriggerProps) {
  const { render, ...otherProps } = props;
  const { open, refs, getReferenceProps } = useTooltipContext();

  const state = { open };

  const defaultProps = {
    type: 'button' as const,
    'data-cl-slot': 'tooltip-trigger',
    ref: refs.setReference,
    ...(getReferenceProps() as React.ComponentPropsWithRef<'button'>),
  };

  return renderElement({
    defaultTagName: 'button',
    render,
    state,
    stateAttributesMapping: {
      open: (v: boolean): Record<string, string> | null => (v ? { 'data-cl-open': '' } : { 'data-cl-closed': '' }),
    },
    props: mergeProps<'button'>(defaultProps, otherProps),
  });
}

// ---------------------------------------------------------------------------
// Tooltip.Portal
// ---------------------------------------------------------------------------

export interface TooltipPortalProps {
  children: ReactNode;
  root?: HTMLElement | null | React.RefObject<HTMLElement | null>;
}

function TooltipPortal(props: TooltipPortalProps) {
  const { mounted } = useTooltipContext();
  if (!mounted) return null;
  return <FloatingPortal root={props.root}>{props.children}</FloatingPortal>;
}

// ---------------------------------------------------------------------------
// Tooltip.Positioner
// ---------------------------------------------------------------------------

export interface TooltipPositionerProps extends ComponentProps<'div'> {}

function TooltipPositioner(props: TooltipPositionerProps) {
  const { render, ...otherProps } = props;
  const { mounted, refs, floatingStyles, placement, getFloatingProps } = useTooltipContext();

  const side = placement.split('-')[0];

  const defaultProps = {
    'data-cl-slot': 'tooltip-positioner',
    'data-cl-side': side,
    ref: refs.setFloating,
    style: floatingStyles,
    ...(getFloatingProps() as React.ComponentPropsWithRef<'div'>),
  };

  return renderElement({
    defaultTagName: 'div',
    render,
    enabled: mounted,
    props: mergeProps<'div'>(defaultProps, otherProps),
  });
}

// ---------------------------------------------------------------------------
// Tooltip.Popup
// ---------------------------------------------------------------------------

export interface TooltipPopupProps extends ComponentProps<'div'> {}

function TooltipPopup(props: TooltipPopupProps) {
  const { render, ...otherProps } = props;
  const { popupRef, transitionProps } = useTooltipContext();

  const defaultProps = {
    'data-cl-slot': 'tooltip-popup',
    ref: popupRef,
    ...transitionProps,
  };

  return renderElement({
    defaultTagName: 'div',
    render,
    props: mergeProps<'div'>(defaultProps, otherProps),
  });
}

// ---------------------------------------------------------------------------
// Tooltip.Arrow
// ---------------------------------------------------------------------------

export interface TooltipArrowProps extends React.ComponentPropsWithRef<typeof FloatingArrow> {}

function TooltipArrowComponent(props: TooltipArrowProps) {
  const { floatingContext, arrowRef, placement } = useTooltipContext();
  const side = placement.split('-')[0];

  return (
    <FloatingArrow
      data-cl-slot='tooltip-arrow'
      data-cl-side={side}
      {...props}
      ref={arrowRef}
      context={floatingContext}
    />
  );
}

// ---------------------------------------------------------------------------
// Tooltip.Group
// ---------------------------------------------------------------------------

export interface TooltipGroupProps {
  /** Shared delay config for grouped tooltips. Default: { open: 200, close: 100 } */
  delay?: number | { open?: number; close?: number };
  /** Time in ms before the group resets to non-instant phase. Default: 300 */
  timeoutMs?: number;
  children: ReactNode;
}

function TooltipGroupRoot(props: TooltipGroupProps) {
  const { delay = { open: 200, close: 100 }, timeoutMs = 300, children } = props;
  return (
    <FloatingDelayGroup
      delay={delay}
      timeoutMs={timeoutMs}
    >
      {children}
    </FloatingDelayGroup>
  );
}

// ---------------------------------------------------------------------------
// Compound export
// ---------------------------------------------------------------------------

export const Tooltip = Object.assign(TooltipRoot, {
  Trigger: TooltipTrigger,
  Portal: TooltipPortal,
  Positioner: TooltipPositioner,
  Popup: TooltipPopup,
  Arrow: TooltipArrowComponent,
  Group: TooltipGroupRoot,
});
