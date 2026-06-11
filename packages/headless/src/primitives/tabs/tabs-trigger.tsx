'use client';

import { useMergeRefs } from '@floating-ui/react';
import React, { useLayoutEffect, useRef } from 'react';

import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { useTabsContext } from './tabs-context';

export interface TabsTriggerProps extends ComponentProps<'button'> {
  value: string;
  disabled?: boolean;
}

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(function TabsTrigger(props, ref) {
  const { render, value: tabValue, disabled, ...otherProps } = props;
  const { value: selectedValue, setValue, tabsId, registerTab } = useTabsContext();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const combinedRef = useMergeRefs([triggerRef, ref]);

  const isSelected = selectedValue === tabValue;
  const tabId = `${tabsId}-tab-${tabValue}`;
  const panelId = `${tabsId}-panel-${tabValue}`;

  useLayoutEffect(() => {
    registerTab(tabValue, triggerRef.current);
    return () => registerTab(tabValue, null);
  }, [tabValue, registerTab]);

  const state = {
    selected: isSelected,
    disabled: !!disabled,
  };

  const defaultProps = {
    'data-cl-slot': 'tabs-trigger',
    ref: combinedRef,
    id: tabId,
    role: 'tab' as const,
    type: 'button' as const,
    'aria-selected': isSelected,
    'aria-controls': panelId,
    'aria-disabled': disabled || undefined,
    onClick: () => {
      if (!disabled) {
        setValue(tabValue);
      }
    },
  };

  const merged = mergeProps<'button'>(defaultProps, otherProps);
  // The wired id is owned by the primitive: a consumer-supplied id must not
  // override it, or the tab/panel aria pairing would silently break.
  merged.id = tabId;

  return renderElement({
    defaultTagName: 'button',
    render,
    state,
    stateAttributesMapping: {
      selected: (v: boolean) => (v ? { 'data-cl-selected': '' } : null),
      disabled: (v: boolean) => (v ? { 'data-cl-disabled': '' } : null),
    },
    props: merged,
  });
});
