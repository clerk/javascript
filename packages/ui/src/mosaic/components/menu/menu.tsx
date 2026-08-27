import type {
  MenuPortalProps,
  MenuProps,
  MenuSeparatorProps,
  MenuItemProps as PrimitiveMenuItemProps,
  MenuPopupProps as PrimitiveMenuPopupProps,
} from '@clerk/headless/menu';
import { Menu as Primitive } from '@clerk/headless/menu';
import { useRender } from '@clerk/headless/utils';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { focusOutline } from '../../utils/focus-outline.styles';
import { reset } from '../../utils/reset.styles';
import { truncationStyles } from '../../utils/typography.styles';
import { Button } from '../button';
import { Icon } from '../icon';
import * as slots from './menu.styles';

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

export interface MenuPopupProps extends PrimitiveMenuPopupProps {
  /** Container the menu portals into. Defaults to `document.body`. */
  portalRoot?: MenuPortalProps['root'];
}

/**
 * The floating surface: portals, positions, and renders the menu items. The portal and the
 * positioner are not parts a consumer composes, so they stay out of the public API.
 */
export const MenuPopup = React.forwardRef<HTMLDivElement, MenuPopupProps>(function MosaicMenuPopup(
  { portalRoot, className, style, children, ...rest },
  ref,
) {
  return (
    <Primitive.Portal root={portalRoot}>
      <Primitive.Positioner
        {...mergeStyleProps(themeProps('menu-positioner'), stylex.props(reset.base, slots.positioner.base))}
      >
        <Primitive.Popup
          ref={ref}
          {...mergeStyleProps(themeProps('menu-popup'), stylex.props(reset.base, slots.popup.base), className, style)}
          {...rest}
        >
          {children}
        </Primitive.Popup>
      </Primitive.Positioner>
    </Primitive.Portal>
  );
});

/** The width of the media column, and so the height of the row it sits in. */
export type MenuMediaSize = 'xs' | 'sm';

/** `span`, not `div`: the item this sits in is a button, so its children are phrasing content. */
export type MenuMediaProps = MosaicComponentProps<'span'> & {
  /**
   * Column width: `sm` fits an icon or an avatar, `xs` a bare glyph. The row takes its height
   * from this, so every item in one menu wants the same value or their text no longer starts on
   * one line.
   *
   * @default 'sm'
   */
  size?: MenuMediaSize;
};

/**
 * Square leading column that centers its media (icon, image, or avatar), so every item's
 * text starts on the same line whatever each one leads with.
 */
export const MenuMedia = React.forwardRef<HTMLSpanElement, MenuMediaProps>(function MosaicMenuMedia(
  { size = 'sm', render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'span',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('menu-media', { size }),
        stylex.props(reset.base, slots.media.base, slots.media[size]),
        className,
        style,
      ),
      ...rest,
    },
  });
});

/** `span`, not `div`: the item this sits in is a button, so its children are phrasing content. */
export type MenuLabelProps = MosaicComponentProps<'span'>;

/**
 * The item's text. Takes the space between the media and whatever trails it, and truncates to one
 * line rather than pushing the menu wide. `Menu.Item` wraps its own `label` in this, so only a row
 * built from the parts has to write it.
 */
export const MenuLabel = React.forwardRef<HTMLSpanElement, MenuLabelProps>(function MosaicMenuLabel(
  { render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'span',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('menu-label'),
        stylex.props(reset.base, slots.label.base, truncationStyles.singleLine),
        className,
        style,
      ),
      ...rest,
    },
  });
});

export interface MenuItemProps extends PrimitiveMenuItemProps {
  /** Semantic color of the action. */
  color?: 'neutral' | 'negative';
  /**
   * The row's content, composed from `Menu.Media` and `Menu.Label`. Required, and text goes in
   * `Menu.Label` rather than straight in here: a bare text node is not a flex item the row can
   * size, so it neither lines up with the other rows nor truncates.
   */
  children: React.ReactNode;
}

/**
 * A single menu action. `label` names it for typeahead and for assistive technology; what the row
 * shows is whatever `Menu.Media` and `Menu.Label` are composed into it.
 */
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
        stylex.props(reset.base, focusOutline.visible, slots.item.base, color === 'negative' && slots.item.negative),
        className,
        style,
      )}
      {...rest}
    >
      {children}
    </Primitive.Item>
  );
});

/** A full-bleed divider between groups of items. */
export function MenuSeparator({ className, style, ...rest }: MenuSeparatorProps): React.ReactElement {
  return (
    <Primitive.Separator
      {...mergeStyleProps(
        themeProps('menu-separator'),
        stylex.props(reset.base, slots.separator.base),
        className,
        style,
      )}
      {...rest}
    />
  );
}

export const Menu = {
  // Renders no element of its own; re-exported unchanged so the state provider sits
  // alongside the styled parts.
  Root: Primitive.Root,
  Trigger: MenuTrigger,
  Popup: MenuPopup,
  Item: MenuItem,
  Media: MenuMedia,
  Label: MenuLabel,
  Separator: MenuSeparator,
};
