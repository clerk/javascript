// eslint-disable-next-line no-restricted-imports
import createCache from '@emotion/cache';
// eslint-disable-next-line no-restricted-imports
import { CacheProvider, ThemeProvider } from '@emotion/react';
import React from 'react';

// TODO: make it customisable
import { defaultTheme } from '../foundations';

const cache = createCache({
  key: 'cl-internal',
  prepend: true,
});

// type InternalThemeProvider = React.PropsWithChildren<{
//   userDefinedAppearance?: Appearance;
// }>;

export const InternalThemeProvider = (props: any) => {
  const { children, theme = defaultTheme } = props;
  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </CacheProvider>
  );
};
