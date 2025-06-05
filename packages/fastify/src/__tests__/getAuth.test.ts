import type { FastifyRequest } from 'fastify';

import { getAuth } from '../getAuth';

describe('getAuth(req)', () => {
  test('returns req.auth', () => {
    const req = { key1: 'asa', auth: { tokenType: 'session_token' } } as unknown as FastifyRequest;

    expect(getAuth(req)).toEqual({ tokenType: 'session_token' });
  });

  test('throws error if clerkPlugin is on registered', () => {
    const req = { key1: 'asa' } as unknown as FastifyRequest;

    expect(() => getAuth(req)).toThrowErrorMatchingSnapshot();
  });

  it('returns the actual auth object when its tokenType matches acceptsToken', () => {
    const req = { auth: { tokenType: 'api_key', id: 'ak_1234', subject: 'api_key_1234' } } as unknown as FastifyRequest;
    const result = getAuth(req, { acceptsToken: 'api_key' });
    expect(result.tokenType).toBe('api_key');
    expect(result.id).toBe('ak_1234');
    expect(result.subject).toBe('api_key_1234');
  });

  it('returns the actual auth object if its tokenType is included in the acceptsToken array', () => {
    const req = { auth: { tokenType: 'machine_token', id: 'mt_1234' } } as unknown as FastifyRequest;
    const result = getAuth(req, { acceptsToken: ['machine_token', 'api_key'] });
    expect(result.tokenType).toBe('machine_token');
    expect(result.id).toBe('mt_1234');
    expect(result.subject).toBeUndefined();
  });

  it('returns an unauthenticated auth object when the tokenType does not match acceptsToken', () => {
    const req = { auth: { tokenType: 'session_token', userId: 'user_12345' } } as unknown as FastifyRequest;
    const result = getAuth(req, { acceptsToken: 'api_key' });
    expect(result.tokenType).toBe('session_token'); // reflects the actual token found
    // Properties specific to authenticated objects should be null or undefined
    // @ts-expect-error - userId is not a property of the unauthenticated object
    expect(result.userId).toBeNull();
  });
});
