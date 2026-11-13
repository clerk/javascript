import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '../../mock-server';
import { createBackendApiClient } from '../factory';

describe('ArtifactsAPI', () => {
  const frontendApi = 'https://clerk.company.example';

  it('gets discovery from the authenticated Backend API artifact without changing the document', async () => {
    const metadata = {
      protocol_version: '0.4',
      organization: { name: 'Company', domain: 'company.example' },
      web: { browser_session_endpoint: `${frontendApi}/v1/poppy/browser_sessions`, unscoped: true },
      auth: {
        issuer: frontendApi,
        scopes: {
          'poppy:browser-sign-in': 'Browse the website, and see and do anything your account can do there.',
          profile: 'Your basic profile information',
        },
      },
    };
    server.use(
      http.get('https://api.clerk.test/v1/artifacts/well-known-poppy', ({ request }) => {
        expect(request.headers.get('Authorization')).toBe('Bearer sk_live_example');
        expect(new URL(request.url).search).toBe('');
        return HttpResponse.json({ object: 'artifact', data: metadata });
      }),
    );
    const { artifacts } = createBackendApiClient({
      apiUrl: 'https://api.clerk.test',
      secretKey: 'sk_live_example',
    });
    await expect(artifacts.__experimental_getPoppyJson()).resolves.toEqual(metadata);
  });

  it.each([
    {
      status: 401,
      code: 'clerk_key_invalid',
      message: 'The provided Clerk Secret Key is invalid. Make sure that your Clerk Secret Key is correct.',
      long_message: 'The provided Clerk Secret Key is invalid. Make sure that your Clerk Secret Key is correct.',
    },
    { status: 404, code: 'resource_not_found', message: 'not found', long_message: 'Resource not found' },
    {
      status: 500,
      code: 'internal_clerk_error',
      message: 'Oops, an unexpected error occurred',
      long_message: "There was an internal error on our servers. We've been notified and are working on fixing it.",
    },
    {
      status: 503,
      code: 'service_unavailable',
      message: 'Service unavailable',
      long_message: 'Service unavailable',
    },
  ])('propagates Backend API artifact status $status ($code)', async ({ status, ...error }) => {
    const traceId = 'trace_id_artifact';
    server.use(
      http.get('https://api.clerk.test/v1/artifacts/well-known-poppy', () =>
        HttpResponse.json({ errors: [error], clerk_trace_id: traceId }, { status }),
      ),
    );
    const { artifacts } = createBackendApiClient({
      apiUrl: 'https://api.clerk.test',
      secretKey: 'sk_live_example',
    });
    await expect(artifacts.__experimental_getPoppyJson()).rejects.toMatchObject({
      status,
      clerkTraceId: traceId,
      errors: [{ code: error.code, message: error.message, longMessage: error.long_message }],
    });
  });
});
