// clerkMiddleware warns once when it detects a React Router context reused
// across requests (the shared-RouterContextProvider footgun). Auth itself is
// kept correct by requestAuthStorage; this warning tells the app its setup is
// unsupported and may leak its own per-request data.
//
// We spy on logger.warnOnce (the call site) rather than console.warn so the
// assertions are deterministic regardless of warnOnce's per-process dedup.
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
    toAuth: () => ({ userId, tokenType: TokenType.SessionToken }),
  };
}

const noop = async () => new Response('ok');

describe('clerkMiddleware shared-context detection', () => {
  let warnOnceSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    warnOnceSpy = vi.spyOn(logger, 'warnOnce').mockImplementation(() => {});
    mockLoadOptions.mockReturnValue({
      audience: '',
      authorizedParties: [],
      signInUrl: '',
      signUpUrl: '',
      secretKey: 'sk_test_...',
      publishableKey: 'pk_test_...',
    } as unknown as ReturnType<typeof loadOptions>);
    mockClerkClient.mockReturnValue({
      authenticateRequest: vi.fn(async (req: { url: string }) => fakeStateForRequest(req)),
    } as unknown as ClerkClient);
  });

  it('warns once when two requests share one RouterContextProvider', async () => {
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

  it('does not warn when each request gets its own RouterContextProvider', async () => {
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
