import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import React from 'react';

const cache = createCache({
  key: 'cl-internal',
  prepend: true,
});

export const EmotionCacheProvider = (props: React.PropsWithChildren<{}>) => {
  return <CacheProvider value={cache}>{props.children}</CacheProvider>;
};
