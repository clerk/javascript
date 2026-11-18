import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server, validateHeaders } from '../../mock-server';
import { createBackendApiClient } from '../factory';

describe('RoleSetAPI', () => {
  const apiClient = createBackendApiClient({
    apiUrl: 'https://api.clerk.test',
    secretKey: 'deadbeef',
  });

  const roleSetId = 'role_set_123';
  const roleSetKey = 'role_set:default';

  const mockRoleSetItem = {
    object: 'role_set_item',
    id: 'role_123',
    name: 'Admin',
    key: 'org:admin',
    description: null,
    created_at: 1640995200,
    updated_at: 1640995200,
  };

  const mockRoleSet = {
    object: 'role_set',
    id: roleSetId,
    name: 'Default',
    key: roleSetKey,
    description: null,
    roles: [mockRoleSetItem],
    default_role: mockRoleSetItem,
    creator_role: mockRoleSetItem,
    type: 'custom',
    role_set_migration: null,
    created_at: 1640995200,
    updated_at: 1640995200,
  };

  const mockPaginatedResponse = {
    data: [mockRoleSet],
    total_count: 1,
  };

  it('lists role sets with query parameters', async () => {
    server.use(
      http.get(
        'https://api.clerk.test/v1/role_sets',
        validateHeaders(({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('limit')).toBe('10');
          expect(url.searchParams.get('query')).toBe('default');
          return HttpResponse.json(mockPaginatedResponse);
        }),
      ),
    );

    const response = await apiClient.roleSets.getRoleSetList({ limit: 10, query: 'default' });

    expect(response.data).toHaveLength(1);
    expect(response.totalCount).toBe(1);
    expect(response.data[0].roles).toHaveLength(1);
    expect(response.data[0].defaultRole?.key).toBe('org:admin');
  });

  it('fetches a role set by key or ID', async () => {
    server.use(
      http.get(
        `https://api.clerk.test/v1/role_sets/${roleSetKey}`,
        validateHeaders(() => HttpResponse.json(mockRoleSet)),
      ),
    );

    const response = await apiClient.roleSets.getRoleSet(roleSetKey);

    expect(response.id).toBe(roleSetId);
    expect(response.creatorRole?.key).toBe('org:admin');
  });

  it('creates a role set', async () => {
    const createParams = {
      name: 'Default',
      default_role_key: 'org:member',
      creator_role_key: 'org:admin',
      roles: ['org:admin', 'org:member'],
    };

    server.use(
      http.post(
        'https://api.clerk.test/v1/role_sets',
        validateHeaders(async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual(createParams);
          return HttpResponse.json(mockRoleSet);
        }),
      ),
    );

    const response = await apiClient.roleSets.createRoleSet({
      name: 'Default',
      defaultRoleKey: 'org:member',
      creatorRoleKey: 'org:admin',
      roles: ['org:admin', 'org:member'],
    });

    expect(response.id).toBe(roleSetId);
  });

  it('updates a role set', async () => {
    server.use(
      http.patch(
        `https://api.clerk.test/v1/role_sets/${roleSetId}`,
        validateHeaders(async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual({ name: 'Updated' });
          return HttpResponse.json({ ...mockRoleSet, name: 'Updated' });
        }),
      ),
    );

    const response = await apiClient.roleSets.updateRoleSet({ roleSetKeyOrId: roleSetId, name: 'Updated' });

    expect(response.name).toBe('Updated');
  });

  it('adds roles to a role set', async () => {
    server.use(
      http.post(
        `https://api.clerk.test/v1/role_sets/${roleSetId}/roles`,
        validateHeaders(async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual({ role_keys: ['org:billing'] });
          return HttpResponse.json(mockRoleSet);
        }),
      ),
    );

    const response = await apiClient.roleSets.addRolesToRoleSet({
      roleSetKeyOrId: roleSetId,
      roleKeys: ['org:billing'],
    });

    expect(response.id).toBe(roleSetId);
  });

  it('replaces a role in a role set', async () => {
    server.use(
      http.post(
        `https://api.clerk.test/v1/role_sets/${roleSetId}/roles/replace`,
        validateHeaders(async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual({ role_key: 'org:member', to_role_key: 'org:admin' });
          return HttpResponse.json(mockRoleSet);
        }),
      ),
    );

    const response = await apiClient.roleSets.replaceRoleInRoleSet({
      roleSetKeyOrId: roleSetId,
      roleKey: 'org:member',
      toRoleKey: 'org:admin',
    });

    expect(response.id).toBe(roleSetId);
  });

  it('replaces a role set', async () => {
    server.use(
      http.post(
        `https://api.clerk.test/v1/role_sets/${roleSetId}/replace`,
        validateHeaders(async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual({
            dest_role_set_key: 'role_set:new',
            reassignment_mappings: { 'org:member': 'org:admin' },
          });
          return HttpResponse.json({ object: 'role_set', id: roleSetId, deleted: true });
        }),
      ),
    );

    const response = await apiClient.roleSets.replaceRoleSet({
      roleSetKeyOrId: roleSetId,
      destRoleSetKey: 'role_set:new',
      reassignmentMappings: { 'org:member': 'org:admin' },
    });

    expect(response.id).toBe(roleSetId);
    expect(response.deleted).toBe(true);
  });
});
