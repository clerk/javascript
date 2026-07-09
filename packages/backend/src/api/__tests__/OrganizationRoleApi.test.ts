import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server, validateHeaders } from '../../mock-server';
import { createBackendApiClient } from '../factory';

describe('OrganizationRoleAPI', () => {
  const apiClient = createBackendApiClient({
    apiUrl: 'https://api.clerk.test',
    secretKey: 'deadbeef',
  });

  const roleId = 'role_123';
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

  const mockRole = {
    object: 'role',
    id: roleId,
    name: 'Billing Manager',
    key: 'org:billing_manager',
    description: null,
    is_creator_eligible: false,
    permissions: [mockPermission],
    created_at: 1640995200,
    updated_at: 1640995200,
  };

  const mockPaginatedResponse = {
    data: [mockRole],
    total_count: 1,
  };

  it('lists organization roles with query parameters', async () => {
    server.use(
      http.get(
        'https://api.clerk.test/v1/organization_roles',
        validateHeaders(({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('limit')).toBe('20');
          expect(url.searchParams.get('query')).toBe('billing');
          return HttpResponse.json(mockPaginatedResponse);
        }),
      ),
    );

    const response = await apiClient.organizationRoles.getOrganizationRoleList({ limit: 20, query: 'billing' });

    expect(response.data).toHaveLength(1);
    expect(response.totalCount).toBe(1);
    expect(response.data[0].permissions).toHaveLength(1);
    expect(response.data[0].permissions[0].key).toBe('org:billing:manage');
  });

  it('fetches an organization role by ID', async () => {
    server.use(
      http.get(
        `https://api.clerk.test/v1/organization_roles/${roleId}`,
        validateHeaders(() => HttpResponse.json(mockRole)),
      ),
    );

    const response = await apiClient.organizationRoles.getOrganizationRole(roleId);

    expect(response.id).toBe(roleId);
    expect(response.description).toBeNull();
  });

  it('creates an organization role', async () => {
    const createParams = {
      name: 'Billing Manager',
      key: 'org:billing_manager',
      permissions: [permissionId],
    };

    server.use(
      http.post(
        'https://api.clerk.test/v1/organization_roles',
        validateHeaders(async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual(createParams);
          return HttpResponse.json(mockRole);
        }),
      ),
    );

    const response = await apiClient.organizationRoles.createOrganizationRole(createParams);

    expect(response.id).toBe(roleId);
  });

  it('updates an organization role', async () => {
    server.use(
      http.patch(
        `https://api.clerk.test/v1/organization_roles/${roleId}`,
        validateHeaders(async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual({ name: 'Updated' });
          return HttpResponse.json({ ...mockRole, name: 'Updated' });
        }),
      ),
    );

    const response = await apiClient.organizationRoles.updateOrganizationRole({
      organizationRoleId: roleId,
      name: 'Updated',
    });

    expect(response.name).toBe('Updated');
  });

  it('deletes an organization role', async () => {
    server.use(
      http.delete(
        `https://api.clerk.test/v1/organization_roles/${roleId}`,
        validateHeaders(() => HttpResponse.json({ object: 'role', id: roleId, deleted: true })),
      ),
    );

    const response = await apiClient.organizationRoles.deleteOrganizationRole(roleId);

    expect(response.id).toBe(roleId);
    expect(response.deleted).toBe(true);
  });

  it('assigns a permission to an organization role', async () => {
    server.use(
      http.post(
        `https://api.clerk.test/v1/organization_roles/${roleId}/permissions/${permissionId}`,
        validateHeaders(() => HttpResponse.json(mockRole)),
      ),
    );

    const response = await apiClient.organizationRoles.assignPermissionToOrganizationRole({
      organizationRoleId: roleId,
      permissionId,
    });

    expect(response.id).toBe(roleId);
  });

  it('removes a permission from an organization role', async () => {
    server.use(
      http.delete(
        `https://api.clerk.test/v1/organization_roles/${roleId}/permissions/${permissionId}`,
        validateHeaders(() => HttpResponse.json(mockRole)),
      ),
    );

    const response = await apiClient.organizationRoles.removePermissionFromOrganizationRole({
      organizationRoleId: roleId,
      permissionId,
    });

    expect(response.id).toBe(roleId);
  });
});
