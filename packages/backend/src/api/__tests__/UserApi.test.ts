import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import { server, validateHeaders } from '../../mock-server';
import { createBackendApiClient } from '../factory';

describe('UserAPI', () => {
  const apiClient = createBackendApiClient({
    apiUrl: 'https://api.clerk.test',
    secretKey: 'deadbeef',
  });

  const mockUserResponse = {
    object: 'user',
    id: 'user_123',
    public_metadata: {},
    private_metadata: {},
    unsafe_metadata: {},
  };

  describe('updateUser', () => {
    it('calls PATCH /users/{id} when no metadata fields are provided', async () => {
      const patchHandler = vi.fn(async ({ request }: { request: Request }) => {
        const body = await request.json();
        expect(body).toEqual({ first_name: 'Jane' });
        return HttpResponse.json(mockUserResponse);
      });

      server.use(http.patch('https://api.clerk.test/v1/users/user_123', validateHeaders(patchHandler)));

      const response = await apiClient.users.updateUser('user_123', { firstName: 'Jane' });

      expect(patchHandler).toHaveBeenCalledTimes(1);
      expect(response.id).toBe('user_123');
    });

    it('routes metadata to PUT /users/{id}/metadata when only metadata is provided', async () => {
      const patchHandler = vi.fn(() => HttpResponse.json(mockUserResponse));
      const putHandler = vi.fn(async ({ request }: { request: Request }) => {
        const body = await request.json();
        expect(body).toEqual({
          public_metadata: { foo: 'bar' },
        });
        return HttpResponse.json({
          ...mockUserResponse,
          public_metadata: { foo: 'bar' },
        });
      });

      server.use(
        http.patch('https://api.clerk.test/v1/users/user_123', validateHeaders(patchHandler)),
        http.put('https://api.clerk.test/v1/users/user_123/metadata', validateHeaders(putHandler)),
      );

      const response = await apiClient.users.updateUser('user_123', {
        publicMetadata: { foo: 'bar' },
      });

      expect(patchHandler).not.toHaveBeenCalled();
      expect(putHandler).toHaveBeenCalledTimes(1);
      expect(response.publicMetadata).toEqual({ foo: 'bar' });
    });

    it('splits mixed calls: PATCH for non-metadata, then PUT for metadata', async () => {
      const calls: string[] = [];

      const patchHandler = vi.fn(async ({ request }: { request: Request }) => {
        calls.push('patch');
        const body = await request.json();
        expect(body).toEqual({ first_name: 'Jane' });
        return HttpResponse.json(mockUserResponse);
      });

      const putHandler = vi.fn(async ({ request }: { request: Request }) => {
        calls.push('put');
        const body = await request.json();
        expect(body).toEqual({
          public_metadata: { plan: 'pro' },
          private_metadata: { invoice: 'inv_1' },
        });
        return HttpResponse.json({
          ...mockUserResponse,
          first_name: 'Jane',
          public_metadata: { plan: 'pro' },
          private_metadata: { invoice: 'inv_1' },
        });
      });

      server.use(
        http.patch('https://api.clerk.test/v1/users/user_123', validateHeaders(patchHandler)),
        http.put('https://api.clerk.test/v1/users/user_123/metadata', validateHeaders(putHandler)),
      );

      const response = await apiClient.users.updateUser('user_123', {
        firstName: 'Jane',
        publicMetadata: { plan: 'pro' },
        privateMetadata: { invoice: 'inv_1' },
      });

      expect(patchHandler).toHaveBeenCalledTimes(1);
      expect(putHandler).toHaveBeenCalledTimes(1);
      // PATCH must run before PUT so the user state from PUT is the latest.
      expect(calls).toEqual(['patch', 'put']);
      expect(response.firstName).toBe('Jane');
      expect(response.publicMetadata).toEqual({ plan: 'pro' });
    });

    it('passes only metadata fields that were explicitly provided to PUT', async () => {
      const putHandler = vi.fn(async ({ request }: { request: Request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        // Only unsafe_metadata was provided. The other two should be undefined,
        // which serializes to "field omitted" on the wire — leaving those
        // columns untouched server-side.
        expect(body.unsafe_metadata).toEqual({ device: 'mobile' });
        expect(body).not.toHaveProperty('public_metadata');
        expect(body).not.toHaveProperty('private_metadata');
        return HttpResponse.json({
          ...mockUserResponse,
          unsafe_metadata: { device: 'mobile' },
        });
      });

      server.use(http.put('https://api.clerk.test/v1/users/user_123/metadata', validateHeaders(putHandler)));

      await apiClient.users.updateUser('user_123', {
        unsafeMetadata: { device: 'mobile' },
      });

      expect(putHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateUserMetadata', () => {
    it('still hits PATCH /users/{id}/metadata (unchanged)', async () => {
      const patchHandler = vi.fn(async ({ request }: { request: Request }) => {
        const body = await request.json();
        expect(body).toEqual({
          public_metadata: { merge: true },
        });
        return HttpResponse.json({
          ...mockUserResponse,
          public_metadata: { merge: true },
        });
      });

      server.use(http.patch('https://api.clerk.test/v1/users/user_123/metadata', validateHeaders(patchHandler)));

      await apiClient.users.updateUserMetadata('user_123', {
        publicMetadata: { merge: true },
      });

      expect(patchHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('replaceUserMetadata', () => {
    it('hits PUT /users/{id}/metadata', async () => {
      const putHandler = vi.fn(async ({ request }: { request: Request }) => {
        const body = await request.json();
        expect(body).toEqual({
          public_metadata: { replaced: true },
        });
        return HttpResponse.json({
          ...mockUserResponse,
          public_metadata: { replaced: true },
        });
      });

      server.use(http.put('https://api.clerk.test/v1/users/user_123/metadata', validateHeaders(putHandler)));

      const response = await apiClient.users.replaceUserMetadata('user_123', {
        publicMetadata: { replaced: true },
      });

      expect(putHandler).toHaveBeenCalledTimes(1);
      expect(response.publicMetadata).toEqual({ replaced: true });
    });
  });
});
