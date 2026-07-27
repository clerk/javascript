import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createFrontendApiProxyHandlers } from '../proxy';

describe('createFrontendApiProxyHandlers', () => {
  const mockFetch = vi.fn();
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = mockFetch;
    mockFetch.mockReset();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('forwards fapiUrl to the backend proxy', async () => {
    mockFetch.mockResolvedValue(new Response(JSON.stringify({ client: {} }), { status: 200 }));
    const request = new Request('https://example.com/__clerk/v1/client');
    const handlers = createFrontendApiProxyHandlers({
      publishableKey: 'pk_test_Y2xlcmsuZXhhbXBsZS5jb20k',
      secretKey: 'sk_test_xxx',
      fapiUrl: 'http://localhost:8001',
    });

    await handlers.GET(request);

    expect(mockFetch.mock.calls[0][0]).toBe('http://localhost:8001/v1/client');
  });
});
