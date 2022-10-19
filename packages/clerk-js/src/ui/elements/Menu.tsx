import React, { cloneElement, isValidElement, PropsWithChildren, useEffect, useRef } from 'react';

import { createContextAndHook } from '@clerk/shared';
import { Button, Col } from '../customizables';
import { usePopover, UsePopoverReturn } from '../hooks';
import { animations, PropsOfComponent } from '../styledSystem';
import { colors } from '../utils/colors';
import { Portal } from './Portal';

type MenuState = {
  popoverCtx: UsePopoverReturn;
};

const [MenuStateCtx, useMenuState] = createContextAndHook<MenuState>('MenuState');

type MenuProps = PropsWithChildren<Record<never, never>>;

export const Menu = (props: MenuProps) => {
  const popoverCtx = usePopover({
    placement: 'right-start',
    offset: 8,
  });

  const value = React.useMemo(() => ({ value: { popoverCtx } }), [{ ...popoverCtx }]);

  return (
    <MenuStateCtx.Provider
      value={value}
      {...props}
    />
  );
};

type MenuTriggerProps = React.PropsWithChildren<Record<never, never>>;

export const MenuTrigger = (props: MenuTriggerProps) => {
  const { children } = props;
  const { popoverCtx } = useMenuState();
  const { reference, toggle } = popoverCtx;

  if (!isValidElement(children)) {
    return null;
  }

  return cloneElement(children, {
    // @ts-expect-error
    ref: reference,
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

type MenuListProps = PropsOfComponent<typeof Col>;

export const MenuList = (props: MenuListProps) => {
  const { sx, ...rest } = props;
  const { popoverCtx } = useMenuState();
  const { floating, styles, isOpen } = popoverCtx;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const current = containerRef.current;
    floating(current);
    current?.focus();
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

  if (!isOpen) {
    return null;
  }

  return (
    <Portal>
      <Col
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
            boxShadow: theme.shadows.$boxShadow1,
            zIndex: theme.zIndices.$dropdown,
          }),
          sx,
        ]}
        style={styles}
        {...rest}
      />
    </Portal>
  );
};

type MenuItemProps = PropsOfComponent<typeof Button> & {
  destructive?: boolean;
};

export const MenuItem = (props: MenuItemProps) => {
  const { sx, onClick, destructive, ...rest } = props;
  const { popoverCtx } = useMenuState();
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
    <Button
      ref={buttonRef}
      focusRing={false}
      variant='ghost'
      colorScheme={destructive ? 'danger' : 'neutral'}
      role='menuitem'
      onKeyDown={onKeyDown}
      onClick={e => {
        onClick?.(e);
        toggle();
      }}
      sx={[
        theme => ({
          justifyContent: 'start',
          borderRadius: theme.radii.$none,
          paddingLeft: theme.space.$4,
          paddingRight: theme.space.$4,
          ':focus': {
            backgroundColor: theme.colors.$blackAlpha200,
          },
        }),
        sx,
      ]}
      {...rest}
    />
  );
};
