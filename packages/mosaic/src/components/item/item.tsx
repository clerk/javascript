'use client';

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

export type ItemRootProps = MosaicComponentProps<'div'>;

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
const Root = React.forwardRef<HTMLDivElement, ItemRootProps>(function MosaicItem({ render, xstyle, ...rest }, ref) {
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

export type ItemMediaProps = MosaicComponentProps<'div'>;

/** Square column that centers its media (icon, image, avatar, or spinner). */
const Media = React.forwardRef<HTMLDivElement, ItemMediaProps>(function MosaicItemMedia(
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

export type ItemContentProps = MosaicComponentProps<'div'>;

/** Vertical stack (label + description) that grows to fill the row between media and actions. */
const Content = React.forwardRef<HTMLDivElement, ItemContentProps>(function MosaicItemContent(
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

export type ItemDescriptionProps = MosaicComponentProps<'div'>;

/** Secondary text beneath the label. Truncates to a single line. Describes the radio of a `Radio.Card` row. */
const Description = React.forwardRef<HTMLDivElement, ItemDescriptionProps>(function MosaicItemDescription(
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

export type ItemActionsProps = MosaicComponentProps<'div'>;

/** Trailing controls (buttons, badges). */
const Actions = React.forwardRef<HTMLDivElement, ItemActionsProps>(function MosaicItemActions(
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

export type ItemGroupProps = MosaicComponentProps<'div'>;

/** Vertical stack of rows, spaced apart. Layout only; the rows carry their own semantics. */
const Group = React.forwardRef<HTMLDivElement, ItemGroupProps>(function MosaicItemGroup(
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

declare namespace Root {
  type Props = ItemRootProps;
}

declare namespace Media {
  type Props = ItemMediaProps;
}

declare namespace Content {
  type Props = ItemContentProps;
}

declare namespace Label {
  type Props = ItemLabelProps;
}

declare namespace Description {
  type Props = ItemDescriptionProps;
}

declare namespace Actions {
  type Props = ItemActionsProps;
}

declare namespace Group {
  type Props = ItemGroupProps;
}

export {
  Root as ItemRoot,
  Media as ItemMedia,
  Content as ItemContent,
  Label as ItemLabel,
  Description as ItemDescription,
  Actions as ItemActions,
  Group as ItemGroup,
};
