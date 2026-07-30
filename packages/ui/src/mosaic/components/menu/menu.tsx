import type { MenuProps as HeadlessMenuProps } from '@clerk/headless/menu';
import { Menu as Primitive } from '@clerk/headless/menu';
import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import React from 'react';

import { mergeStyleProps, themeProps } from '../../props';
import { floating } from '../floating.styles';
import { item as itemSlots } from '../item/item.styles';
import * as styles from './menu.styles';

/**
 * Mosaic Menu: a list of actions anchored to a trigger, built on the
 * `@clerk/headless` menu primitive.
 *
 * Distinct from `Popover` on purpose. A menu is `role="menu"` with roving focus,
 * typeahead, and nested submenus; a popover is a `role="dialog"` holding arbitrary
 * content. They share only the floating box (`floating.styles.ts`) — stacking,
 * viewport clamps, and the enter/exit transition.
 *
 * Rows reuse the `Item` geometry so a menu row and a list row are the same shape.
 */

const Positioner = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof Primitive.Positioner>>(
  function MenuPositioner({ className, style, ...rest }, ref) {
    return (
      <Primitive.Positioner
        ref={ref}
        {...mergeStyleProps(themeProps('menu-positioner'), stylex.props(floating.positioner), className, style)}
        {...rest}
      />
    );
  },
);

const Popup = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof Primitive.Popup>>(
  function MenuPopup({ className, style, ...rest }, ref) {
    return (
      <Primitive.Popup
        ref={ref}
        {...mergeStyleProps(
          themeProps('menu-popup'),
          stylex.props(floating.popup, styles.popup.base),
          className,
          style,
        )}
        {...rest}
      />
    );
  },
);

export interface MenuItemProps extends React.ComponentPropsWithoutRef<typeof Primitive.Item> {
  /** Row text. Also drives typeahead matching, so it is required. */
  label: string;
}

/**
 * A single action. Falls back to rendering `label` when no children are supplied —
 * the primitive keeps the two separate because `label` feeds typeahead, but the
 * common case is that they are the same string.
 */
const Item = React.forwardRef<HTMLButtonElement, MenuItemProps>(function MenuItem(
  { className, style, children, label, disabled, ...rest },
  ref,
) {
  return (
    <Primitive.Item
      ref={ref}
      label={label}
      disabled={disabled}
      {...mergeStyleProps(
        themeProps('menu-item', { disabled }),
        stylex.props(itemSlots.base, itemSlots.entity, styles.item.base, disabled && styles.item.disabled),
        className,
        style,
      )}
      {...rest}
    >
      {children ?? label}
    </Primitive.Item>
  );
});

/**
 * Trigger for a nested submenu, styled as a row. Use this instead of wrapping a
 * `Menu.Item` in a nested `Menu.Trigger` — the trigger already registers itself as a
 * `menuitem` in the parent list, so nesting an `Item` inside it would register a
 * second entry and desync arrow-key navigation from what is on screen.
 */
const SubTrigger = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof Primitive.Trigger>>(
  function MenuSubTrigger({ className, style, ...rest }, ref) {
    return (
      <Primitive.Trigger
        ref={ref}
        {...mergeStyleProps(
          themeProps('menu-sub-trigger'),
          stylex.props(itemSlots.base, itemSlots.entity, styles.subTrigger.base),
          className,
          style,
        )}
        {...rest}
      />
    );
  },
);

const Separator = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof Primitive.Separator>>(
  function MenuSeparator({ className, style, ...rest }, ref) {
    return (
      <Primitive.Separator
        ref={ref}
        {...mergeStyleProps(themeProps('menu-separator'), stylex.props(styles.separator.base), className, style)}
        {...rest}
      />
    );
  },
);

export interface MenuProps extends Pick<
  HeadlessMenuProps,
  'open' | 'defaultOpen' | 'onOpenChange' | 'placement' | 'sideOffset'
> {
  /** Rendered as the menu's anchor. Receives the trigger's props and open state. */
  trigger: React.ComponentProps<typeof Primitive.Trigger>['render'];
  /** Menu contents. Compose `Menu.Item` and `Menu.Separator`. */
  children: ReactNode;
}

/**
 * Convenience composition: trigger + portalled, positioned popup. For nested
 * submenus, compose the parts directly and nest a `Menu.Root` inside a popup.
 */
export function Menu({ trigger, children, open, defaultOpen, onOpenChange, placement, sideOffset }: MenuProps) {
  return (
    <Primitive.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      placement={placement}
      sideOffset={sideOffset}
    >
      <Primitive.Trigger render={trigger} />
      <Primitive.Portal>
        <Positioner>
          <Popup>{children}</Popup>
        </Positioner>
      </Primitive.Portal>
    </Primitive.Root>
  );
}

/** Compound parts for custom menu layouts, including nested submenus. */
Menu.Root = Primitive.Root;
Menu.Trigger = Primitive.Trigger;
Menu.Portal = Primitive.Portal;
Menu.Positioner = Positioner;
Menu.Popup = Popup;
Menu.SubTrigger = SubTrigger;
Menu.Item = Item;
Menu.Separator = Separator;
