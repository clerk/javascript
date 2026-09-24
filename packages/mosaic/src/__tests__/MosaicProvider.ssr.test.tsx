// @vitest-environment node
//
// Runs in a real node environment (no jsdom `document`) so `renderToString` exercises the actual
// server path. Every Mosaic component sits behind a `'use client'` boundary, but Next.js still
// server-renders it, so the provider must render without touching the DOM.
import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { MosaicProvider } from '../MosaicProvider';

describe('MosaicProvider SSR', () => {
  it('renders on the server without throwing', () => {
    expect(() =>
      renderToString(
        <MosaicProvider>
          <div />
        </MosaicProvider>,
      ),
    ).not.toThrow();
  });
});
