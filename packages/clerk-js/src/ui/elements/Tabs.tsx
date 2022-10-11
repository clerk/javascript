import React from 'react';

import { Button, Col, Flex } from '../customizables';
import { createContextAndHook, getValidChildren } from '../utils';

type TabsContextValue = {
  selectedIndex: number;
  setSelectedIndex: (item: number) => void;
  focusedIndex: number;
  setFocusedIndex: (item: number) => void;
};
export const [TabsContext, useTabsContext] = createContextAndHook<TabsContextValue>('TabsContext');
export const TabsContextProvider = (props: React.PropsWithChildren<{ value: TabsContextValue }>) => {
  const ctxValue = React.useMemo(
    () => ({ value: props.value }),
    [props.value.selectedIndex, props.value.setFocusedIndex],
  );
  return <TabsContext.Provider value={ctxValue}>{props.children}</TabsContext.Provider>;
};

/**
 * TabsProps
 */
type TabsProps = {
  children: React.ReactNode;
  defaultIndex?: number;
};

export const Tabs = ({ children, ...props }: TabsProps) => {
  const { defaultIndex = 0 } = props;
  const [selectedIndex, setSelectedIndex] = React.useState(defaultIndex);
  const [focusedIndex, setFocusedIndex] = React.useState(defaultIndex);

  return (
    <TabsContextProvider value={{ selectedIndex, setSelectedIndex, focusedIndex, setFocusedIndex }}>
      <Col>{children}</Col>
    </TabsContextProvider>
  );
};

/**
 * TabsList
 */
type TabsListProps = React.PropsWithChildren<any>;
export const TabsList = (props: TabsListProps) => {
  const { children } = props;
  const { setSelectedIndex, selectedIndex, setFocusedIndex } = useTabsContext();

  const childrenWithProps = getValidChildren(children).map((child, index) =>
    React.cloneElement(child, {
      tabIndex: index,
    }),
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const tabs = childrenWithProps.filter(child => !child.props?.isDisabled).map(child => child.props.tabIndex);
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
      onKeyDown={onKeyDown}
      sx={theme => ({ borderBottom: theme.borders.$normal, borderColor: theme.colors.$blackAlpha300 })}
    >
      {childrenWithProps}
    </Flex>
  );
};

/**
 * Tab
 */
type TabProps = React.PropsWithChildren<any>;
type TabPropsWithTabIndex = TabProps & { tabIndex?: number };
export const Tab = (props: TabProps) => {
  const { children, tabIndex, isDisabled } = props as TabPropsWithTabIndex;

  if (tabIndex === undefined) {
    throw new Error('Tab component must be a direct child of TabList.');
  }

  const { setSelectedIndex, selectedIndex, focusedIndex, setFocusedIndex } = useTabsContext();
  const buttonRef = React.useRef<HTMLButtonElement | any>(null);
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
    <Flex sx={{ position: 'relative' }}>
      <Button
        onClick={onClick}
        focusRing={isFocused}
        isDisabled={isDisabled}
        variant='ghost'
        aria-selected={isActive}
        id={`cl-tab-${tabIndex}`}
        aria-controls={`cl-tabpanel-${tabIndex}`}
        role='tab'
        ref={buttonRef}
        sx={t => ({
          background: t.colors.$transparent,
          color: isActive ? t.colors.$blackAlpha900 : t.colors.$blackAlpha700,
          gap: t.space.$1x5,
          fontWeight: t.fontWeights.$medium,
          borderBottom: t.borders.$normal,
          borderColor: isActive ? t.colors.$blackAlpha700 : t.colors.$transparent,
          borderRadius: 0,
          width: 'fit-content',
          '&:hover': { backgroundColor: t.colors.$transparent },
        })}
      >
        {children}
      </Button>
    </Flex>
  );
};

/**
 * TabPanels
 */
type TabPanelsProps = React.PropsWithChildren<any>;
export const TabPanels = (props: TabPanelsProps) => {
  const { children } = props;

  const childrenWithProps = getValidChildren(children).map((child, index) =>
    React.cloneElement(child, {
      tabIndex: index,
    }),
  );

  return <Flex>{childrenWithProps}</Flex>;
};

/**
 * TabPanel
 */
type TabPanelProps = React.PropsWithChildren<any>;
type TabPanelPropsWithTabIndex = TabPanelProps & { tabIndex?: number };
export const TabPanel = (props: TabPanelProps) => {
  const { tabIndex, children } = props as TabPanelPropsWithTabIndex;

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
      id={`cl-tabpanel-${tabIndex}`}
      role='tabpanel'
      tabIndex={0}
      aria-labelledby={`cl-tab-${tabIndex}`}
    >
      {children}
    </Flex>
  );
};
