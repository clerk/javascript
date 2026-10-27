'use client';

import * as React from 'react';

export interface PagePreset {
  id: string;
  label: string;
  vars: Record<string, string>;
}

export const pagePresets: PagePreset[] = [
  { id: 'default', label: 'Default', vars: {} },
  {
    id: 'gray',
    label: 'Gray',
    vars: {
      '--cl-color-page': 'light-dark(#f2f2f3, oklch(0.2 0 0))',
    },
  },
  {
    id: 'warm-gray',
    label: 'Warm gray',
    vars: {
      '--cl-color-page': 'light-dark(oklch(0.96 0.004 75), oklch(0.19 0.005 70))',
    },
  },
  {
    id: 'cool-gray',
    label: 'Cool gray',
    vars: {
      '--cl-color-page': 'light-dark(oklch(0.96 0.004 250), oklch(0.19 0.008 255))',
    },
  },
];

interface PageContextValue {
  page: string;
  setPage: (page: string) => void;
}

const PageContext = React.createContext<PageContextValue>({ page: 'default', setPage: () => {} });

export function PageProvider({ children }: { children: React.ReactNode }) {
  const [page, setPage] = React.useState('default');
  React.useEffect(() => {
    const style = document.documentElement.style;
    const vars = pagePresets.find(preset => preset.id === page)?.vars ?? {};
    Object.entries(vars).forEach(([name, value]) => style.setProperty(name, value));
    return () => Object.keys(vars).forEach(name => style.removeProperty(name));
  }, [page]);
  const value = React.useMemo(() => ({ page, setPage }), [page]);
  return <PageContext.Provider value={value}>{children}</PageContext.Provider>;
}

export function usePage() {
  return React.useContext(PageContext);
}
