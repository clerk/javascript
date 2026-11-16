import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { useRender } from '../../primitives/utils';
import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { focusOutline } from '../../styles/focus-outline.styles';
import { reset } from '../../styles/reset.styles';
import { truncationStyles } from '../../styles/typography.styles';
import { useOptionalFieldContext, useRegisterFieldPartId } from '../field/field.context';
import * as slots from './item.styles';

export type ItemProps = MosaicComponentProps<'div'>;

/**
 * Root row. Renders a `<div>`, or a custom element (link, button, or
 * `Radio.Card`) via `render`, which also opts the row into hover and cursor
 * affordances. Bordered, so it reads as its own card.
 *
 * @example
 * <Item.Root render={({ children, ...props }) => <a {...props} href='/org'>{children}</a>}>
 *   <Item.Media><Avatar.Root size='fit'>…</Avatar.Root></Item.Media>
 *   <Item.Content><Item.Label>Clerk</Item.Label></Item.Content>
 * </Item.Root>
 */
const Root = React.forwardRef<HTMLDivElement, ItemProps>(function MosaicItem({ render, xstyle, ...rest }, ref) {
  // A custom render (link, button, or radio card row) opts into hover + cursor affordances.
  const interactive = Boolean(render);
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('item', { interactive }),
        stylex.props(reset.base, focusOutline.visible, slots.item.base, interactive && slots.item.interactive, xstyle),
        rest,
      ),
    },
  });
});

/** Square column that centers its media (icon, image, avatar, or spinner). */
const Media = React.forwardRef<HTMLDivElement, MosaicComponentProps<'div'>>(function MosaicItemMedia(
  { render, xstyle, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('item-media'), stylex.props(reset.base, slots.media.base, xstyle), rest),
    },
  });
});

/** Vertical stack (label + description) that grows to fill the row between media and actions. */
const Content = React.forwardRef<HTMLDivElement, MosaicComponentProps<'div'>>(function MosaicItemContent(
  { render, xstyle, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('item-content'), stylex.props(reset.base, slots.content.base, xstyle), rest),
    },
  });
});

/** Where the label sits in the row's hierarchy. */
type LabelVariant = 'default' | 'interactive';

const DEFAULT_LABEL_VARIANT: LabelVariant = 'default';

export type ItemLabelProps = MosaicComponentProps<'div'> & {
  /**
   * `default` names the row's subject (a person, an organization) and sets its
   * own color, so it holds that strength whatever the row does. `interactive`
   * sets no color and takes the row's, so on an interactive row it brightens
   * with the row on hover instead of staying fixed. Use it where the text is
   * the row itself (`Add account`, `Sign out`), not a subject the row names.
   *
   * @default 'default'
   */
  variant?: LabelVariant;
};

/** The row's label. Truncates to a single line. Names the radio of a `Radio.Card` row. */
const Label = React.forwardRef<HTMLDivElement, ItemLabelProps>(function MosaicItemLabel(
  { variant = DEFAULT_LABEL_VARIANT, render, xstyle, id: idProp, ...rest },
  ref,
) {
  const context = useOptionalFieldContext();
  const generatedId = React.useId();
  const id = idProp ?? (context ? `cl-item-${generatedId}-label` : undefined);
  useRegisterFieldPartId(id, context?.setLabelIds);
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('item-label', { variant }),
        stylex.props(reset.base, slots.label.base, slots.label[variant], truncationStyles.singleLine, xstyle),
        rest,
      ),
      id,
    },
  });
});

/** Secondary text beneath the label. Truncates to a single line. Describes the radio of a `Radio.Card` row. */
const Description = React.forwardRef<HTMLDivElement, MosaicComponentProps<'div'>>(function MosaicItemDescription(
  { render, xstyle, id: idProp, ...rest },
  ref,
) {
  const context = useOptionalFieldContext();
  const generatedId = React.useId();
  const id = idProp ?? (context ? `cl-item-${generatedId}-description` : undefined);
  useRegisterFieldPartId(id, context?.setMessageIds);
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('item-description'),
        stylex.props(reset.base, slots.description.base, truncationStyles.singleLine, xstyle),
        rest,
      ),
      id,
    },
  });
});

/** Trailing controls (buttons, badges). */
const Actions = React.forwardRef<HTMLDivElement, MosaicComponentProps<'div'>>(function MosaicItemActions(
  { render, xstyle, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('item-actions'), stylex.props(reset.base, slots.actions.base, xstyle), rest),
    },
  });
});

/** Vertical stack of rows, spaced apart. Layout only; the rows carry their own semantics. */
const Group = React.forwardRef<HTMLDivElement, MosaicComponentProps<'div'>>(function MosaicItemGroup(
  { render, xstyle, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('item-group'), stylex.props(reset.base, slots.group.base, xstyle), rest),
    },
  });
});

/**
 * Mosaic `Item` — a row for lists of accounts, organizations, and settings.
 * Composed via dot syntax: `Item.Root`, `Item.Media`, `Item.Content`,
 * `Item.Label`, `Item.Description`, `Item.Actions`, `Item.Group`. Every part
 * takes a `render` prop and forwards a ref.
 */
export const Item = {
  Root,
  Media,
  Content,
  Label,
  Description,
  Actions,
  Group,
};
