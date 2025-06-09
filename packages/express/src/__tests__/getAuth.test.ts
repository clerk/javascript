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
    const req = mockRequestWithAuth({ tokenType: 'api_key', id: 'ak_1234', subject: 'api_key_1234' });
    const result = getAuth(req, { acceptsToken: 'api_key' });
    expect(result.tokenType).toBe('api_key');
    expect(result.id).toBe('ak_1234');
    expect(result.subject).toBe('api_key_1234');
  });

  it('returns the actual auth object if its tokenType is included in the acceptsToken array', () => {
    const req = mockRequestWithAuth({ tokenType: 'machine_token', id: 'mt_1234' });
    const result = getAuth(req, { acceptsToken: ['machine_token', 'api_key'] });
    expect(result.tokenType).toBe('machine_token');
    expect(result.id).toBe('mt_1234');
    expect(result.subject).toBeUndefined();
  });

  it('returns an unauthenticated auth object when the tokenType does not match acceptsToken', () => {
    const req = mockRequestWithAuth({ tokenType: 'session_token', userId: 'user_12345' });
    const result = getAuth(req, { acceptsToken: 'api_key' });
    expect(result.tokenType).toBe('session_token'); // reflects the actual token found
    // Properties specific to authenticated objects should be null or undefined
    // @ts-expect-error - userId is not a property of the unauthenticated object
    expect(result.userId).toBeNull();
  });
});
