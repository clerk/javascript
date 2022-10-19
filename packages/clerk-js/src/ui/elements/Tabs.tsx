import { createContextAndHook } from '@clerk/shared';
import React from 'react';

import { Button, Col, Flex } from '../customizables';
import { PropsOfComponent } from '../styledSystem';
import { getValidChildren } from '../utils';

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

type TabsProps = PropsOfComponent<typeof Col> & {
  defaultIndex?: number;
};

export const Tabs = (props: TabsProps) => {
  const { defaultIndex = 0, children, sx, ...rest } = props;
  const [selectedIndex, setSelectedIndex] = React.useState(defaultIndex);
  const [focusedIndex, setFocusedIndex] = React.useState(-1);

  return (
    <TabsContextProvider value={{ selectedIndex, setSelectedIndex, focusedIndex, setFocusedIndex }}>
      <Col
        sx={sx}
        {...rest}
      >
        {children}
      </Col>
    </TabsContextProvider>
  );
};

type TabsListProps = PropsOfComponent<typeof Flex>;
export const TabsList = (props: TabsListProps) => {
  const { children, sx, ...rest } = props;
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
      sx={[theme => ({ borderBottom: theme.borders.$normal, borderColor: theme.colors.$blackAlpha300 }), sx]}
      {...rest}
    >
      {childrenWithProps}
    </Flex>
  );
};

type TabProps = PropsOfComponent<typeof Flex>;
type TabPropsWithTabIndex = TabProps & { tabIndex?: number };
export const Tab = (props: TabProps) => {
  const { children, sx, tabIndex, isDisabled, ...rest } = props as TabPropsWithTabIndex;

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
    <Flex
      sx={[{ position: 'relative' }, sx]}
      {...rest}
    >
      <Button
        onClick={onClick}
        focusRing={isActive}
        isDisabled={isDisabled}
        tabIndex={isActive ? 0 : -1}
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

type TabPanelsProps = PropsOfComponent<typeof Flex>;
export const TabPanels = (props: TabPanelsProps) => {
  const { sx, children, ...rest } = props;

  const childrenWithProps = getValidChildren(children).map((child, index) =>
    React.cloneElement(child, {
      tabIndex: index,
    }),
  );

  return (
    <Flex
      sx={sx}
      {...rest}
    >
      {childrenWithProps}
    </Flex>
  );
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
