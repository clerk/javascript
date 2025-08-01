import { APIKey } from '../internal';

describe('APIKey', () => {
  it('has the same initial properties', () => {
    const apiKey = new APIKey({
      object: 'api_key',
      id: 'ak_12345',
      type: 'api_key',
      name: 'Test API Key',
      subject: 'user_123',
      scopes: ['read', 'write'],
      claims: { custom: 'claim' },
      revoked: false,
      revocation_reason: null,
      expired: false,
      expiration: null,
      created_by: 'user_456',
      description: 'Test API key for testing',
      last_used_at: 1754006990779,
      created_at: 1754006990779,
      updated_at: 1754006990779,
    });

    expect(apiKey).toMatchObject({
      id: 'ak_12345',
      type: 'api_key',
      name: 'Test API Key',
      subject: 'user_123',
      scopes: ['read', 'write'],
      claims: { custom: 'claim' },
      revoked: false,
      revocationReason: null,
      expired: false,
      expiration: null,
      createdBy: 'user_456',
      description: 'Test API key for testing',
      lastUsedAt: new Date(1754006990779),
      createdAt: new Date(1754006990779),
      updatedAt: new Date(1754006990779),
    });
  });
});
