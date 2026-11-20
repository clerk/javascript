'use client';

import * as React from 'react';

export const THEME_STYLES = ['default', 'clerk'] as const;

export type ThemeStyle = (typeof THEME_STYLES)[number];

export function parseThemeStyle(value: unknown): ThemeStyle {
  return THEME_STYLES.find(style => style === value) ?? 'default';
}

export const THEME_STYLE_STORAGE_KEY = 'swingset-theme-style';

export const THEME_STYLE_INIT_SCRIPT = `try{var s=localStorage.getItem('${THEME_STYLE_STORAGE_KEY}');if(s!=='default'&&${JSON.stringify(THEME_STYLES)}.indexOf(s)!==-1)document.documentElement.dataset.swingsetTheme=s}catch(e){}`;

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): ThemeStyle {
  return parseThemeStyle(document.documentElement.dataset.swingsetTheme);
}

function getServerSnapshot(): ThemeStyle {
  return 'default';
}

function setThemeStyle(next: ThemeStyle) {
  if (next === 'default') {
    delete document.documentElement.dataset.swingsetTheme;
  } else {
    document.documentElement.dataset.swingsetTheme = next;
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
