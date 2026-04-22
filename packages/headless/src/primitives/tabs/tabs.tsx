'use client';

import { Composite, CompositeItem } from '@floating-ui/react';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useControllableState } from '../../hooks/use-controllable-state';
import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
  orientation: 'horizontal' | 'vertical';
  activationMode: 'automatic' | 'manual';
  tabsId: string;
  registerTab: (value: string, element: HTMLElement | null) => void;
  getTabElement: (value: string) => HTMLElement | null;
  listRef: React.RefObject<HTMLElement | null>;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error('Tabs compound components must be used within <Tabs>');
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Tabs (root)
// ---------------------------------------------------------------------------

export interface TabsProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  activationMode?: 'automatic' | 'manual';
  children: ReactNode;
}

function TabsRoot(props: TabsProps) {
  const { orientation = 'horizontal', activationMode = 'automatic', children } = props;

  const [value, setValue] = useControllableState(props.value, props.defaultValue ?? '', props.onValueChange);

  const tabsId = useId();
  const tabElementsRef = useRef<Map<string, HTMLElement>>(new Map());
  const listRef = useRef<HTMLElement | null>(null);

  const registerTab = useCallback((tabValue: string, element: HTMLElement | null) => {
    if (element) {
      tabElementsRef.current.set(tabValue, element);
    } else {
      tabElementsRef.current.delete(tabValue);
    }
  }, []);

  const getTabElement = useCallback((tabValue: string) => {
    return tabElementsRef.current.get(tabValue) ?? null;
  }, []);

  const contextValue = useMemo<TabsContextValue>(
    () => ({
      value,
      setValue,
      orientation,
      activationMode,
      tabsId,
      registerTab,
      getTabElement,
      listRef,
    }),
    [value, setValue, orientation, activationMode, tabsId, registerTab, getTabElement],
  );

  return <TabsContext.Provider value={contextValue}>{children}</TabsContext.Provider>;
}

// ---------------------------------------------------------------------------
// Tabs.List
// ---------------------------------------------------------------------------

export interface TabsListProps extends ComponentProps<'div'> {}

function TabsList(props: TabsListProps) {
  const { render, children, ...otherProps } = props;
  const { orientation, listRef } = useTabsContext();

  return (
    <Composite
      ref={listRef}
      orientation={orientation}
      render={(compositeProps: React.HTMLAttributes<HTMLElement>) => {
        const defaultProps: Record<string, unknown> = {
          'data-cl-slot': 'tabs-list',
          role: 'tablist' as const,
          onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
            if (event.key !== 'Home' && event.key !== 'End') return;
            event.preventDefault();
            const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]:not([disabled])'));
            if (items.length === 0) return;
            const target = event.key === 'Home' ? items[0] : items[items.length - 1];
            target.focus();
          },
        };

        const merged = mergeProps<'div'>(
          defaultProps,
          mergeProps<'div'>(otherProps, compositeProps as Record<string, unknown>),
        );

        return renderElement({
          defaultTagName: 'div',
          render,
          props: merged,
        })!;
      }}
    >
      {children}
    </Composite>
  );
}

// ---------------------------------------------------------------------------
// Tabs.Tab
// ---------------------------------------------------------------------------

export interface TabsTabProps extends ComponentProps<'button'> {
  value: string;
  disabled?: boolean;
}

function TabsTab(props: TabsTabProps) {
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
          'data-cl-slot': 'tabs-tab',
          id: tabId,
          role: 'tab' as const,
          type: 'button' as const,
          'aria-selected': isSelected,
          'aria-controls': panelId,
          'aria-disabled': disabled || undefined,
        };

        if (activationMode === 'automatic') {
          defaultProps.onFocus = (event: React.FocusEvent<HTMLButtonElement>) => {
            if (!disabled) setValue(tabValue);
          };
        } else {
          defaultProps.onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
            if (!disabled) setValue(tabValue);
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
          mergeProps<'button'>(defaultProps as Record<string, unknown>, otherProps),
          compositeProps as Record<string, unknown>,
        );

        return renderElement({
          defaultTagName: 'button',
          render,
          state,
          stateAttributesMapping: {
            selected: (v: boolean) => (v ? { 'data-cl-selected': '' } : null),
            disabled: (v: boolean) => (v ? { 'data-cl-disabled': '' } : null),
          },
          props: merged,
        })!;
      }}
    >
      {children}
    </CompositeItem>
  );
}

