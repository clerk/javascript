import React from 'react';

import { useRouter } from '../router';

type TabMap = {
  [key: number]: string | undefined;
};

export const useTabState = (tabMap: TabMap, defaultTab = 0) => {
  const router = useRouter();

  const getInitialTab = () => {
    const tab = router.queryParams.tab;
    const tabIndex = Object.entries(tabMap).find(([_, value]) => value === tab)?.[0];
    return tabIndex ? parseInt(tabIndex, 10) : defaultTab;
  };

  const [selectedTab, setSelectedTab] = React.useState(getInitialTab());

  const handleTabChange = (index: number) => {
    setSelectedTab(index);
    const currentPath = router.currentPath;
    void router.navigate(currentPath, { searchParams: new URLSearchParams({ tab: tabMap[index] || '' }) });
  };

  return {
    selectedTab,
    handleTabChange,
  };
};
