import { useRender } from '@clerk/headless/utils';
import { useSafeLayoutEffect } from '@clerk/shared/react';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { MosaicComponentProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { colorVars, fontWeightVars, radiusVars, space, typeScaleVars } from '../../tokens.stylex';
import type { HeadingProps } from '../heading';
import { Heading } from '../heading';
import { reset } from '../reset.styles';
import { sectionItemsMarker } from './section.markers.stylex';

export type SectionRootProps = Omit<MosaicComponentProps<'section'>, 'title'>;
export type SectionTitleProps = Omit<HeadingProps, 'size'>;
export type SectionGroupProps = MosaicComponentProps<'div'>;
export type SectionRowProps = MosaicComponentProps<'div'>;
export type SectionItemsProps = MosaicComponentProps<'div'>;
export type SectionItemProps = MosaicComponentProps<'div'>;
export type SectionMediaSize = 'sm' | 'md' | 'lg';
export type SectionMediaProps = MosaicComponentProps<'div'> & { size?: SectionMediaSize };
export type SectionContentProps = MosaicComponentProps<'div'>;
export type SectionLabelProps = MosaicComponentProps<'div'>;
export type SectionDescriptionProps = MosaicComponentProps<'div'>;
export type SectionActionsProps = MosaicComponentProps<'div'>;

/* eslint-disable @stylexjs/no-lookahead-selectors -- Mosaic's supported browsers include :has();
   the marker keeps this selector scoped to Section.Items. */
const styles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: space['2'],
    width: '100%',
  },
  group: {
    borderColor: colorVars['--cl-color-border'],
    borderRadius: radiusVars['--cl-radius-xl'],
    borderStyle: 'solid',
    borderWidth: '1px',
    overflow: 'hidden',
    backgroundColor: colorVars['--cl-color-background'],
    width: '100%',
  },
  row: {
    marginInline: space['4'],
    borderBlockStartColor: colorVars['--cl-color-border'],
    borderBlockStartStyle: 'solid',
    borderBlockStartWidth: {
      default: '1px',
      ':first-child': '0px',
    },
    display: 'flex',
    flexDirection: 'column',
    paddingBlockEnd: {
      default: space['4'],
      [stylex.when.descendant('[data-nested]', sectionItemsMarker)]: space['1'],
    },
    paddingBlockStart: space['4'],
    rowGap: space['2'],
    width: 'auto',
  },
  items: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  item: {
    alignItems: 'center',
    columnGap: space['3'],
    display: 'flex',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  nestedItem: {
    minHeight: space['11'],
  },
  mediaBase: {
    alignItems: 'center',
    alignSelf: 'center',
    aspectRatio: '1/1',
    display: 'flex',
    flexShrink: 0,
    justifyContent: 'center',
  },
  mediaSm: {
    height: space['4'],
    width: space['4'],
  },
  mediaMd: {
    height: space['6'],
    width: space['6'],
  },
  mediaLg: {
    height: space['8'],
    width: space['8'],
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    justifyContent: 'center',
    rowGap: space['0.5'],
    minWidth: 0,
  },
  nestedContent: {
    paddingBlock: space['3'],
  },
  label: {
    color: colorVars['--cl-color-card-foreground'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    fontWeight: fontWeightVars['--cl-font-medium'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
  },
  description: {
    color: colorVars['--cl-color-neutral-faded'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    fontWeight: fontWeightVars['--cl-font-medium'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    textWrap: 'balance',
  },
  actions: {
    alignItems: 'center',
    display: 'flex',
    flexShrink: 0,
    justifyContent: 'flex-end',
    marginInlineStart: space['3'],
  },
});
/* eslint-enable @stylexjs/no-lookahead-selectors */

const mediaSizes = {
  sm: styles.mediaSm,
  md: styles.mediaMd,
  lg: styles.mediaLg,
};

const SectionTitleContext = React.createContext<React.Dispatch<React.SetStateAction<string[]>> | null>(null);
const SectionItemsContext = React.createContext(false);

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
      size='sm'
      {...mergeStyleProps(themeProps('section-title'), className, style)}
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

const Items = React.forwardRef<HTMLDivElement, SectionItemsProps>(function SectionItems(
  { render, className, style, ...rest },
  ref,
) {
  const element = useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('section-items', { nested: true }),
        stylex.props(reset.base, styles.items, sectionItemsMarker),
        className,
        style,
      ),
      ...rest,
    },
  });

  return <SectionItemsContext.Provider value>{element}</SectionItemsContext.Provider>;
});

const Item = React.forwardRef<HTMLDivElement, SectionItemProps>(function SectionItem(
  { render, className, style, ...rest },
  ref,
) {
  const nested = React.useContext(SectionItemsContext);

  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('section-item', { nested }),
        stylex.props(reset.base, styles.item, nested && styles.nestedItem),
        className,
        style,
      ),
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
  const nested = React.useContext(SectionItemsContext);

  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('section-content', { nested }),
        stylex.props(reset.base, styles.content, nested && styles.nestedContent),
        className,
        style,
      ),
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
