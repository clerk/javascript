'use client';

import {
  arrow,
  autoUpdate,
  type ExtendedRefs,
  FloatingArrow,
  type FloatingContext,
  FloatingFocusManager,
  FloatingList,
  FloatingNode,
  FloatingPortal,
  FloatingTree,
  flip,
  offset,
  type Placement,
  type ReferenceType,
  safePolygon,
  shift,
  type UseInteractionsReturn,
  useClick,
  useDismiss,
  useFloating,
  useFloatingNodeId,
  useFloatingParentNodeId,
  useFloatingTree,
  useHover,
  useInteractions,
  useListItem,
  useListNavigation,
  useMergeRefs,
  useRole,
  useTypeahead,
} from '@floating-ui/react';
import {
  type CSSProperties,
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useControllableState } from '../../hooks/use-controllable-state';
import { type TransitionProps, useFloatingTransition } from '../../hooks/use-floating-transition';
import { floatingCssVars } from '../../utils/floating-css-vars';
import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface MenuContextValue {
  open: boolean;
  floatingContext: FloatingContext;
  refs: ExtendedRefs<ReferenceType>;
  floatingStyles: CSSProperties;
  placement: Placement;
  getReferenceProps: UseInteractionsReturn['getReferenceProps'];
  getFloatingProps: UseInteractionsReturn['getFloatingProps'];
  getItemProps: UseInteractionsReturn['getItemProps'];
  activeIndex: number | null;
  setActiveIndex: React.Dispatch<React.SetStateAction<number | null>>;
  elementsRef: React.MutableRefObject<Array<HTMLElement | null>>;
  labelsRef: React.MutableRefObject<Array<string | null>>;
  arrowRef: React.MutableRefObject<SVGSVGElement | null>;
  popupRef: React.RefObject<HTMLDivElement | null>;
  isNested: boolean;
  mounted: boolean;
  transitionProps: TransitionProps;
  parentContext: MenuContextValue | null;
}

const MenuContext = createContext<MenuContextValue | null>(null);

