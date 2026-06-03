'use client';

import { useLayoutEffect, useRef } from 'react';
import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { useTabsContext } from './tabs-context';

export interface TabsTriggerProps extends ComponentProps<'button'> {
  value: string;
  disabled?: boolean;
}

export function TabsTrigger(props: TabsTriggerProps) {
  const { render, value: tabValue, disabled, ...otherProps } = props;
  const { value: selectedValue, setValue, tabsId, registerTab } = useTabsContext();
  const triggerRef = useRef<HTMLButtonElement | null>(null);

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
    ref: triggerRef,
    id: tabId,
    role: 'tab' as const,
    type: 'button' as const,
    'aria-selected': isSelected,
    'aria-controls': panelId,
    'aria-disabled': disabled || undefined,
    onClick: () => {
      if (!disabled) setValue(tabValue);
    },
  };

  return renderElement({
    defaultTagName: 'button',
    render,
    state,
    stateAttributesMapping: {
      selected: (v: boolean) => (v ? { 'data-cl-selected': '' } : null),
      disabled: (v: boolean) => (v ? { 'data-cl-disabled': '' } : null),
    },
    props: mergeProps<'button'>(defaultProps, otherProps),
  });
}
