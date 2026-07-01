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
import { type ReactNode, useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from 'react';

import { useControllableState } from '../../hooks/use-controllable-state';
import { useTransition } from '../../hooks/use-transition';
import { DrawerAttrs, DrawerCssVars, registerDrawerCssVars } from './css-vars';
import {
  DrawerContext,
  type DrawerContextValue,
  type NestedDrawerCallbacks,
  useParentDrawerContext,
} from './drawer-context';
import type { DrawerHandle } from './drawer-handle';
import { useDrawerDrag } from './use-drawer-drag';
import { useRepositionInputs } from './use-reposition-inputs';
import { useSnapPoints } from './use-snap-points';

export interface DrawerProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Traps focus and blocks interaction with the rest of the page. Default: true */
  modal?: boolean;
  /** Imperative handle for a trigger rendered outside `Drawer.Root`. */
  handle?: DrawerHandle;
  /** Ascending fractions (0..1) of the viewport the drawer rests at. */
  snapPoints?: number[];
  /** Controlled active snap point index. */
  activeSnapPoint?: number;
  /** Uncontrolled initial active snap point index. Defaults to the last (most open). */
  defaultActiveSnapPoint?: number;
  onActiveSnapPointChange?: (index: number) => void;
  /** When true (default), a downward release past threshold (or outside press) closes the drawer. */
  dismissible?: boolean;
  /** When true, only a press starting on `Drawer.Handle` initiates a drag. Default: false */
  handleOnly?: boolean;
  /** Keep a focused field visible above the virtual keyboard. Default: true */
  repositionInputs?: boolean;
  /** Move focus into the popup on open. Default: false (so opening on touch does not pop the keyboard). */
  autoFocus?: boolean;
  /**
   * Internal test seam: an injectable clock for deterministic drag velocity.
   * @internal
   */
  _now?: () => number;
  children: ReactNode;
}

const defaultNow = (): number => (typeof performance !== 'undefined' ? performance.now() : Date.now());
const noopSubscribe = (): (() => void) => () => {};

