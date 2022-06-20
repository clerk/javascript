// eslint-disable-next-line no-restricted-imports
import createCache from '@emotion/cache';
// eslint-disable-next-line no-restricted-imports
import { CacheProvider, ThemeProvider } from '@emotion/react';
import React from 'react';

import { useAppearance } from '../customizables';
import { useFlowMetadata } from '../elements';
import { InternalTheme } from '../styledSystem';

const cache = createCache({
  key: 'cl-internal',
  prepend: true,
});

type InternalThemeProviderProps = React.PropsWithChildren<{
  theme?: InternalTheme;
}>;

export const InternalThemeProvider = (props: InternalThemeProviderProps) => {
  const { parsedInternalTheme } = useAppearance();
  const { flow } = useFlowMetadata();
  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={parsedInternalTheme[flow]}>{props.children}</ThemeProvider>
    </CacheProvider>
  );
};
