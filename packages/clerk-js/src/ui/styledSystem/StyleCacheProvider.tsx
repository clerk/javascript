// eslint-disable-next-line no-restricted-imports
import type { StylisPlugin } from '@emotion/cache';
// eslint-disable-next-line no-restricted-imports
import createCache from '@emotion/cache';
// eslint-disable-next-line no-restricted-imports
import { CacheProvider } from '@emotion/react';
import React, { useMemo } from 'react';

const wrapInLayer: (layerName: string) => StylisPlugin = layerName => node => {
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

const el = document.querySelector('style#cl-style-insertion-point');

type StyleCacheProviderProps = React.PropsWithChildren<{
  nonce?: string;
  cssLayerName?: string;
}>;

export const StyleCacheProvider = (props: StyleCacheProviderProps) => {
  const cache = useMemo(
    () =>
      createCache({
        key: 'cl-internal',
        prepend: !el,
        insertionPoint: el ? (el as HTMLElement) : undefined,
        nonce: props.nonce,
        stylisPlugins: props.cssLayerName ? [wrapInLayer(props.cssLayerName)] : undefined,
      }),
    [props.nonce, props.cssLayerName],
  );

  return <CacheProvider value={cache}>{props.children}</CacheProvider>;
};
