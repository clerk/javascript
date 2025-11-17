import { createContextAndHook } from '@clerk/shared/react';
import type { MenuId, PortalConfig } from '@clerk/shared/types';
import type { Placement } from '@floating-ui/react';
import type { PropsWithChildren } from 'react';
import React, { cloneElement, isValidElement, useLayoutEffect, useRef } from 'react';

import { usePortalContext } from '../contexts/PortalContext';
import type { Button } from '../customizables';
import { Col, descriptors, SimpleButton } from '../customizables';
import type { UsePopoverReturn } from '../hooks';
import { usePopover } from '../hooks';
import type { PropsOfComponent } from '../styledSystem';
import { animations } from '../styledSystem';
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
  const { popoverPlacement = 'bottom-end', elementId, ...rest } = props;
  // Only read from context to determine strategy for fixed positioning
  const portalFromContext = usePortalContext();
  const useFixedPosition = portalFromContext !== undefined && portalFromContext !== false;

  const popoverCtx = usePopover({
    placement: popoverPlacement,
    offset: 8,
    shoudFlip: true,
    strategy: useFixedPosition ? 'fixed' : 'absolute',
  });

  const value = React.useMemo(() => ({ value: { popoverCtx, elementId } }), [{ ...popoverCtx }, elementId]);

  return (
    <MenuStateCtx.Provider
      value={value}
      {...rest}
    />
  );
});

type MenuTriggerProps = React.PropsWithChildren<{ arialLabel?: string | ((open: boolean) => string) }>;

export const MenuTrigger = (props: MenuTriggerProps) => {
  const { children, arialLabel } = props;
  const { popoverCtx, elementId } = useMenuState();
  const { reference, toggle, isOpen } = popoverCtx;

  const normalizedAriaLabel = typeof arialLabel === 'function' ? arialLabel(isOpen) : arialLabel;

  if (!isValidElement(children)) {
    return null;
  }

  return cloneElement(children, {
    // @ts-expect-error
    ref: reference,
    elementDescriptor: children.props.elementDescriptor || descriptors.menuButton,
    elementId: children.props.elementId || descriptors.menuButton.setId(elementId),
    'aria-label': normalizedAriaLabel,
    'aria-expanded': isOpen,
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
  asPortal?: PortalConfig;
};

export const MenuList = (props: MenuListProps) => {
  const { sx, asPortal: asPortalProp, ...rest } = props;
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
      portal={asPortalProp !== undefined ? asPortalProp : undefined}
    >
      <Col
        elementDescriptor={descriptors.menuList}
        elementId={descriptors.menuList.setId(elementId)}
        ref={containerRef}
        role='menu'
        onKeyDown={onKeyDown}
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
      variant='ghost'
      colorScheme={destructive ? 'danger' : 'neutral'}
      role='menuitem'
      onKeyDown={onKeyDown}
      focusRing={false}
      onClick={e => {
        onClick?.(e);
        if (closeAfterClick) {
          toggle();
        }
      }}
      sx={[
        theme => ({
          justifyContent: 'start',
          borderRadius: theme.radii.$sm,
          padding: `${theme.space.$1} ${theme.space.$3}`,
        }),
        sx,
      ]}
      {...rest}
    />
  );
};
