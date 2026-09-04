import { useRender } from '@clerk/headless/utils';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { focusOutline } from '../../utils/focus-outline.styles';
import { reset } from '../../utils/reset.styles';
import { truncationStyles } from '../../utils/typography.styles';
import * as slots from './item.styles';

/** The row's height and gap, and the width of the media column inside it. */
type Size = 'xs' | 'md' | 'lg';

const DEFAULT_SIZE: Size = 'md';

/** Carries `Item.Root`'s size down to the parts it scales (`Item.Media`). */
const ItemContext = React.createContext<Size>(DEFAULT_SIZE);

/** How a row presents itself: seated on a shared surface, or bordered as its own card. */
type Variant = 'default' | 'outline';

const DEFAULT_VARIANT: Variant = 'default';

/** Carries `Item.Group`'s variant down to the rows it borders (`Item.Root`). */
const ItemGroupContext = React.createContext<Variant>(DEFAULT_VARIANT);

export type ItemProps = MosaicComponentProps<'div'> & {
  /**
   * Row height and gap. Also sizes a nested `Item.Media`, which reads this from
   * context rather than taking its own prop, so a row scales as one unit.
   *
   * @default 'md'
   */
  size?: Size;
  /**
   * `outline` borders the row so it reads as its own card. Set it here for a row
   * standing on its own, or on `Item.Group` to border a whole set at once — a
   * row set here wins over the group either way, so a row can opt out of an
   * outlined group with `default`.
   *
   * @default the enclosing `Item.Group`'s variant, or `'default'`
   */
  variant?: Variant;
};

/**
 * Root row. Renders a `<div>`, or a custom element (link/button) via `render`,
 * which also opts the row into hover and cursor affordances. Provides its `size`
 * to the parts nested within it, and takes its `variant` from the enclosing
 * `Item.Group` unless it sets one of its own.
 *
 * @example
 * <Item.Root size='xs' render={({ children, ...props }) => <a {...props} href='/org'>{children}</a>}>
 *   <Item.Media><Avatar.Root size='fit'>…</Avatar.Root></Item.Media>
 *   <Item.Content><Item.Label>Clerk</Item.Label></Item.Content>
 * </Item.Root>
 */
const Root = React.forwardRef<HTMLDivElement, ItemProps>(function MosaicItem(
  { size = DEFAULT_SIZE, variant: variantProp, render, className, style, ...rest },
  ref,
) {
  // A custom render (link/button row) opts into hover + cursor affordances.
  const interactive = Boolean(render);
  // The group is the default, not the authority: a row that names a variant keeps it, which is what
  // lets one row opt out of an outlined group.
  const groupVariant = React.useContext(ItemGroupContext);
  const variant = variantProp ?? groupVariant;
  const element = useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('item', { interactive, size, variant }),
        stylex.props(
          reset.base,
          focusOutline.visible,
          slots.item.base,
          slots.item[size],
          variant === 'outline' && slots.item.outline,
          interactive && slots.item.interactive,
        ),
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
        stylex.props(reset.base, slots.media.base, slots.media[size]),
        className,
        style,
      ),
      ...rest,
    },
  });
});

/** Vertical stack (label + description) that grows to fill the row between media and actions. */
const Content = React.forwardRef<HTMLDivElement, MosaicComponentProps<'div'>>(function MosaicItemContent(
  { render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('item-content'), stylex.props(reset.base, slots.content.base), className, style),
      ...rest,
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

/** The row's label. Truncates to a single line. */
const Label = React.forwardRef<HTMLDivElement, ItemLabelProps>(function MosaicItemLabel(
  { variant = DEFAULT_LABEL_VARIANT, render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('item-label', { variant }),
        stylex.props(reset.base, slots.label.base, slots.label[variant], truncationStyles.singleLine),
        className,
        style,
      ),
      ...rest,
    },
  });
});

/** Secondary text beneath the label. Truncates to a single line. */
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
        stylex.props(reset.base, slots.description.base, truncationStyles.singleLine),
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
      ...mergeStyleProps(themeProps('item-actions'), stylex.props(reset.base, slots.actions.base), className, style),
      ...rest,
    },
  });
});

export type ItemGroupProps = MosaicComponentProps<'div'> & {
  /**
   * `default` keeps the rows on one continuous surface, inset by the group's own
   * gutter. `outline` gives each row a border and reads them as separate cards,
   * so the group drops its gutter and spaces the rows apart instead. Reaches the
   * rows through context, so a row only needs its own `variant` to disagree with
   * the group.
   *
   * @default 'default'
   */
  variant?: Variant;
};

/**
 * Vertical wrapper around a set of rows. Layout only; the rows carry their own
 * semantics. Provides its `variant` to the rows nested within it.
 */
const Group = React.forwardRef<HTMLDivElement, ItemGroupProps>(function MosaicItemGroup(
  { variant = DEFAULT_VARIANT, render, className, style, ...rest },
  ref,
) {
  const element = useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('item-group', { variant }),
        stylex.props(reset.base, slots.group.base, slots.group[variant]),
        className,
        style,
      ),
      ...rest,
    },
  });

  return <ItemGroupContext.Provider value={variant}>{element}</ItemGroupContext.Provider>;
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
      ...mergeStyleProps(
        themeProps('item-separator'),
        stylex.props(reset.base, slots.separator.base),
        className,
        style,
      ),
      ...rest,
    },
  });
});

/**
 * Mosaic `Item` — a row for lists of accounts, organizations, and settings.
 * Composed via dot syntax: `Item.Root`, `Item.Media`, `Item.Content`,
 * `Item.Label`, `Item.Description`, `Item.Actions`, `Item.Group`,
 * `Item.Separator`. Every part takes a `render` prop and forwards a ref.
 *
 * `size` is set once on `Item.Root` and reaches `Item.Media` through context, so
 * a row scales as a unit rather than per part. `variant` is set on a row, or
 * once on `Item.Group` to reach every row in it.
 */
export const Item = {
  Root,
  Media,
  Content,
  Label,
  Description,
  Actions,
  Group,
  Separator,
};
