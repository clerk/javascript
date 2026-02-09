import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { DynamicClerkScripts } from '../DynamicClerkScripts';

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));

import { headers } from 'next/headers';

const mockHeaders = headers as unknown as ReturnType<typeof vi.fn>;

const render = async (element: Promise<React.JSX.Element | null>) => {
  const resolved = await element;
  if (!resolved) {
    return '';
  }
  return renderToStaticMarkup(resolved);
};

const defaultProps = {
  publishableKey: 'pk_test_123',
};

describe('DynamicClerkScripts', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when publishableKey is empty', async () => {
    const html = await render(DynamicClerkScripts({ publishableKey: '' }));
    expect(html).toBe('');
  });

  it('uses X-Nonce header when present', async () => {
    mockHeaders.mockResolvedValue(
      new Map([
        ['X-Nonce', 'test-nonce-123'],
        ['Content-Security-Policy', ''],
      ]),
    );

    const html = await render(DynamicClerkScripts(defaultProps));
    expect(html).toContain('nonce="test-nonce-123"');
  });

  it('falls back to CSP header when X-Nonce is absent', async () => {
    mockHeaders.mockResolvedValue(
      new Map([
        ['X-Nonce', null],
        ['Content-Security-Policy', "script-src 'nonce-csp-nonce-456'"],
      ]),
    );

    const html = await render(DynamicClerkScripts(defaultProps));
    expect(html).toContain('nonce="csp-nonce-456"');
  });

  it('renders scripts without a nonce value when neither X-Nonce nor CSP header is present', async () => {
    mockHeaders.mockResolvedValue(
      new Map([
        ['X-Nonce', null],
        ['Content-Security-Policy', ''],
      ]),
    );

    const html = await render(DynamicClerkScripts(defaultProps));
    expect(html).toContain('data-clerk-js-script');
    expect(html).not.toContain('nonce="test');
    expect(html).not.toContain('nonce="csp');
  });

  it('rethrows prerendering bailout errors', async () => {
    mockHeaders.mockRejectedValue(new Error('Dynamic server usage: headers'));

    await expect(render(DynamicClerkScripts(defaultProps))).rejects.toThrow('Dynamic server usage: headers');
  });

  it('gracefully degrades when headers() throws a non-bailout error', async () => {
    mockHeaders.mockRejectedValue(new Error('some unexpected error'));

    const html = await render(DynamicClerkScripts(defaultProps));
    expect(html).toContain('data-clerk-js-script');
    expect(html).not.toContain('nonce="test');
    expect(html).not.toContain('nonce="csp');
  });
});
