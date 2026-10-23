import { ClerkAPIResponseError } from '@clerk/shared/error';
import { parsePublishableKey } from '@clerk/shared/keys';

import { runtime } from './runtime';

export function createPoppyClient(publishableKey: string | undefined) {
  return {
    /**
     * Fetches public POPPY metadata for the configured instance without sending credentials.
     * @experimental This API is subject to change.
     * @returns The metadata document, unchanged, for a customer-hosted discovery route.
     * @example
     * ### Return metadata from a server route
     * ```ts
     * return Response.json(await clerkClient.__experimental_getPoppyMetadata());
     * ```
     */
    async __experimental_getPoppyMetadata(): Promise<unknown> {
      const { frontendApi } = parsePublishableKey(publishableKey, { fatal: true });
      const origin = new URL(`https://${frontendApi}`);
      if (
        origin.host !== frontendApi ||
        origin.username ||
        origin.password ||
        origin.pathname !== '/' ||
        origin.search ||
        origin.hash ||
        origin.port
      ) {
        throw new Error('Publishable key has an invalid frontend API hostname.');
      }

      const response = await runtime.fetch(new URL('/.well-known/poppy.json', origin), {
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
