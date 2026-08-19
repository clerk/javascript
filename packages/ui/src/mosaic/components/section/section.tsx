import { useRender } from '@clerk/headless/utils';
import { useSafeLayoutEffect } from '@clerk/shared/react';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import type { HeadingProps } from '../heading';
import { Heading } from '../heading';
import { reset } from '../reset.styles';
import { sectionItemsMarker } from './section.markers.stylex';
import { styles } from './section.styles';

export type SectionRootProps = Omit<MosaicComponentProps<'section'>, 'title'>;
export type SectionTitleProps = Omit<HeadingProps, 'size'>;
export type SectionGroupProps = MosaicComponentProps<'div'>;
export type SectionRowProps = MosaicComponentProps<'div'>;
export type SectionItemsProps = MosaicComponentProps<'div'>;
export type SectionItemProps = MosaicComponentProps<'div'>;
export type SectionMediaSize = 'sm' | 'md' | 'lg' | 'xl';
export type SectionMediaProps = MosaicComponentProps<'div'> & { size?: SectionMediaSize };
export type SectionContentProps = MosaicComponentProps<'div'>;
export type SectionLabelProps = MosaicComponentProps<'div'>;
export type SectionDescriptionProps = MosaicComponentProps<'div'>;
export type SectionActionsProps = MosaicComponentProps<'div'>;

const mediaSizes = {
  sm: styles.mediaSm,
  md: styles.mediaMd,
  lg: styles.mediaLg,
  xl: styles.mediaXl,
};

const SectionTitleContext = React.createContext<React.Dispatch<React.SetStateAction<string[]>> | null>(null);

const Root = React.forwardRef<HTMLElement, SectionRootProps>(function SectionRoot(
  { render, className, style, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy, ...rest },
  ref,
) {
  const [titleIds, setTitleIds] = React.useState<string[]>([]);

  const element = useRender({
    defaultTagName: 'section',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('section'), stylex.props(reset.base, styles.root), className, style),
      ...rest,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy ?? (ariaLabel ? undefined : titleIds.join(' ') || undefined),
    },
  });

  return <SectionTitleContext.Provider value={setTitleIds}>{element}</SectionTitleContext.Provider>;
});

const Title = React.forwardRef<HTMLHeadingElement, SectionTitleProps>(function SectionTitle(
  { id: idProp, render, className, style, ...rest },
  ref,
) {
  const setTitleIds = React.useContext(SectionTitleContext);
  const generatedId = React.useId();
  const id = idProp ?? (setTitleIds ? `cl-section-${generatedId}-title` : undefined);

  useSafeLayoutEffect(() => {
    if (!id || !setTitleIds) {
      return undefined;
    }

    setTitleIds(ids => (ids.includes(id) ? ids : [...ids, id]));
    return () => setTitleIds(ids => ids.filter(value => value !== id));
  }, [id, setTitleIds]);

  return (
    <Heading
      ref={ref}
      id={id}
      render={render ?? (props => <h4 {...props} />)}
      size='base'
      {...mergeStyleProps(themeProps('section-title'), stylex.props(styles.title), className, style)}
      {...rest}
    />
  );
});

const Group = React.forwardRef<HTMLDivElement, SectionGroupProps>(function SectionGroup(
  { render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('section-group'), stylex.props(reset.base, styles.group), className, style),
      ...rest,
    },
  });
});

const Items = React.forwardRef<HTMLDivElement, SectionItemsProps>(function SectionItems(
  { render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('section-items'),
        stylex.props(reset.base, styles.items, sectionItemsMarker),
        className,
        style,
      ),
      ...rest,
    },
  });
});

const Row = React.forwardRef<HTMLDivElement, SectionRowProps>(function SectionRow(
  { render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('section-row'), stylex.props(reset.base, styles.row), className, style),
      ...rest,
    },
  });
});

const Item = React.forwardRef<HTMLDivElement, SectionItemProps>(function SectionItem(
  { render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('section-item'), stylex.props(reset.base, styles.item), className, style),
      ...rest,
    },
  });
});

const Media = React.forwardRef<HTMLDivElement, SectionMediaProps>(function SectionMedia(
  { size = 'md', render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('section-media', { size }),
        stylex.props(reset.base, styles.mediaBase, mediaSizes[size]),
        className,
        style,
      ),
      ...rest,
    },
  });
});

const Content = React.forwardRef<HTMLDivElement, SectionContentProps>(function SectionContent(
  { render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('section-content'), stylex.props(reset.base, styles.content), className, style),
      ...rest,
    },
  });
});

const Label = React.forwardRef<HTMLDivElement, SectionLabelProps>(function SectionLabel(
  { render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('section-label'), stylex.props(reset.base, styles.label), className, style),
      ...rest,
    },
  });
});

const Description = React.forwardRef<HTMLDivElement, SectionDescriptionProps>(function SectionDescription(
  { render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('section-description'),
        stylex.props(reset.base, styles.description),
        className,
        style,
      ),
      ...rest,
    },
  });
});

const Actions = React.forwardRef<HTMLDivElement, SectionActionsProps>(function SectionActions(
  { render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('section-actions'), stylex.props(reset.base, styles.actions), className, style),
      ...rest,
    },
  });
});

/**
 * A compound component that fixes section semantics, surface treatment, row grouping,
 * and item layout while leaving each item's content composable.
 */
export const Section = { Root, Title, Group, Row, Items, Item, Media, Content, Label, Description, Actions };
