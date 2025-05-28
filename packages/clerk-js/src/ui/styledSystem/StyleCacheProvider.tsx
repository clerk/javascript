// eslint-disable-next-line no-restricted-imports
import createCache from '@emotion/cache';
// eslint-disable-next-line no-restricted-imports
import { CacheProvider } from '@emotion/react';
import React, { useMemo } from 'react';

const el = document.querySelector('style#cl-style-insertion-point');

type StyleCacheProviderProps = React.PropsWithChildren<{
  /** Optional nonce value for CSP (Content Security Policy) */
  nonce?: string;
  /** Optional CSS layer name to wrap styles in */
  cssLayerName?: string;
}>;

export const StyleCacheProvider = (props: StyleCacheProviderProps) => {
  const cache = useMemo(() => {
    const emotionCache = createCache({
      key: 'cl-internal',
      prepend: props.cssLayerName ? false : !el,
      insertionPoint: el ? (el as HTMLElement) : undefined,
      nonce: props.nonce,
    });

    if (props.cssLayerName) {
      const prevInsert = emotionCache.insert.bind(emotionCache);
      emotionCache.insert = (...args) => {
        if (!args[1].styles.startsWith('@layer')) {
          // avoid nested @layer
          args[1].styles = `@layer ${props.cssLayerName} {${args[1].styles}}`;
        }
        return prevInsert(...args);
      };
    }
    return emotionCache;
  }, [props.nonce, props.cssLayerName]);

  return <CacheProvider value={cache}>{props.children}</CacheProvider>;
};
