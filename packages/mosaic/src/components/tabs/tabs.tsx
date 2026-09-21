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
import type { MosaicStyleProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../utils/reset.styles';
import { styles } from './tabs.styles';

type StyledProps<Props> = Omit<Props, 'className' | 'style'> & MosaicStyleProps;

export type TabsRootProps = HeadlessTabsRootProps;
export type TabsListProps = StyledProps<HeadlessTabsListProps>;
export type TabsTabProps = StyledProps<HeadlessTabsTabProps>;
export type TabsTriggerProps = StyledProps<HeadlessTabsTriggerProps>;
export type TabsPanelProps = StyledProps<HeadlessTabsPanelProps>;
export type TabsIndicatorProps = StyledProps<HeadlessTabsIndicatorProps>;

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
      {...mergeStyleProps(themeProps('tabs-tab'), stylex.props(reset.base, styles.tab, xstyle), rest)}
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
      {...mergeStyleProps(themeProps('tabs-trigger'), stylex.props(reset.base, styles.tab, xstyle), rest)}
    />
  );
});

const Panel = React.forwardRef<HTMLDivElement, TabsPanelProps>(function MosaicTabsPanel({ xstyle, ...rest }, ref) {
  return (
    <Primitive.Panel
      ref={ref}
      {...mergeStyleProps(themeProps('tabs-panel'), stylex.props(reset.base, xstyle), rest)}
    />
  );
});

function Indicator({ xstyle, ...rest }: TabsIndicatorProps) {
  return (
    <Primitive.Indicator
      {...mergeStyleProps(themeProps('tabs-indicator'), stylex.props(reset.base, styles.indicator, xstyle), rest)}
    />
  );
}

export const Tabs = {
  Root: Primitive.Root,
  List,
  Tab,
  Trigger,
  Panel,
  Indicator,
};
