'use client';
import * as React from 'react';

import { useQueryParam } from '@/components/gallery/touch-mode';
import { parseTheme, THEME_CSS, THEME_MESSAGE, type ThemeId } from '@/lib/components/theme';

export function ThemeStyles() {
  return <style>{THEME_CSS}</style>;
}
export function useApplyTheme(theme: ThemeId) {
  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === 'default') {
      delete root.dataset.mosaicTheme;
    } else {
      root.dataset.mosaicTheme = theme;
    }
    return () => {
      delete root.dataset.mosaicTheme;
    };
  }, [theme]);
}
export function ThemeReceiver() {
  const initial = parseTheme(useQueryParam('theme'));
  const [override, setOverride] = React.useState<ThemeId | null>(null);
  const theme = override ?? initial;
  React.useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.data?.type !== THEME_MESSAGE) {
        return;
      }
      setOverride(parseTheme(event.data.theme));
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);
  useApplyTheme(theme);
  return <ThemeStyles />;
}
