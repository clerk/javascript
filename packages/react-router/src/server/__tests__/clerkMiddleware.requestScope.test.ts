// Request-scoped auth isolation for clerkMiddleware + getAuth.
//
// clerkMiddleware binds each request's auth to an AsyncLocalStorage scope (see
// requestAuthStorage) and also mirrors it onto the React Router context. getAuth
// reads the async scope first. That keeps auth correct per request even when an
// app shares one RouterContextProvider across requests (the custom-server /
// getLoadContext footgun) - the failure mode reported as a cross-user "bleed".
//
// Only clerkClient and loadOptions are mocked; each request authenticates as a
// distinct user encoded in its URL, so the sole variable under test is whether
// the RouterContextProvider is shared or per-request.
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

// The "user" for a request is encoded in its URL (?u=...); authenticateRequest
// reads it back, so every request resolves to its own correct identity.
function fakeStateForRequest(req: { url: string }) {
  const userId = new URL(req.url).searchParams.get('u');
  return {
    status: AuthStatus.SignedIn,
    headers: new Headers(),
    toAuth: () => ({ userId, tokenType: TokenType.SessionToken }),
  };
}

// Flush microtasks so request A finishes authenticate + context.set and parks
// inside next() before request B runs.
const flushMicrotasks = () => new Promise<void>(resolve => setTimeout(resolve, 0));

async function readUserId(args: LoaderFunctionArgs): Promise<string | null | undefined> {
  const auth = (await getAuth(args, { acceptsToken: 'any' })) as { userId?: string | null };
  return auth.userId;
}

describe('clerkMiddleware + getAuth request-scoped isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  // Interleave two concurrent requests, each using `contextFor(request)`:
  //  1. A's middleware authenticates, sets context, then parks inside next().
  //  2. B's middleware authenticates, sets context, reads its own auth in next().
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

  // The regression: with a single shared RouterContextProvider, B's middleware
  // overwrote the shared context's auth between A's middleware and A's loader
  // read, so A was served B's identity. The async scope fixes this: A's loader
  // runs inside A's store regardless of the shared context.
  it('keeps auth per-request with a shared RouterContextProvider', async () => {
    const shared = new RouterContextProvider();
    const results = await runInterleaved(() => shared);

    expect(results.A).toBe('user_A');
    expect(results.B).toBe('user_B');
  });

  it('keeps auth per-request with a fresh RouterContextProvider per request', async () => {
    const perRequest = new Map<Request, RouterContextProvider>();
    const results = await runInterleaved(req => {
      if (!perRequest.has(req)) perRequest.set(req, new RouterContextProvider());
      return perRequest.get(req)!;
    });

    expect(results.A).toBe('user_A');
    expect(results.B).toBe('user_B');
  });

  // On a mutation, React Router mints a NEW Request for the post-action loader
  // revalidation (a request-keyed store would miss it), but the loader still runs
  // inside the middleware's async scope, so getAuth resolves the right user even
  // when reading via the fresh Request and a shared context.
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
