// eslint-disable-next-line no-restricted-imports
import type { StylisPlugin } from '@emotion/cache';
// eslint-disable-next-line no-restricted-imports
import createCache from '@emotion/cache';
// eslint-disable-next-line no-restricted-imports
import { CacheProvider } from '@emotion/react';
import React, { useMemo } from 'react';

/**
 * A Stylis plugin that wraps CSS rules in a CSS layer
 * @param layerName - The name of the CSS layer to wrap the styles in
 * @returns A Stylis plugin function
 */
export const wrapInLayer: (layerName: string) => StylisPlugin = layerName => node => {
  // if we're not at the root of a <style> tag, leave the tree intact
  if (node.parent) return;

  // if we're at the root, replace node with `@layer layerName { node }`
  const child = { ...node, parent: node, root: node };
  Object.assign(node, {
    children: [child],
    length: 6,
    parent: null,
    props: [layerName],
    return: '',
    root: null,
    type: '@layer',
    value: `@layer ${layerName}`,
  });
};

/**
 * Finds the appropriate insertion point for Emotion styles in the DOM
 * @returns The HTMLElement to use as insertion point, or undefined if none found
 */
export const getInsertionPoint = (): HTMLElement | undefined => {
  try {
    const metaTag = document.querySelector('meta[name="emotion-insertion-point"]');
    if (metaTag) {
      return metaTag as HTMLElement;
    }
    return document.querySelector('style#cl-style-insertion-point') as HTMLElement;
  } catch (error) {
    console.warn('Failed to find Emotion insertion point:', error);
    return undefined;
  }
};

type StyleCacheProviderProps = React.PropsWithChildren<{
  /** Optional nonce value for CSP (Content Security Policy) */
  nonce?: string;
  /** Optional CSS layer name to wrap styles in */
  cssLayerName?: string;
}>;

/**
 * Provides an Emotion cache configuration for styling with support for CSS layers and CSP nonce
 * @param props - Component props
 * @returns A CacheProvider component with configured Emotion cache
 */
export const StyleCacheProvider = (props: StyleCacheProviderProps) => {
  const cache = useMemo(() => {
    const insertionPoint = getInsertionPoint();
    return createCache({
      key: 'cl-internal',
      prepend: !insertionPoint,
      insertionPoint: insertionPoint ?? undefined,
      nonce: props.nonce,
      stylisPlugins: props.cssLayerName ? [wrapInLayer(props.cssLayerName)] : undefined,
    });
  }, [props.nonce, props.cssLayerName]);

  return <CacheProvider value={cache}>{props.children}</CacheProvider>;
};
