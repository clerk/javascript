import React from 'react';

import * as Primitives from '../../ui/primitives';
import { Button, Flex } from '../customizables';
import { createContextAndHook, getValidChildren } from '../utils';

const { Box } = Primitives;

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
  defaultIndex?: number | null;
};

export const Tabs = ({ children, ...props }: TabsProps) => {
  const { defaultIndex = null } = props;
  const [selectedIndex, setSelectedIndex] = React.useState(defaultIndex ?? 0);
  const [focusedIndex, setFocusedIndex] = React.useState(defaultIndex ?? 0);

  return (
    <TabsContextProvider value={{ selectedIndex, setSelectedIndex, focusedIndex, setFocusedIndex }}>
      <Box>{children}</Box>
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

  const validChildren = getValidChildren(children);
  const childrenWithProps = validChildren.map((child, index) =>
    React.cloneElement(child as React.ReactElement<React.PropsWithChildren<any>>, {
      tabIndex: index,
    }),
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const tabCount = Object.keys(childrenWithProps).length;

    if (e.key === 'ArrowLeft') {
      const prev = selectedIndex === 0 ? tabCount - 1 : selectedIndex - 1;
      setFocusedIndex(prev);
      return setSelectedIndex(prev);
    }
    if (e.key === 'ArrowRight') {
      const next = tabCount - 1 === selectedIndex ? 0 : selectedIndex + 1;
      setFocusedIndex(next);
      return setSelectedIndex(next);
    }
  };

  return (
    <Flex
      onKeyDown={onKeyDown}
      direction='row'
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
  const { children, tabIndex } = props as TabPropsWithTabIndex;

  if (tabIndex === undefined) {
    throw new Error('Tab component must be a direct child of TabList.');
  }

  const { setSelectedIndex, selectedIndex, focusedIndex, setFocusedIndex } = useTabsContext();
  const ref = React.useRef<HTMLButtonElement | any>(null);
  const isActive = tabIndex === selectedIndex;
  const isFocused = tabIndex === focusedIndex;

  const onClick = () => {
    setSelectedIndex(tabIndex);
    setFocusedIndex(-1);
  };

  React.useEffect(() => {
    if (ref && isFocused) {
      ref.current.focus();
    }
  }, [ref, isFocused]);

  return (
    <Flex
      direction='row'
      sx={{ position: 'relative' }}
    >
      <Button
        onClick={onClick}
        focusRing={isFocused}
        variant='ghost'
        aria-selected={isActive}
        id={`tab-${tabIndex}`}
        aria-controls={`tabpanel-${tabIndex}`}
        role='tab'
        ref={ref}
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

  const validChildren = getValidChildren(children);
  const childrenWithProps = validChildren.map((child, index) =>
    React.cloneElement(child as React.ReactElement<React.PropsWithChildren<any>>, {
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
      id={`tabpanel-${tabIndex}`}
      role='tabpanel'
      tabIndex={0}
      aria-labelledby={`tab-${tabIndex}`}
    >
      {children}
    </Flex>
  );
};
