import type { ClerkClient } from '@clerk/backend';
import { AuthStatus, TokenType } from '@clerk/backend/internal';
import type { LoaderFunctionArgs } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { clerkClient } from '../clerkClient';
import { authFnContext, clerkMiddleware, requestStateContext } from '../clerkMiddleware';
import { loadOptions } from '../loadOptions';
import type { ClerkMiddlewareOptions } from '../types';

vi.mock('../clerkClient');
vi.mock('../loadOptions');

const mockClerkClient = vi.mocked(clerkClient);
const mockLoadOptions = vi.mocked(loadOptions);

describe('clerkMiddleware', () => {
  const mockNext = vi.fn();
  const mockContext = {
    get: vi.fn(),
    set: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CLERK_SECRET_KEY = 'sk_test_...';

    mockLoadOptions.mockReturnValue({
      audience: '',
      authorizedParties: [],
      signInUrl: '',
      signUpUrl: '',
      secretKey: 'sk_test_...',
      publishableKey: 'pk_test_...',
    } as unknown as ReturnType<typeof loadOptions>);

    mockClerkClient.mockReturnValue({
      authenticateRequest: vi.fn(),
    } as unknown as ClerkClient);
  });

  it('should authenticate request and set context', async () => {
    const mockRequestState = {
      status: AuthStatus.SignedIn,
      headers: new Headers(),
      toAuth: vi.fn().mockReturnValue({ userId: 'user_xxx', tokenType: TokenType.SessionToken }),
    };

    const mockAuthenticateRequest = vi.fn().mockResolvedValue(mockRequestState);
    mockClerkClient.mockReturnValue({
      authenticateRequest: mockAuthenticateRequest,
    } as unknown as ClerkClient);

    const middleware = clerkMiddleware();
    const args = {
      request: new Request('http://clerk.com'),
      context: mockContext,
    } as LoaderFunctionArgs;

    const mockResponse = new Response('OK');
    mockNext.mockResolvedValue(mockResponse);

    const result = await middleware(args, mockNext);

    expect(mockAuthenticateRequest).toHaveBeenCalledWith(expect.any(Object), {
      apiUrl: undefined,
      secretKey: 'sk_test_...',
      jwtKey: undefined,
      proxyUrl: undefined,
      isSatellite: undefined,
      domain: undefined,
      publishableKey: 'pk_test_...',
      machineSecretKey: undefined,
      audience: '',
      authorizedParties: [],
      signInUrl: '',
      signUpUrl: '',
      acceptsToken: 'any',
    });

    expect(mockContext.set).toHaveBeenCalledWith(authFnContext, expect.any(Function));
    expect(mockContext.set).toHaveBeenCalledWith(requestStateContext, mockRequestState);

    expect(mockNext).toHaveBeenCalled();

    expect(result).toBe(mockResponse);
  });

  it('should pass options to loadOptions', async () => {
    const mockRequestState = {
      status: AuthStatus.SignedIn,
      headers: new Headers(),
      toAuth: vi.fn().mockReturnValue({ userId: 'user_xxx', tokenType: TokenType.SessionToken }),
    };

    const mockAuthenticateRequest = vi.fn().mockResolvedValue(mockRequestState);
    mockClerkClient.mockReturnValue({
      authenticateRequest: mockAuthenticateRequest,
    } as unknown as ClerkClient);

    const options: ClerkMiddlewareOptions = {
      audience: 'test-audience',
      authorizedParties: ['https://example.com'],
      signInUrl: '/sign-in',
      signUpUrl: '/sign-up',
    };

    const middleware = clerkMiddleware(options);
    const args = {
      request: new Request('http://clerk.com'),
      context: mockContext,
    } as LoaderFunctionArgs;

    const mockResponse = new Response('OK');
    mockNext.mockResolvedValue(mockResponse);

    await middleware(args, mockNext);

    expect(mockLoadOptions).toHaveBeenCalledWith(args, options);
  });

  it('should append request state headers to response', async () => {
    const mockRequestState = {
      status: AuthStatus.SignedIn,
      headers: new Headers({
        'x-clerk-auth-status': 'signed-in',
        'x-clerk-auth-reason': 'auth-reason',
        'x-clerk-auth-message': 'auth-message',
      }),
      toAuth: vi.fn().mockReturnValue({ userId: 'user_xxx', tokenType: TokenType.SessionToken }),
    };

    const mockAuthenticateRequest = vi.fn().mockResolvedValue(mockRequestState);
    mockClerkClient.mockReturnValue({
      authenticateRequest: mockAuthenticateRequest,
    } as unknown as ClerkClient);

    const middleware = clerkMiddleware();
    const args = {
      request: new Request('http://clerk.com'),
      context: mockContext,
    } as LoaderFunctionArgs;

    const mockResponse = new Response('OK');
    mockNext.mockResolvedValue(mockResponse);

    const result = (await middleware(args, mockNext)) as Response;

    expect(result.headers.get('x-clerk-auth-status')).toBe('signed-in');
    expect(result.headers.get('x-clerk-auth-reason')).toBe('auth-reason');
    expect(result.headers.get('x-clerk-auth-message')).toBe('auth-message');
  });
});
