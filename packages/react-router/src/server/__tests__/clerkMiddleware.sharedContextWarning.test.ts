// clerkMiddleware surfaces a React Router context reused across requests (the
// shared-RouterContextProvider footgun). getAuth re-derives identity per request
// so auth stays correct, but a shared context can still leak the app's own
// per-request data, so the middleware throws in development and warns once in
// production. We drive dev vs prod via the publishable key (pk_test -> dev,
// pk_live -> prod) and spy on logger.warnOnce so assertions don't depend on its
// per-process dedup.
import type { ClerkClient } from '@clerk/backend';
import { AuthStatus, TokenType } from '@clerk/backend/internal';
import { logger } from '@clerk/shared/logger';
import type { LoaderFunctionArgs } from 'react-router';
import { RouterContextProvider } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { clerkClient } from '../clerkClient';
import { clerkMiddleware } from '../clerkMiddleware';
import { loadOptions } from '../loadOptions';

vi.mock('../clerkClient');
vi.mock('../loadOptions');

const mockClerkClient = vi.mocked(clerkClient);
const mockLoadOptions = vi.mocked(loadOptions);

function fakeStateForRequest(req: { url: string }) {
  const userId = new URL(req.url).searchParams.get('u');
  return {
    status: AuthStatus.SignedIn,
    headers: new Headers(),
    publishableKey: 'pk',
    toAuth: () => ({ userId, tokenType: TokenType.SessionToken }),
  };
}

const noop = async () => new Response('ok');

function mockKeys(publishableKey: string) {
  mockLoadOptions.mockReturnValue({
    audience: '',
    authorizedParties: [],
    signInUrl: '',
    signUpUrl: '',
    secretKey: 'sk_xxx',
    publishableKey,
  } as unknown as ReturnType<typeof loadOptions>);
}

describe('clerkMiddleware shared-context detection', () => {
  let warnOnceSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    warnOnceSpy = vi.spyOn(logger, 'warnOnce').mockImplementation(() => {});
    mockClerkClient.mockReturnValue({
      authenticateRequest: vi.fn(async (req: { url: string }) => fakeStateForRequest(req)),
    } as unknown as ClerkClient);
  });

  it('warns once (production) when two requests share one RouterContextProvider', async () => {
    mockKeys('pk_live_xxx');
    const middleware = clerkMiddleware();
    const shared = new RouterContextProvider();

    await middleware(
      { request: new Request('http://app.test/?u=user_A'), context: shared } as unknown as LoaderFunctionArgs,
      noop,
    );
    await middleware(
      { request: new Request('http://app.test/?u=user_B'), context: shared } as unknown as LoaderFunctionArgs,
      noop,
    );

    expect(warnOnceSpy).toHaveBeenCalledTimes(1);
    expect(warnOnceSpy).toHaveBeenCalledWith(expect.stringContaining('reused across requests'));
  });

  it('throws (development) when a second request reuses the context', async () => {
    mockKeys('pk_test_xxx');
    const middleware = clerkMiddleware();
    const shared = new RouterContextProvider();

    await middleware(
      { request: new Request('http://app.test/?u=user_A'), context: shared } as unknown as LoaderFunctionArgs,
      noop,
    );

    await expect(
      middleware(
        { request: new Request('http://app.test/?u=user_B'), context: shared } as unknown as LoaderFunctionArgs,
        noop,
      ),
    ).rejects.toThrow(/reused across requests/);
  });

  it('does not warn or throw when each request gets its own RouterContextProvider', async () => {
    mockKeys('pk_test_xxx');
    const middleware = clerkMiddleware();

    await middleware(
      { request: new Request('http://app.test/?u=user_A'), context: new RouterContextProvider() } as unknown as LoaderFunctionArgs,
      noop,
    );
    await middleware(
      { request: new Request('http://app.test/?u=user_B'), context: new RouterContextProvider() } as unknown as LoaderFunctionArgs,
      noop,
    );

    expect(warnOnceSpy).not.toHaveBeenCalled();
  });
});
