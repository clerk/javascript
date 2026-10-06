import { inertProps } from '@clerk/shared/inert';
import { useSafeLayoutEffect } from '@clerk/shared/react';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { useTransition } from '../../primitives/hooks/use-transition';
import { useRender } from '../../primitives/utils';
import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { feedbackHeight, feedbackStyles } from '../../styles/feedback.styles';
import { reset } from '../../styles/reset.styles';
import { skeletonStyles } from '../../styles/skeleton.styles';
import { sizes as typographySizes, styles as typographyStyles, truncationStyles } from '../../styles/typography.styles';
import { FeedbackBody, hasMessage, useHeldMessage, useMessageHeight } from '../../utils/feedback';
import { SkeletonText } from '../../utils/skeleton-text';
import { withTruncatableLabel } from '../../utils/truncatable-label';
import type { HeadingProps } from '../heading';
import { Heading, useHeadingLevel } from '../heading';
import { sectionHeaderDescriptionMarker, sectionHeaderMarker, sectionNestedItemMarker } from './section.markers.stylex';
import { styles } from './section.styles';

export type SectionRootProps = Omit<MosaicComponentProps<'section'>, 'title'>;
export type SectionGroupProps = MosaicComponentProps<'div'> & { skeleton?: boolean };
export type SectionHeaderProps = MosaicComponentProps<'div'>;
export type SectionTitleProps = Omit<HeadingProps, 'size'> & { skeleton?: boolean };
export type SectionBodyProps = MosaicComponentProps<'div'>;
export type SectionRowProps = MosaicComponentProps<'div'>;
export type SectionItemsProps = MosaicComponentProps<'ul'>;
export type SectionItemProps = MosaicComponentProps<'div'> & { wrap?: boolean };
export type SectionMediaSize = 'sm' | 'md' | 'lg' | 'xl';
export type SectionMediaProps = MosaicComponentProps<'div'> & { size?: SectionMediaSize; skeleton?: boolean };
export type SectionContentProps = MosaicComponentProps<'div'>;
export type SectionLabelProps = MosaicComponentProps<'div'> & { skeleton?: boolean };
export type SectionDescriptionProps = MosaicComponentProps<'div'> & { skeleton?: boolean };
export type SectionActionsProps = MosaicComponentProps<'div'> & { skeleton?: boolean };
export type SectionNoteProps = MosaicComponentProps<'div'> & { icon?: React.ReactNode };
export type SectionErrorProps = MosaicComponentProps<'p'>;

const mediaSizes = {
  sm: styles.mediaSm,
  md: styles.mediaMd,
  lg: styles.mediaLg,
  xl: styles.mediaXl,
};

const SectionGroupContext = React.createContext<React.Dispatch<React.SetStateAction<string | undefined>> | null>(null);
const SectionHeaderContext = React.createContext(false);
const SectionItemsContext = React.createContext(false);
const SectionItemWrapContext = React.createContext(false);
const SectionSkeletonContext = React.createContext(false);

function useInheritedSkeleton(skeleton: boolean | undefined) {
  const inherited = React.useContext(SectionSkeletonContext);
  return skeleton ?? inherited;
}

const Root = React.forwardRef<HTMLElement, SectionRootProps>(function SectionRoot({ render, xstyle, ...rest }, ref) {
  return useRender({
    defaultTagName: 'section',
    render,
    ref,
    props: mergeStyleProps(themeProps('section'), stylex.props(reset.base, styles.root, xstyle), rest),
  });
});

