import type { NextFunction, Request as ExpressRequest, Response as ExpressResponse } from 'express';

import { requireAuth, UnauthorizedError } from '../requireAuth';
import { mockRequest, mockRequestWithAuth, mockResponse } from './helpers';

// This middleware is used to handle the UnauthorizedError thrown by requireAuth
// See https://expressjs.com/en/guide/error-handling.html for handling errors in Express
const errorHandler = (err: Error, _req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
  if (err instanceof UnauthorizedError) {
    return res.status(401).send('Unauthorized');
  }

  return next(err);
};

describe('requireAuth', () => {
  it('throws error if clerkMiddleware is not executed before this middleware', async () => {
    expect(() => requireAuth(mockRequest(), mockResponse(), () => undefined)).toThrow(
      /The "clerkMiddleware" should be registered before using "requireAuth"/,
    );
  });

  it('passes UnauthorizedError to next for unauthenticated requests', () => {
    const request = mockRequestWithAuth();
    const response = mockResponse();
    const next = jest.fn();

    requireAuth(request, response, next);

    // Simulate how Express would call the error middleware
    const error = next.mock.calls[0][0];
    errorHandler(error, request, response, next);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.send).toHaveBeenCalledWith('Unauthorized');
  });

  it('allows access for authenticated requests', async () => {
    const request = mockRequestWithAuth({ userId: 'user_1234' });
    const response = mockResponse();
    const next = jest.fn();

    requireAuth(request, response, next);

    // Simulate a protected route
    const protectedRoute = (_req: ExpressRequest, res: ExpressResponse) => {
      res.status(200).send('Welcome, user_1234');
    };

    protectedRoute(request, response);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.send).toHaveBeenCalledWith('Welcome, user_1234');
  });
});
