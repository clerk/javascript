import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clerkFrontendApiProxy, DEFAULT_PROXY_PATH, fapiUrlFromPublishableKey, matchProxyPath } from '../proxy';

describe('proxy', () => {
  describe('DEFAULT_PROXY_PATH', () => {
    it('should be /__clerk', () => {
      expect(DEFAULT_PROXY_PATH).toBe('/__clerk');
    });
  });

  describe('fapiUrlFromPublishableKey', () => {
    it('returns production FAPI URL for production publishable keys', () => {
      const pk = 'pk_live_Y2xlcmsuZXhhbXBsZS5jb20k'; // clerk.example.com
      const result = fapiUrlFromPublishableKey(pk);
      expect(result).toBe('https://frontend-api.clerk.dev');
    });

    it('returns local FAPI URL for local environment keys', () => {
      // Non-legacy local keys (not starting with 'clerk.') should use local FAPI
      const pk = 'pk_test_bXlhcHAubGNsY2xlcmsuY29tJA=='; // myapp.lclclerk.com
      const result = fapiUrlFromPublishableKey(pk);
      expect(result).toBe('https://frontend-api.lclclerk.com');
    });

    it('returns staging FAPI URL for staging environment keys', () => {
      const pk = 'pk_test_Y2xlcmsuYWNjb3VudHNzdGFnZS5kZXYk'; // clerk.accountsstage.dev
      const result = fapiUrlFromPublishableKey(pk);
      expect(result).toBe('https://frontend-api.clerkstage.dev');
    });

    it('returns production FAPI URL for legacy dev instance keys', () => {
      // Legacy dev instances should use production FAPI
      const pk = 'pk_test_Y2xlcmsuZXhhbXBsZS5sY2xjbGVyay5jb20k'; // clerk.example.lclclerk.com
      const result = fapiUrlFromPublishableKey(pk);
      expect(result).toBe('https://frontend-api.clerk.dev');
    });

    it('returns production FAPI URL for invalid publishable keys', () => {
      const result = fapiUrlFromPublishableKey('invalid_key');
      expect(result).toBe('https://frontend-api.clerk.dev');
    });
  });

  describe('matchProxyPath', () => {
    it('matches request with default proxy path', () => {
      const request = new Request('https://example.com/__clerk/v1/client');
      expect(matchProxyPath(request)).toBe(true);
    });

    it('does not match request without proxy path', () => {
      const request = new Request('https://example.com/api/users');
      expect(matchProxyPath(request)).toBe(false);
    });

    it('matches request with custom proxy path', () => {
      const request = new Request('https://example.com/custom-proxy/v1/client');
      expect(matchProxyPath(request, { proxyPath: '/custom-proxy' })).toBe(true);
    });

    it('does not match request with different custom proxy path', () => {
      const request = new Request('https://example.com/__clerk/v1/client');
      expect(matchProxyPath(request, { proxyPath: '/custom-proxy' })).toBe(false);
    });

    it('matches root proxy path request', () => {
      const request = new Request('https://example.com/__clerk');
      expect(matchProxyPath(request)).toBe(true);
    });

    it('matches proxy path with trailing slash', () => {
      const request = new Request('https://example.com/__clerk/');
      expect(matchProxyPath(request)).toBe(true);
    });
  });

  describe('clerkFrontendApiProxy', () => {
    const mockFetch = vi.fn();
    const originalFetch = global.fetch;

    beforeEach(() => {
      global.fetch = mockFetch;
      mockFetch.mockReset();
    });

    afterEach(() => {
      global.fetch = originalFetch;
    });

    it('returns error when publishableKey is missing', async () => {
      const request = new Request('https://example.com/__clerk/v1/client');

      const response = await clerkFrontendApiProxy(request, {
        secretKey: 'sk_test_xxx',
      });

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.errors[0].code).toBe('proxy_configuration_error');
      expect(body.errors[0].message).toContain('publishableKey');
    });

    it('returns error when secretKey is missing', async () => {
      const request = new Request('https://example.com/__clerk/v1/client');

      const response = await clerkFrontendApiProxy(request, {
        publishableKey: 'pk_test_Y2xlcmsuZXhhbXBsZS5jb20k',
      });

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.errors[0].code).toBe('proxy_configuration_error');
      expect(body.errors[0].message).toContain('secretKey');
    });

    it('returns error when request path does not match proxy path', async () => {
      const request = new Request('https://example.com/api/users');

      const response = await clerkFrontendApiProxy(request, {
        publishableKey: 'pk_test_Y2xlcmsuZXhhbXBsZS5jb20k',
        secretKey: 'sk_test_xxx',
        proxyPath: '/__clerk',
      });

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.errors[0].code).toBe('proxy_path_mismatch');
    });

    it('forwards GET request to FAPI with correct headers', async () => {
      const mockResponse = new Response(JSON.stringify({ client: {} }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
      mockFetch.mockResolvedValue(mockResponse);

      const request = new Request('https://example.com/__clerk/v1/client', {
        method: 'GET',
        headers: {
          'User-Agent': 'Test Agent',
        },
      });

      const response = await clerkFrontendApiProxy(request, {
        publishableKey: 'pk_test_Y2xlcmsuZXhhbXBsZS5jb20k',
        secretKey: 'sk_test_xxx',
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];

      // Check URL is correctly constructed
      expect(url).toBe('https://frontend-api.clerk.dev/v1/client');

      // Check required headers are set
      expect(options.headers.get('Clerk-Proxy-Url')).toBe('https://example.com/__clerk');
      expect(options.headers.get('Clerk-Secret-Key')).toBe('sk_test_xxx');
      expect(options.headers.get('Host')).toBe('frontend-api.clerk.dev');

      expect(response.status).toBe(200);
    });

    it('forwards POST request with body', async () => {
      const mockResponse = new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
      mockFetch.mockResolvedValue(mockResponse);

      const requestBody = JSON.stringify({ email: 'test@example.com' });
      const request = new Request('https://example.com/__clerk/v1/sign_ups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
      });

      const response = await clerkFrontendApiProxy(request, {
        publishableKey: 'pk_test_Y2xlcmsuZXhhbXBsZS5jb20k',
        secretKey: 'sk_test_xxx',
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];

      expect(url).toBe('https://frontend-api.clerk.dev/v1/sign_ups');
      expect(options.method).toBe('POST');
      expect(options.duplex).toBe('half');

      expect(response.status).toBe(200);
    });

    it('preserves query parameters', async () => {
      const mockResponse = new Response(JSON.stringify({}), { status: 200 });
      mockFetch.mockResolvedValue(mockResponse);

      const request = new Request('https://example.com/__clerk/v1/client?_clerk_js_version=5.0.0');

      await clerkFrontendApiProxy(request, {
        publishableKey: 'pk_test_Y2xlcmsuZXhhbXBsZS5jb20k',
        secretKey: 'sk_test_xxx',
      });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('_clerk_js_version=5.0.0');
    });

    it('forwards X-Forwarded-For header from original request', async () => {
      const mockResponse = new Response(JSON.stringify({}), { status: 200 });
      mockFetch.mockResolvedValue(mockResponse);

      const request = new Request('https://example.com/__clerk/v1/client', {
        headers: {
          'X-Forwarded-For': '192.168.1.1',
        },
      });

      await clerkFrontendApiProxy(request, {
        publishableKey: 'pk_test_Y2xlcmsuZXhhbXBsZS5jb20k',
        secretKey: 'sk_test_xxx',
      });

      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers.get('X-Forwarded-For')).toBe('192.168.1.1');
    });

    it('uses CF-Connecting-IP when available', async () => {
      const mockResponse = new Response(JSON.stringify({}), { status: 200 });
      mockFetch.mockResolvedValue(mockResponse);

      const request = new Request('https://example.com/__clerk/v1/client', {
        headers: {
          'CF-Connecting-IP': '10.0.0.1',
          'X-Forwarded-For': '192.168.1.1',
        },
      });

      await clerkFrontendApiProxy(request, {
        publishableKey: 'pk_test_Y2xlcmsuZXhhbXBsZS5jb20k',
        secretKey: 'sk_test_xxx',
      });

      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers.get('X-Forwarded-For')).toBe('10.0.0.1');
    });

    it('removes hop-by-hop headers from request', async () => {
      const mockResponse = new Response(JSON.stringify({}), { status: 200 });
      mockFetch.mockResolvedValue(mockResponse);

      const request = new Request('https://example.com/__clerk/v1/client', {
        headers: {
          Connection: 'keep-alive',
          'Keep-Alive': 'timeout=5',
          'Transfer-Encoding': 'chunked',
          'User-Agent': 'Test',
        },
      });

      await clerkFrontendApiProxy(request, {
        publishableKey: 'pk_test_Y2xlcmsuZXhhbXBsZS5jb20k',
        secretKey: 'sk_test_xxx',
      });

      const [, options] = mockFetch.mock.calls[0];
      expect(options.headers.has('Connection')).toBe(false);
      expect(options.headers.has('Keep-Alive')).toBe(false);
      expect(options.headers.has('Transfer-Encoding')).toBe(false);
      expect(options.headers.get('User-Agent')).toBe('Test');
    });

    it('returns 502 when fetch fails', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const request = new Request('https://example.com/__clerk/v1/client');

      const response = await clerkFrontendApiProxy(request, {
        publishableKey: 'pk_test_Y2xlcmsuZXhhbXBsZS5jb20k',
        secretKey: 'sk_test_xxx',
      });

      expect(response.status).toBe(502);
      const body = await response.json();
      expect(body.errors[0].code).toBe('proxy_request_failed');
      expect(body.errors[0].message).toContain('Network error');
    });

    it('passes through FAPI response status codes', async () => {
      const mockResponse = new Response(JSON.stringify({ errors: [] }), {
        status: 401,
        statusText: 'Unauthorized',
      });
      mockFetch.mockResolvedValue(mockResponse);

      const request = new Request('https://example.com/__clerk/v1/client');

      const response = await clerkFrontendApiProxy(request, {
        publishableKey: 'pk_test_Y2xlcmsuZXhhbXBsZS5jb20k',
        secretKey: 'sk_test_xxx',
      });

      expect(response.status).toBe(401);
    });

    it('uses custom proxy path', async () => {
      const mockResponse = new Response(JSON.stringify({}), { status: 200 });
      mockFetch.mockResolvedValue(mockResponse);

      const request = new Request('https://example.com/custom-clerk/v1/client');

      await clerkFrontendApiProxy(request, {
        publishableKey: 'pk_test_Y2xlcmsuZXhhbXBsZS5jb20k',
        secretKey: 'sk_test_xxx',
        proxyPath: '/custom-clerk',
      });

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toBe('https://frontend-api.clerk.dev/v1/client');
      expect(options.headers.get('Clerk-Proxy-Url')).toBe('https://example.com/custom-clerk');
    });
  });
});
