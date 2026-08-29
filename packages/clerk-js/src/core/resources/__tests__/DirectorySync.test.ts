import type { DirectorySyncJSON } from '@clerk/shared/types';
import { describe, expect, it, vi } from 'vitest';

import { BaseResource, DirectorySync } from '../internal';

const ORG_ID = 'org_123';
const DIRECTORY_PATH = `/organizations/${ORG_ID}/enterprise_connections/ec_123/directory`;

const directoryJSON: DirectorySyncJSON = {
  object: 'directory',
  id: 'scimdir_1',
  name: 'Acme Okta',
  enterprise_connection_id: 'ec_123',
  endpoint_url: 'https://api.example.com/scim/v2',
  provider: 'okta',
  enabled: false,
  group_role_mapping_enabled: false,
  attribute_mapping: { 'name.givenName': 'first_name' },
  created_at: 1700000000000,
  updated_at: 1700000000000,
};

function createDirectorySync(): DirectorySync {
  return new DirectorySync(directoryJSON, ORG_ID);
}

describe('DirectorySync', () => {
  it('scopes itself to the owning organization and connection', () => {
    const directory = createDirectorySync();

    expect(directory.organizationId).toBe(ORG_ID);
    expect(directory.enterpriseConnectionId).toBe('ec_123');
    expect(directory.apiKey).toBeNull();
    expect(directory.__internal_toSnapshot()).not.toHaveProperty('api_key');
  });

  it('updates the directory, serializing the attribute mapping as JSON', async () => {
    // @ts-ignore
    BaseResource._fetch = vi.fn().mockReturnValue(Promise.resolve({ response: { ...directoryJSON, enabled: true } }));

    const result = await createDirectorySync().update({
      enabled: true,
      attributeMapping: { 'name.familyName': 'last_name', 'name.givenName': null },
    });

    // @ts-ignore
    expect(BaseResource._fetch).toHaveBeenCalledWith({
      method: 'PATCH',
      path: DIRECTORY_PATH,
      body: {
        enabled: true,
        attribute_mapping: JSON.stringify({ 'name.familyName': 'last_name', 'name.givenName': null }),
      },
    });
    expect(result.enabled).toBe(true);
    expect(result.organizationId).toBe(ORG_ID);
  });

  it('rotates the bearer token', async () => {
    // @ts-ignore
    BaseResource._fetch = vi
      .fn()
      .mockReturnValue(Promise.resolve({ response: { ...directoryJSON, api_key: 'ak_new' } }));

    const result = await createDirectorySync().rotateToken();

    // @ts-ignore
    expect(BaseResource._fetch).toHaveBeenCalledWith({ method: 'POST', path: `${DIRECTORY_PATH}/rotate_api_key` });
    expect(result.apiKey).toBe('ak_new');
  });

  it('deletes the directory', async () => {
    // @ts-ignore
    BaseResource._fetch = vi
      .fn()
      .mockReturnValue(Promise.resolve({ response: { object: 'directory', id: 'scimdir_1', deleted: true } }));

    const result = await createDirectorySync().delete();

    // @ts-ignore
    expect(BaseResource._fetch).toHaveBeenCalledWith({ method: 'DELETE', path: DIRECTORY_PATH });
    expect(result.id).toBe('scimdir_1');
    expect(result.deleted).toBe(true);
  });

  it('lists provisioned directory users with pagination', async () => {
    const paginated = {
      data: [
        {
          object: 'directory_user' as const,
          id: 'scimdu_1',
          user_id: 'user_1',
          first_name: 'Ada',
          last_name: 'Lovelace',
          identifier: 'ada@example.com',
          image_url: '',
          has_image: false,
          active: true,
          provisioned_at: 1700000000000,
          updated_at: 1700000000000,
        },
      ],
      total_count: 1,
    };

    // @ts-ignore
    BaseResource._fetch = vi.fn().mockReturnValue(Promise.resolve({ response: paginated }));

    const result = await createDirectorySync().getUsers({ initialPage: 2, pageSize: 10 });

    // @ts-ignore
    const call = BaseResource._fetch.mock.calls[0][0];
    expect(call.method).toBe('GET');
    expect(call.path).toBe(`${DIRECTORY_PATH}/users`);
    expect(call.search.get('limit')).toBe('10');
    expect(call.search.get('offset')).toBe('10');

    expect(result.total_count).toBe(1);
    expect(result.data[0].userId).toBe('user_1');
    expect(result.data[0].identifier).toBe('ada@example.com');
    expect(result.data[0].active).toBe(true);
  });
});
