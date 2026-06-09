import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import { server, validateHeaders } from '../../mock-server';
import { createBackendApiClient } from '../factory';

describe('OrganizationAPI', () => {
  const apiClient = createBackendApiClient({
    apiUrl: 'https://api.clerk.test',
    secretKey: 'deadbeef',
  });

  const mockOrgResponse = {
    object: 'organization',
    id: 'org_123',
    name: 'Test Org',
    slug: 'test-org',
    public_metadata: {},
    private_metadata: {},
  };

  describe('updateOrganization', () => {
    it('calls PATCH /organizations/{id} when no metadata fields are provided', async () => {
      const patchHandler = vi.fn(async ({ request }: { request: Request }) => {
        const body = await request.json();
        expect(body).toEqual({ name: 'New Name' });
        return HttpResponse.json(mockOrgResponse);
      });

      server.use(http.patch('https://api.clerk.test/v1/organizations/org_123', validateHeaders(patchHandler)));

      const response = await apiClient.organizations.updateOrganization('org_123', { name: 'New Name' });

      expect(patchHandler).toHaveBeenCalledTimes(1);
      expect(response.id).toBe('org_123');
    });

    it('routes metadata to PUT /organizations/{id}/metadata when only metadata is provided', async () => {
      const patchHandler = vi.fn(() => HttpResponse.json(mockOrgResponse));
      const putHandler = vi.fn(async ({ request }: { request: Request }) => {
        const body = await request.json();
        expect(body).toEqual({
          public_metadata: { foo: 'bar' },
        });
        return HttpResponse.json({
          ...mockOrgResponse,
          public_metadata: { foo: 'bar' },
        });
      });

      server.use(
        http.patch('https://api.clerk.test/v1/organizations/org_123', validateHeaders(patchHandler)),
        http.put('https://api.clerk.test/v1/organizations/org_123/metadata', validateHeaders(putHandler)),
      );

      const response = await apiClient.organizations.updateOrganization('org_123', {
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
        expect(body).toEqual({ name: 'New Name' });
        return HttpResponse.json(mockOrgResponse);
      });

      const putHandler = vi.fn(async ({ request }: { request: Request }) => {
        calls.push('put');
        const body = await request.json();
        expect(body).toEqual({
          public_metadata: { plan: 'pro' },
          private_metadata: { invoice: 'inv_1' },
        });
        return HttpResponse.json({
          ...mockOrgResponse,
          name: 'New Name',
          public_metadata: { plan: 'pro' },
          private_metadata: { invoice: 'inv_1' },
        });
      });

      server.use(
        http.patch('https://api.clerk.test/v1/organizations/org_123', validateHeaders(patchHandler)),
        http.put('https://api.clerk.test/v1/organizations/org_123/metadata', validateHeaders(putHandler)),
      );

      const response = await apiClient.organizations.updateOrganization('org_123', {
        name: 'New Name',
        publicMetadata: { plan: 'pro' },
        privateMetadata: { invoice: 'inv_1' },
      });

      expect(patchHandler).toHaveBeenCalledTimes(1);
      expect(putHandler).toHaveBeenCalledTimes(1);
      expect(calls).toEqual(['patch', 'put']);
      expect(response.name).toBe('New Name');
      expect(response.publicMetadata).toEqual({ plan: 'pro' });
    });

    it('passes only metadata fields that were explicitly provided to PUT', async () => {
      const putHandler = vi.fn(async ({ request }: { request: Request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        expect(body.private_metadata).toEqual({ secret: 'value' });
        expect(body).not.toHaveProperty('public_metadata');
        return HttpResponse.json({
          ...mockOrgResponse,
          private_metadata: { secret: 'value' },
        });
      });

      server.use(http.put('https://api.clerk.test/v1/organizations/org_123/metadata', validateHeaders(putHandler)));

      await apiClient.organizations.updateOrganization('org_123', {
        privateMetadata: { secret: 'value' },
      });

      expect(putHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateOrganizationMetadata', () => {
    it('still hits PATCH /organizations/{id}/metadata (unchanged)', async () => {
      const patchHandler = vi.fn(async ({ request }: { request: Request }) => {
        const body = await request.json();
        expect(body).toEqual({
          public_metadata: { merge: true },
        });
        return HttpResponse.json({
          ...mockOrgResponse,
          public_metadata: { merge: true },
        });
      });

      server.use(http.patch('https://api.clerk.test/v1/organizations/org_123/metadata', validateHeaders(patchHandler)));

      await apiClient.organizations.updateOrganizationMetadata('org_123', {
        publicMetadata: { merge: true },
      });

      expect(patchHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('replaceOrganizationMetadata', () => {
    it('hits PUT /organizations/{id}/metadata', async () => {
      const putHandler = vi.fn(async ({ request }: { request: Request }) => {
        const body = await request.json();
        expect(body).toEqual({
          public_metadata: { replaced: true },
        });
        return HttpResponse.json({
          ...mockOrgResponse,
          public_metadata: { replaced: true },
        });
      });

      server.use(http.put('https://api.clerk.test/v1/organizations/org_123/metadata', validateHeaders(putHandler)));

      const response = await apiClient.organizations.replaceOrganizationMetadata('org_123', {
        publicMetadata: { replaced: true },
      });

      expect(putHandler).toHaveBeenCalledTimes(1);
      expect(response.publicMetadata).toEqual({ replaced: true });
    });
  });
});
