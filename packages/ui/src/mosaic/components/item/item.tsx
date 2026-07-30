import { type RenderProp, useRender } from '@clerk/headless/utils';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { truncationStyles } from '../typography.styles';
import * as slots from './item.styles';

export type ItemProps = Omit<MosaicComponentProps<'div'>, 'render'> & {
  /**
   * Visual treatment, which also sets the row's vertical density. `entity` (default)
   * is a standard row; `action` is a denser row whose title color is promoted on
   * interactive rows.
   */
  variant?: 'entity' | 'action';
  /** Render a custom element (e.g. a link or button) in place of the default `div`. */
  render?: RenderProp<React.HTMLAttributes<HTMLElement>>;
};

/** Root row. Renders a `<div>`, or a custom element (link/button) via `render`. */
const Root = React.forwardRef<HTMLDivElement, ItemProps>(function MosaicItem(
  { variant = 'entity', render, className, style, ...rest },
  ref,
) {
  // A custom render (link/button row) opts into hover + cursor affordances.
  const interactive = Boolean(render);
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('item', { interactive, variant }),
        stylex.props(
          slots.item.base,
          slots.item[variant],
          interactive && slots.item.interactive,
          // Marks action rows so `Item.Title` can react to their hover via `when.ancestor`.
          interactive && variant === 'action' && stylex.defaultMarker(),
        ),
        className,
        style,
      ),
      ...rest,
    },
  });
});

/** Fixed-width leading i that centers its media (icon, image, or avatar). */
const Media = React.forwardRef<HTMLDivElement, MosaicComponentProps<'div'>>(function MosaicItemMedia(
  { render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('item-media'), stylex.props(slots.media.base), className, style),
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

/** Primary label. On interactive `action` rows its color darkens on hover. */
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

/** Secondary text beneath the title. */
const Description = React.forwardRef<HTMLParagraphElement, MosaicComponentProps<'p'>>(function MosaicItemDescription(
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

/** Header row above a group: a label (`Item.HeaderTitle`) with optional `Item.HeaderActions`. */
const Header = React.forwardRef<HTMLDivElement, MosaicComponentProps<'div'>>(function MosaicItemHeader(
  { render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('item-header'), stylex.props(slots.header.base), className, style),
      ...rest,
    },
  });
});

/** Label text within an `Item.Header`. */
const HeaderTitle = React.forwardRef<HTMLDivElement, MosaicComponentProps<'div'>>(function MosaicItemHeaderTitle(
  { render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('item-header-title'), stylex.props(slots.headerTitle.base), className, style),
      ...rest,
    },
  });
});

/** Trailing controls within an `Item.Header`. */
const HeaderActions = React.forwardRef<HTMLDivElement, MosaicComponentProps<'div'>>(function MosaicItemHeaderActions(
  { render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('item-header-actions'), stylex.props(slots.headerActions.base), className, style),
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
 * `Item.Title`, `Item.Description`, `Item.Actions`, `Item.Header`,
 * `Item.HeaderTitle`, `Item.HeaderActions`, `Item.Group`, `Item.Separator`.
 */
export const Item = {
  Root,
  Media,
  Content,
  Title,
  Description,
  Actions,
  Header,
  HeaderTitle,
  HeaderActions,
  Group,
  Separator,
};
