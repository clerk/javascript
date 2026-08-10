import { useRender } from '@clerk/headless/utils';
import { useSafeLayoutEffect } from '@clerk/shared/react';
import * as stylex from '@stylexjs/stylex';
import React from 'react';

import { Field as MosaicField } from '../components/field';
import type { HeadingProps } from '../components/heading';
import { Heading } from '../components/heading';
import { reset } from '../components/reset.styles';
import type { MosaicComponentProps } from '../props';
import { mergeStyleProps, themeProps } from '../props';
import { colorVars, fontWeightVars, radiusVars, space, typeScaleVars } from '../tokens.stylex';

export type SettingsGroupRootProps = Omit<MosaicComponentProps<'section'>, 'title'>;
export type SettingsGroupTitleProps = Omit<HeadingProps, 'size'>;

export type SettingsGroupListProps = MosaicComponentProps<'div'>;
export interface SettingsGroupRowProps extends MosaicComponentProps<'div'> {
  /** Associates the row label with exactly one nested form control. */
  field?: boolean;
}
export type SettingsGroupMediaProps = MosaicComponentProps<'div'>;

export interface SettingsGroupLabelProps extends MosaicComponentProps<'div'> {
  description?: React.ReactNode;
}

export type SettingsGroupControlProps = MosaicComponentProps<'div'>;

const styles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: space['2'],
    width: '100%',
  },
  list: {
    padding: space['2'],
    borderColor: colorVars['--cl-color-border'],
    borderRadius: radiusVars['--cl-radius-xl'],
    borderStyle: 'solid',
    borderWidth: '1px',
    overflow: 'hidden',
    backgroundColor: colorVars['--cl-color-card'],
    width: '100%',
  },
  row: {
    marginInline: space['2'],
    paddingBlock: space['4'],
    alignItems: 'center',
    borderBlockStartColor: colorVars['--cl-color-border'],
    borderBlockStartStyle: 'solid',
    borderBlockStartWidth: {
      default: '1px',
      ':first-child': '0px',
    },
    columnGap: space['6'],
    display: 'flex',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    rowGap: space['3'],
    minHeight: space['13'],
    width: 'auto',
  },
  media: {
    alignItems: 'center',
    alignSelf: 'center',
    display: 'flex',
    flexShrink: 0,
    justifyContent: 'center',
    height: space['6'],
    width: space['6'],
  },
  label: {
    color: colorVars['--cl-color-card-foreground'],
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    rowGap: space['0.5'],
    minWidth: 0,
  },
  labelText: {
    fontSize: typeScaleVars['--cl-text-sm-size'],
    fontWeight: fontWeightVars['--cl-font-medium'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
  },
  description: {
    color: colorVars['--cl-color-neutral-faded'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    fontWeight: fontWeightVars['--cl-font-normal'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    textWrap: 'balance',
  },
  control: {
    alignItems: 'center',
    display: 'flex',
    flexBasis: 'auto',
    flexShrink: 0,
    justifyContent: 'flex-end',
    maxWidth: '60%',
    minWidth: 0,
    width: 'auto',
  },
});

const SettingsGroupRowFieldContext = React.createContext(false);
const SettingsGroupTitleContext = React.createContext<React.Dispatch<React.SetStateAction<string[]>> | null>(null);

const Root = React.forwardRef<HTMLElement, SettingsGroupRootProps>(function SettingsGroupRoot(
  { render, className, style, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy, ...rest },
  ref,
) {
  const [titleIds, setTitleIds] = React.useState<string[]>([]);

  const element = useRender({
    defaultTagName: 'section',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('settings-group'), stylex.props(reset.base, styles.root), className, style),
      ...rest,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy ?? (ariaLabel ? undefined : titleIds.join(' ') || undefined),
    },
  });

  return <SettingsGroupTitleContext.Provider value={setTitleIds}>{element}</SettingsGroupTitleContext.Provider>;
});

const Title = React.forwardRef<HTMLHeadingElement, SettingsGroupTitleProps>(function SettingsGroupTitle(
  { id: idProp, render, className, style, ...rest },
  ref,
) {
  const setTitleIds = React.useContext(SettingsGroupTitleContext);
  const generatedId = React.useId();
  const id = idProp ?? (setTitleIds ? `cl-settings-group-${generatedId}-title` : undefined);

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
      size='xs'
      {...mergeStyleProps(themeProps('settings-group-title'), className, style)}
      {...rest}
    />
  );
});

const List = React.forwardRef<HTMLDivElement, SettingsGroupListProps>(function SettingsGroupList(
  { render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('settings-group-list'), stylex.props(reset.base, styles.list), className, style),
      ...rest,
    },
  });
});

const Row = React.forwardRef<HTMLDivElement, SettingsGroupRowProps>(function SettingsGroupRow(
  { field = false, render, className, style, ...rest },
  ref,
) {
  const resolvedRender = field ? <MosaicField.Root render={render} /> : render;
  const element = useRender({
    defaultTagName: 'div',
    render: resolvedRender,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('settings-group-row', { field }),
        stylex.props(reset.base, styles.row),
        className,
        style,
      ),
      ...rest,
    },
  });

  return <SettingsGroupRowFieldContext.Provider value={field}>{element}</SettingsGroupRowFieldContext.Provider>;
});

const Media = React.forwardRef<HTMLDivElement, SettingsGroupMediaProps>(function SettingsGroupMedia(
  { render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(themeProps('settings-group-media'), stylex.props(reset.base, styles.media), className, style),
      ...rest,
    },
  });
});

const Label = React.forwardRef<HTMLDivElement, SettingsGroupLabelProps>(function SettingsGroupLabel(
  { description, render, className, style, children, ...rest },
  ref,
) {
  const field = React.useContext(SettingsGroupRowFieldContext);
  const resolvedRender = field ? <MosaicField.Label render={render} /> : render;

  return useRender({
    defaultTagName: 'div',
    render: resolvedRender,
    ref,
    props: {
      ...mergeStyleProps(themeProps('settings-group-label'), stylex.props(reset.base, styles.label), className, style),
      ...rest,
      children: (
        <>
          <span {...mergeStyleProps(themeProps('settings-group-label-text'), stylex.props(styles.labelText))}>
            {children}
          </span>
          {description ? (
            <span
              {...mergeStyleProps(themeProps('settings-group-label-description'), stylex.props(styles.description))}
            >
              {description}
            </span>
          ) : null}
        </>
      ),
    },
  });
});

const Control = React.forwardRef<HTMLDivElement, SettingsGroupControlProps>(function SettingsGroupControl(
  { render, className, style, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...mergeStyleProps(
        themeProps('settings-group-control'),
        stylex.props(reset.base, styles.control),
        className,
        style,
      ),
      ...rest,
    },
  });
});

/**
 * A settings block that fixes section semantics, surface treatment, row separation,
 * and label/control layout while leaving each control composable.
 */
export const SettingsGroup = { Root, Title, List, Row, Media, Label, Control };
