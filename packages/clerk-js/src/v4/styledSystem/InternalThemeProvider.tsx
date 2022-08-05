// eslint-disable-next-line no-restricted-imports
import createCache from '@emotion/cache';
// eslint-disable-next-line no-restricted-imports
import { CacheProvider, ThemeProvider } from '@emotion/react';
import React from 'react';

import { useAppearance } from '../customizables';
import { InternalTheme } from '../styledSystem';

const el = document.querySelector('style#cl-style-insertion-point');

const cache = createCache({
  key: 'cl-internal',
  prepend: !el,
  insertionPoint: el ? (el as HTMLElement) : undefined,
});

type InternalThemeProviderProps = React.PropsWithChildren<{
  theme?: InternalTheme;
}>;

export const InternalThemeProvider = (props: InternalThemeProviderProps) => {
  const { parsedInternalTheme } = useAppearance();
  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={parsedInternalTheme}>{props.children}</ThemeProvider>
    </CacheProvider>
  );
};