function useMenuContext() {
  const ctx = useContext(MenuContext);
  if (!ctx) {
    throw new Error('Menu compound components must be used within <Menu>');
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Menu (root)
// ---------------------------------------------------------------------------

export interface MenuProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: Placement;
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
      floatingCssVars({ sideOffset: resolvedOffset }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const { mounted, transitionProps } = useFloatingTransition({
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

  // Close all menus when an item is clicked anywhere in the tree
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

function MenuRoot(props: MenuProps) {
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

// ---------------------------------------------------------------------------
// Menu.Trigger
// ---------------------------------------------------------------------------

export interface MenuTriggerProps extends ComponentProps<'button'> {}

function MenuTrigger(props: MenuTriggerProps) {
  const { render, ref: consumerRef, ...otherProps } = props;
  const { open, isNested, refs, getReferenceProps, parentContext } = useMenuContext();

  const item = useListItem();

  const mergedRef = useMergeRefs([refs.setReference, isNested ? item.ref : null, consumerRef ?? null]);

  const state = { open };

  let referenceProps: Record<string, unknown>;

  if (isNested && parentContext) {
    referenceProps = getReferenceProps(parentContext.getItemProps() as React.HTMLProps<HTMLElement>);
  } else {
    referenceProps = getReferenceProps();
  }

  const defaultProps = {
    type: 'button' as const,
    'data-cl-slot': 'menu-trigger',
    ref: mergedRef,
    ...(isNested && {
      role: 'menuitem' as const,
      tabIndex: parentContext?.activeIndex === item.index ? 0 : -1,
    }),
    ...(referenceProps as React.ComponentPropsWithRef<'button'>),
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
// Menu.Portal
// ---------------------------------------------------------------------------

export interface MenuPortalProps {
  children: ReactNode;
}

function MenuPortal(props: MenuPortalProps) {
  const { mounted } = useMenuContext();
  if (!mounted) return null;
  return <FloatingPortal>{props.children}</FloatingPortal>;
}

// ---------------------------------------------------------------------------
// Menu.Positioner
// ---------------------------------------------------------------------------

export interface MenuPositionerProps extends ComponentProps<'div'> {}

function MenuPositioner(props: MenuPositionerProps) {
  const { render, ...otherProps } = props;
  const {
    mounted,
    floatingContext,
    refs,
    floatingStyles,
    placement,
    getFloatingProps,
    elementsRef,
    labelsRef,
    isNested,
    setActiveIndex,
  } = useMenuContext();

  const side = placement.split('-')[0];

  const defaultProps = {
    'data-cl-slot': 'menu-positioner',
    'data-cl-side': side,
    ref: refs.setFloating,
    style: floatingStyles,
    ...(getFloatingProps({
      onKeyDown(event: React.KeyboardEvent<HTMLElement>) {
        if (event.key === 'Home' || event.key === 'End') {
          event.preventDefault();
          const items = elementsRef.current;
          if (event.key === 'Home') {
            const firstEnabled = items.findIndex(el => el != null && !el.hasAttribute('aria-disabled'));
            if (firstEnabled !== -1) setActiveIndex(firstEnabled);
          } else {
            for (let i = items.length - 1; i >= 0; i--) {
              if (items[i] != null && !items[i]!.hasAttribute('aria-disabled')) {
                setActiveIndex(i);
                break;
              }
            }
          }
        }
      },
    }) as React.ComponentPropsWithRef<'div'>),
  };

  const element = renderElement({
    defaultTagName: 'div',
    render,
    enabled: mounted,
    props: mergeProps<'div'>(defaultProps, otherProps),
  });

  return (
    <FloatingFocusManager
      context={floatingContext}
      modal={false}
      initialFocus={isNested ? -1 : 0}
      returnFocus={!isNested}
    >
      <FloatingList
        elementsRef={elementsRef}
        labelsRef={labelsRef}
      >
        {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- element is guaranteed non-null when mounted */}
        {element!}
      </FloatingList>
    </FloatingFocusManager>
  );
}

// ---------------------------------------------------------------------------
// Menu.Popup
// ---------------------------------------------------------------------------

export interface MenuPopupProps extends ComponentProps<'div'> {}

function MenuPopup(props: MenuPopupProps) {
  const { render, ...otherProps } = props;
  const { popupRef, transitionProps } = useMenuContext();

  const defaultProps = {
    'data-cl-slot': 'menu-popup',
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
// Menu.Item
// ---------------------------------------------------------------------------

export interface MenuItemProps extends ComponentProps<'button'> {
  label: string;
  disabled?: boolean;
  closeOnClick?: boolean;
}

function MenuItem(props: MenuItemProps) {
  const { render, label, disabled, closeOnClick = true, ...otherProps } = props;
  const { activeIndex, getItemProps } = useMenuContext();
  const tree = useFloatingTree();
  const item = useListItem({ label: disabled ? null : label });
  const isActive = item.index === activeIndex;

  const state = {
    active: isActive,
    disabled: !!disabled,
  };

  const defaultProps = {
    'data-cl-slot': 'menu-item',
    type: 'button' as const,
    ref: item.ref,
    role: 'menuitem' as const,
    tabIndex: isActive ? 0 : -1,
    ...(disabled && { 'aria-disabled': true as const }),
    ...(getItemProps({
      onClick() {
        if (!disabled && closeOnClick) {
          tree?.events.emit('click');
        }
      },
    }) as React.ComponentPropsWithRef<'button'>),
  };

  return renderElement({
    defaultTagName: 'button',
    render,
    state,
    stateAttributesMapping: {
      active: (v: boolean) => (v ? { 'data-cl-active': '' } : null),
      disabled: (v: boolean) => (v ? { 'data-cl-disabled': '' } : null),
    },
    props: mergeProps<'button'>(defaultProps, otherProps),
  });
}

// ---------------------------------------------------------------------------
// Menu.Separator
// ---------------------------------------------------------------------------

export interface MenuSeparatorProps extends ComponentProps<'div'> {}

function MenuSeparator(props: MenuSeparatorProps) {
  const { render, ...otherProps } = props;

  const defaultProps = {
    'data-cl-slot': 'menu-separator',
    role: 'separator' as const,
  };

  return renderElement({
    defaultTagName: 'div',
    render,
    props: mergeProps<'div'>(defaultProps, otherProps),
  });
}

// ---------------------------------------------------------------------------
// Menu.Arrow
// ---------------------------------------------------------------------------

export interface MenuArrowProps extends React.ComponentPropsWithRef<typeof FloatingArrow> {}

function MenuArrowComponent(props: MenuArrowProps) {
  const { floatingContext, arrowRef, placement } = useMenuContext();
  const side = placement.split('-')[0];

  return (
    <FloatingArrow
      data-cl-slot='menu-arrow'
      data-cl-side={side}
      {...props}
      ref={arrowRef}
      context={floatingContext}
    />
  );
}

// ---------------------------------------------------------------------------
// Compound export
// ---------------------------------------------------------------------------

export const Menu = Object.assign(MenuRoot, {
  Trigger: MenuTrigger,
  Portal: MenuPortal,
  Positioner: MenuPositioner,
  Popup: MenuPopup,
  Item: MenuItem,
  Separator: MenuSeparator,
  Arrow: MenuArrowComponent,
});
