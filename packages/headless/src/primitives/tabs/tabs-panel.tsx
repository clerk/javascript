'use client';

import { useMergeRefs } from '@floating-ui/react';
import { useRef } from 'react';

import { useTransition } from '../../hooks/use-transition';
import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { useTabsContext } from './tabs-context';

export interface TabsPanelProps extends ComponentProps<'div'> {
  value: string;
  /** When true, removes `hidden` so the panel stays in layout flow. */
  shouldForceMount?: boolean;
}

export function TabsPanel(props: TabsPanelProps) {
  const { render, ref: consumerRef, value: panelValue, shouldForceMount, ...otherProps } = props;
  const { value: selectedValue, tabsId, direction } = useTabsContext();

  const isSelected = selectedValue === panelValue;
  const tabId = `${tabsId}-tab-${panelValue}`;
  const panelId = `${tabsId}-panel-${panelValue}`;

  const panelRef = useRef<HTMLDivElement | null>(null);
  // Merge the consumer ref with the internal panelRef so passing a ref does not
  // clobber the ref the panel relies on for transition tracking.
  const combinedRef = useMergeRefs([panelRef, consumerRef]);
  const { transitionProps } = useTransition({
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

  const effectiveTransitionProps =
    shouldForceMount && !hasBeenDeselected.current
      ? { ...transitionProps, 'data-cl-starting-style': undefined, style: undefined }
      : transitionProps;

  const state = { hidden: !isSelected };

  const defaultProps = {
    'data-cl-slot': 'tabs-panel',
    id: panelId,
    role: 'tabpanel' as const,
    'aria-labelledby': tabId,
    tabIndex: 0,
    inert: !isSelected ? '' : undefined,
    hidden: !isSelected && !shouldForceMount ? true : undefined,
    ref: combinedRef,
    ...(shouldForceMount
      ? {
          ...effectiveTransitionProps,
          style: { ...effectiveTransitionProps.style, ['--cl-tab-transition-direction' as string]: String(direction) },
        }
      : {}),
  };

  const merged = mergeProps<'div'>(defaultProps, otherProps);
  // The wired id is owned by the primitive: a consumer-supplied id must not
  // override it, or the tab/panel aria pairing would silently break.
  merged.id = panelId;

  return renderElement({
    defaultTagName: 'div',
    render,
    state,
    stateAttributesMapping: {
      hidden: (v: boolean) => (v ? { 'data-cl-hidden': '' } : null),
    },
    props: merged,
  });
}
