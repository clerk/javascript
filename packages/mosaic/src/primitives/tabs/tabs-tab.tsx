'use client';

import React, { useCallback } from 'react';

import { useCompositeItem } from '../hooks/use-composite';
import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { useTabsContext } from './tabs-context';

export interface TabsTabProps extends ComponentProps<'button'> {
  value: string;
  disabled?: boolean;
}

export const TabsTab = React.forwardRef<HTMLButtonElement, TabsTabProps>(function TabsTab(props, ref) {
  const { render, value: tabValue, disabled, ...otherProps } = props;
  const { value: selectedValue, setValue, activationMode, tabsId, registerTab } = useTabsContext();

  const compositeItem = useCompositeItem(tabValue);

  const isSelected = selectedValue === tabValue;
  const tabId = `${tabsId}-tab-${tabValue}`;
  const panelId = `${tabsId}-panel-${tabValue}`;
  const register = useCallback(
    (element: HTMLButtonElement | null) => registerTab(tabValue, element),
    [registerTab, tabValue],
  );

  const state = {
    selected: isSelected,
    disabled: !!disabled,
  };

  const defaultProps: DefaultProps<'button'> = {
    role: 'tab',
    type: 'button',
    disabled,
    'aria-selected': isSelected,
    'aria-controls': panelId,
    'aria-disabled': disabled || undefined,
  };

  if (activationMode === 'automatic') {
    defaultProps.onFocus = () => {
      if (!disabled) {
        setValue(tabValue);
      }
    };
  } else {
    defaultProps.onClick = () => {
      if (!disabled) {
        setValue(tabValue);
      }
    };
    defaultProps.onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (!disabled && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        setValue(tabValue);
      }
    };
  }

  const merged = mergeProps<'button'>(defaultProps, otherProps);

  // The wired id is owned by the primitive: a consumer-supplied id must not
  // override it, or the tab/panel aria pairing would silently break.
  merged.id = tabId;

  return useRender({
    defaultTagName: 'button',
    render,
    ref: [compositeItem, register, ref],
    state,
    stateAttributesMapping: {
      selected: (v: boolean) => (v ? { 'data-selected': '' } : null),
      disabled: (v: boolean) => (v ? { 'data-disabled': '' } : null),
    },
    props: merged,
  });
});
