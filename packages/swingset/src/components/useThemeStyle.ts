'use client';

import * as React from 'react';

export type ThemeStyle = 'default' | 'clerk';

export const THEME_STYLE_STORAGE_KEY = 'swingset-theme-style';

export const THEME_STYLE_INIT_SCRIPT = `try{var s=localStorage.getItem('${THEME_STYLE_STORAGE_KEY}');if(s!=='default')document.documentElement.dataset.swingsetTheme='clerk'}catch(e){document.documentElement.dataset.swingsetTheme='clerk'}`;

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

export function useThemeStyle() {
  const themeStyle = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { themeStyle, setThemeStyle };
}
