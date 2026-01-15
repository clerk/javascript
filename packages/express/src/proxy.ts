import { Readable } from 'stream';

import { clerkFrontendApiProxy, type FrontendApiProxyOptions } from '@clerk/backend/proxy';
import type { NextFunction, Request as ExpressRequest, Response as ExpressResponse } from 'express';

import { loadApiEnv, loadClientEnv, requestToProxyRequest } from './utils';

export { DEFAULT_PROXY_PATH, type FrontendApiProxyOptions } from '@clerk/backend/proxy';

/**
 * Options for the Express Frontend API proxy middleware
 */
export interface ExpressFrontendApiProxyOptions extends Omit<FrontendApiProxyOptions, 'proxyPath'> {}

/**
 * Creates Express middleware that proxies requests to Clerk's Frontend API.
 *
 * This middleware handles forwarding requests from your application to Clerk's
 * Frontend API, enabling scenarios where direct communication with Clerk's API
 * is blocked or needs to go through your application server.
 *
 * @param options - Proxy configuration options
 * @returns Express middleware handler
 *
 * @example
 * ```typescript
 * import express from 'express';
 * import { clerkFrontendApiProxyMiddleware } from '@clerk/express/proxy';
 *
 * const app = express();
 *
 * // Mount the proxy middleware at /__clerk
 * app.use('/__clerk', clerkFrontendApiProxyMiddleware());
 *
 * app.listen(3000);
 * ```
 *
 * @example
 * ```typescript
 * // With custom options
 * app.use('/__clerk', clerkFrontendApiProxyMiddleware({
 *   publishableKey: 'pk_...',
 *   secretKey: 'sk_...',
 * }));
 * ```
 */
export function clerkFrontendApiProxyMiddleware(options?: ExpressFrontendApiProxyOptions) {
  return async (req: ExpressRequest, res: ExpressResponse, _next: NextFunction) => {
    const clientEnv = loadClientEnv();
    const apiEnv = loadApiEnv();

    const publishableKey = options?.publishableKey || clientEnv.publishableKey;
    const secretKey = options?.secretKey || apiEnv.secretKey;

    // Convert Express request to Fetch API Request with body streaming
    const request = requestToProxyRequest(req);

    // The proxy path is determined by where this middleware is mounted in Express
    // We extract it from the request URL by looking at the baseUrl
    const proxyPath = req.baseUrl || '/__clerk';

    // Call the core proxy function
    const response = await clerkFrontendApiProxy(request, {
      proxyPath,
      publishableKey,
      secretKey,
    });

    // Set response status
    res.status(response.status);

    // Copy response headers
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // Stream the response body
    if (response.body) {
      const reader = response.body.getReader();
      const stream = new Readable({
        async read() {
          try {
            const { done, value } = await reader.read();
            if (done) {
              this.push(null);
            } else {
              this.push(Buffer.from(value));
            }
          } catch (error) {
            this.destroy(error instanceof Error ? error : new Error(String(error)));
          }
        },
      });
      stream.pipe(res);
    } else {
      res.end();
    }
  };
}
