import { http, HttpResponse } from 'msw';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';

import { server, validateHeaders } from '../../mock-server';
import { createBackendApiClient } from '../factory';
import type { PaginatedResourceResponse } from '../resources/Deserializer';
import type { OrganizationInvitation } from '../resources/OrganizationInvitation';

describe('OrganizationAPI', () => {
  const apiClient = createBackendApiClient({
    apiUrl: 'https://api.clerk.test',
    secretKey: 'deadbeef',
  });

  const organizationId = 'org_123';

  const mockOrgResponse = {
    object: 'organization',
    id: organizationId,
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

      server.use(
        http.patch(`https://api.clerk.test/v1/organizations/${organizationId}`, validateHeaders(patchHandler)),
      );

      const response = await apiClient.organizations.updateOrganization(organizationId, { name: 'New Name' });

      expect(patchHandler).toHaveBeenCalledTimes(1);
      expect(response.id).toBe(organizationId);
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
        http.patch(`https://api.clerk.test/v1/organizations/${organizationId}`, validateHeaders(patchHandler)),
        http.put(`https://api.clerk.test/v1/organizations/${organizationId}/metadata`, validateHeaders(putHandler)),
      );

      const response = await apiClient.organizations.updateOrganization(organizationId, {
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
        http.patch(`https://api.clerk.test/v1/organizations/${organizationId}`, validateHeaders(patchHandler)),
        http.put(`https://api.clerk.test/v1/organizations/${organizationId}/metadata`, validateHeaders(putHandler)),
      );

      const response = await apiClient.organizations.updateOrganization(organizationId, {
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

      server.use(
        http.put(`https://api.clerk.test/v1/organizations/${organizationId}/metadata`, validateHeaders(putHandler)),
      );

      await apiClient.organizations.updateOrganization(organizationId, {
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

      server.use(
        http.patch(`https://api.clerk.test/v1/organizations/${organizationId}/metadata`, validateHeaders(patchHandler)),
      );

      await apiClient.organizations.updateOrganizationMetadata(organizationId, {
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

      server.use(
        http.put(`https://api.clerk.test/v1/organizations/${organizationId}/metadata`, validateHeaders(putHandler)),
      );

      const response = await apiClient.organizations.replaceOrganizationMetadata(organizationId, {
        publicMetadata: { replaced: true },
      });

      expect(putHandler).toHaveBeenCalledTimes(1);
      expect(response.publicMetadata).toEqual({ replaced: true });
    });
  });

  describe('createOrganizationInvitationBulk', () => {
    const mockInvitation = {
      object: 'organization_invitation',
      id: 'orginv_1',
      email_address: 'one@example.com',
      role: 'org:member',
      role_name: 'Member',
      organization_id: organizationId,
      status: 'pending',
      public_metadata: {},
      private_metadata: {},
      url: null,
      created_at: 1640995200,
      updated_at: 1640995200,
      expires_at: 1643673600,
    };

    it('returns a paginated { data, totalCount } response matching the Backend API shape', async () => {
      server.use(
        http.post(
          `https://api.clerk.test/v1/organizations/${organizationId}/invitations/bulk`,
          validateHeaders(async ({ request }) => {
            const body = (await request.json()) as Array<Record<string, unknown>>;
            expect(body).toHaveLength(2);
            expect(body[0]).toMatchObject({
              email_address: 'one@example.com',
              role: 'org:member',
              inviter_user_id: 'user_1',
            });

            return HttpResponse.json({
              data: [mockInvitation, { ...mockInvitation, id: 'orginv_2', email_address: 'two@example.com' }],
              total_count: 2,
            });
          }),
        ),
      );

      const response = await apiClient.organizations.createOrganizationInvitationBulk(organizationId, [
        { emailAddress: 'one@example.com', role: 'org:member', inviterUserId: 'user_1' },
        { emailAddress: 'two@example.com', role: 'org:member', inviterUserId: 'user_1' },
      ]);

      expect(response.data).toHaveLength(2);
      expect(response.data[0].emailAddress).toBe('one@example.com');
      expect(response.data[0].organizationId).toBe(organizationId);
      expect(response.totalCount).toBe(2);

      expectTypeOf(response).toEqualTypeOf<PaginatedResourceResponse<OrganizationInvitation[]>>();
    });
  });
});
