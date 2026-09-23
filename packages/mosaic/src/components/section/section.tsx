import { useSafeLayoutEffect } from '@clerk/shared/react';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { useTransition } from '../../primitives/hooks/use-transition';
import { useRender } from '../../primitives/utils';
import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { FeedbackBody, hasMessage, useHeldMessage, useMessageHeight } from '../../utils/feedback';
import { feedbackHeight, feedbackStyles } from '../../utils/feedback.styles';
import { reset } from '../../utils/reset.styles';
import { sizes as typographySizes, styles as typographyStyles } from '../../utils/typography.styles';
import type { HeadingProps } from '../heading';
import { Heading } from '../heading';
import { sectionNestedItemMarker } from './section.markers.stylex';
import { styles } from './section.styles';

export type SectionRootProps = Omit<MosaicComponentProps<'section'>, 'title'>;
export type SectionTitleProps = Omit<HeadingProps, 'size'>;
export type SectionGroupVariant = 'default' | 'contained';
export type SectionGroupProps = MosaicComponentProps<'div'> & { variant?: SectionGroupVariant };
export type SectionRowProps = MosaicComponentProps<'div'>;
export type SectionSurfaceProps = MosaicComponentProps<'div'>;
export type SectionHeaderProps = MosaicComponentProps<'div'>;
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
  { variant = 'default', render, xstyle, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      role: variant === 'contained' ? 'group' : undefined,
      ...mergeStyleProps(
        themeProps('section-group', { variant }),
        stylex.props(reset.base, styles.group, xstyle),
        rest,
      ),
    },
  });
});

const Surface = React.forwardRef<HTMLDivElement, SectionSurfaceProps>(function SectionSurface(
  { render, xstyle, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('section-surface'), stylex.props(reset.base, styles.surface, xstyle), rest),
    },
  });
});

const Header = React.forwardRef<HTMLDivElement, SectionHeaderProps>(function SectionHeader(
  { render, xstyle, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('section-header'),
        stylex.props(reset.base, styles.item, styles.header, xstyle),
        rest,
      ),
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
        stylex.props(reset.base, styles.items, xstyle),
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
      ...mergeStyleProps(
        themeProps('section-item', { nested }),
        stylex.props(reset.base, styles.item, nested && styles.nestedItem, nested && sectionNestedItemMarker, xstyle),
        rest,
      ),
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
 * single centered line, so the media and actions hold their position whether or not it is showing.
 * Carries `role='alert'` for the announcement a `Field.Root` would otherwise wire up.
 *
 * It opens and closes on the message it is given, so render it with that message —
 * `<Section.Error>{error}</Section.Error>` — rather than behind a conditional.
 */
const SectionError = React.forwardRef<HTMLParagraphElement, SectionErrorProps>(function SectionError(
  { render, xstyle, children, ...rest },
  ref,
) {
  const open = hasMessage(children);
  const element = React.useRef<HTMLElement | null>(null);
  const [messageElement, setMessageElement] = React.useState<HTMLElement | null>(null);
  const height = useMessageHeight(messageElement);
  const { mounted, transitionProps } = useTransition({ open, ref: element });
  const message = useHeldMessage(children, open);
  const messageProps = stylex.props(reset.base, feedbackStyles.message, feedbackStyles.error);

  return useRender({
    defaultTagName: 'p',
    render,
    enabled: mounted,
    ref: [ref, element],
    props: {
      role: 'alert',
      ...mergeStyleProps(
        themeProps('section-error'),
        stylex.props(
          reset.base,
          typographyStyles.base,
          typographySizes.xs,
          feedbackStyles.collapse,
          feedbackHeight.measured(height),
          styles.error,
          xstyle,
        ),
        { 'aria-hidden': open ? undefined : true, ...transitionProps },
        rest,
      ),
      children: (
        <span
          ref={setMessageElement}
          {...messageProps}
          {...transitionProps}
          style={{ ...messageProps.style, ...transitionProps.style }}
        >
          <FeedbackBody icon='exclamation-circle'>{message}</FeedbackBody>
        </span>
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
  Surface,
  Row,
  Header,
  Items,
  Item,
  Media,
  Content,
  Label,
  Description,
  Actions,
  Error: SectionError,
};
