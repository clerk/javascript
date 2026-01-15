import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clerkFrontendApiProxy, createFrontendApiProxyHandlers, DEFAULT_PROXY_PATH } from '../proxy';

// Mock the backend proxy module
vi.mock('@clerk/backend/proxy', () => ({
  clerkFrontendApiProxy: vi.fn(),
  DEFAULT_PROXY_PATH: '/__clerk',
  matchProxyPath: vi.fn(),
}));

// Mock the server constants
vi.mock('../server/constants', () => ({
  PUBLISHABLE_KEY: 'pk_test_mock',
  SECRET_KEY: 'sk_test_mock',
}));

describe('proxy', () => {
  describe('DEFAULT_PROXY_PATH', () => {
    it('should be /__clerk', () => {
      expect(DEFAULT_PROXY_PATH).toBe('/__clerk');
    });
  });

  describe('createFrontendApiProxyHandlers', () => {
    it('returns handlers for all HTTP methods', () => {
      const handlers = createFrontendApiProxyHandlers();

      expect(handlers).toHaveProperty('GET');
      expect(handlers).toHaveProperty('POST');
      expect(handlers).toHaveProperty('PUT');
      expect(handlers).toHaveProperty('DELETE');
      expect(handlers).toHaveProperty('PATCH');

      expect(typeof handlers.GET).toBe('function');
      expect(typeof handlers.POST).toBe('function');
      expect(typeof handlers.PUT).toBe('function');
      expect(typeof handlers.DELETE).toBe('function');
      expect(typeof handlers.PATCH).toBe('function');
    });

    it('all handlers call the same underlying function', () => {
      const handlers = createFrontendApiProxyHandlers();

      // All handlers should be the same function
      expect(handlers.GET).toBe(handlers.POST);
      expect(handlers.POST).toBe(handlers.PUT);
      expect(handlers.PUT).toBe(handlers.DELETE);
      expect(handlers.DELETE).toBe(handlers.PATCH);
    });

    it('passes custom options to proxy function', async () => {
      const { clerkFrontendApiProxy: mockProxy } = await import('@clerk/backend/proxy');
      const mockedProxy = vi.mocked(mockProxy);

      mockedProxy.mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));

      const customOptions = {
        publishableKey: 'pk_custom',
        secretKey: 'sk_custom',
      };

      const handlers = createFrontendApiProxyHandlers(customOptions);
      const mockRequest = new Request('https://example.com/__clerk/v1/client');

      await handlers.GET(mockRequest);

      expect(mockedProxy).toHaveBeenCalledWith(mockRequest, expect.objectContaining(customOptions));
    });
  });

  describe('clerkFrontendApiProxy', () => {
    let mockBackendProxy: ReturnType<typeof vi.fn>;

    beforeEach(async () => {
      const { clerkFrontendApiProxy: backendProxy } = await import('@clerk/backend/proxy');
      mockBackendProxy = vi.mocked(backendProxy);
      mockBackendProxy.mockReset();
    });

    it('calls backend proxy with default options', async () => {
      mockBackendProxy.mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));

      const request = new Request('https://example.com/__clerk/v1/client');
      await clerkFrontendApiProxy(request);

      expect(mockBackendProxy).toHaveBeenCalledWith(request, {
        proxyPath: '/__clerk',
        publishableKey: 'pk_test_mock',
        secretKey: 'sk_test_mock',
      });
    });

    it('allows overriding options', async () => {
      mockBackendProxy.mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));

      const request = new Request('https://example.com/custom/__clerk/v1/client');
      await clerkFrontendApiProxy(request, {
        proxyPath: '/custom/__clerk',
        publishableKey: 'pk_custom',
        secretKey: 'sk_custom',
      });

      expect(mockBackendProxy).toHaveBeenCalledWith(request, {
        proxyPath: '/custom/__clerk',
        publishableKey: 'pk_custom',
        secretKey: 'sk_custom',
      });
    });

    it('returns response from backend proxy', async () => {
      const expectedResponse = new Response(JSON.stringify({ client: {} }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
      mockBackendProxy.mockResolvedValue(expectedResponse);

      const request = new Request('https://example.com/__clerk/v1/client');
      const response = await clerkFrontendApiProxy(request);

      expect(response).toBe(expectedResponse);
    });
  });

  describe('exports', () => {
    it('exports all required functions and constants', async () => {
      const proxyModule = await import('../proxy.js');

      expect(proxyModule).toHaveProperty('clerkFrontendApiProxy');
      expect(proxyModule).toHaveProperty('createFrontendApiProxyHandlers');
      expect(proxyModule).toHaveProperty('DEFAULT_PROXY_PATH');
    });
  });
});
