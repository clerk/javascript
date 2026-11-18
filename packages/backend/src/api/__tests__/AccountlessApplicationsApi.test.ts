import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '../../mock-server';
import { createBackendApiClient } from '../factory';

describe('AccountlessApplications', () => {
  const mockAccountlessApplication = {
    object: 'accountless_application',
    publishable_key: 'pk_test_keyless',
    secret_key: 'sk_test_keyless',
    claim_url: 'https://dashboard.clerk.com/claim',
    api_keys_url: 'https://dashboard.clerk.com/api-keys',
  };

  it('creates an accountless application with a source query parameter', async () => {
    const apiClient = createBackendApiClient({
      apiUrl: 'https://api.clerk.test',
    });

    server.use(
      http.post('https://api.clerk.test/v1/accountless_applications', ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get('source')).toBe('nextjs');
        expect(request.headers.get('Clerk-API-Version')).toBeTruthy();
        expect(request.headers.get('User-Agent')).toBe('@clerk/backend@0.0.0-test');

        return HttpResponse.json(mockAccountlessApplication);
      }),
    );

    const response = await apiClient.__experimental_accountlessApplications.createAccountlessApplication({
      source: 'nextjs',
    });

    expect(response.publishableKey).toBe('pk_test_keyless');
  });

  it('creates an accountless application without a source query parameter when source is omitted', async () => {
    const apiClient = createBackendApiClient({
      apiUrl: 'https://api.clerk.test',
    });

    server.use(
      http.post('https://api.clerk.test/v1/accountless_applications', ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.has('source')).toBe(false);

        return HttpResponse.json(mockAccountlessApplication);
      }),
    );

    const response = await apiClient.__experimental_accountlessApplications.createAccountlessApplication();

    expect(response.publishableKey).toBe('pk_test_keyless');
  });

  it('completes accountless application onboarding with a source query parameter', async () => {
    const apiClient = createBackendApiClient({
      apiUrl: 'https://api.clerk.test',
    });

    server.use(
      http.post('https://api.clerk.test/v1/accountless_applications/complete', ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get('source')).toBe('nextjs');
        expect(request.headers.get('Clerk-API-Version')).toBeTruthy();
        expect(request.headers.get('User-Agent')).toBe('@clerk/backend@0.0.0-test');

        return HttpResponse.json(mockAccountlessApplication);
      }),
    );

    const response = await apiClient.__experimental_accountlessApplications.completeAccountlessApplicationOnboarding({
      source: 'nextjs',
    });

    expect(response.publishableKey).toBe('pk_test_keyless');
  });

  it('completes accountless application onboarding without a source query parameter when source is omitted', async () => {
    const apiClient = createBackendApiClient({
      apiUrl: 'https://api.clerk.test',
    });

    server.use(
      http.post('https://api.clerk.test/v1/accountless_applications/complete', ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.has('source')).toBe(false);

        return HttpResponse.json(mockAccountlessApplication);
      }),
    );

    const response = await apiClient.__experimental_accountlessApplications.completeAccountlessApplicationOnboarding();

    expect(response.publishableKey).toBe('pk_test_keyless');
  });
});
