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
