'use client';

import { CompositeItem } from '@floating-ui/react';
import React, { useLayoutEffect, useRef } from 'react';

import { type ComponentProps, mergeProps, useRender } from '../../utils';
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
      ref={internalRef}
      disabled={disabled}
      render={(compositeProps: React.HTMLAttributes<HTMLElement>) => {
        const defaultProps: Record<string, unknown> = {
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

        // CompositeItem injects its roving-tabindex ref via compositeProps; hand it to
        // useRender's ref param (which owns ref-merging) instead of leaving it in props,
        // where useRender's merged ref would overwrite it and break focus navigation.
        const { ref: compositeRef, ...mergedProps } = merged;

        // floating-ui's CompositeItem invokes this render callback synchronously and
        // unconditionally during its own render (see renderJsx), so useRender runs in a
        // stable hook position on the CompositeItem fiber. The rule can't see that.
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useRender({
          defaultTagName: 'button',
          render,
          // SAFETY: mergeProps returns Record<string, unknown>; the ref CompositeItem
          // injected is a valid React ref at runtime.
          ref: [internalRef, compositeRef as React.Ref<unknown>, ref],
          state,
          stateAttributesMapping: {
            selected: (v: boolean) => (v ? { 'data-selected': '' } : null),
            disabled: (v: boolean) => (v ? { 'data-disabled': '' } : null),
          },
          props: mergedProps,
        });
      }}
    >
      {children}
    </CompositeItem>
  );
});
