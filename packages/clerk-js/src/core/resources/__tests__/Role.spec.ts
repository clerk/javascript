import { describe, expect, it } from 'vitest';

import { Role } from '../Role';

describe('Role', () => {
  it('has the same initial properties', () => {
    const role = new Role({
      object: 'role',
      id: 'role_123',
      key: 'admin',
      name: 'Administrator',
      description: 'Full administrative access',
      permissions: ['perm_1', 'perm_2'],
      created_at: 1735689500000,
      updated_at: 1735689650000,
    });

    expect(role).toMatchObject({
      id: 'role_123',
      key: 'admin',
      name: 'Administrator',
      description: 'Full administrative access',
      permissions: ['perm_1', 'perm_2'],
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });
});

describe('Role Snapshots', () => {
  it('should match snapshot for role structure', () => {
    const role = new Role({
      object: 'role',
      id: 'role_123',
      key: 'admin',
      name: 'Administrator',
      description: 'Full administrative access to organization',
      permissions: ['org:sys_profile:manage', 'org:sys_memberships:manage'],
      created_at: 1735689500000,
      updated_at: 1735689650000,
    });

    const snapshot = {
      id: role.id,
      key: role.key,
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      createdAt: role.createdAt?.getTime(),
      updatedAt: role.updatedAt?.getTime(),
    };

    expect(snapshot).toMatchSnapshot();
  });

  it('should match snapshot for __internal_toSnapshot method', () => {
    const role = new Role({
      object: 'role',
      id: 'role_456',
      key: 'member',
      name: 'Member',
      description: 'Basic member access',
      permissions: ['org:sys_profile:read'],
      created_at: 1735689500000,
      updated_at: 1735689500000,
    });

    if (typeof role.__internal_toSnapshot === 'function') {
      const snapshot = role.__internal_toSnapshot();
      expect(snapshot).toMatchSnapshot();
    }
  });
});
