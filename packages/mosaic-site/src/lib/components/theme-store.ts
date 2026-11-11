import { parseTheme, type ThemeId } from '@/lib/components/theme';

const KEY = 'mosaic-component-theme';
const listeners = new Set<() => void>();
let current: ThemeId = 'default';
let hydrated = false;

const notify = () => listeners.forEach(listener => listener());

export function hydrateTheme() {
  if (hydrated) {
    return;
  }
  hydrated = true;
  try {
    current = parseTheme(window.localStorage.getItem(KEY));
  } catch {
    current = 'default';
  }
  notify();
}

export function setStoredTheme(theme: ThemeId) {
  current = theme;
  try {
    window.localStorage.setItem(KEY, theme);
  } catch {
    current = theme;
  }
  notify();
}

export const subscribeTheme = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getTheme = () => current;
