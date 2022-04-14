import cn from 'classnames';
import React from 'react';

// @ts-ignore
import styles from './Tabs.module.scss';

export type TabTitleProps = {
  active: boolean;
  title: React.ReactNode;
  index: number;
  setActiveTabIndex: (index: number) => void;
};

export const TabTitle: React.FC<TabTitleProps> = ({ active, title, index, setActiveTabIndex }: TabTitleProps) => {
  return (
    <li
      className={cn(styles.title, {
        [styles.active]: active,
      })}
      onClick={() => setActiveTabIndex(index)}
      role='tab'
      aria-selected={active}
    >
      {title}
    </li>
  );
};

export type TabsProps = {
  defaultSelectedIndex?: number;
  children: Array<React.ReactElement<{ title: string; role?: string }>>;
};

export const Tabs: React.FC<TabsProps> = ({ children = [], defaultSelectedIndex = 0 }: TabsProps) => {
  const [activeTabIndex, setActiveTabIndex] = React.useState(defaultSelectedIndex);
  if (children.length < 2) {
    return null;
  }

  const activeTab = children[activeTabIndex];
  const clonedActiveTab =
    activeTab &&
    React.cloneElement(activeTab, {
      ...activeTab.props,
      // @ts-ignore
      title: null, // Delete title attribute
      role: 'tabpanel',
    });

  return (
    <div className={styles.container}>
      <ul
        className={styles.tabList}
        role='tablist'
      >
        {children.reduce((memo: JSX.Element[], child, index) => {
          if (child) {
            memo.push(
              <TabTitle
                key={index}
                active={activeTabIndex === index}
                index={index}
                title={child.props.title}
                setActiveTabIndex={setActiveTabIndex}
              />,
            );
          }
          return memo;
        }, [])}
      </ul>
      {clonedActiveTab}
    </div>
  );
};
