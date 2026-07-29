// @vitest-environment node
//
// Runs in a real node environment (no jsdom `document`) so `renderToString` exercises the actual
// server path: `ensureInsertionPoint` returns null and Emotion inserts through the wrapped cache.
// Every Mosaic component sits behind a `'use client'` boundary, but Next.js still server-renders it,
// so the provider must render without touching the DOM and its layer wrapping must hold on the server.
import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { MosaicProvider } from '../MosaicProvider';

describe('MosaicProvider SSR', () => {
  it('renders on the server without throwing', () => {
    expect(() =>
      renderToString(
        <MosaicProvider>
          <div css={{ color: 'red' }} />
        </MosaicProvider>,
      ),
    ).not.toThrow();
  });

  it('emits the reset wrapped in the layer when cssLayerName is set', () => {
    const html = renderToString(
      <MosaicProvider cssLayerName='cl-test'>
        <div />
      </MosaicProvider>,
    );

    // Combined substring, not two separate `toContain`s: proves the reset itself sits inside the layer.
    expect(html).toContain('@layer cl-test{:where([data-cl-slot])');
  });

  it('wraps server-inserted component styles in the layer when cssLayerName is set', () => {
    const html = renderToString(
      <MosaicProvider cssLayerName='cl-test'>
        <div css={{ color: 'red' }} />
      </MosaicProvider>,
    );

    expect(html).toContain('color:red');
    // The component rule (`.cl-mosaic-*`) must be nested in the layer, not merely coexist with the
    // already-layered reset elsewhere in the markup.
    expect(html).toMatch(/@layer cl-test\s*\{\s*\.cl-mosaic/);
  });
});
