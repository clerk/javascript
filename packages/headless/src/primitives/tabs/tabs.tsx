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
import { useTransition } from '../../hooks/use-transition';
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
  direction: 1 | -1;
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

  const [value, setValueRaw] = useControllableState(props.value, props.defaultValue ?? '', props.onValueChange);

  const [direction, setDirection] = useState<1 | -1>(1);
  const tabsId = useId();
  const tabElementsRef = useRef<Map<string, HTMLElement>>(new Map());
  const tabOrderRef = useRef<string[]>([]);
  const listRef = useRef<HTMLElement | null>(null);
  const valueRef = useRef(value);
  valueRef.current = value;

  const registerTab = useCallback((tabValue: string, element: HTMLElement | null) => {
    if (element) {
      tabElementsRef.current.set(tabValue, element);
      if (!tabOrderRef.current.includes(tabValue)) {
        tabOrderRef.current.push(tabValue);
      }
    } else {
      tabElementsRef.current.delete(tabValue);
    }
  }, []);

  const getTabElement = useCallback((tabValue: string) => {
    return tabElementsRef.current.get(tabValue) ?? null;
  }, []);

  const setValue = useCallback(
    (newValue: string) => {
      const prevIndex = tabOrderRef.current.indexOf(valueRef.current);
      const nextIndex = tabOrderRef.current.indexOf(newValue);
      if (prevIndex !== -1 && nextIndex !== -1) {
        setDirection(nextIndex > prevIndex ? 1 : -1);
      }
      setValueRaw(newValue);
    },
    [setValueRaw],
  );

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
      direction,
    }),
    [value, setValue, orientation, activationMode, tabsId, registerTab, getTabElement, direction],
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
  /** When true, removes `hidden` so the panel stays in layout flow. */
  shouldForceMount?: boolean;
}

function TabsPanel(props: TabsPanelProps) {
  const { render, value: panelValue, shouldForceMount, ...otherProps } = props;
  const { value: selectedValue, tabsId, direction } = useTabsContext();

  const isSelected = selectedValue === panelValue;
  const tabId = `${tabsId}-tab-${panelValue}`;
  const panelId = `${tabsId}-panel-${panelValue}`;

  const panelRef = useRef<HTMLDivElement | null>(null);
  const { transitionProps } = useTransition({
    open: isSelected,
    ref: panelRef,
  });

  // Suppress enter animation on initial mount so the initially-selected panel
  // appears instantly. After the panel has been deselected once, subsequent
  // selections will animate normally. Matches the Accordion pattern.
  const hasBeenDeselected = useRef(false);
  if (!isSelected) hasBeenDeselected.current = true;

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
    inert: !isSelected || undefined,
    hidden: !isSelected && !shouldForceMount ? true : undefined,
    ...(shouldForceMount
      ? {
          ref: panelRef,
          ...effectiveTransitionProps,
          style: { ...effectiveTransitionProps.style, ['--cl-tab-transition-direction' as string]: String(direction) },
        }
      : {}),
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
// Tabs.Trigger
// ---------------------------------------------------------------------------

export interface TabsTriggerProps extends ComponentProps<'button'> {
  value: string;
  disabled?: boolean;
}

function TabsTrigger(props: TabsTriggerProps) {
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
        ['--cl-tab-left' as string]: `${newRect.left}px`,
        ['--cl-tab-width' as string]: `${newRect.width}px`,
        ['--cl-tab-top' as string]: `${newRect.top}px`,
        ['--cl-tab-height' as string]: `${newRect.height}px`,
        ...(prev == null ? { transition: 'none' } : {}),
      });
    } else {
      setStyle({
        position: 'absolute',
        top: newRect.top,
        height: newRect.height,
        ['--cl-tab-left' as string]: `${newRect.left}px`,
        ['--cl-tab-width' as string]: `${newRect.width}px`,
        ['--cl-tab-top' as string]: `${newRect.top}px`,
        ['--cl-tab-height' as string]: `${newRect.height}px`,
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
  Trigger: TabsTrigger,
  Panel: TabsPanel,
  Indicator: TabsIndicator,
});
