'use client';

import * as React from 'react';

export type ThemeStyle = 'default' | 'clerk';

export const THEME_STYLE_STORAGE_KEY = 'swingset-theme-style';

export const THEME_STYLE_INIT_SCRIPT = `try{if(localStorage.getItem('${THEME_STYLE_STORAGE_KEY}')==='clerk')document.documentElement.dataset.swingsetTheme='clerk'}catch(e){}`;

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
  return 'default';
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
