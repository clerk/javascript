import { serializeToJSON } from './parser';

describe('serializeToJSON', () => {
  it('should serialize basic object properties', () => {
    const data = {
      id: 'test-id',
      name: 'Test Name',
      active: true,
      count: 42,
    };

    const result = serializeToJSON(data);
    expect(result).toEqual({
      id: 'test-id',
      name: 'Test Name',
      active: true,
      count: 42,
    });
  });

  it('should convert Date objects to timestamps', () => {
    const now = new Date();
    const data = {
      createdAt: now,
      updatedAt: now,
    };

    const result = serializeToJSON(data, {
      dateFields: ['createdAt', 'updatedAt'],
    });

    expect(result.createdAt).toBe(now.getTime());
    expect(result.updatedAt).toBe(now.getTime());
  });

  it('should convert camelCase to snake_case for specified fields', () => {
    const data = {
      firstName: 'John',
      lastName: 'Doe',
      emailAddress: 'john@example.com',
      publicMetadata: { key: 'value' },
    };

    const result = serializeToJSON(data, {
      snakeCaseFields: ['firstName', 'lastName', 'emailAddress', 'publicMetadata'],
    });

    expect(result).toEqual({
      first_name: 'John',
      last_name: 'Doe',
      email_address: 'john@example.com',
      public_metadata: { key: 'value' },
    });
  });

  it('should handle nested objects with __internal_toSnapshot method', () => {
    const mockNestedObject = {
      id: 'nested-id',
      name: 'Nested Object',
      __internal_toSnapshot: jest.fn().mockReturnValue({
        object: 'nested',
        id: 'nested-id',
        name: 'Nested Object',
      }),
    };

    const data = {
      user: mockNestedObject,
      settings: mockNestedObject,
    };

    const result = serializeToJSON(data, {
      nestedFields: ['user', 'settings'],
    });

    expect(result.user).toEqual({
      object: 'nested',
      id: 'nested-id',
      name: 'Nested Object',
    });
    expect(result.settings).toEqual({
      object: 'nested',
      id: 'nested-id',
      name: 'Nested Object',
    });
    expect(mockNestedObject.__internal_toSnapshot).toHaveBeenCalledTimes(2);
  });

  it('should handle arrays of nested objects', () => {
    const mockNestedObject = {
      id: 'item-1',
      name: 'Item 1',
      __internal_toSnapshot: jest.fn().mockReturnValue({
        object: 'item',
        id: 'item-1',
        name: 'Item 1',
      }),
    };

    const data = {
      items: [mockNestedObject, mockNestedObject],
    };

    const result = serializeToJSON(data, {
      arrayFields: ['items'],
    });

    expect(result.items).toHaveLength(2);
    expect(result.items[0]).toEqual({
      object: 'item',
      id: 'item-1',
      name: 'Item 1',
    });
    expect(mockNestedObject.__internal_toSnapshot).toHaveBeenCalledTimes(2);
  });

  it('should apply custom transforms', () => {
    const data = {
      value: 'test',
      count: 42,
    };

    const result = serializeToJSON(data, {
      customTransforms: {
        value: (val: string) => val.toUpperCase(),
        count: (val: number) => val * 2,
      },
    });

    expect(result.value).toBe('TEST');
    expect(result.count).toBe(84);
  });

  it('should skip undefined values', () => {
    const data = {
      id: 'test-id',
      name: undefined,
      active: true,
      count: undefined,
    };

    const result = serializeToJSON(data);
    expect(result).toEqual({
      id: 'test-id',
      active: true,
    });
  });

  it('should handle null values', () => {
    const data = {
      id: 'test-id',
      user: null,
      settings: null,
    };

    const result = serializeToJSON(data, {
      nestedFields: ['user', 'settings'],
    });

    expect(result).toEqual({
      id: 'test-id',
      user: null,
      settings: null,
    });
  });

  it('should handle complex nested structure', () => {
    const mockUser = {
      id: 'user-1',
      name: 'John Doe',
      __internal_toSnapshot: jest.fn().mockReturnValue({
        object: 'user',
        id: 'user-1',
        name: 'John Doe',
      }),
    };

    const mockSession = {
      id: 'session-1',
      status: 'active',
      __internal_toSnapshot: jest.fn().mockReturnValue({
        object: 'session',
        id: 'session-1',
        status: 'active',
      }),
    };

    const now = new Date();
    const data = {
      id: 'test-id',
      firstName: 'John',
      lastName: 'Doe',
      createdAt: now,
      updatedAt: now,
      user: mockUser,
      sessions: [mockSession, mockSession],
      metadata: { key: 'value' },
    };

    const result = serializeToJSON(data, {
      dateFields: ['createdAt', 'updatedAt'],
      nestedFields: ['user'],
      arrayFields: ['sessions'],
      snakeCaseFields: ['firstName', 'lastName', 'createdAt', 'updatedAt', 'user', 'sessions'],
    });

    expect(result).toEqual({
      id: 'test-id',
      first_name: 'John',
      last_name: 'Doe',
      created_at: now.getTime(),
      updated_at: now.getTime(),
      user: {
        object: 'user',
        id: 'user-1',
        name: 'John Doe',
      },
      sessions: [
        {
          object: 'session',
          id: 'session-1',
          status: 'active',
        },
        {
          object: 'session',
          id: 'session-1',
          status: 'active',
        },
      ],
      metadata: { key: 'value' },
    });
  });
});
