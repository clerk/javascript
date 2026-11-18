'use client';

import * as React from 'react';

export type ThemeStyle = 'default' | 'clerk';

export const THEME_STYLE_STORAGE_KEY = 'swingset-theme-style';

export const THEME_STYLE_INIT_SCRIPT = `try{var s=localStorage.getItem('${THEME_STYLE_STORAGE_KEY}');if(s!=='default')document.documentElement.dataset.swingsetTheme='clerk'}catch(e){document.documentElement.dataset.swingsetTheme='clerk'}`;

interface ThemeStyleContextValue {
  themeStyle: ThemeStyle;
  setThemeStyle: (themeStyle: ThemeStyle) => void;
}

const ThemeStyleContext = React.createContext<ThemeStyleContextValue>({
  themeStyle: 'clerk',
  setThemeStyle: () => {},
});

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): ThemeStyle {
  return document.documentElement.dataset.swingsetTheme === 'clerk' ? 'clerk' : 'default';
}

function getServerSnapshot(): ThemeStyle {
  return 'clerk';
}

function setThemeStyle(next: ThemeStyle) {
  if (next === 'clerk') {
    document.documentElement.dataset.swingsetTheme = 'clerk';
  } else {
    delete document.documentElement.dataset.swingsetTheme;
  }
  listeners.forEach(listener => listener());
  try {
    localStorage.setItem(THEME_STYLE_STORAGE_KEY, next);
  } catch {
    return;
  }
}

export function ThemeStyleProvider({ children }: { children: React.ReactNode }) {
  const themeStyle = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const value = React.useMemo(() => ({ themeStyle, setThemeStyle }), [themeStyle]);
  return <ThemeStyleContext.Provider value={value}>{children}</ThemeStyleContext.Provider>;
}

export function useThemeStyle() {
  return React.useContext(ThemeStyleContext);
}
