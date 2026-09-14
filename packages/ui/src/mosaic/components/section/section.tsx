import { useRender } from '@clerk/headless/utils';
import { useSafeLayoutEffect } from '@clerk/shared/react';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../utils/reset.styles';
import { sizes as typographySizes, styles as typographyStyles } from '../../utils/typography.styles';
import type { HeadingProps } from '../heading';
import { Heading } from '../heading';
import { Icon } from '../icon';
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
export type SectionErrorProps = MosaicComponentProps<'p'>;

const mediaSizes = {
  sm: styles.mediaSm,
  md: styles.mediaMd,
  lg: styles.mediaLg,
  xl: styles.mediaXl,
};

const SectionTitleContext = React.createContext<React.Dispatch<React.SetStateAction<string[]>> | null>(null);
const SectionItemsContext = React.createContext(false);

const Root = React.forwardRef<HTMLElement, SectionRootProps>(function SectionRoot(
  { render, xstyle, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy, ...rest },
  ref,
) {
  const [titleIds, setTitleIds] = React.useState<string[]>([]);

  const element = useRender({
    defaultTagName: 'section',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('section'), stylex.props(reset.base, styles.root, xstyle), rest),
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy ?? (ariaLabel ? undefined : titleIds.join(' ') || undefined),
    },
  });

  return <SectionTitleContext.Provider value={setTitleIds}>{element}</SectionTitleContext.Provider>;
});

const Title = React.forwardRef<HTMLHeadingElement, SectionTitleProps>(function SectionTitle(
  { id: idProp, render, xstyle, ...rest },
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
      {...mergeStyleProps(themeProps('section-title'), stylex.props(styles.title, xstyle), rest)}
    />
  );
});

const Group = React.forwardRef<HTMLDivElement, SectionGroupProps>(function SectionGroup(
  { render, xstyle, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('section-group'), stylex.props(reset.base, styles.group, xstyle), rest),
    },
  });
});

const Items = React.forwardRef<HTMLDivElement, SectionItemsProps>(function SectionItems(
  { render, xstyle, ...rest },
  ref,
) {
  const element = useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('section-items', { nested: true }),
        stylex.props(reset.base, styles.items, sectionItemsMarker, xstyle),
        rest,
      ),
    },
  });

  return <SectionItemsContext.Provider value>{element}</SectionItemsContext.Provider>;
});

const Row = React.forwardRef<HTMLDivElement, SectionRowProps>(function SectionRow({ render, xstyle, ...rest }, ref) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('section-row'), stylex.props(reset.base, styles.row, xstyle), rest),
    },
  });
});

const Item = React.forwardRef<HTMLDivElement, SectionItemProps>(function SectionItem({ render, xstyle, ...rest }, ref) {
  const nested = React.useContext(SectionItemsContext);

  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('section-item', { nested }), stylex.props(reset.base, styles.item, xstyle), rest),
    },
  });
});

const Media = React.forwardRef<HTMLDivElement, SectionMediaProps>(function SectionMedia(
  { size = 'md', render, xstyle, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('section-media', { size }),
        stylex.props(reset.base, styles.mediaBase, mediaSizes[size], xstyle),
        rest,
      ),
    },
  });
});

const Content = React.forwardRef<HTMLDivElement, SectionContentProps>(function SectionContent(
  { render, xstyle, ...rest },
  ref,
) {
  const nested = React.useContext(SectionItemsContext);

  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('section-content', { nested }),
        stylex.props(reset.base, styles.content, xstyle),
        rest,
      ),
    },
  });
});

const Label = React.forwardRef<HTMLDivElement, SectionLabelProps>(function SectionLabel(
  { render, xstyle, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('section-label'), stylex.props(reset.base, styles.label, xstyle), rest),
    },
  });
});

const Description = React.forwardRef<HTMLDivElement, SectionDescriptionProps>(function SectionDescription(
  { render, xstyle, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('section-description'), stylex.props(reset.base, styles.description, xstyle), rest),
    },
  });
});

const Actions = React.forwardRef<HTMLDivElement, SectionActionsProps>(function SectionActions(
  { render, xstyle, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('section-actions'), stylex.props(reset.base, styles.actions, xstyle), rest),
    },
  });
});

/**
 * A row-level message, mirroring `Field.Error` for a row that holds no form control. Place it as a
 * sibling of `Section.Item` inside `Section.Row`, not inside `Section.Content`: the item stays a
 * single centred line, so the media and actions hold their position whether or not it is showing.
 * Carries `role='alert'` for the announcement a `Field.Root` would otherwise wire up.
 */
const SectionError = React.forwardRef<HTMLParagraphElement, SectionErrorProps>(function SectionError(
  { render, xstyle, children, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'p',
    render,
    ref,
    props: {
      role: 'alert',
      ...mergeStyleProps(
        themeProps('section-error'),
        stylex.props(reset.base, typographyStyles.base, typographySizes.xs, styles.error, xstyle),
        rest,
      ),
      children: (
        <>
          <Icon
            name='alert-circle'
            size='sm'
            aria-hidden='true'
            xstyle={styles.errorIcon}
          />
          <span>{children}</span>
        </>
      ),
    },
  });
});

/**
 * A compound component that fixes section semantics, surface treatment, row grouping,
 * and item layout while leaving each item's content composable.
 */
export const Section = {
  Root,
  Title,
  Group,
  Row,
  Items,
  Item,
  Media,
  Content,
  Label,
  Description,
  Actions,
  Error: SectionError,
};