// ---------------------------------------------------------------------------
// Tabs.Panel
// ---------------------------------------------------------------------------

export interface TabsPanelProps extends ComponentProps<'div'> {
  value: string;
}

function TabsPanel(props: TabsPanelProps) {
  const { render, value: panelValue, ...otherProps } = props;
  const { value: selectedValue, tabsId } = useTabsContext();

  const isSelected = selectedValue === panelValue;
  const tabId = `${tabsId}-tab-${panelValue}`;
  const panelId = `${tabsId}-panel-${panelValue}`;

  const state = { hidden: !isSelected };

  const defaultProps = {
    'data-cl-slot': 'tabs-panel',
    id: panelId,
    role: 'tabpanel' as const,
    'aria-labelledby': tabId,
    tabIndex: 0,
    hidden: !isSelected || undefined,
  };

  return renderElement({
    defaultTagName: 'div',
    render,
    state,
    stateAttributesMapping: {
      hidden: (v: boolean) => (v ? { 'data-cl-hidden': '' } : null),
    },
    props: mergeProps<'div'>(defaultProps, otherProps),
  });
}

// ---------------------------------------------------------------------------
// Tabs.Indicator
// ---------------------------------------------------------------------------

export interface TabsIndicatorProps extends ComponentProps<'span'> {}

function TabsIndicator(props: TabsIndicatorProps) {
  const { render, ...otherProps } = props;
  const { value, getTabElement, orientation, listRef } = useTabsContext();

  const [style, setStyle] = useState<React.CSSProperties>({});
  const previousRectRef = useRef<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    const el = getTabElement(value);
    const list = listRef.current;
    if (!el || !list) return;

    const tabRect = el.getBoundingClientRect();
    const listRect = list.getBoundingClientRect();

    const newRect = {
      left: tabRect.left - listRect.left,
      top: tabRect.top - listRect.top,
      width: tabRect.width,
      height: tabRect.height,
    };

    const prev = previousRectRef.current;
    previousRectRef.current = newRect;

    if (orientation === 'horizontal') {
      setStyle({
        position: 'absolute',
        left: newRect.left,
        width: newRect.width,
        ['--tab-left' as string]: `${newRect.left}px`,
        ['--tab-width' as string]: `${newRect.width}px`,
        ['--tab-top' as string]: `${newRect.top}px`,
        ['--tab-height' as string]: `${newRect.height}px`,
        ...(prev == null ? { transition: 'none' } : {}),
      });
    } else {
      setStyle({
        position: 'absolute',
        top: newRect.top,
        height: newRect.height,
        ['--tab-left' as string]: `${newRect.left}px`,
        ['--tab-width' as string]: `${newRect.width}px`,
        ['--tab-top' as string]: `${newRect.top}px`,
        ['--tab-height' as string]: `${newRect.height}px`,
        ...(prev == null ? { transition: 'none' } : {}),
      });
    }
  }, [value, getTabElement, orientation, listRef]);

  const defaultProps = {
    'data-cl-slot': 'tabs-indicator',
    'aria-hidden': true as const,
    style,
  };

  return renderElement({
    defaultTagName: 'span',
    render,
    props: mergeProps<'span'>(defaultProps, otherProps),
  });
}

// ---------------------------------------------------------------------------
// Compound export
// ---------------------------------------------------------------------------

export const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Tab: TabsTab,
  Panel: TabsPanel,
  Indicator: TabsIndicator,
});
