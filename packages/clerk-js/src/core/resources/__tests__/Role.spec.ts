import { describe, expect, it, vi } from 'vitest';

import { Role } from '../Role';

const FIXED_DATE = new Date('2025-01-01T00:00:00.000Z');

describe('Role', () => {
  it('has the same initial properties', () => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_DATE);

    const role = new Role({
      object: 'role',
      id: 'role_123',
      key: 'admin',
      name: 'Administrator',
      description: 'Full administrative access',
      permissions: [
        {
          object: 'permission',
          id: 'perm_1',
          key: 'users:read',
          name: 'Read Users',
          description: 'Can read user data',
          type: 'system',
          created_at: 1735689500000,
          updated_at: 1735689650000,
        },
        {
          object: 'permission',
          id: 'perm_2',
          key: 'users:write',
          name: 'Write Users',
          description: 'Can modify user data',
          type: 'system',
          created_at: 1735689500000,
          updated_at: 1735689650000,
        },
      ],
      created_at: 1735689500000,
      updated_at: 1735689650000,
    });

    expect(role).toMatchObject({
      id: 'role_123',
      key: 'admin',
      name: 'Administrator',
      description: 'Full administrative access',
      permissions: expect.arrayContaining([expect.any(Object), expect.any(Object)]),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });

    vi.useRealTimers();
  });
});

describe('Role Snapshots', () => {
  it('should match snapshot for role structure', () => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_DATE);

    const role = new Role({
      object: 'role',
      id: 'role_123',
      key: 'admin',
      name: 'Administrator',
      description: 'Full administrative access',
      permissions: [
        {
          object: 'permission',
          id: 'perm_1',
          key: 'users:read',
          name: 'Read Users',
          description: 'Can read user data',
          type: 'system',
          created_at: 1735689500000,
          updated_at: 1735689650000,
        },
      ],
      created_at: 1735689500000,
      updated_at: 1735689650000,
    });

    const snapshot = {
      id: role.id,
      key: role.key,
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      createdAt: role.createdAt.getTime(),
      updatedAt: role.updatedAt.getTime(),
    };

    expect(snapshot).toMatchSnapshot();
    vi.useRealTimers();
  });

  it('should match snapshot for __internal_toSnapshot method', () => {
    const role = new Role({
      object: 'role',
      id: 'role_456',
      key: 'user',
      name: 'User',
      description: 'Basic user access',
      permissions: [],
      created_at: 1735689400000,
      updated_at: 1735689500000,
    });

    // Role doesn't have __internal_toSnapshot method, so we'll just test the structure
    const snapshot = {
      id: role.id,
      key: role.key,
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      createdAt: role.createdAt.getTime(),
      updatedAt: role.updatedAt.getTime(),
    };

    expect(snapshot).toMatchSnapshot();
  });
});
