'use client';

import * as React from 'react';

import { type ThemeId } from '@/lib/components/theme';
import { getTheme, hydrateTheme, setStoredTheme, subscribeTheme } from '@/lib/components/theme-store';

export function useMosaicTheme(): [ThemeId, (theme: ThemeId) => void] {
  const theme = React.useSyncExternalStore(subscribeTheme, getTheme, () => 'default' as ThemeId);
  React.useEffect(() => {
    hydrateTheme();
  }, []);
  return [theme, setStoredTheme];
}