const Group = React.forwardRef<HTMLDivElement, SectionGroupProps>(function SectionGroup(
  { skeleton = false, render, xstyle, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy, ...rest },
  ref,
) {
  const [titleId, setTitleId] = React.useState<string>();

  const element = useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: skeleton
      ? {
          'aria-hidden': true,
          ...inertProps(true),
          ...mergeStyleProps(
            themeProps('section-group', { skeleton }),
            stylex.props(reset.base, styles.group, xstyle),
            rest,
          ),
        }
      : {
          role: 'group',
          ...mergeStyleProps(themeProps('section-group'), stylex.props(reset.base, styles.group, xstyle), rest),
          'aria-label': ariaLabel,
          'aria-labelledby': ariaLabelledBy ?? (ariaLabel ? undefined : titleId),
        },
  });

  return (
    <SectionGroupContext.Provider value={setTitleId}>
      <SectionSkeletonContext.Provider value={skeleton}>{element}</SectionSkeletonContext.Provider>
    </SectionGroupContext.Provider>
  );
});

const Header = React.forwardRef<HTMLDivElement, SectionHeaderProps>(function SectionHeader(
  { render, xstyle, ...rest },
  ref,
) {
  const element = useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('section-header'),
        stylex.props(reset.base, styles.header, sectionHeaderMarker, xstyle),
        rest,
      ),
    },
  });

  return <SectionHeaderContext.Provider value>{element}</SectionHeaderContext.Provider>;
});

const Title = React.forwardRef<HTMLHeadingElement, SectionTitleProps>(function SectionTitle(
  { id: idProp, skeleton: skeletonProp, xstyle, children, ...rest },
  ref,
) {
  const skeleton = useInheritedSkeleton(skeletonProp);
  const setTitleId = React.useContext(SectionGroupContext);
  const generatedId = React.useId();
  const level = useHeadingLevel();
  const id = skeleton ? undefined : (idProp ?? (setTitleId ? `cl-section-${generatedId}-title` : undefined));

  useSafeLayoutEffect(() => {
    if (!id || !setTitleId) {
      return undefined;
    }

    setTitleId(id);
    return () => setTitleId(current => (current === id ? undefined : current));
  }, [id, setTitleId]);

  return (
    <Heading
      ref={ref}
      id={id}
      level={level}
      size='base'
      xstyle={[styles.title, truncationStyles.singleLine, xstyle]}
      {...mergeStyleProps(themeProps('section-title', { skeleton }), rest)}
    >
      {skeleton ? <SkeletonText>{children}</SkeletonText> : children}
    </Heading>
  );
});

const Body = React.forwardRef<HTMLDivElement, SectionBodyProps>(function SectionBody({ render, xstyle, ...rest }, ref) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeStyleProps(themeProps('section-body'), stylex.props(reset.base, styles.body, xstyle), rest),
  });
});

const Row = React.forwardRef<HTMLDivElement, SectionRowProps>(function SectionRow({ render, xstyle, ...rest }, ref) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeStyleProps(themeProps('section-row'), stylex.props(reset.base, styles.row, xstyle), rest),
  });
});

const Items = React.forwardRef<HTMLUListElement, SectionItemsProps>(function SectionItems(
  { render, xstyle, ...rest },
  ref,
) {
  const element = useRender({
    defaultTagName: 'ul',
    render,
    ref,
    props: mergeStyleProps(themeProps('section-items'), stylex.props(reset.base, styles.items, xstyle), rest),
  });

  return <SectionItemsContext.Provider value>{element}</SectionItemsContext.Provider>;
});

const Item = React.forwardRef<HTMLDivElement, SectionItemProps>(function SectionItem(
  { wrap = false, render, xstyle, ...rest },
  ref,
) {
  const nested = React.useContext(SectionItemsContext);

  const element = useRender({
    defaultTagName: nested ? 'li' : 'div',
    render,
    ref,
    props: mergeStyleProps(
      themeProps('section-item', { nested, wrap }),
      stylex.props(
        reset.base,
        styles.item,
        nested && styles.nestedItem,
        nested && sectionNestedItemMarker,
        wrap && styles.itemWrap,
        xstyle,
      ),
      rest,
    ),
  });

  return <SectionItemWrapContext.Provider value={wrap}>{element}</SectionItemWrapContext.Provider>;
});

