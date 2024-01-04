import { createContextAndHook } from '@clerk/shared/react';
import type { MenuId } from '@clerk/types';
import type { Placement } from '@floating-ui/react';
import type { PropsWithChildren } from 'react';
import React, { cloneElement, isValidElement, useLayoutEffect, useRef } from 'react';

import type { Button } from '../customizables';
import { Col, descriptors, SimpleButton } from '../customizables';
import type { UsePopoverReturn } from '../hooks';
import { usePopover } from '../hooks';
import type { PropsOfComponent } from '../styledSystem';
import { animations, common } from '../styledSystem';
import { colors } from '../utils/colors';
import { withFloatingTree } from './contexts';
import { Popover } from './Popover';

type MenuState = {
  popoverCtx: UsePopoverReturn;
  elementId?: MenuId;
};

export const [MenuStateCtx, useMenuState] = createContextAndHook<MenuState>('MenuState');

type MenuProps = PropsWithChildren<Record<never, never>> & {
  elementId?: MenuId;
  popoverPlacement?: Placement;
};

export const Menu = withFloatingTree((props: MenuProps) => {
  const { elementId, popoverPlacement = 'bottom-end' } = props;
  const popoverCtx = usePopover({
    placement: popoverPlacement,
    offset: 8,
    bubbles: false,
    shoudFlip: false,
  });

  const value = React.useMemo(() => ({ value: { popoverCtx, elementId } }), [{ ...popoverCtx }, elementId]);

  return (
    <MenuStateCtx.Provider
      value={value}
      {...props}
    />
  );
});

type MenuTriggerProps = React.PropsWithChildren<Record<never, never>>;

export const MenuTrigger = (props: MenuTriggerProps) => {
  const { children } = props;
  const { popoverCtx, elementId } = useMenuState();
  const { reference, toggle } = popoverCtx;

  if (!isValidElement(children)) {
    return null;
  }

  return cloneElement(children, {
    // @ts-expect-error
    ref: reference,
    elementDescriptor: descriptors.menuButton,
    elementId: descriptors.menuButton.setId(elementId),
    onClick: (e: React.MouseEvent) => {
      children.props?.onClick?.(e);
      toggle();
    },
  });
};

const findMenuItem = (el: Element, siblingType: 'prev' | 'next', options?: { countSelf?: boolean }) => {
  let tagName = options?.countSelf ? el.tagName : '';
  let sibling: Element | null = el;
  while (sibling && tagName.toUpperCase() !== 'BUTTON') {
    sibling = sibling[siblingType === 'prev' ? 'previousElementSibling' : 'nextElementSibling'];
    tagName = sibling?.tagName ?? '';
  }
  return sibling;
};

type MenuListProps = PropsOfComponent<typeof Col> & {
  isPortal?: boolean;
};

export const MenuList = (props: MenuListProps) => {
  const { sx, isPortal, ...rest } = props;
  const { popoverCtx, elementId } = useMenuState();
  const { floating, styles, isOpen, context, nodeId } = popoverCtx;
  const containerRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const current = containerRef.current;
    floating(current);
  }, [isOpen]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const current = containerRef.current;
    if (!current) {
      return;
    }

    if (current !== document.activeElement) {
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      return (findMenuItem(current.children[0], 'next', { countSelf: true }) as HTMLElement)?.focus();
    }
  };

  return (
    <Popover
      context={context}
      nodeId={nodeId}
      isOpen={isOpen}
      order={['floating', 'content']}
      portal={isPortal}
    >
      <Col
        elementDescriptor={descriptors.menuList}
        elementId={descriptors.menuList.setId(elementId)}
        ref={containerRef}
        role='menu'
        onKeyDown={onKeyDown}
        tabIndex={0}
        sx={[
          theme => ({
            backgroundColor: colors.makeSolid(theme.colors.$colorBackground),
            border: theme.borders.$normal,
            outline: 'none',
            borderRadius: theme.radii.$lg,
            borderColor: theme.colors.$blackAlpha200,
            paddingTop: theme.space.$2,
            paddingBottom: theme.space.$2,
            overflow: 'hidden',
            top: `calc(100% + ${theme.space.$2})`,
            animation: `${animations.dropdownSlideInScaleAndFade} ${theme.transitionDuration.$slower} ${theme.transitionTiming.$slowBezier}`,
            transformOrigin: 'top center',
            boxShadow: common.shadows(theme).menuShadow,
            zIndex: theme.zIndices.$dropdown,
          }),
          sx,
        ]}
        style={styles}
        {...rest}
      />
    </Popover>
  );
};

type MenuItemProps = PropsOfComponent<typeof Button> & {
  destructive?: boolean;
  closeAfterClick?: boolean;
};

export const MenuItem = (props: MenuItemProps) => {
  const { sx, onClick, destructive, closeAfterClick = true, ...rest } = props;
  const { popoverCtx, elementId } = useMenuState();
  const { toggle } = popoverCtx;
  const buttonRef = useRef<HTMLButtonElement>(null);

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const current = buttonRef.current;
    if (!current) {
      return;
    }

    const key = e.key;
    if (key !== 'ArrowUp' && key !== 'ArrowDown') {
      return;
    }

    e.preventDefault();
    const sibling = findMenuItem(current, key === 'ArrowUp' ? 'prev' : 'next');
    (sibling as HTMLElement)?.focus();
  };

  return (
    <SimpleButton
      ref={buttonRef}
      elementDescriptor={descriptors.menuItem}
      elementId={descriptors.menuItem.setId(elementId)}
      hoverAsFocus
      variant={destructive ? 'secondaryDanger' : 'secondary'}
      role='menuitem'
      onKeyDown={onKeyDown}
      onClick={e => {
        onClick?.(e);
        closeAfterClick && toggle();
      }}
      sx={[
        theme => ({
          boxShadow: 'none',
          justifyContent: 'start',
          borderRadius: theme.radii.$none,
          paddingLeft: theme.space.$4,
          paddingRight: theme.space.$4,
        }),
        sx,
      ]}
      {...rest}
    />
  );
};
