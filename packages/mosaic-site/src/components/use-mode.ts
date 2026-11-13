'use client';

import { useSyncExternalStore } from 'react';

export type Mode = 'light' | 'dark';

const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
};

const getSnapshot = (): Mode => (document.documentElement.classList.contains('dark') ? 'dark' : 'light');

const getServerSnapshot = (): Mode => 'light';

export function useMode(): Mode {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

const SYSTEM_DARK = '(prefers-color-scheme: dark)';

const subscribeSystem = (onChange: () => void) => {
  const query = window.matchMedia(SYSTEM_DARK);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
};

const getSystemSnapshot = (): Mode => (window.matchMedia(SYSTEM_DARK).matches ? 'dark' : 'light');

const getSystemServerSnapshot = (): Mode | null => null;

export function useSystemMode(): Mode | null {
  return useSyncExternalStore(subscribeSystem, getSystemSnapshot, getSystemServerSnapshot);
}
