// Concurrency isolation for clerkMiddleware + getAuth.
//
// clerkMiddleware stores the request's auth into the React Router `context`
// (args.context.set), and getAuth reads it back in a loader. React Router hands
// each request its own context by default, which keeps auth per-request.
//
// If an app's custom-server getLoadContext returns a single module-scoped
// RouterContextProvider, every request shares it; under concurrency one request's
// auth overwrites another's, so getAuth can return the wrong user. These tests pin
// both behaviors: a fresh per-request context is isolated, a shared one is not.
//
// Only the network (clerkClient) and option-loading are mocked, so each request
// authenticates as a distinct user; the variable under test is solely whether the
// RouterContextProvider is shared or per-request.
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

describe('clerkMiddleware + getAuth concurrency isolation', () => {
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

  it('keeps auth per-request when each request gets a fresh RouterContextProvider', async () => {
    const perRequest = new Map<Request, RouterContextProvider>();
    const results = await runInterleaved(req => {
      if (!perRequest.has(req)) perRequest.set(req, new RouterContextProvider());
      return perRequest.get(req)!;
    });

    expect(results.A).toBe('user_A');
    expect(results.B).toBe('user_B');
  });

  it('leaks across concurrent requests when one RouterContextProvider is shared', async () => {
    const shared = new RouterContextProvider();
    const results = await runInterleaved(() => shared);

    // B saw itself, but A was served B's identity because B overwrote the shared
    // context's auth entry between A's middleware and A's loader read.
    expect(results.B).toBe('user_B');
    expect(results.A).toBe('user_B');
    expect(results.A).not.toBe('user_A');
  });
});
