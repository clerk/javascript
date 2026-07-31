import { useRender } from '@clerk/headless/utils';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { truncationStyles } from '../typography.styles';
import { itemScope } from './item.markers.stylex';
import * as slots from './item.styles';

/** The row's height and gap, and the width of the media column inside it. */
type Size = 'xs' | 'md';

const DEFAULT_SIZE: Size = 'md';

/** Carries `Item.Root`'s size down to the parts it scales (`Item.Media`). */
const ItemContext = React.createContext<Size>(DEFAULT_SIZE);

export type ItemProps = MosaicComponentProps<'div'> & {
  /**
   * Row height and gap. Also sizes a nested `Item.Media`, which reads this from
   * context rather than taking its own prop, so a row scales as one unit.
   *
   * @default 'md'
   */
  size?: Size;
};

/**
 * Root row. Renders a `<div>`, or a custom element (link/button) via `render`,
 * which also opts the row into hover and cursor affordances. Provides its `size`
 * to the parts nested within it.
 *
 * @example
 * <Item.Root size='xs' render={({ children, ...props }) => <a {...props} href='/org'>{children}</a>}>
 *   <Item.Media><Avatar.Root size='fit'>…</Avatar.Root></Item.Media>
 *   <Item.Content><Item.Title>Clerk</Item.Title></Item.Content>
 * </Item.Root>
 */
const Root = React.forwardRef<HTMLDivElement, ItemProps>(function MosaicItem(
  { size = DEFAULT_SIZE, render, className, style, ...rest },
  ref,
) {
  // A custom render (link/button row) opts into hover + cursor affordances.
  const interactive = Boolean(render);
  const element = useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('item', { interactive, size }),
        stylex.props(itemScope, slots.item.base, slots.item[size], interactive && slots.item.interactive),
        className,
        style,
      ),
      ...rest,
    },
  });

  return <ItemContext.Provider value={size}>{element}</ItemContext.Provider>;
});

/**
 * Square leading column that centers its media (icon, image, or avatar). Takes
 * its width from the `size` on the enclosing `Item.Root`, falling back to the
 * default when rendered on its own.
 */
const Media = React.forwardRef<HTMLDivElement, MosaicComponentProps<'div'>>(function MosaicItemMedia(
  { render, className, style, ...rest },
  ref,
) {
  const size = React.useContext(ItemContext);
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('item-media', { size }),
        stylex.props(slots.media.base, slots.media[size]),
        className,
        style,
      ),
      ...rest,
    },
  });
});

/** Vertical stack (title + description) that grows to fill the row between media and actions. */
const Content = React.forwardRef<HTMLDivElement, MosaicComponentProps<'div'>>(function MosaicItemContent(
  { render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('item-content'), stylex.props(slots.content.base), className, style),
      ...rest,
    },
  });
});

/** Primary label. Truncates to a single line. */
const Title = React.forwardRef<HTMLDivElement, MosaicComponentProps<'div'>>(function MosaicItemTitle(
  { render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('item-title'),
        stylex.props(slots.title.base, truncationStyles.singleLine),
        className,
        style,
      ),
      ...rest,
    },
  });
});

/** Secondary text beneath the title. Truncates to a single line. */
const Description = React.forwardRef<HTMLDivElement, MosaicComponentProps<'div'>>(function MosaicItemDescription(
  { render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('item-description'),
        stylex.props(slots.description.base, truncationStyles.singleLine),
        className,
        style,
      ),
      ...rest,
    },
  });
});

/**
 * Sole label on an action row (`Add account`, `Sign out`), used in place of a
 * title. Dimmed until the row is hovered, so it reads as an affordance rather
 * than as content.
 */
const Label = React.forwardRef<HTMLDivElement, MosaicComponentProps<'div'>>(function MosaicItemLabel(
  { render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('item-label'),
        stylex.props(slots.label.base, truncationStyles.singleLine),
        className,
        style,
      ),
      ...rest,
    },
  });
});

/** Trailing controls (buttons, badges). */
const Actions = React.forwardRef<HTMLDivElement, MosaicComponentProps<'div'>>(function MosaicItemActions(
  { render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('item-actions'), stylex.props(slots.actions.base), className, style),
      ...rest,
    },
  });
});

/** Vertical wrapper around a set of rows. Layout only; the rows carry their own semantics. */
const Group = React.forwardRef<HTMLDivElement, MosaicComponentProps<'div'>>(function MosaicItemGroup(
  { render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('item-group'), stylex.props(slots.group.base), className, style),
      ...rest,
    },
  });
});

/** Thin divider (`<hr>`) between rows or groups. */
const Separator = React.forwardRef<HTMLHRElement, MosaicComponentProps<'hr'>>(function MosaicItemSeparator(
  { render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'hr',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('item-separator'), stylex.props(slots.separator.base), className, style),
      ...rest,
    },
  });
});

/**
 * Mosaic `Item` — a row for lists of accounts, organizations, and settings.
 * Composed via dot syntax: `Item.Root`, `Item.Media`, `Item.Content`,
 * `Item.Title`, `Item.Description`, `Item.Label`, `Item.Actions`, `Item.Group`,
 * `Item.Separator`. Every part takes a `render` prop and forwards a ref.
 *
 * `size` is set once on `Item.Root` and reaches `Item.Media` through context, so
 * a row scales as a unit rather than per part.
 */
export const Item = {
  Root,
  Media,
  Content,
  Title,
  Description,
  Label,
  Actions,
  Group,
  Separator,
};