const Media = React.forwardRef<HTMLDivElement, SectionMediaProps>(function SectionMedia(
  { size = 'md', skeleton: skeletonProp, render, xstyle, children, ...rest },
  ref,
) {
  const skeleton = useInheritedSkeleton(skeletonProp);
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeStyleProps(
      themeProps('section-media', { size, skeleton }),
      stylex.props(
        reset.base,
        styles.mediaBase,
        mediaSizes[size],
        skeleton && skeletonStyles.bone,
        skeleton && skeletonStyles.shimmer,
        xstyle,
      ),
      { ...rest, children: skeleton ? undefined : children },
    ),
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
    props: mergeStyleProps(
      themeProps('section-content', { nested }),
      stylex.props(reset.base, styles.content, xstyle),
      rest,
    ),
  });
});

const Label = React.forwardRef<HTMLDivElement, SectionLabelProps>(function SectionLabel(
  { skeleton: skeletonProp, render, xstyle, children, ...rest },
  ref,
) {
  const skeleton = useInheritedSkeleton(skeletonProp);
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeStyleProps(themeProps('section-label', { skeleton }), stylex.props(reset.base, styles.label, xstyle), {
      ...rest,
      children: skeleton ? <SkeletonText>{children}</SkeletonText> : withTruncatableLabel(children),
    }),
  });
});

const Description = React.forwardRef<HTMLDivElement, SectionDescriptionProps>(function SectionDescription(
  { skeleton: skeletonProp, render, xstyle, children, ...rest },
  ref,
) {
  const skeleton = useInheritedSkeleton(skeletonProp);
  const inHeader = React.useContext(SectionHeaderContext);
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeStyleProps(
      themeProps('section-description', { skeleton }),
      stylex.props(
        reset.base,
        styles.description,
        inHeader && styles.headerDescription,
        inHeader && sectionHeaderDescriptionMarker,
        xstyle,
      ),
      { ...rest, children: skeleton ? <SkeletonText>{children}</SkeletonText> : children },
    ),
  });
});

const Actions = React.forwardRef<HTMLDivElement, SectionActionsProps>(function SectionActions(
  { skeleton: skeletonProp, render, xstyle, children, ...rest },
  ref,
) {
  const skeleton = useInheritedSkeleton(skeletonProp);
  const wrap = React.useContext(SectionItemWrapContext);
  const inHeader = React.useContext(SectionHeaderContext);

  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeStyleProps(
      themeProps('section-actions', { skeleton }),
      stylex.props(
        reset.base,
        styles.actions,
        wrap && styles.actionsWrap,
        inHeader && styles.headerActions,
        skeleton && styles.actionsSkeleton,
        xstyle,
      ),
      { ...rest, children: skeleton ? undefined : children },
    ),
  });
});

/**
 * Static text that takes an action's place in a row, stating why it offers none. Sits directly in
 * `Section.Item` where a `Section.Actions` would; it holds its own trailing position, so it does not
 * need one. `icon` renders into a fixed leading slot, sized to the text, for a logo or a lock.
 */
const Note = React.forwardRef<HTMLDivElement, SectionNoteProps>(function SectionNote(
  { icon, children, render, xstyle, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('section-note'), stylex.props(reset.base, styles.note, xstyle), rest),
      children: (
        <>
          {icon ? (
            <span {...mergeStyleProps(themeProps('section-note-icon'), stylex.props(styles.noteIcon))}>{icon}</span>
          ) : null}
          <span {...stylex.props(truncationStyles.singleLine, styles.truncate)}>{children}</span>
        </>
      ),
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
 * A compound component for a topic of settings. `Section.Root` stacks cards; each `Section.Group`
 * is a card named by the `Section.Title` in its `Section.Header`, with a `Section.Body` holding
 * either `Section.Row`s (one setting each) or a `Section.Items` list of values.
 */
export const Section = {
  Root,
  Group,
  Header,
  Title,
  Body,
  Row,
  Items,
  Item,
  Media,
  Content,
  Label,
  Description,
  Actions,
  Note,
  Error: SectionError,
};
