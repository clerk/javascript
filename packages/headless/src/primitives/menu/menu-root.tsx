'use client';

import {
  arrow,
  autoUpdate,
  FloatingNode,
  FloatingTree,
  flip,
  offset,
  safePolygon,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useFloatingNodeId,
  useFloatingParentNodeId,
  useFloatingTree,
  useHover,
  useInteractions,
  useListNavigation,
  useRole,
  useTypeahead,
} from '@floating-ui/react';
import { type ReactNode, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useControllableState } from '../../hooks/use-controllable-state';
import { useTransition } from '../../hooks/use-transition';
import { cssVars } from '../../utils/css-vars';
import { MenuContext, type MenuContextValue } from './menu-context';

export interface MenuProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: import('@floating-ui/react').Placement;
  sideOffset?: number;
  children: ReactNode;
}

function MenuInner(props: MenuProps) {
  const { placement: placementProp, sideOffset, children } = props;

  const parentContext = useContext(MenuContext);
  const tree = useFloatingTree();
  const nodeId = useFloatingNodeId();
  const parentId = useFloatingParentNodeId();
  const isNested = parentId != null;

  const [open, setOpen] = useControllableState(props.open, props.defaultOpen ?? false, props.onOpenChange);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const elementsRef = useRef<Array<HTMLElement | null>>([]);
  const labelsRef = useRef<Array<string | null>>([]);
  const arrowRef = useRef<SVGSVGElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);

  const resolvedPlacement = placementProp ?? (isNested ? 'right-start' : 'bottom-start');
  const resolvedOffset = sideOffset ?? (isNested ? 0 : 4);

  const {
    refs,
    floatingStyles,
    context: floatingContext,
    placement,
  } = useFloating<HTMLButtonElement>({
    nodeId,
    open,
    onOpenChange: setOpen,
    placement: resolvedPlacement,
    middleware: [
      offset({
        mainAxis: resolvedOffset,
        alignmentAxis: isNested ? -4 : 0,
      }),
      flip(),
      shift({ padding: 5 }),
      arrow({ element: arrowRef }),
      cssVars({ sideOffset: resolvedOffset }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const { mounted, transitionProps } = useTransition({
    open,
    ref: popupRef,
  });

  const hover = useHover(floatingContext, {
    enabled: isNested,
    delay: { open: 75 },
    handleClose: safePolygon({ blockPointerEvents: true }),
  });
  const click = useClick(floatingContext, {
    event: 'mousedown',
    toggle: !isNested,
    ignoreMouse: isNested,
  });
  const role = useRole(floatingContext, { role: 'menu' });
  const dismiss = useDismiss(floatingContext, { bubbles: true });
  const listNavigation = useListNavigation(floatingContext, {
    listRef: elementsRef,
    activeIndex,
    nested: isNested,
    onNavigate: setActiveIndex,
  });
  const typeahead = useTypeahead(floatingContext, {
    listRef: labelsRef,
    onMatch: open ? setActiveIndex : undefined,
    activeIndex,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    hover,
    click,
    role,
    dismiss,
    listNavigation,
    typeahead,
  ]);

  useEffect(() => {
    if (!tree) return;

    function handleTreeClick() {
      setOpen(false);
    }

    function onSubMenuOpen(event: { nodeId: string; parentId: string }) {
      if (event.nodeId !== nodeId && event.parentId === parentId) {
        setOpen(false);
      }
    }

    tree.events.on('click', handleTreeClick);
    tree.events.on('menuopen', onSubMenuOpen);

    return () => {
      tree.events.off('click', handleTreeClick);
      tree.events.off('menuopen', onSubMenuOpen);
    };
  }, [tree, nodeId, parentId, setOpen]);

  useEffect(() => {
    if (open && tree) {
      tree.events.emit('menuopen', { parentId, nodeId });
    }
  }, [tree, open, nodeId, parentId]);

  const contextValue = useMemo<MenuContextValue>(
    () => ({
      open,
      floatingContext,
      refs,
      floatingStyles,
      placement,
      getReferenceProps,
      getFloatingProps,
      getItemProps,
      activeIndex,
      setActiveIndex,
      elementsRef,
      labelsRef,
      arrowRef,
      popupRef,
      isNested,
      mounted,
      transitionProps,
      parentContext,
    }),
    [
      open,
      floatingContext,
      refs,
      floatingStyles,
      placement,
      getReferenceProps,
      getFloatingProps,
      getItemProps,
      activeIndex,
      isNested,
      mounted,
      transitionProps,
      parentContext,
    ],
  );

  return (
    <FloatingNode id={nodeId}>
      <MenuContext.Provider value={contextValue}>{children}</MenuContext.Provider>
    </FloatingNode>
  );
}

export function MenuRoot(props: MenuProps) {
  const parentId = useFloatingParentNodeId();

  if (parentId === null) {
    return (
      <FloatingTree>
        <MenuInner {...props} />
      </FloatingTree>
    );
  }

  return <MenuInner {...props} />;
}
