import type {
  MenuItemProps as PrimitiveMenuItemProps,
  MenuPopupProps,
  MenuPortalProps,
  MenuProps,
  MenuSeparatorProps,
  MenuTriggerProps,
} from '@clerk/headless/menu';
import { Menu as Primitive } from '@clerk/headless/menu';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { iconRegistry } from '../../icons/registry';
import { mergeStyleProps, themeProps } from '../../props';
import { Button } from '../button';
import { styles } from './menu.styles';

const EllipsisIcon = iconRegistry.ellipsis;

export type { MenuProps, MenuSeparatorProps, MenuTriggerProps };

/**
 * Opens the menu. Renders a ghost `Button` holding an ellipsis glyph by default;
 * pass `children` for a labelled trigger, or `render` to supply your own element.
 */
export const MenuTrigger = React.forwardRef<HTMLButtonElement, MenuTriggerProps>(function MosaicMenuTrigger(
  { render, className, style, children, ...rest },
  ref,
) {
  return (
    <Primitive.Trigger
      ref={ref}
      render={
        render ??
        (props => (
          <Button
            variant='ghost'
            size='sm'
            shape={children ? 'default' : 'square'}
            {...props}
          />
        ))
      }
      {...mergeStyleProps(themeProps('menu-trigger'), className, style)}
      {...rest}
    >
      {children ?? <EllipsisIcon {...stylex.props(styles.triggerIcon)} />}
    </Primitive.Trigger>
  );
});

export interface MenuContentProps extends MenuPopupProps {
  /** Container the menu portals into. Defaults to `document.body`. */
  portalRoot?: MenuPortalProps['root'];
}

/** The floating surface: portals, positions, and renders the menu items. */
export const MenuContent = React.forwardRef<HTMLDivElement, MenuContentProps>(function MosaicMenuContent(
  { portalRoot, className, style, children, ...rest },
  ref,
) {
  return (
    <Primitive.Portal root={portalRoot}>
      <Primitive.Positioner {...mergeStyleProps(themeProps('menu-positioner'), stylex.props(styles.positioner))}>
        <Primitive.Popup
          ref={ref}
          {...mergeStyleProps(themeProps('menu-popup'), stylex.props(styles.popup), className, style)}
          {...rest}
        >
          {children}
        </Primitive.Popup>
      </Primitive.Positioner>
    </Primitive.Portal>
  );
});

export interface MenuItemProps extends PrimitiveMenuItemProps {
  /** Leading glyph, sized and tinted by the item. */
  icon?: React.ReactNode;
}

/** A single menu action. `label` drives typeahead and, unless `children` is given, the visible text. */
export const MenuItem = React.forwardRef<HTMLButtonElement, MenuItemProps>(function MosaicMenuItem(
  { icon, label, className, style, children, ...rest },
  ref,
) {
  return (
    <Primitive.Item
      ref={ref}
      label={label}
      {...mergeStyleProps(themeProps('menu-item'), stylex.props(styles.item), className, style)}
      {...rest}
    >
      {icon ? (
        <span {...mergeStyleProps(themeProps('menu-item-icon'), stylex.props(styles.itemIcon))}>{icon}</span>
      ) : null}
      <span {...mergeStyleProps(themeProps('menu-item-label'), stylex.props(styles.itemLabel))}>
        {children ?? label}
      </span>
    </Primitive.Item>
  );
});

/** A full-bleed divider between groups of items. */
export function MenuSeparator({ className, style, ...rest }: MenuSeparatorProps): React.ReactElement {
  return (
    <Primitive.Separator
      {...mergeStyleProps(themeProps('menu-separator'), stylex.props(styles.separator), className, style)}
      {...rest}
    />
  );
}

export const Menu = {
  // Renders no element of its own; re-exported unchanged so the state provider sits
  // alongside the styled parts.
  Root: Primitive.Root,
  Trigger: MenuTrigger,
  Content: MenuContent,
  Item: MenuItem,
  Separator: MenuSeparator,
};
