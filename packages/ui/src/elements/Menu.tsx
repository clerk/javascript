import { createContextAndHook } from '@clerk/shared/react';
import type { MenuId } from '@clerk/shared/types';
import type { Placement } from '@floating-ui/react';
import {
  FloatingList,
  useClick,
  useInteractions,
  useListItem,
  useListNavigation,
  useMergeRefs,
  useRole,
} from '@floating-ui/react';
import type { PropsWithChildren } from 'react';
import React, { cloneElement, isValidElement, useRef } from 'react';

import type { Button } from '../customizables';
import { Col, descriptors, SimpleButton } from '../customizables';
import type { UsePopoverReturn } from '../hooks';
import { usePopover } from '../hooks';
import type { PropsOfComponent } from '../styledSystem';
import { animations } from '../styledSystem';
import { colors } from '../utils/colors';
import { withFloatingTree } from './contexts';
import { Popover } from './Popover';

type UseInteractionsReturn = ReturnType<typeof useInteractions>;

type MenuState = {
  popoverCtx: UsePopoverReturn;
  elementId?: MenuId;
  getReferenceProps: UseInteractionsReturn['getReferenceProps'];
  getFloatingProps: UseInteractionsReturn['getFloatingProps'];
  getItemProps: UseInteractionsReturn['getItemProps'];
  activeIndex: number | null;
  elementsRef: React.MutableRefObject<Array<HTMLElement | null>>;
};

export const [MenuStateCtx, useMenuState] = createContextAndHook<MenuState>('MenuState');

type MenuProps = PropsWithChildren<Record<never, never>> & {
  elementId?: MenuId;
  popoverPlacement?: Placement;
};

export const Menu = withFloatingTree((props: MenuProps) => {
  const { popoverPlacement = 'bottom-end', elementId, ...rest } = props;
  const popoverCtx = usePopover({
    placement: popoverPlacement,
    offset: 8,
    shoudFlip: true,
  });
  const { context, isOpen } = popoverCtx;

  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const elementsRef = useRef<Array<HTMLElement | null>>([]);

  React.useEffect(() => {
    if (!isOpen) {
      setActiveIndex(null);
    }
  }, [isOpen]);

  const click = useClick(context);
  const role = useRole(context, { role: 'menu' });
  const listNavigation = useListNavigation(context, {
    listRef: elementsRef,
    activeIndex,
    onNavigate: setActiveIndex,
    loop: true,
  });
  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([click, role, listNavigation]);

  const value = React.useMemo(
    () => ({
      value: {
        popoverCtx,
        elementId,
        getReferenceProps,
        getFloatingProps,
        getItemProps,
        activeIndex,
        elementsRef,
      },
    }),
    [popoverCtx, elementId, getReferenceProps, getFloatingProps, getItemProps, activeIndex],
  );

  return (
    <MenuStateCtx.Provider
      value={value}
      {...rest}
    />
  );
});

type MenuTriggerProps = React.PropsWithChildren<{ ariaLabel?: string | ((open: boolean) => string) }>;

export const MenuTrigger = (props: MenuTriggerProps) => {
  const { children, ariaLabel } = props;
  const { popoverCtx, elementId, getReferenceProps } = useMenuState();
  const { reference, isOpen } = popoverCtx;

  const normalizedAriaLabel = typeof ariaLabel === 'function' ? ariaLabel(isOpen) : ariaLabel;

  if (!isValidElement(children)) {
    return null;
  }

  return cloneElement(children, {
    // @ts-expect-error
    ref: reference,
    elementDescriptor: children.props.elementDescriptor || descriptors.menuButton,
    elementId: children.props.elementId || descriptors.menuButton.setId(elementId),
    'aria-label': normalizedAriaLabel,
    ...getReferenceProps({
      onClick: children.props?.onClick,
    }),
  });
};

type MenuListProps = PropsOfComponent<typeof Col> & {
  asPortal?: boolean;
};

export const MenuList = (props: MenuListProps) => {
  const { sx, asPortal, ...rest } = props;
  const { popoverCtx, elementId, getFloatingProps, elementsRef } = useMenuState();
  const { floating, styles, isOpen, context, nodeId } = popoverCtx;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mergedRef = useMergeRefs([containerRef, floating]);

  return (
    <Popover
      context={context}
      nodeId={nodeId}
      isOpen={isOpen}
      portal={asPortal}
      order={['content']}
      modal={false}
    >
      <FloatingList elementsRef={elementsRef}>
        <Col
          elementDescriptor={descriptors.menuList}
          elementId={descriptors.menuList.setId(elementId)}
          ref={mergedRef}
          sx={[
            t => ({
              backgroundColor: colors.makeSolid(t.colors.$colorBackground),
              borderWidth: t.borderWidths.$normal,
              borderStyle: t.borderStyles.$solid,
              borderColor: t.colors.$borderAlpha150,
              outline: 'none',
              borderRadius: t.radii.$md,
              padding: t.space.$0x5,
              overflow: 'hidden',
              top: `calc(100% + ${t.space.$2})`,
              animation: `${animations.dropdownSlideInScaleAndFade} ${t.transitionDuration.$slower} ${t.transitionTiming.$slowBezier}`,
              transformOrigin: 'top center',
              zIndex: t.zIndices.$dropdown,
              gap: t.space.$0x5,
            }),
            sx,
          ]}
          style={styles}
          {...getFloatingProps()}
          {...rest}
        />
      </FloatingList>
    </Popover>
  );
};

type MenuItemProps = PropsOfComponent<typeof Button> & {
  destructive?: boolean;
  closeAfterClick?: boolean;
};

export const MenuItem = (props: MenuItemProps) => {
  const { sx, onClick, destructive, closeAfterClick = true, ...rest } = props;
  const { popoverCtx, elementId, getItemProps, activeIndex } = useMenuState();
  const { toggle } = popoverCtx;
  const item = useListItem();
  const isActive = item.index === activeIndex;

  return (
    <SimpleButton
      ref={item.ref}
      elementDescriptor={descriptors.menuItem}
      elementId={descriptors.menuItem.setId(elementId)}
      hoverAsFocus
      variant='ghost'
      colorScheme={destructive ? 'danger' : 'neutral'}
      role='menuitem'
      tabIndex={isActive ? 0 : -1}
      focusRing={false}
      {...getItemProps({
        onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
          onClick?.(e);
          if (closeAfterClick) {
            toggle();
          }
        },
      })}
      sx={[
        theme => ({
          justifyContent: 'start',
          borderRadius: theme.radii.$sm,
          padding: `${theme.space.$1} ${theme.space.$3}`,
          whiteSpace: 'nowrap',
        }),
        sx,
      ]}
      {...rest}
    />
  );
};
