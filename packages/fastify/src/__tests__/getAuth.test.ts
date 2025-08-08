import type { AuthenticatedMachineObject } from '@clerk/backend/internal';
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
    const req = {
      auth: { tokenType: 'api_key', id: 'ak_1234', userId: 'user_12345', orgId: null },
    } as unknown as FastifyRequest;
    const result = getAuth(req, { acceptsToken: 'api_key' });
    expect(result.tokenType).toBe('api_key');
    expect(result.id).toBe('ak_1234');
    expect(result.userId).toBe('user_12345');
    expect(result.orgId).toBeNull();
  });

  it('returns the actual auth object if its tokenType is included in the acceptsToken array', () => {
    const req = { auth: { tokenType: 'm2m_token', id: 'm2m_1234' } } as unknown as FastifyRequest;
    const result = getAuth(req, { acceptsToken: ['m2m_token', 'api_key'] });
    expect(result.tokenType).toBe('m2m_token');
    expect((result as AuthenticatedMachineObject<'m2m_token'>).id).toBe('m2m_1234');
    expect((result as AuthenticatedMachineObject<'m2m_token'>).subject).toBeUndefined();
  });

  it('returns an unauthenticated auth object when the tokenType does not match acceptsToken', () => {
    const req = { auth: { tokenType: 'session_token', userId: 'user_12345' } } as unknown as FastifyRequest;
    const result = getAuth(req, { acceptsToken: 'api_key' });
    expect(result.tokenType).toBe('api_key'); // reflects the actual token found
    expect(result.userId).toBeNull();
    expect(result.orgId).toBeNull();
  });
});
