// eslint-disable-next-line no-restricted-imports
import createCache from '@emotion/cache';
// eslint-disable-next-line no-restricted-imports
import { CacheProvider } from '@emotion/react';
import React, { useMemo } from 'react';

const el = document.querySelector('style#cl-style-insertion-point');

type StyleCacheProviderProps = React.PropsWithChildren<{
  nonce?: string;
}>;

export const StyleCacheProvider = (props: StyleCacheProviderProps) => {
  const cache = useMemo(
    () =>
      createCache({
        key: 'cl-internal',
        prepend: !el,
        insertionPoint: el ? (el as HTMLElement) : undefined,
        nonce: props.nonce,
      }),
    [props.nonce],
  );

  return <CacheProvider value={cache}>{props.children}</CacheProvider>;
};
