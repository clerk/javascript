// eslint-disable-next-line no-restricted-imports
import { CacheProvider } from '@emotion/react';
import React, { useMemo } from 'react';

import { createEmotionCache } from './createEmotionCache';

type StyleCacheProviderProps = React.PropsWithChildren<{
  /** The nonce value for CSP (Content Security Policy). */
  nonce?: string;
  /** The CSS layer name to wrap styles in. */
  cssLayerName?: string;
}>;

export const StyleCacheProvider = (props: StyleCacheProviderProps) => {
  const cache = useMemo(
    () => createEmotionCache({ nonce: props.nonce, cssLayerName: props.cssLayerName }),
    [props.nonce, props.cssLayerName],
  );

  return <CacheProvider value={cache}>{props.children}</CacheProvider>;
};
