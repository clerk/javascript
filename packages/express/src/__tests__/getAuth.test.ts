import type { AuthenticatedMachineObject } from '@clerk/backend/internal';

import { getAuth } from '../getAuth';
import { mockRequest, mockRequestWithAuth } from './helpers';

describe('getAuth', () => {
  it('throws error if clerkMiddleware is not executed before getAuth', () => {
    expect(() => getAuth(mockRequest())).toThrow(/The "clerkMiddleware" should be registered before using "getAuth"/);
  });

  it('returns auth from request for signed-out request', () => {
    const req = mockRequestWithAuth({ userId: null, tokenType: 'session_token' });
    const auth = getAuth(req);
    expect(auth.userId).toBeNull();
    expect(auth.tokenType).toBe('session_token');
  });

  it('returns auth from request', () => {
    const req = mockRequestWithAuth({ userId: 'user_12345', tokenType: 'session_token' });
    const auth = getAuth(req);
    expect(auth.userId).toBe('user_12345');
    expect(auth.tokenType).toBe('session_token');
  });

  it('returns the actual auth object when its tokenType matches acceptsToken', () => {
    const req = mockRequestWithAuth({ tokenType: 'api_key', id: 'ak_1234', userId: 'user_12345', orgId: null });
    const result = getAuth(req, { acceptsToken: 'api_key' });
    expect(result.tokenType).toBe('api_key');
    expect(result.id).toBe('ak_1234');
    expect(result.userId).toBe('user_12345');
    expect(result.orgId).toBeNull();
  });

  it('returns the actual auth object if its tokenType is included in the acceptsToken array', () => {
    const req = mockRequestWithAuth({ tokenType: 'm2m_token', id: 'm2m_1234' });
    const result = getAuth(req, { acceptsToken: ['m2m_token', 'api_key'] });
    expect(result.tokenType).toBe('m2m_token');

    expect((result as AuthenticatedMachineObject<'m2m_token'>).id).toBe('m2m_1234');
    expect((result as AuthenticatedMachineObject<'m2m_token'>).subject).toBeUndefined();
  });

  it('returns an unauthenticated auth object when the tokenType does not match acceptsToken', () => {
    const req = mockRequestWithAuth({ tokenType: 'session_token', userId: 'user_12345' });
    const result = getAuth(req, { acceptsToken: 'api_key' });
    expect(result.tokenType).toBe('api_key'); // reflects the actual token found
    // Properties specific to authenticated objects should be null or undefined
    expect(result.userId).toBeNull();
    expect(result.orgId).toBeNull();
  });
});
