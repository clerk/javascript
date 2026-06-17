// getAuth re-derives auth from `args.request`, so it returns the right user even
// when an app shares one RouterContextProvider across requests. authenticateRequest
// is mocked to resolve each request to the user encoded in its URL (?u=...).
import type { ClerkClient } from '@clerk/backend';
import { AuthStatus, TokenType } from '@clerk/backend/internal';
import type { LoaderFunctionArgs } from 'react-router';
import { RouterContextProvider } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { clerkClient } from '../clerkClient';
import { clerkMiddleware } from '../clerkMiddleware';
import { getAuth } from '../getAuth';
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
    publishableKey: 'pk_live_xxx',
    toAuth: () => ({ userId, tokenType: TokenType.SessionToken }),
  };
}

const flushMicrotasks = () => new Promise<void>(resolve => setTimeout(resolve, 0));

async function readUserId(args: LoaderFunctionArgs): Promise<string | null | undefined> {
  const auth = (await getAuth(args, { acceptsToken: 'any' })) as { userId?: string | null };
  return auth.userId;
}

describe('clerkMiddleware + getAuth auth isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoadOptions.mockReturnValue({
      audience: '',
      authorizedParties: [],
      signInUrl: '',
      signUpUrl: '',
      secretKey: 'sk_live_xxx',
      // pk_live -> production instance -> shared-context probe warns (does not throw).
      publishableKey: 'pk_live_xxx',
    } as unknown as ReturnType<typeof loadOptions>);
    mockClerkClient.mockReturnValue({
      authenticateRequest: vi.fn((req: { url: string }) => Promise.resolve(fakeStateForRequest(req))),
    } as unknown as ClerkClient);
  });

  // Interleave two concurrent requests, each using `contextFor(request)`:
  //  1. A's middleware runs, then parks inside next().
  //  2. B's middleware runs, B's loader reads its own auth in next().
  //  3. A unparks and reads its auth.
  async function runInterleaved(contextFor: (req: Request) => RouterContextProvider) {
    const middleware = clerkMiddleware();
    const results: { A?: string | null; B?: string | null } = {};

    let releaseA!: () => void;
    const gateA = new Promise<void>(resolve => (releaseA = resolve));

    const reqA = new Request('http://app.test/?u=user_A');
    const reqB = new Request('http://app.test/?u=user_B');
    const argsA = { request: reqA, context: contextFor(reqA) } as unknown as LoaderFunctionArgs;
    const argsB = { request: reqB, context: contextFor(reqB) } as unknown as LoaderFunctionArgs;

    const aDone = middleware(argsA, async () => {
      await gateA;
      results.A = await readUserId(argsA);
      return new Response('A');
    });

    await flushMicrotasks();

    await middleware(argsB, async () => {
      results.B = await readUserId(argsB);
      return new Response('B');
    });

    releaseA();
    await aDone;

    return results;
  }

  it('keeps auth per-request with a shared RouterContextProvider', async () => {
    const shared = new RouterContextProvider();
    const results = await runInterleaved(() => shared);

    expect(results.A).toBe('user_A');
    expect(results.B).toBe('user_B');
  });

  it('keeps auth per-request with a fresh RouterContextProvider per request', async () => {
    const perRequest = new Map<Request, RouterContextProvider>();
    const results = await runInterleaved(req => {
      if (!perRequest.has(req)) {
        perRequest.set(req, new RouterContextProvider());
      }
      return perRequest.get(req)!;
    });

    expect(results.A).toBe('user_A');
    expect(results.B).toBe('user_B');
  });

  // React Router mints a NEW Request for post-action loader revalidation. getAuth
  // re-derives from whatever request the loader was invoked with, so it resolves
  // the right user even reading via the fresh Request on a shared context.
  it('resolves the right user when the loader reads via a fresh Request (action -> loader)', async () => {
    const shared = new RouterContextProvider();
    const middleware = clerkMiddleware();

    const reqA = new Request('http://app.test/?u=user_A', { method: 'POST' });
    const argsA = { request: reqA, context: shared } as unknown as LoaderFunctionArgs;

    let seen: string | null | undefined;
    await middleware(argsA, async () => {
      const loaderRequest = new Request(reqA.url, { headers: reqA.headers });
      const loaderArgs = { request: loaderRequest, context: shared } as unknown as LoaderFunctionArgs;
      seen = await readUserId(loaderArgs);
      return new Response('A');
    });

    expect(seen).toBe('user_A');
  });
});
