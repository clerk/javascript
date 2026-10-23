import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ClerkScriptTags } from '../clerk-script-tags';

const reactVersion = vi.hoisted(() => ({ current: '18.3.1' }));

vi.mock('react', async importOriginal => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    default: {
      ...actual,
      get version() {
        return reactVersion.current;
      },
    },
  };
});

describe.each([
  { version: '18.3.1', attribute: 'fetchpriority' },
  { version: '19.0.0', attribute: 'fetchPriority' },
])('ClerkScriptTags with React $version', ({ version, attribute }) => {
  beforeEach(() => {
    reactVersion.current = version;
  });
  it.each([undefined, true, false])('prioritizes the core script when prefetchUI is %s', prefetchUI => {
    const container = document.createElement('div');
    const markup = renderToStaticMarkup(
      <ClerkScriptTags
        publishableKey='pk_test_123'
        __internal_clerkJSUrl='https://example.com/clerk.js'
        nonce='test-nonce'
        prefetchUI={prefetchUI}
      />,
    );

    expect(markup).toContain(`${attribute}="high"`);
    container.innerHTML = markup;
    const script = container.querySelector('script[data-clerk-js-script]');
    expect(script?.getAttribute('src')).toBe('https://example.com/clerk.js');
    expect(script?.getAttribute('fetchpriority')).toBe('high');
    expect(script?.hasAttribute('async')).toBe(true);
    expect(script?.getAttribute('crossorigin')).toBe('anonymous');
    expect(script?.getAttribute('nonce')).toBe('test-nonce');
    expect(script?.getAttribute('data-clerk-publishable-key')).toBe('pk_test_123');
  });

  it.each([undefined, true, false])('preserves UI preloading when prefetchUI is %s', prefetchUI => {
    const container = document.createElement('div');
    container.innerHTML = renderToStaticMarkup(
      <ClerkScriptTags
        publishableKey='pk_test_123'
        __internal_clerkUIUrl='https://example.com/ui.js'
        nonce='test-nonce'
        prefetchUI={prefetchUI}
      />,
    );

    const preload = container.querySelector('link[href="https://example.com/ui.js"]');
    if (prefetchUI === false) {
      expect(preload).toBeNull();
    } else {
      expect(preload?.getAttribute('rel')).toBe('preload');
      expect(preload?.getAttribute('as')).toBe('script');
      expect(preload?.getAttribute('crossorigin')).toBe('anonymous');
      expect(preload?.getAttribute('nonce')).toBe('test-nonce');
    }
    expect(container.querySelector('script[src="https://example.com/ui.js"]')).toBeNull();
  });
});
