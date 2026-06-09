'use client';

import { CompositeItem, useMergeRefs } from '@floating-ui/react';
import React, { useLayoutEffect, useRef } from 'react';

import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { useTabsContext } from './tabs-context';

export interface TabsTabProps extends ComponentProps<'button'> {
  value: string;
  disabled?: boolean;
}

export const TabsTab = React.forwardRef<HTMLButtonElement, TabsTabProps>(function TabsTab(props, ref) {
  const { render, value: tabValue, disabled, children, ...otherProps } = props;
  const { value: selectedValue, setValue, activationMode, tabsId, registerTab } = useTabsContext();

  const isSelected = selectedValue === tabValue;
  const tabId = `${tabsId}-tab-${tabValue}`;
  const panelId = `${tabsId}-panel-${tabValue}`;
  const internalRef = useRef<HTMLButtonElement | null>(null);
  const combinedRef = useMergeRefs([internalRef, ref]);

  useLayoutEffect(() => {
    registerTab(tabValue, internalRef.current);
    return () => registerTab(tabValue, null);
  }, [tabValue, registerTab]);

  const state = {
    selected: isSelected,
    disabled: !!disabled,
  };

  return (
    <CompositeItem
      ref={combinedRef}
      disabled={disabled}
      render={(compositeProps: React.HTMLAttributes<HTMLElement>) => {
        const defaultProps: Record<string, unknown> = {
          'data-cl-slot': 'tabs-tab',
          id: tabId,
          role: 'tab' as const,
          type: 'button' as const,
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

        // Merge: defaultProps first, then consumer props, then composite props last
        // (composite needs to win on tabIndex, data-active, onFocus, ref)
        const merged = mergeProps<'button'>(
          mergeProps<'button'>(defaultProps, otherProps),
          compositeProps as Record<string, unknown>,
        );

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
      }}
    >
      {children}
    </CompositeItem>
  );
});
