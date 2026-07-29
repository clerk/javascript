import { type RenderProp, useRender } from '@clerk/headless/utils';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import * as slots from './item.styles';

export type ItemProps = Omit<MosaicComponentProps<'div'>, 'render'> & {
  /** Vertical density of the row. `flush` removes the block padding. */
  size?: 'flush' | 'md';
  /** Render a custom element (e.g. a link or button) in place of the default `div`. */
  render?: RenderProp<React.HTMLAttributes<HTMLElement>>;
};

const Root = React.forwardRef<HTMLDivElement, ItemProps>(function MosaicItem(
  { size = 'md', render, className, style, ...rest },
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
        themeProps('item', { interactive, size }),
        stylex.props(slots.item.base, slots.item[size], interactive && slots.item.interactive),
        className,
        style,
      ),
      ...rest,
    },
  });
});

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

const Title = React.forwardRef<HTMLDivElement, MosaicComponentProps<'div'>>(function MosaicItemTitle(
  { render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('item-title'), stylex.props(slots.title.base), className, style),
      ...rest,
    },
  });
});

const Description = React.forwardRef<HTMLParagraphElement, MosaicComponentProps<'p'>>(function MosaicItemDescription(
  { render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'p',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('item-description'), stylex.props(slots.description.base), className, style),
      ...rest,
    },
  });
});

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

const Group = React.forwardRef<HTMLDivElement, MosaicComponentProps<'div'>>(function MosaicItemGroup(
  { render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      role: 'list',
      ...mergeStyleProps(themeProps('item-group'), stylex.props(slots.group.base), className, style),
      ...rest,
    },
  });
});

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
 * `Item.Title`, `Item.Description`, `Item.Actions`, `Item.Group`,
 * `Item.Separator`.
 */
export const Item = {
  Root,
  Media,
  Content,
  Title,
  Description,
  Actions,
  Group,
  Separator,
};
