import { getAuth } from '../getAuth';
import { mockRequest, mockRequestWithAuth } from './helpers';

describe('getAuth', () => {
  it('throws error if clerkMiddleware is not executed before getAuth', async () => {
    expect(() => getAuth(mockRequest())).toThrow(/The "clerkMiddleware" should be registered before using "getAuth"/);
  });

  it('returns auth from request for signed-out request', async () => {
    expect(getAuth(mockRequestWithAuth())).toHaveProperty('userId', null);
  });

  it('returns auth from request', async () => {
    const req = mockRequestWithAuth({ userId: 'user_12345' });
    expect(getAuth(req)).toHaveProperty('userId', 'user_12345');
  });
});
