'use client';

import { inertProps } from '@clerk/shared/inert';
import React, { useRef } from 'react';

import { useTransition } from '../hooks/use-transition';
import { type ComponentProps, mergeProps, useRender } from '../utils';
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

  // Suppress enter animation on initial mount so the initially-selected panel
  // appears instantly. After the panel has been deselected once, subsequent
  // selections will animate normally. Matches the Accordion pattern.
  const hasBeenDeselected = useRef(false);
  if (!isSelected) {
    hasBeenDeselected.current = true;
  }

  const effectiveTransitionProps = !hasBeenDeselected.current
    ? { ...transitionProps, 'data-starting-style': undefined, style: undefined }
    : transitionProps;

  const state = { hidden: !mounted };

  const defaultProps = {
    id: panelId,
    role: 'tabpanel' as const,
    'aria-labelledby': tabId,
    tabIndex: 0,
    ...inertProps(!isSelected),
    hidden: mounted ? undefined : true,
    ...effectiveTransitionProps,
    style: {
      ...effectiveTransitionProps.style,
      '--cl-tab-transition-direction': direction === 'forward' ? '1' : '-1',
    },
    children: keepMounted || mounted ? children : null,
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
