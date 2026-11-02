'use client';

import {
  arrow,
  autoUpdate,
  type ElementProps,
  flip,
  FloatingNode,
  FloatingTree,
  offset,
  type Placement,
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
import { flushSync } from 'react-dom';

import { useDirection } from '../direction-provider';
import { useControllableState } from '../hooks/use-controllable-state';
import { useReturnFocus } from '../hooks/use-return-focus';
import { useTransition } from '../hooks/use-transition';
import { cssVars } from '../utils/css-vars';
import { isHoverOpen } from '../utils/interaction-modality';
import { resolveSideOffset, type SideOffset } from '../utils/side-offset';
import { MenuContext, type MenuContextValue } from './menu-context';

export interface MenuProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: Placement;
  /**
   * The gap between the trigger and the menu, in px. `{ x, y }` gives the horizontal and vertical
   * placements a gap each, for a menu that can flip between the two axes.
   */
  sideOffset?: SideOffset;
  /**
   * Where the menu goes when `placement` does not fit, in the order it tries them. Defaults to the
   * opposite side. A menu opened from inside another floating surface wants this: the opposite side
   * is that surface, so it has to be given somewhere else to land.
   */
  fallbackPlacements?: Placement[];
  /**
   * Opens the menu when a mouse rests on the trigger, and closes it when the mouse leaves for
   * somewhere other than the menu. A press still opens it, and keeps a hover-opened menu open.
   * Submenus open on hover regardless.
   *
   * @default false
   */
  openOnHover?: boolean;
  children: ReactNode;
}

function MenuInner(props: MenuProps) {
  const { placement: placementProp, sideOffset, fallbackPlacements, openOnHover = false, children } = props;

  const parentContext = useContext(MenuContext);
  const tree = useFloatingTree();
  const nodeId = useFloatingNodeId();
  const parentId = useFloatingParentNodeId();
  // A submenu, not merely a menu inside some other floating element. A menu rendered in a popover
  // has a parent node id too, and treating that as nesting makes it hover-open, side-placed, and
  // unclickable by mouse.
  const isNested = parentId != null && parentContext != null;
  const direction = useDirection();

  const [open, setOpen] = useControllableState(props.open, props.defaultOpen ?? false, props.onOpenChange);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const elementsRef = useRef<Array<HTMLElement | null>>([]);
  const labelsRef = useRef<Array<string | null>>([]);
  const arrowRef = useRef<SVGSVGElement | null>(null);
  const pressPointerTypeRef = useRef<string | null>(null);
  const openFrameRef = useRef<number | null>(null);
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
      offset(state => ({
        mainAxis: resolveSideOffset(resolvedOffset, state.placement),
        alignmentAxis: isNested ? -4 : 0,
      })),
      flip({ fallbackPlacements }),
      shift({ padding: 5 }),
      arrow({ element: arrowRef }),
      cssVars({ sideOffset: resolvedOffset }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const returnFocusRef = useReturnFocus(floatingContext);

  const { mounted, transitionProps } = useTransition({
    open,
    ref: popupRef,
  });

  const hover = useHover(floatingContext, {
    enabled: isNested || openOnHover,
    delay: { open: 75 },
    mouseOnly: !isNested,
    handleClose: safePolygon({ blockPointerEvents: true }),
  });
  const click = useClick(floatingContext, {
    event: 'mousedown',
    toggle: !isNested,
    ignoreMouse: true,
  });
  const mousePress = useMemo<ElementProps>(
    () => ({
      reference: {
        onPointerDown(event: React.PointerEvent) {
          pressPointerTypeRef.current = event.pointerType;
        },
        onMouseDown(event: React.MouseEvent) {
          const pointerType = pressPointerTypeRef.current;
          pressPointerTypeRef.current = null;
          if (isNested || event.button !== 0 || (pointerType !== 'mouse' && pointerType !== 'pen')) {
            return;
          }
          if (openFrameRef.current !== null) {
            cancelAnimationFrame(openFrameRef.current);
            openFrameRef.current = null;
            return;
          }
          if (open && !isHoverOpen(floatingContext)) {
            floatingContext.onOpenChange(false, event.nativeEvent, 'click');
            return;
          }
          // Safari blurs an already-focused button on press, moving focus to its nearest focusable
          // ancestor. Opening now lets that blur reach the open menu and close it, so open on the
          // next frame, after the press has settled, as Base UI's `useClick` does.
          const nativeEvent = event.nativeEvent;
          openFrameRef.current = requestAnimationFrame(() => {
            openFrameRef.current = null;
            flushSync(() => floatingContext.onOpenChange(true, nativeEvent, 'click'));
          });
        },
      },
    }),
    [floatingContext, isNested, open],
  );
  const baseRole = useRole(floatingContext, { role: 'menu' });
  // `useRole` decides submenu-ness from the floating tree alone, so a menu inside a popover gets
  // `role="menuitem"` on its trigger with no parent menu to be an item of. `isNested` is the real answer.
  const role = useMemo(() => {
    if (isNested) {
      return baseRole;
    }
    const reference = { ...baseRole.reference };
    delete reference.role;
    return { ...baseRole, reference };
  }, [baseRole, isNested]);
  // Escape must not bubble: it closes this menu and leaves whatever it sits inside — a parent menu,
  // or a popover — open. An outside press is the opposite, and dismisses the whole stack.
  const dismiss = useDismiss(floatingContext, { bubbles: { escapeKey: false, outsidePress: true } });
  const listNavigation = useListNavigation(floatingContext, {
    listRef: elementsRef,
    activeIndex,
    nested: isNested,
    rtl: direction === 'rtl',
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
    mousePress,
    role,
    dismiss,
    listNavigation,
    typeahead,
  ]);

  useEffect(
    () => () => {
      if (openFrameRef.current !== null) {
        cancelAnimationFrame(openFrameRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (!tree) {
      return;
    }

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
      returnFocusRef,
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
      returnFocusRef,
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
