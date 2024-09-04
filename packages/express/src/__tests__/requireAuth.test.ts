import { requireAuth } from '../requireAuth';
import { mockRequest, mockRequestWithAuth, mockResponse } from './helpers';

describe('requireAuth', () => {
  it('throws error if clerkMiddleware is not executed before this middleware', async () => {
    expect(() => requireAuth(mockRequest(), mockResponse(), () => undefined)).toThrow(
      /The "clerkMiddleware" should be registered before using "requireAuth"/,
    );
  });

  it('make application require auth - returns 401 Unauthorized for signed-out', async () => {
    const response = mockResponse();
    const nextFn = jest.fn();

    requireAuth(mockRequestWithAuth(), response, nextFn);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(nextFn).not.toHaveBeenCalled();
  });

  it('make application require auth - proceed with next middlewares for signed-in', async () => {
    const response = mockResponse();
    const nextFn = jest.fn();
    const request = mockRequestWithAuth({ userId: 'user_1234' });

    requireAuth(request, response, nextFn);

    expect(response.status).not.toHaveBeenCalled();
    expect(nextFn).toHaveBeenCalled();
  });
});
