import { ClerkAPIResponseError } from '@clerk/shared/error';
import { parsePublishableKey } from '@clerk/shared/keys';

import { stripTrailingSlashes } from './proxy';
import { runtime } from './runtime';

export function createPoppyClient(publishableKey: string | undefined) {
  return {
    /**
     * Fetches public POPPY metadata for the configured instance without sending credentials.
     * @experimental This API is subject to change.
     * @param options - Optional public proxy configuration.
     * @param options.proxyUrl - Absolute HTTP(S) proxy URL, including its path prefix. Omit to use the instance directly.
     * @returns The metadata document, unchanged, for a customer-hosted discovery route.
     * @example
     * ### Return metadata from a server route
     * ```ts
     * return Response.json(await clerkClient.__experimental_getPoppyMetadata());
     * ```
     * @example
     * ### Fetch through a customer-hosted proxy
     * ```ts
     * return Response.json(await clerkClient.__experimental_getPoppyMetadata({
     *   proxyUrl: new URL('/__clerk', request.url),
     * }));
     * ```
     */
    async __experimental_getPoppyMetadata(options?: { proxyUrl?: string | URL }): Promise<unknown> {
      let url: URL;
      if (options?.proxyUrl !== undefined) {
        url = new URL(options.proxyUrl);
        if (
          (url.protocol !== 'http:' && url.protocol !== 'https:') ||
          url.username ||
          url.password ||
          url.search ||
          url.hash
        ) {
          throw new Error('Proxy URL must use HTTP(S) without credentials, a query string, or a fragment.');
        }
        url.pathname = `${stripTrailingSlashes(url.pathname)}/.well-known/poppy.json`;
      } else {
        const { frontendApi } = parsePublishableKey(publishableKey, { fatal: true });
        url = new URL(`https://${frontendApi}`);
        if (
          url.host !== frontendApi ||
          url.username ||
          url.password ||
          url.pathname !== '/' ||
          url.search ||
          url.hash ||
          url.port
        ) {
          throw new Error('Publishable key has an invalid frontend API hostname.');
        }
        url.pathname = '/.well-known/poppy.json';
      }

      const response = await runtime.fetch(url, {
        headers: { Accept: 'application/json' },
        credentials: 'omit',
        redirect: 'error',
        cache: 'no-store',
      });

      if (!response.ok) {
        const body: unknown = await response.json().catch(() => null);
        const errors = isRecord(body) && Array.isArray(body.errors) ? body.errors.filter(isApiError) : [];
        throw new ClerkAPIResponseError(response.statusText, {
          status: response.status,
          data: errors,
          clerkTraceId:
            isRecord(body) && typeof body.clerk_trace_id === 'string'
              ? body.clerk_trace_id
              : response.headers.get('cf-ray') || undefined,
        });
      }

      return response.json();
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isApiError(value: unknown): value is { code: string; message: string } {
  return isRecord(value) && typeof value.code === 'string' && typeof value.message === 'string';
}
