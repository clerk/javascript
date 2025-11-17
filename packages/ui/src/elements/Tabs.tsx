import { createContextAndHook } from '@clerk/shared/react';
import type { PropsWithChildren } from 'react';
import React from 'react';

import { Button, descriptors, Flex, useLocalizations } from '../customizables';
import type { PropsOfComponent } from '../styledSystem';
import { getValidChildren } from '../utils/getValidReactChildren';

type TabsContextValue = {
  selectedIndex: number;
  setSelectedIndex: (item: number) => void;
  focusedIndex: number;
  setFocusedIndex: (item: number) => void;
};

const [TabsContext, useTabsContext] = createContextAndHook<TabsContextValue>('TabsContext');
const TabsContextProvider = (props: React.PropsWithChildren<{ value: TabsContextValue }>) => {
  const ctxValue = React.useMemo(
    () => ({ value: props.value }),
    [props.value.selectedIndex, props.value.setFocusedIndex],
  );
  return <TabsContext.Provider value={ctxValue}>{props.children}</TabsContext.Provider>;
};

type TabsProps = PropsWithChildren<{
  /** The index of the selected tab (controlled mode) */
  value?: number;
  /** Callback fired when the selected tab changes (controlled mode) */
  onChange?: (index: number) => void;
  /** The index of the tab to be selected on initial render (uncontrolled mode) */
  defaultIndex?: number;
}>;

export const Tabs = (props: TabsProps) => {
  const { value, onChange, defaultIndex = 0, children } = props;
  const [selectedIndex, setSelectedIndex] = React.useState(defaultIndex);
  const [focusedIndex, setFocusedIndex] = React.useState(-1);

  const handleSelectedIndexChange = React.useCallback(
    (newIndex: number) => {
      if (onChange) {
        onChange(newIndex);
      } else {
        setSelectedIndex(newIndex);
      }
    },
    [onChange],
  );

  const currentIndex = value !== undefined ? value : selectedIndex;

  return (
    <TabsContextProvider
      value={{
        selectedIndex: currentIndex,
        setSelectedIndex: handleSelectedIndexChange,
        focusedIndex,
        setFocusedIndex,
      }}
    >
      {children}
    </TabsContextProvider>
  );
};

type TabsListProps = PropsOfComponent<typeof Flex>;
export const TabsList = (props: TabsListProps) => {
  const { children, sx, ...rest } = props;
  const { setSelectedIndex, selectedIndex, setFocusedIndex } = useTabsContext();

  let index = 0;
  const childrenWithProps = getValidChildren(children).map(child => {
    const el = React.cloneElement(child, {
      tabIndex: child.type === Tab ? index : undefined,
    });
    index++;
    return el;
  });

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const tabs = childrenWithProps
      .filter(child => !child.props?.isDisabled && child.type === Tab)
      .map(child => child.props.tabIndex);
    const tabsLenth = tabs.length;
    const current = tabs.indexOf(selectedIndex);

    if (e.key === 'ArrowLeft') {
      const prev = current === 0 ? tabs[tabsLenth - 1] : tabs[current - 1];
      setFocusedIndex(prev);
      return setSelectedIndex(prev);
    }
    if (e.key === 'ArrowRight') {
      const next = tabsLenth - 1 === current ? tabs[0] : tabs[current + 1];
      setFocusedIndex(next);
      return setSelectedIndex(next);
    }
  };

  return (
    <Flex
      elementDescriptor={descriptors.tabListContainer}
      onKeyDown={onKeyDown}
      role='tablist'
      sx={[
        t => ({
          borderBottomStyle: t.borderStyles.$solid,
          borderBottomWidth: t.borderWidths.$normal,
          borderColor: t.colors.$borderAlpha100,
        }),
        sx,
      ]}
      {...rest}
    >
      {childrenWithProps}
    </Flex>
  );
};
type TabProps = PropsOfComponent<typeof Button>;
type TabPropsWithTabIndex = TabProps & { tabIndex?: number };
export const Tab = (props: TabProps) => {
  const { t } = useLocalizations();
  const { children, sx, tabIndex, isDisabled, localizationKey, ...rest } = props as TabPropsWithTabIndex;

  if (tabIndex === undefined) {
    throw new Error('Tab component must be a direct child of TabList.');
  }

  const { setSelectedIndex, selectedIndex, focusedIndex, setFocusedIndex } = useTabsContext();
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const isActive = tabIndex === selectedIndex;
  const isFocused = tabIndex === focusedIndex;

  const onClick = () => {
    setSelectedIndex(tabIndex);
    setFocusedIndex(-1);
  };

  React.useEffect(() => {
    if (isDisabled && tabIndex === 0) {
      setSelectedIndex((tabIndex as number) + 1);
    }
  }, []);

  React.useEffect(() => {
    if (buttonRef.current && isFocused) {
      buttonRef.current.focus();
    }
  }, [isFocused]);

  return (
    <Button
      elementDescriptor={descriptors.tabButton}
      onClick={onClick}
      isDisabled={isDisabled}
      tabIndex={isActive ? 0 : -1}
      variant='ghost'
      aria-selected={isActive}
      id={`cl-tab-${tabIndex}`}
      aria-controls={`cl-tabpanel-${tabIndex}`}
      role='tab'
      ref={buttonRef}
      sx={[
        t => ({
          background: t.colors.$transparent,
          color: isActive ? t.colors.$primary500 : t.colors.$neutralAlpha700,
          gap: t.space.$1x5,
          fontWeight: t.fontWeights.$medium,
          borderBottomWidth: isActive ? t.borderWidths.$normal : 0,
          borderBottomStyle: t.borderStyles.$solid,
          borderBottomColor: t.colors.$primary500,
          marginBottom: isActive ? '-1px' : 0,
          borderRadius: 0,
          padding: `${t.space.$2x5} ${t.space.$0x25}`,
          width: 'fit-content',
          '&:hover, :focus': { backgroundColor: t.colors.$transparent, boxShadow: 'none' },
        }),
        sx,
      ]}
      {...rest}
    >
      {t(localizationKey)}
      {children}
    </Button>
  );
};

export const TabPanels = (props: PropsWithChildren<Record<never, never>>) => {
  const { children } = props;

  const childrenWithProps = getValidChildren(children).map((child, index) =>
    React.cloneElement(child, {
      tabIndex: index,
    }),
  );

  return <>{childrenWithProps}</>;
};

type TabPanelProps = PropsOfComponent<typeof Flex>;
type TabPanelPropsWithTabIndex = TabPanelProps & { tabIndex?: number };
export const TabPanel = (props: TabPanelProps) => {
  const { tabIndex, sx, children, ...rest } = props as TabPanelPropsWithTabIndex;

  if (tabIndex === undefined) {
    throw new Error('TabPanel component must be a direct child of TabPanels.');
  }

  const { selectedIndex } = useTabsContext();
  const isOpen = tabIndex === selectedIndex;

  if (!isOpen) {
    return null;
  }

  return (
    <Flex
      elementDescriptor={descriptors.tabPanel}
      id={`cl-tabpanel-${tabIndex}`}
      role='tabpanel'
      tabIndex={0}
      aria-labelledby={`cl-tab-${tabIndex}`}
      sx={[
        {
          outline: 0,
        },
        sx,
      ]}
      {...rest}
    >
      {children}
    </Flex>
  );
};
