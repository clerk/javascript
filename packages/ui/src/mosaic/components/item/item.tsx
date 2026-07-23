import { type ComponentProps, type RenderProp, useRender } from '@clerk/headless/utils';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { mergeStyleProps, themeProps } from '../../props';
import * as slots from './item.styles';

export type ItemProps = Omit<ComponentProps<'div'>, 'render'> & {
  variant?: 'default' | 'outline' | 'muted';
  size?: 'default' | 'sm';
  /** Render a custom element (e.g. a link or button) in place of the default `div`. */
  render?: RenderProp<React.HTMLAttributes<HTMLElement>>;
};

const Root = React.forwardRef<HTMLDivElement, ItemProps>(function MosaicItem(
  { variant = 'default', size = 'default', render, className, style, ...rest },
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
        themeProps('item', { variant, size, interactive }),
        stylex.props(
          slots.item.base,
          variant === 'outline' && slots.item.variantOutline,
          variant === 'muted' && slots.item.variantMuted,
          variant === 'default' && slots.item.variantDefault,
          size === 'sm' ? slots.item.sizeSm : slots.item.sizeMd,
          interactive && slots.item.interactive,
        ),
        className,
        style,
      ),
      ...rest,
    },
  });
});

export type ItemMediaProps = ComponentProps<'div'> & {
  variant?: 'default' | 'icon' | 'image';
};

const Media = React.forwardRef<HTMLDivElement, ItemMediaProps>(function MosaicItemMedia(
  { variant = 'default', render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('item-media', { variant }),
        stylex.props(
          slots.media.base,
          variant === 'icon' && slots.media.icon,
          variant === 'image' && slots.media.image,
        ),
        className,
        style,
      ),
      ...rest,
    },
  });
});

const Content = React.forwardRef<HTMLDivElement, ComponentProps<'div'>>(function MosaicItemContent(
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

const Title = React.forwardRef<HTMLDivElement, ComponentProps<'div'>>(function MosaicItemTitle(
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

const Description = React.forwardRef<HTMLParagraphElement, ComponentProps<'p'>>(function MosaicItemDescription(
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

const Actions = React.forwardRef<HTMLDivElement, ComponentProps<'div'>>(function MosaicItemActions(
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

const Footer = React.forwardRef<HTMLDivElement, ComponentProps<'div'>>(function MosaicItemFooter(
  { render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('item-footer'), stylex.props(slots.band.base), className, style),
      ...rest,
    },
  });
});

const Group = React.forwardRef<HTMLDivElement, ComponentProps<'div'>>(function MosaicItemGroup(
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

const Separator = React.forwardRef<HTMLHRElement, ComponentProps<'hr'>>(function MosaicItemSeparator(
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
 * Composed via dot syntax: `Item.Media`, `Item.Content`, `Item.Title`,
 * `Item.Description`, `Item.Actions`, `Item.Footer`, `Item.Group`,
 * `Item.Separator`.
 */
export const Item = Object.assign(Root, {
  Media,
  Content,
  Title,
  Description,
  Actions,
  Footer,
  Group,
  Separator,
});
