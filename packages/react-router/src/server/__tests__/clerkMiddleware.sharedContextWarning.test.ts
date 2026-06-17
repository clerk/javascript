// clerkMiddleware warns once when it detects a React Router context reused across
// requests (the shared-RouterContextProvider footgun). We spy on logger.warnOnce
// so assertions don't depend on its per-process dedup.
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

const noop = () => Promise.resolve(new Response('ok'));

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
      secretKey: 'sk_live_xxx',
      publishableKey: 'pk_live_xxx',
    } as unknown as ReturnType<typeof loadOptions>);
    mockClerkClient.mockReturnValue({
      authenticateRequest: vi.fn((req: { url: string }) => Promise.resolve(fakeStateForRequest(req))),
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
      {
        request: new Request('http://app.test/?u=user_A'),
        context: new RouterContextProvider(),
      } as unknown as LoaderFunctionArgs,
      noop,
    );
    await middleware(
      {
        request: new Request('http://app.test/?u=user_B'),
        context: new RouterContextProvider(),
      } as unknown as LoaderFunctionArgs,
      noop,
    );

    expect(warnOnceSpy).not.toHaveBeenCalled();
  });
});
