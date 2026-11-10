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

export function ThemeStyleProvider({ children }: { children: React.ReactNode }) {
  const [themeStyle, setThemeStyle] = React.useState<ThemeStyle>('clerk');

  React.useEffect(() => {
    // eslint-disable-next-line react/set-state-in-effect -- Read the theme the init script applied only after hydration
    setThemeStyle(document.documentElement.dataset.swingsetTheme === 'clerk' ? 'clerk' : 'default');
  }, []);

  const selectThemeStyle = React.useCallback((next: ThemeStyle) => {
    if (next === 'clerk') {
      document.documentElement.dataset.swingsetTheme = 'clerk';
    } else {
      delete document.documentElement.dataset.swingsetTheme;
    }
    setThemeStyle(next);
    try {
      localStorage.setItem(THEME_STYLE_STORAGE_KEY, next);
    } catch {
      return;
    }
  }, []);

  const value = React.useMemo(() => ({ themeStyle, setThemeStyle: selectThemeStyle }), [themeStyle, selectThemeStyle]);
  return <ThemeStyleContext.Provider value={value}>{children}</ThemeStyleContext.Provider>;
}

export function useThemeStyle() {
  return React.useContext(ThemeStyleContext);
}
