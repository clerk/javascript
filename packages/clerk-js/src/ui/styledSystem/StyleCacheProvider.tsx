// eslint-disable-next-line no-restricted-imports
import createCache from '@emotion/cache';
// eslint-disable-next-line no-restricted-imports
import { CacheProvider, type SerializedStyles } from '@emotion/react';
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
      emotionCache.insert = (selector: string, serialized: SerializedStyles, sheet: any, shouldCache: boolean) => {
        if (serialized && typeof serialized.styles === 'string' && !serialized.styles.startsWith('@layer')) {
          const newSerialized = { ...serialized };
          newSerialized.styles = `@layer ${props.cssLayerName} {${serialized.styles}}`;
          return prevInsert(selector, newSerialized, sheet, shouldCache);
        }
        return prevInsert(selector, serialized, sheet, shouldCache);
      };
    }
    return emotionCache;
  }, [props.nonce, props.cssLayerName]);

  return <CacheProvider value={cache}>{props.children}</CacheProvider>;
};