function DrawerInner(props: DrawerProps) {
  const {
    modal = true,
    handle,
    snapPoints,
    dismissible = true,
    handleOnly = false,
    repositionInputs = true,
    autoFocus = false,
    children,
  } = props;

  const parent = useParentDrawerContext();
  const isNested = parent !== null;
  const nodeId = useFloatingNodeId();

  // Stable clock wrapper so the engine's handlers/effects don't churn when a test
  // passes a fresh `_now` each render.
  const nowRef = useRef(defaultNow);
  nowRef.current = props._now ?? defaultNow;
  const now = useCallback(() => nowRef.current(), []);

  // Open state. A `handle` (detached trigger) becomes the shared source of truth.
  const [internalOpen, setInternalOpen] = useControllableState(
    props.open,
    props.defaultOpen ?? false,
    props.onOpenChange,
  );
  const handleOpen = useSyncExternalStore(
    useCallback((cb: () => void) => handle?.subscribe(cb) ?? noopSubscribe(), [handle]),
    () => handle?.isOpen ?? false,
    () => handle?.isOpen ?? false,
  );
  const open = handle ? handleOpen : internalOpen;
  const setOpen = useCallback(
    (next: boolean) => {
      if (handle) {
        if (next) {
          handle.open();
        } else {
          handle.close();
        }
      }
      setInternalOpen(next);
    },
    [handle, setInternalOpen],
  );

  const labelId = useId();
  const descriptionId = useId();
  const popupRef = useRef<HTMLDivElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);

  const { refs, context: floatingContext } = useFloating({
    nodeId,
    open,
    onOpenChange: setOpen,
  });

  const { mounted, transitionProps } = useTransition({ open, ref: popupRef });

  const click = useClick(floatingContext);
  const dismiss = useDismiss(floatingContext, { outsidePressEvent: 'mousedown', enabled: dismissible });
  const role = useRole(floatingContext);
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  // CSS-var writers. `setSwipe` is the single writer of the live swipe-y, keeping
  // the var and the `curSwipe` ref in lockstep so drag decisions can read the ref.
  const curSwipe = useRef(0);
  const setVar = useCallback((name: string, value: string) => {
    popupRef.current?.style.setProperty(name, value);
  }, []);
  const setSwipe = useCallback(
    (px: number) => {
      curSwipe.current = px;
      setVar(DrawerCssVars.swipeY, `${px}px`);
    },
    [setVar],
  );

  const close = useCallback(() => setOpen(false), [setOpen]);

  const snap = useSnapPoints({
    snapPoints,
    activeSnapPoint: props.activeSnapPoint,
    defaultActiveSnapPoint: props.defaultActiveSnapPoint,
    onActiveSnapPointChange: props.onActiveSnapPointChange,
    setVar,
    setSwipe,
    open,
  });

  const drag = useDrawerDrag({
    popupRef,
    open,
    dismissible,
    handleOnly,
    snapPoints,
    snap,
    close,
    now,
    setVar,
    setSwipe,
    curSwipe,
    onNestedDrag: parent?.onNested.onNestedDrag,
    onNestedRelease: parent?.onNested.onNestedRelease,
  });

  useEffect(() => {
    registerDrawerCssVars();
  }, []);

  useRepositionInputs({ enabled: repositionInputs && open, popupRef });

  // Nested wiring: count open children (for the parent's stack vars) and notify
  // our own parent when this drawer opens/closes.
  const [nestedOpenCount, setNestedOpenCount] = useState(0);
  const onNested = useMemo<NestedDrawerCallbacks>(
    () => ({
      onNestedOpenChange: (childOpen: boolean) =>
        setNestedOpenCount(count => Math.max(0, childOpen ? count + 1 : count - 1)),
      // High-frequency: write straight to the popup (like the drag engine) instead
      // of routing through React state, so a nested child's drag stays 60fps.
      onNestedDrag: (progress: number) => {
        setVar(DrawerCssVars.nestedDragProgress, String(progress));
        popupRef.current?.setAttribute(DrawerAttrs.nestedSwiping, '');
      },
      onNestedRelease: () => {
        setVar(DrawerCssVars.nestedDragProgress, '0');
        popupRef.current?.removeAttribute(DrawerAttrs.nestedSwiping);
      },
    }),
    [setVar],
  );

  useEffect(() => {
    if (!parent || !open) {
      return;
    }
    parent.onNested.onNestedOpenChange(true);
    return () => parent.onNested.onNestedOpenChange(false);
  }, [parent, open]);

  const contextValue = useMemo<DrawerContextValue>(
    () => ({
      open,
      setOpen,
      floatingContext,
      refs,
      getReferenceProps,
      getFloatingProps,
      popupRef,
      backdropRef,
      modal,
      labelId,
      descriptionId,
      mounted,
      transitionProps,
      drag,
      dismissible,
      handleOnly,
      autoFocus,
      snapPoints,
      activeSnapPointIndex: snap ? snap.activeIndex : -1,
      setActiveSnapPointIndex: snap ? snap.setActiveIndex : noopSetIndex,
      snapRestOffset: snap ? snap.restOffset : null,
      onNested,
      isNested,
      nestedOpenCount,
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
      drag,
      dismissible,
      handleOnly,
      autoFocus,
      snapPoints,
      snap,
      onNested,
      isNested,
      nestedOpenCount,
    ],
  );

  return (
    <FloatingNode id={nodeId}>
      <DrawerContext.Provider value={contextValue}>{children}</DrawerContext.Provider>
    </FloatingNode>
  );
}

const noopSetIndex = (): void => {};

export function DrawerRoot(props: DrawerProps) {
  const parentId = useFloatingParentNodeId();

  if (parentId === null) {
    return (
      <FloatingTree>
        <DrawerInner {...props} />
      </FloatingTree>
    );
  }

  return <DrawerInner {...props} />;
}
