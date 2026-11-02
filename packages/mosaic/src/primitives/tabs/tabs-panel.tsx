'use client';

import { inertProps } from '@clerk/shared/inert';
import React, { useRef } from 'react';

import { useTransition } from '../hooks/use-transition';
import { type ComponentProps, Freeze, mergeProps, useRender } from '../utils';
import { useTabsContext } from './tabs-context';

export interface TabsPanelProps extends ComponentProps<'div'> {
  value: string;
  /** When true, renders the panel's children while it is hidden. */
  keepMounted?: boolean;
}

export const TabsPanel = React.forwardRef<HTMLDivElement, TabsPanelProps>(function TabsPanel(props, ref) {
  const { render, value: panelValue, keepMounted, children, ...otherProps } = props;
  const { value: selectedValue, tabsId, direction } = useTabsContext();

  const isSelected = selectedValue === panelValue;
  const tabId = `${tabsId}-tab-${panelValue}`;
  const panelId = `${tabsId}-panel-${panelValue}`;

  const panelRef = useRef<HTMLDivElement | null>(null);
  const { mounted, transitionProps } = useTransition({
    open: isSelected,
    ref: panelRef,
  });

  const state = { hidden: !mounted };

  const defaultProps = {
    id: panelId,
    role: 'tabpanel' as const,
    'aria-labelledby': tabId,
    tabIndex: 0,
    ...inertProps(!isSelected),
    hidden: mounted ? undefined : true,
    ...transitionProps,
    style: {
      ...transitionProps.style,
      '--cl-tab-transition-direction': direction === 'forward' ? '1' : '-1',
    },
    children: keepMounted || mounted ? <Freeze frozen={!isSelected && mounted}>{children}</Freeze> : null,
  };

  const merged = mergeProps<'div'>(defaultProps, otherProps);
  // The wired id is owned by the primitive: a consumer-supplied id must not
  // override it, or the tab/panel aria pairing would silently break.
  merged.id = panelId;

  return useRender({
    defaultTagName: 'div',
    render,
    ref: [panelRef, ref],
    state,
    stateAttributesMapping: {
      hidden: (v: boolean) => (v ? { 'data-hidden': '' } : null),
    },
    props: merged,
  });
});
