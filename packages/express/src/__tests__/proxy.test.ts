import type { Application } from 'express';
import express from 'express';
import { Readable } from 'stream';
import supertest from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clerkFrontendApiProxyMiddleware, DEFAULT_PROXY_PATH } from '../proxy';
import { requestToProxyRequest } from '../utils';

// Mock the backend proxy module
vi.mock('@clerk/backend/proxy', () => ({
  clerkFrontendApiProxy: vi.fn(),
  DEFAULT_PROXY_PATH: '/__clerk',
}));

describe('proxy', () => {
  describe('DEFAULT_PROXY_PATH', () => {
    it('should be /__clerk', () => {
      expect(DEFAULT_PROXY_PATH).toBe('/__clerk');
    });
  });

  describe('clerkFrontendApiProxyMiddleware', () => {
    let mockProxy: ReturnType<typeof vi.fn>;

    beforeEach(async () => {
      const { clerkFrontendApiProxy } = await import('@clerk/backend/proxy');
      mockProxy = vi.mocked(clerkFrontendApiProxy);
      mockProxy.mockReset();

      // Set up environment variables
      process.env.CLERK_PUBLISHABLE_KEY = 'pk_test_Y2xlcmsuZXhhbXBsZS5jb20k';
      process.env.CLERK_SECRET_KEY = 'sk_test_xxx';
    });

    afterEach(() => {
      delete process.env.CLERK_PUBLISHABLE_KEY;
      delete process.env.CLERK_SECRET_KEY;
    });

    function createApp() {
      const app: Application = express();
      app.use('/__clerk', clerkFrontendApiProxyMiddleware());
      return app;
    }

    it('returns middleware function', () => {
      const middleware = clerkFrontendApiProxyMiddleware();
      expect(typeof middleware).toBe('function');
    });

    it('proxies GET requests', async () => {
      mockProxy.mockResolvedValue(
        new Response(JSON.stringify({ client: {} }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const app = createApp();
      const response = await supertest(app).get('/__clerk/v1/client');

      expect(mockProxy).toHaveBeenCalledTimes(1);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ client: {} });
    });

    it('proxies POST requests', async () => {
      mockProxy.mockResolvedValue(
        new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const app = createApp();
      const response = await supertest(app).post('/__clerk/v1/sign_ups').send({ email: 'test@example.com' });

      expect(mockProxy).toHaveBeenCalledTimes(1);
      expect(response.status).toBe(200);
    });

    it('passes through error status codes', async () => {
      mockProxy.mockResolvedValue(
        new Response(JSON.stringify({ errors: [{ message: 'Unauthorized' }] }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      const app = createApp();
      const response = await supertest(app).get('/__clerk/v1/client');

      expect(response.status).toBe(401);
    });

    it('uses baseUrl as proxyPath', async () => {
      mockProxy.mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));

      const app: Application = express();
      app.use('/custom-proxy', clerkFrontendApiProxyMiddleware());

      await supertest(app).get('/custom-proxy/v1/client');

      expect(mockProxy).toHaveBeenCalledWith(
        expect.any(Request),
        expect.objectContaining({
          proxyPath: '/custom-proxy',
        }),
      );
    });

    it('uses custom publishableKey and secretKey when provided', async () => {
      mockProxy.mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));

      const app: Application = express();
      app.use(
        '/__clerk',
        clerkFrontendApiProxyMiddleware({
          publishableKey: 'pk_custom',
          secretKey: 'sk_custom',
        }),
      );

      await supertest(app).get('/__clerk/v1/client');

      expect(mockProxy).toHaveBeenCalledWith(
        expect.any(Request),
        expect.objectContaining({
          publishableKey: 'pk_custom',
          secretKey: 'sk_custom',
        }),
      );
    });

    it('forwards response headers', async () => {
      mockProxy.mockResolvedValue(
        new Response(JSON.stringify({}), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'X-Custom-Header': 'custom-value',
          },
        }),
      );

      const app = createApp();
      const response = await supertest(app).get('/__clerk/v1/client');

      expect(response.headers['content-type']).toContain('application/json');
      expect(response.headers['x-custom-header']).toBe('custom-value');
    });
  });

  describe('requestToProxyRequest', () => {
    it('converts Express request to Fetch Request', () => {
      const mockExpressReq = {
        method: 'GET',
        protocol: 'https',
        secure: true,
        originalUrl: '/__clerk/v1/client',
        url: '/__clerk/v1/client',
        headers: {
          host: 'example.com',
          'user-agent': 'Test Agent',
        },
        get: (header: string) => {
          const headers: Record<string, string> = {
            host: 'example.com',
            'user-agent': 'Test Agent',
          };
          return headers[header.toLowerCase()];
        },
      } as any;

      const request = requestToProxyRequest(mockExpressReq);

      expect(request.method).toBe('GET');
      expect(request.url).toBe('https://example.com/__clerk/v1/client');
      expect(request.headers.get('host')).toBe('example.com');
      expect(request.headers.get('user-agent')).toBe('Test Agent');
    });

    it('includes body for POST requests', () => {
      // Create a real Readable stream with Express-like properties
      const mockStream = new Readable({
        read() {
          this.push(JSON.stringify({ email: 'test@example.com' }));
          this.push(null);
        },
      });

      // Add Express-specific properties to the stream
      const mockExpressReq = Object.assign(mockStream, {
        method: 'POST',
        protocol: 'https',
        secure: true,
        originalUrl: '/__clerk/v1/sign_ups',
        url: '/__clerk/v1/sign_ups',
        headers: {
          host: 'example.com',
          'content-type': 'application/json',
        },
        get: (header: string) => {
          const headers: Record<string, string> = {
            host: 'example.com',
            'content-type': 'application/json',
          };
          return headers[header.toLowerCase()];
        },
      }) as any;

      const request = requestToProxyRequest(mockExpressReq);

      expect(request.method).toBe('POST');
      // Body should be defined for POST
      expect(request.body).toBeDefined();
    });

    it('does not include body for GET requests', () => {
      const mockExpressReq = {
        method: 'GET',
        protocol: 'https',
        secure: true,
        originalUrl: '/__clerk/v1/client',
        url: '/__clerk/v1/client',
        headers: {
          host: 'example.com',
        },
        get: (header: string) => {
          const headers: Record<string, string> = {
            host: 'example.com',
          };
          return headers[header.toLowerCase()];
        },
      } as any;

      const request = requestToProxyRequest(mockExpressReq);

      expect(request.body).toBeNull();
    });

    it('handles array header values', () => {
      const mockExpressReq = {
        method: 'GET',
        protocol: 'https',
        secure: true,
        originalUrl: '/__clerk/v1/client',
        url: '/__clerk/v1/client',
        headers: {
          host: 'example.com',
          'accept-encoding': ['gzip', 'deflate'],
        },
        get: (header: string) => {
          const headers: Record<string, string> = {
            host: 'example.com',
          };
          return headers[header.toLowerCase()];
        },
      } as any;

      const request = requestToProxyRequest(mockExpressReq);

      expect(request.headers.get('accept-encoding')).toBe('gzip, deflate');
    });

    it('uses http protocol when not secure', () => {
      const mockExpressReq = {
        method: 'GET',
        protocol: 'http',
        secure: false,
        originalUrl: '/__clerk/v1/client',
        url: '/__clerk/v1/client',
        headers: {
          host: 'localhost:3000',
        },
        get: (header: string) => {
          const headers: Record<string, string> = {
            host: 'localhost:3000',
          };
          return headers[header.toLowerCase()];
        },
      } as any;

      const request = requestToProxyRequest(mockExpressReq);

      expect(request.url).toBe('http://localhost:3000/__clerk/v1/client');
    });
  });

  describe('exports', () => {
    it('exports all required functions and constants', async () => {
      const proxyModule = await import('../proxy');

      expect(proxyModule).toHaveProperty('clerkFrontendApiProxyMiddleware');
      expect(proxyModule).toHaveProperty('DEFAULT_PROXY_PATH');
    });
  });
});
