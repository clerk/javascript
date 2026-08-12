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
import { settingsItemsMarker } from './settings.markers.stylex';
import { settingsVars } from './settings.vars.stylex';

export { settingsVars } from './settings.vars.stylex';

export type SettingsRootProps = Omit<MosaicComponentProps<'section'>, 'title'>;
export type SettingsTitleProps = Omit<HeadingProps, 'size'>;
export type SettingsGroupProps = MosaicComponentProps<'div'>;
export type SettingsRowProps = MosaicComponentProps<'div'>;
export type SettingsItemsProps = MosaicComponentProps<'div'>;
export type SettingsItemProps = MosaicComponentProps<'div'>;
export type SettingsMediaSize = 'sm' | 'md' | 'lg';
export type SettingsMediaProps = MosaicComponentProps<'div'> & { size?: SettingsMediaSize };
export type SettingsContentProps = MosaicComponentProps<'div'>;
export type SettingsLabelProps = MosaicComponentProps<'div'>;
export type SettingsDescriptionProps = MosaicComponentProps<'div'>;
export type SettingsActionsProps = MosaicComponentProps<'div'>;

/* eslint-disable @stylexjs/no-lookahead-selectors -- Mosaic's supported browsers include :has();
   the marker keeps this selector scoped to Settings.Items. */
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
    backgroundColor: settingsVars['--cl-settings-background'],
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
      [stylex.when.descendant('[data-nested]', settingsItemsMarker)]: space['1'],
    },
    paddingBlockStart: space['4'],
    rowGap: settingsVars['--cl-settings-items-gap'],
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

const SettingsTitleContext = React.createContext<React.Dispatch<React.SetStateAction<string[]>> | null>(null);
const SettingsItemsContext = React.createContext(false);

const Root = React.forwardRef<HTMLElement, SettingsRootProps>(function SettingsRoot(
  { render, className, style, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy, ...rest },
  ref,
) {
  const [titleIds, setTitleIds] = React.useState<string[]>([]);

  const element = useRender({
    defaultTagName: 'section',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('settings'), stylex.props(reset.base, styles.root), className, style),
      ...rest,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy ?? (ariaLabel ? undefined : titleIds.join(' ') || undefined),
    },
  });

  return <SettingsTitleContext.Provider value={setTitleIds}>{element}</SettingsTitleContext.Provider>;
});

const Title = React.forwardRef<HTMLHeadingElement, SettingsTitleProps>(function SettingsTitle(
  { id: idProp, render, className, style, ...rest },
  ref,
) {
  const setTitleIds = React.useContext(SettingsTitleContext);
  const generatedId = React.useId();
  const id = idProp ?? (setTitleIds ? `cl-settings-${generatedId}-title` : undefined);

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
      {...mergeStyleProps(themeProps('settings-title'), className, style)}
      {...rest}
    />
  );
});

const Group = React.forwardRef<HTMLDivElement, SettingsGroupProps>(function SettingsGroup(
  { render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('settings-group'), stylex.props(reset.base, styles.group), className, style),
      ...rest,
    },
  });
});

const Row = React.forwardRef<HTMLDivElement, SettingsRowProps>(function SettingsRow(
  { render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('settings-row'), stylex.props(reset.base, styles.row), className, style),
      ...rest,
    },
  });
});

const Items = React.forwardRef<HTMLDivElement, SettingsItemsProps>(function SettingsItems(
  { render, className, style, ...rest },
  ref,
) {
  const element = useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('settings-items', { nested: true }),
        stylex.props(reset.base, styles.items, settingsItemsMarker),
        className,
        style,
      ),
      ...rest,
    },
  });

  return <SettingsItemsContext.Provider value>{element}</SettingsItemsContext.Provider>;
});

const Item = React.forwardRef<HTMLDivElement, SettingsItemProps>(function SettingsItem(
  { render, className, style, ...rest },
  ref,
) {
  const nested = React.useContext(SettingsItemsContext);

  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('settings-item', { nested }),
        stylex.props(reset.base, styles.item, nested && styles.nestedItem),
        className,
        style,
      ),
      ...rest,
    },
  });
});

const Media = React.forwardRef<HTMLDivElement, SettingsMediaProps>(function SettingsMedia(
  { size = 'md', render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('settings-media', { size }),
        stylex.props(reset.base, styles.mediaBase, mediaSizes[size]),
        className,
        style,
      ),
      ...rest,
    },
  });
});

const Content = React.forwardRef<HTMLDivElement, SettingsContentProps>(function SettingsContent(
  { render, className, style, ...rest },
  ref,
) {
  const nested = React.useContext(SettingsItemsContext);

  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('settings-content', { nested }),
        stylex.props(reset.base, styles.content, nested && styles.nestedContent),
        className,
        style,
      ),
      ...rest,
    },
  });
});

const Label = React.forwardRef<HTMLDivElement, SettingsLabelProps>(function SettingsLabel(
  { render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('settings-label'), stylex.props(reset.base, styles.label), className, style),
      ...rest,
    },
  });
});

const Description = React.forwardRef<HTMLDivElement, SettingsDescriptionProps>(function SettingsDescription(
  { render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('settings-description'),
        stylex.props(reset.base, styles.description),
        className,
        style,
      ),
      ...rest,
    },
  });
});

const Actions = React.forwardRef<HTMLDivElement, SettingsActionsProps>(function SettingsActions(
  { render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('settings-actions'), stylex.props(reset.base, styles.actions), className, style),
      ...rest,
    },
  });
});

/**
 * A settings component that fixes section semantics, surface treatment, row grouping,
 * and item layout while leaving each item's content composable.
 */
export const Settings = { Root, Title, Group, Row, Items, Item, Media, Content, Label, Description, Actions };
