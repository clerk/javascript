import type {
  MenuItemProps as PrimitiveMenuItemProps,
  MenuPopupProps,
  MenuPortalProps,
  MenuProps,
  MenuSeparatorProps,
} from '@clerk/headless/menu';
import { Menu as Primitive } from '@clerk/headless/menu';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { Button } from '../button';
import { Icon } from '../icon';
import { styles } from './menu.styles';

export type { MenuProps, MenuSeparatorProps };

export type MenuTriggerProps = MosaicComponentProps<'button'>;

/**
 * Opens the menu. Renders a ghost `Button` holding an ellipsis glyph by default;
 * pass `children` for a labelled trigger, or `render` to supply your own element.
 */
export const MenuTrigger = React.forwardRef<HTMLButtonElement, MenuTriggerProps>(function MosaicMenuTrigger(
  { render, className, style, children, ...rest },
  ref,
) {
  const trigger: MenuTriggerProps['render'] =
    render ??
    (props => (
      <Button
        variant='ghost'
        size='sm'
        shape={children ? 'default' : 'square'}
        {...props}
      />
    ));

  return (
    <Primitive.Trigger
      ref={ref}
      render={trigger}
      {...mergeStyleProps(themeProps('menu-trigger'), className, style)}
      {...rest}
    >
      {children ?? <Icon name='ellipsis' />}
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
  /** Semantic color of the action. */
  color?: 'neutral' | 'negative';
}

/** A single menu action. `label` drives typeahead and, unless `children` is given, the visible text. */
export const MenuItem = React.forwardRef<HTMLButtonElement, MenuItemProps>(function MosaicMenuItem(
  { color = 'neutral', label, className, style, children, ...rest },
  ref,
) {
  return (
    <Primitive.Item
      ref={ref}
      label={label}
      {...mergeStyleProps(
        themeProps('menu-item', { color }),
        stylex.props(styles.item, color === 'negative' && styles.itemNegative),
        className,
        style,
      )}
      {...rest}
    >
      {children ?? label}
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
