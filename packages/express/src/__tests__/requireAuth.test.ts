import type { RequestHandler } from 'express';

import { clerkMiddleware } from '../clerkMiddleware';
import { requireAuth } from '../requireAuth';
import { mockRequestWithAuth, runMiddleware } from './helpers';

let mockAuthenticateAndDecorateRequest: jest.Mock;
let mockAuthenticateRequest: jest.Mock;

jest.mock('../authenticateRequest', () => ({
  authenticateAndDecorateRequest: (options = {}) => mockAuthenticateAndDecorateRequest(options),
  authenticateRequest: (options = {}) => mockAuthenticateRequest(options),
}));

describe('requireAuth', () => {
  beforeEach(() => {
    mockAuthenticateAndDecorateRequest = jest.fn();
    mockAuthenticateRequest = jest.fn();
    jest.clearAllMocks();
  });

  it('should redirect to sign-in page when user is not authenticated', async () => {
    process.env.CLERK_SIGN_IN_URL = '/sign-in';
    mockAuthenticateAndDecorateRequest.mockImplementation((): RequestHandler => {
      return (req, _res, next) => {
        Object.assign(req, mockRequestWithAuth());
        next();
      };
    });

    const response = await runMiddleware(requireAuth());

    expect(mockAuthenticateAndDecorateRequest).toHaveBeenCalled();
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/sign-in');
  });

  it('should call next() when user is authenticated', async () => {
    mockAuthenticateAndDecorateRequest.mockImplementation((): RequestHandler => {
      return (req, _res, next) => {
        Object.assign(req, mockRequestWithAuth({ userId: 'user_123' }));
        next();
      };
    });

    const response = await runMiddleware(requireAuth());

    expect(mockAuthenticateAndDecorateRequest).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.text).toBe('Hello world!');
  });

  it('should redirect to custom sign-in path when specified', async () => {
    mockAuthenticateAndDecorateRequest.mockImplementation((): RequestHandler => {
      return (req, _res, next) => {
        Object.assign(req, mockRequestWithAuth({ userId: null }));
        next();
      };
    });

    const response = await runMiddleware(
      requireAuth({
        signInUrl: '/custom-sign-in',
      }),
    );

    expect(mockAuthenticateAndDecorateRequest).toHaveBeenCalled();
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/custom-sign-in');
  });

  it('should pass through if req.auth already exists', async () => {
    mockAuthenticateRequest.mockReturnValue({
      toAuth: () => ({ userId: null }),
    });

    mockAuthenticateAndDecorateRequest.mockImplementation((): RequestHandler => {
      return (req, _res, next) => {
        if ((req as any).auth) {
          return next();
        }
        const requestState = mockAuthenticateRequest({ request: req });
        Object.assign(req, { auth: requestState.toAuth() });
        next();
      };
    });

    const response = await runMiddleware([clerkMiddleware(), requireAuth({ signInUrl: '/sign-in' })]);

    expect(mockAuthenticateAndDecorateRequest).toHaveBeenCalledTimes(2);
    // `authenticateRequest` should be called only once
    expect(mockAuthenticateRequest).toHaveBeenCalledTimes(1);
    // Redirect should still happen
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/sign-in');
  });
});
