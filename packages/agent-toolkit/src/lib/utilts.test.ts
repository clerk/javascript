import { describe, expect, it } from 'vitest';

import { ClerkTool } from './clerk-tool';
import { filterTools } from './utils';

describe('filterTools', () => {
  const createMockTool = (name: string): ClerkTool => {
    return ClerkTool({
      name,
      description: `Description for ${name}`,
      execute: () => () => Promise.resolve({ success: true }),
    });
  };

  // Setup mock tools structure
  const mockTools = {
    users: {
      getUser: createMockTool('getUser'),
      getUserCount: createMockTool('getUserCount'),
      createUser: createMockTool('createUser'),
      updateUser: createMockTool('updateUser'),
      deleteUser: createMockTool('deleteUser'),
    },
    organizations: {
      getOrg: createMockTool('getOrg'),
      getOrgCount: createMockTool('getOrgCount'),
      createOrg: createMockTool('createOrg'),
      updateOrg: createMockTool('updateOrg'),
    },
    invitations: {
      createInvitation: createMockTool('createInvitation'),
      revokeInvitation: createMockTool('revokeInvitation'),
    },
  };

  it('returns all tools from a category when only category name is provided', () => {
    const result = filterTools(mockTools, 'users');
    expect(result).toHaveLength(5);
    expect(result).toContainEqual(mockTools.users.getUser);
    expect(result).toContainEqual(mockTools.users.getUserCount);
    expect(result).toContainEqual(mockTools.users.createUser);
    expect(result).toContainEqual(mockTools.users.updateUser);
    expect(result).toContainEqual(mockTools.users.deleteUser);
  });

  it('returns all tools from a category when the .* notation is used', () => {
    const result = filterTools(mockTools, 'users.*');
    expect(result).toHaveLength(5);
    expect(result).toContainEqual(mockTools.users.getUser);
    expect(result).toContainEqual(mockTools.users.getUserCount);
    expect(result).toContainEqual(mockTools.users.createUser);
    expect(result).toContainEqual(mockTools.users.updateUser);
    expect(result).toContainEqual(mockTools.users.deleteUser);
  });

  it('returns all tools from all categories if * is used', () => {
    const result = filterTools(mockTools, '*');
    expect(result).toHaveLength(11);
    expect(result).toContainEqual(mockTools.users.getUser);
    expect(result).toContainEqual(mockTools.users.getUserCount);
    expect(result).toContainEqual(mockTools.users.createUser);
    expect(result).toContainEqual(mockTools.users.updateUser);
    expect(result).toContainEqual(mockTools.users.deleteUser);
    expect(result).toContainEqual(mockTools.organizations.getOrg);
    expect(result).toContainEqual(mockTools.organizations.getOrgCount);
    expect(result).toContainEqual(mockTools.organizations.createOrg);
    expect(result).toContainEqual(mockTools.organizations.updateOrg);
    expect(result).toContainEqual(mockTools.invitations.createInvitation);
    expect(result).toContainEqual(mockTools.invitations.revokeInvitation);
  });

  it('returns a specific tool when using category.tool pattern', () => {
    const result = filterTools(mockTools, 'users.getUserCount');
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(mockTools.users.getUserCount);
  });

  it('throws an error when pattern is empty', () => {
    expect(() => filterTools(mockTools, '')).toThrow('No pattern specified');
  });

  it('throws an error when pattern is invalid', () => {
    expect(() => filterTools(mockTools, 'users..getUserCount')).toThrow('Invalid pattern');
    expect(() => filterTools(mockTools, 'users@getUserCount')).toThrow('Invalid pattern');
    expect(() => filterTools(mockTools, 'users.getUserCount.extra')).toThrow('Invalid pattern');
  });

  it('throws an error when category does not exist', () => {
    expect(() => filterTools(mockTools, 'nonexistent')).toThrow('Category not found: nonexistent');
    expect(() => filterTools(mockTools, 'nonexistent.tool')).toThrow('Category not found: nonexistent');
  });

  it('throws an error when tool does not exist in the category', () => {
    expect(() => filterTools(mockTools, 'users.nonexistent')).toThrow('Tool not found: nonexistent');
  });

  it('should work with small categories', () => {
    const result = filterTools(mockTools, 'invitations');
    expect(result).toHaveLength(2);
    expect(result).toContainEqual(mockTools.invitations.createInvitation);
    expect(result).toContainEqual(mockTools.invitations.revokeInvitation);
  });
});
