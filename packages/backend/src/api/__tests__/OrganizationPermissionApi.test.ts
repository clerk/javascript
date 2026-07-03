import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server, validateHeaders } from '../../mock-server';
import { createBackendApiClient } from '../factory';

describe('OrganizationPermissionAPI', () => {
  const apiClient = createBackendApiClient({
    apiUrl: 'https://api.clerk.test',
    secretKey: 'deadbeef',
  });

  const permissionId = 'perm_123';

  const mockPermission = {
    object: 'permission',
    id: permissionId,
    name: 'Manage Billing',
    key: 'org:billing:manage',
    description: 'Allows managing billing',
    created_at: 1640995200,
    updated_at: 1640995200,
  };

  const mockPaginatedResponse = {
    data: [mockPermission],
    total_count: 1,
  };

  it('lists organization permissions with query parameters', async () => {
    server.use(
      http.get(
        'https://api.clerk.test/v1/organization_permissions',
        validateHeaders(({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('limit')).toBe('10');
          expect(url.searchParams.get('offset')).toBe('5');
          expect(url.searchParams.get('query')).toBe('billing');
          expect(url.searchParams.get('order_by')).toBe('-created_at');
          return HttpResponse.json(mockPaginatedResponse);
        }),
      ),
    );

    const response = await apiClient.organizationPermissions.getOrganizationPermissionList({
      limit: 10,
      offset: 5,
      query: 'billing',
      orderBy: '-created_at',
    });

    expect(response.data).toHaveLength(1);
    expect(response.totalCount).toBe(1);
    expect(response.data[0].key).toBe('org:billing:manage');
  });

  it('fetches an organization permission by ID', async () => {
    server.use(
      http.get(
        `https://api.clerk.test/v1/organization_permissions/${permissionId}`,
        validateHeaders(() => HttpResponse.json(mockPermission)),
      ),
    );

    const response = await apiClient.organizationPermissions.getOrganizationPermission(permissionId);

    expect(response.id).toBe(permissionId);
    expect(response.name).toBe('Manage Billing');
  });

  it('creates an organization permission', async () => {
    const createParams = {
      name: 'Manage Billing',
      key: 'org:billing:manage',
      description: 'Allows managing billing',
    };

    server.use(
      http.post(
        'https://api.clerk.test/v1/organization_permissions',
        validateHeaders(async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual(createParams);
          return HttpResponse.json(mockPermission);
        }),
      ),
    );

    const response = await apiClient.organizationPermissions.createOrganizationPermission(createParams);

    expect(response.id).toBe(permissionId);
  });

  it('updates an organization permission', async () => {
    server.use(
      http.patch(
        `https://api.clerk.test/v1/organization_permissions/${permissionId}`,
        validateHeaders(async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual({ name: 'Updated' });
          return HttpResponse.json({ ...mockPermission, name: 'Updated' });
        }),
      ),
    );

    const response = await apiClient.organizationPermissions.updateOrganizationPermission({
      permissionId,
      name: 'Updated',
    });

    expect(response.name).toBe('Updated');
  });

  it('deletes an organization permission', async () => {
    server.use(
      http.delete(
        `https://api.clerk.test/v1/organization_permissions/${permissionId}`,
        validateHeaders(() => HttpResponse.json({ object: 'permission', id: permissionId, deleted: true })),
      ),
    );

    const response = await apiClient.organizationPermissions.deleteOrganizationPermission(permissionId);

    expect(response.id).toBe(permissionId);
    expect(response.deleted).toBe(true);
  });
});
