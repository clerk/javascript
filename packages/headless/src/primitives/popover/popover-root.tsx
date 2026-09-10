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
import { useReturnFocus } from '../../hooks/use-return-focus';
import { useTransition } from '../../hooks/use-transition';
import { cssVars } from '../../utils/css-vars';
import { PopoverContext, type PopoverContextValue } from './popover-context';

export interface PopoverProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Fires once the open or close animation has finished. Reset what the popup showed here
   * rather than in `onOpenChange`: the contents hold their last frame while closing, and this is
   * the first moment a reset cannot show through the animation.
   */
  onOpenChangeComplete?: (open: boolean) => void;
  placement?: Placement;
  sideOffset?: number;
  alignOffset?: number;
  modal?: boolean;
  /**
   * Where focus lands when the popup opens.
   *
   * - `'auto'` (default): the first tabbable element when opened with the keyboard,
   *   the popup itself when opened with a pointer, so a mouse click never puts a
   *   focus ring on a control the user did not navigate to.
   * - `'first'`: always the first tabbable element. Use it for popups whose content
   *   is meant to be typed into immediately, such as a combobox.
   */
  initialFocus?: 'auto' | 'first';
  children: ReactNode;
}

function PopoverInner(props: PopoverProps) {
  const nodeId = useFloatingNodeId();
  const {
    placement: placementProp = 'bottom',
    sideOffset = 4,
    alignOffset = 0,
    modal = false,
    initialFocus = 'auto',
    children,
  } = props;

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
      offset({ mainAxis: sideOffset, alignmentAxis: alignOffset }),
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

  const returnFocusRef = useReturnFocus(floatingContext);

  const { mounted, transitionProps } = useTransition({
    open,
    ref: popupRef,
    onOpenChangeComplete: props.onOpenChangeComplete,
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
      initialFocus,
      returnFocusRef,
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
      initialFocus,
      returnFocusRef,
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
