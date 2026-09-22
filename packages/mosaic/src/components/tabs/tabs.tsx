import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type {
  TabsIndicatorProps as HeadlessTabsIndicatorProps,
  TabsListProps as HeadlessTabsListProps,
  TabsPanelProps as HeadlessTabsPanelProps,
  TabsProps as HeadlessTabsRootProps,
  TabsTabProps as HeadlessTabsTabProps,
  TabsTriggerProps as HeadlessTabsTriggerProps,
} from '../../primitives/tabs';
import { Tabs as Primitive } from '../../primitives/tabs';
import { useRender } from '../../primitives/utils';
import type { MosaicComponentProps, MosaicStyleProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { focusOutline } from '../../utils/focus-outline.styles';
import { reset } from '../../utils/reset.styles';
import { styles } from './tabs.styles';

type StyledProps<Props> = Omit<Props, 'className' | 'style'> & MosaicStyleProps;

/**
 * Orientation is omitted because the styled layout and indicator currently support only horizontal tabs.
 * The headless primitive still supports vertical orientation.
 */
export type TabsRootProps = StyledProps<Omit<HeadlessTabsRootProps, 'orientation'>>;
export type TabsListProps = StyledProps<HeadlessTabsListProps>;
export type TabsTabProps = StyledProps<HeadlessTabsTabProps>;
/** Props for a standalone tab trigger used outside `List`, keyed to a `Panel` by `value`. */
export type TabsTriggerProps = StyledProps<HeadlessTabsTriggerProps>;
export type TabsPanelProps = StyledProps<HeadlessTabsPanelProps>;
/** Props for the optional wrapper that stacks the panels in one grid cell so they can animate in and out. */
export type TabsPanelsProps = MosaicComponentProps<'div'>;
export type TabsIndicatorProps = StyledProps<HeadlessTabsIndicatorProps>;

function Root({ xstyle, children, ...rest }: TabsRootProps) {
  return (
    <Primitive.Root {...rest}>
      <div {...mergeStyleProps(themeProps('tabs-root'), stylex.props(reset.base, styles.root, xstyle))}>{children}</div>
    </Primitive.Root>
  );
}

function List({ xstyle, ...rest }: TabsListProps) {
  return (
    <Primitive.List
      {...mergeStyleProps(themeProps('tabs-list'), stylex.props(reset.base, styles.list, xstyle), rest)}
    />
  );
}

const Tab = React.forwardRef<HTMLButtonElement, TabsTabProps>(function MosaicTabsTab({ xstyle, ...rest }, ref) {
  return (
    <Primitive.Tab
      ref={ref}
      {...mergeStyleProps(
        themeProps('tabs-tab'),
        stylex.props(reset.base, styles.tab, focusOutline.visible, xstyle),
        rest,
      )}
    />
  );
});

const Trigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(function MosaicTabsTrigger(
  { xstyle, ...rest },
  ref,
) {
  return (
    <Primitive.Trigger
      ref={ref}
      {...mergeStyleProps(
        themeProps('tabs-trigger'),
        stylex.props(reset.base, styles.tab, focusOutline.visible, xstyle),
        rest,
      )}
    />
  );
});

const Panel = React.forwardRef<HTMLDivElement, TabsPanelProps>(function MosaicTabsPanel({ xstyle, ...rest }, ref) {
  return (
    <Primitive.Panel
      ref={ref}
      {...mergeStyleProps(themeProps('tabs-panel'), stylex.props(reset.base, styles.panel, xstyle), rest)}
    />
  );
});

const Panels = React.forwardRef<HTMLDivElement, TabsPanelsProps>(function MosaicTabsPanels(
  { render, xstyle, ...rest },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: mergeStyleProps(themeProps('tabs-panels'), stylex.props(reset.base, styles.panels, xstyle), rest),
  });
});

function Indicator({ xstyle, ...rest }: TabsIndicatorProps) {
  return (
    <Primitive.Indicator
      {...mergeStyleProps(themeProps('tabs-indicator'), stylex.props(reset.base, styles.indicator, xstyle), rest)}
    />
  );
}

export const Tabs = {
  Root,
  List,
  Tab,
  Trigger,
  Panels,
  Panel,
  Indicator,
};
