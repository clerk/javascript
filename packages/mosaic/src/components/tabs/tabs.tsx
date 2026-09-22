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

/** Props for the root container. Set the active tab with `value`/`defaultValue` and observe changes via `onValueChange`. */
export type TabsRootProps = StyledProps<HeadlessTabsRootProps>;
/** Props for the `role="tablist"` container that wraps the `Tab`s and `Indicator`. */
export type TabsListProps = StyledProps<HeadlessTabsListProps>;
/** Props for a tab rendered inside `List`. Its `value` pairs it with the `Panel` sharing the same value. */
export type TabsTabProps = StyledProps<HeadlessTabsTabProps>;
/** Props for a standalone tab trigger used outside `List`, keyed to a `Panel` by `value`. */
export type TabsTriggerProps = StyledProps<HeadlessTabsTriggerProps>;
/** Props for a content panel, shown when its `value` matches the active tab. */
export type TabsPanelProps = StyledProps<HeadlessTabsPanelProps>;
/** Props for the optional wrapper that stacks the panels in one grid cell so they can animate in and out. */
export type TabsPanelsProps = MosaicComponentProps<'div'>;
/** Props for the animated indicator that tracks the active tab within `List`. */
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

/**
 * A styled tabbed interface composed through `Tabs.Root`, `Tabs.List`, `Tabs.Tab`,
 * `Tabs.Trigger`, `Tabs.Panels`, `Tabs.Panel`, and `Tabs.Indicator`. Each part accepts the Mosaic
 * `xstyle` prop. `Tabs.Root` renders a column container so the list and panels stack regardless of
 * the surrounding layout.
 *
 * Selection is keyed by `value`: a `Tabs.Tab` (rendered inside `Tabs.List`) or a standalone
 * `Tabs.Trigger` activates the `Tabs.Panel` that shares the same `value`, and `Tabs.Indicator`
 * animates to the active tab. Control the active tab on `Tabs.Root` through `value`/`defaultValue`
 * and `onValueChange`.
 */
export const Tabs = {
  Root,
  List,
  Tab,
  Trigger,
  Panels,
  Panel,
  Indicator,
};
