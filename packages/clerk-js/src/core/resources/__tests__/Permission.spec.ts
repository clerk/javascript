import { describe, expect, it } from 'vitest';

import { Permission } from '../Permission';

describe('Permission', () => {
  it('has the same initial properties', () => {
    const permission = new Permission({
      object: 'permission',
      id: 'perm_123',
      name: 'org:sys_profile:manage',
      key: 'org:sys_profile:manage',
      description: 'Manage organization profile',
      type: 'system',
      created_at: 12345,
      updated_at: 5678,
    });

    expect(permission).toMatchObject({
      id: 'perm_123',
      name: 'org:sys_profile:manage',
      key: 'org:sys_profile:manage',
      description: 'Manage organization profile',
      type: 'system',
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });
});

describe('Permission Snapshots', () => {
  it('should match snapshot for permission structure', () => {
    const permission = new Permission({
      object: 'permission',
      id: 'perm_123',
      name: 'org:sys_profile:manage',
      key: 'org:sys_profile:manage',
      description: 'Manage organization profile',
      type: 'system',
      created_at: 1735689600000,
      updated_at: 1735689650000,
    });

    const snapshot = {
      id: permission.id,
      name: permission.name,
      key: permission.key,
      description: permission.description,
      type: permission.type,
      createdAt: permission.createdAt?.getTime(),
      updatedAt: permission.updatedAt?.getTime(),
    };

    expect(snapshot).toMatchSnapshot();
  });

  it('should match snapshot for custom permission', () => {
    const permission = new Permission({
      object: 'permission',
      id: 'perm_custom_456',
      name: 'custom:billing:read',
      key: 'custom:billing:read',
      description: 'Read billing information',
      type: 'custom',
      created_at: 1735689600000,
      updated_at: 1735689600000,
    });

    const snapshot = {
      id: permission.id,
      name: permission.name,
      key: permission.key,
      description: permission.description,
      type: permission.type,
      createdAt: permission.createdAt?.getTime(),
      updatedAt: permission.updatedAt?.getTime(),
    };

    expect(snapshot).toMatchSnapshot();
  });
});
