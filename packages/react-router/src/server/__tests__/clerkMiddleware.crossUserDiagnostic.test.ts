// Encodes the decisive cross-user-bleed diagnostic as tests: in a loader, look at
// three things together — the sub the request's __session cookie carries, the
// userId Clerk resolves, and the app's own per-request value on the context. Which
// of them diverges tells you where a real bleed lives:
//
//   fork 1  request sub !== resolved userId            -> Clerk resolution, upstream of this caching layer
//   fork 2  unique Request, but app context value stale -> shared context; Clerk half stays correct, app half leaks
//   fork 3  same Request object, two different users     -> adapter aliases the Request; the limit this PR can't cover
//
// authenticateRequest is mocked to resolve each request to the user it carries (the
// `?u=` param stands in for the __session sub the way real cookie verification would).
import type { ClerkClient } from '@clerk/backend';
import { AuthStatus, TokenType } from '@clerk/backend/internal';
import { logger } from '@clerk/shared/logger';
import type { LoaderFunctionArgs } from 'react-router';
import { createContext, RouterContextProvider } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { clerkClient } from '../clerkClient';
import { clerkMiddleware } from '../clerkMiddleware';
import { getAuth } from '../getAuth';
import { loadOptions } from '../loadOptions';

vi.mock('../clerkClient');
vi.mock('../loadOptions');

const mockClerkClient = vi.mocked(clerkClient);
const mockLoadOptions = vi.mocked(loadOptions);

// The sub the request carries (its __session cookie). The `?u=` param mirrors it so
// the mocked auth layer can resolve it; real authenticateRequest reads the cookie.
function subFromRequest(req: { url: string }): string | null {
  return new URL(req.url).searchParams.get('u');
}

function stateForUserId(userId: string | null) {
  return {
    status: AuthStatus.SignedIn,
    headers: new Headers(),
    publishableKey: 'pk_live_xxx',
    toAuth: () => ({ userId, tokenType: TokenType.SessionToken }),
  };
}

function requestForUser(userId: string, init?: RequestInit): Request {
  return new Request(`http://app.test/?u=${userId}`, {
    ...init,
    headers: { cookie: `__session=${userId}`, ...((init?.headers as Record<string, string>) ?? {}) },
  });
}

const flushMicrotasks = () => new Promise<void>(resolve => setTimeout(resolve, 0));

async function readUserId(args: LoaderFunctionArgs): Promise<string | null | undefined> {
  const auth = (await getAuth(args, { acceptsToken: 'any' })) as { userId?: string | null };
  return auth.userId;
}

describe('cross-user auth bleed: diagnostic forks', () => {
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
      authenticateRequest: vi.fn((req: { url: string }) => Promise.resolve(stateForUserId(subFromRequest(req)))),
    } as unknown as ClerkClient);
  });

  // Fork 1 — the control. On a single faithful request the sub it carries and the
  // userId getAuth surfaces are the same value: this layer hands the resolved user
  // straight through without swapping it for another request's. If these diverge in
  // production, the bug is upstream in Clerk's resolution, not in this caching path.
  it('fork 1: a unique request resolves to its own sub (request sub === resolved userId)', async () => {
    const middleware = clerkMiddleware();
    const request = requestForUser('user_A');
    const args = { request, context: new RouterContextProvider() } as unknown as LoaderFunctionArgs;

    let resolvedUserId: string | null | undefined;
    await middleware(args, async () => {
      resolvedUserId = await readUserId(args);
      return new Response('A');
    });

    expect(resolvedUserId).toBe(subFromRequest(request));
    expect(resolvedUserId).toBe('user_A');
  });

  // Fork 2 — confirmed shared context. Two concurrent requests share one
  // RouterContextProvider. getAuth stays correct per request because it re-derives
  // from each Request (the half this PR fixes), but the app's OWN value stored on the
  // shared context is overwritten by the other request (the half this PR can't fix —
  // it only warns). A stale app value here means the fix is the app's getLoadContext,
  // not Clerk.
  it("fork 2: shared context keeps Clerk auth correct but the app's own per-request value bleeds", async () => {
    const warnOnceSpy = vi.spyOn(logger, 'warnOnce').mockImplementation(() => {});
    const appUser = createContext<string | null>(null);
    const shared = new RouterContextProvider();
    const middleware = clerkMiddleware();

    const argsA = { request: requestForUser('user_A'), context: shared } as unknown as LoaderFunctionArgs;
    const argsB = { request: requestForUser('user_B'), context: shared } as unknown as LoaderFunctionArgs;

    const diag = {
      A: {} as { resolvedUserId?: string | null; appContextUser?: string | null },
      B: {} as { resolvedUserId?: string | null; appContextUser?: string | null },
    };

    let releaseA!: () => void;
    const gateA = new Promise<void>(resolve => (releaseA = resolve));

    // A enters first, stores its own per-request value on the (shared) context, parks.
    const aDone = middleware(argsA, async () => {
      shared.set(appUser, 'user_A');
      await gateA;
      diag.A.resolvedUserId = await readUserId(argsA);
      diag.A.appContextUser = shared.get(appUser);
      return new Response('A');
    });

    await flushMicrotasks();

    // B runs fully while A is parked, overwriting the shared app value with its own.
    await middleware(argsB, async () => {
      shared.set(appUser, 'user_B');
      diag.B.resolvedUserId = await readUserId(argsB);
      diag.B.appContextUser = shared.get(appUser);
      return new Response('B');
    });

    releaseA();
    await aDone;

    // Clerk half (this PR): each request resolves to its own user.
    expect(diag.A.resolvedUserId).toBe('user_A');
    expect(diag.B.resolvedUserId).toBe('user_B');
    // App half (NOT this PR): A's own context value was clobbered by B -> stale.
    expect(diag.A.appContextUser).toBe('user_B');
    // And clerkMiddleware flagged the reused context exactly once.
    expect(warnOnceSpy).toHaveBeenCalledTimes(1);
  });

  // Fork 3 — the irreducible limit. If an adapter reuses the SAME Request object for
  // a second, different logical request, the WeakMap<Request, ...> key is identical,
  // so getAuth returns the first user's cached auth for the second user. This is the
  // case the PR explicitly disclaims ("a layer that reuses the Request object itself
  // ... would be an adapter bug this can't paper over"). The fix is the adapter, not
  // this layer. This test pins that boundary so a future change to the cache key
  // surfaces here.
  it('fork 3: a reused Request object returns the first user (the boundary this PR cannot cover)', async () => {
    // The auth layer resolves whoever the adapter is currently serving, independent
    // of the Request object identity.
    let servingUser = 'user_A';
    const authSpy = vi.fn(() => Promise.resolve(stateForUserId(servingUser)));
    mockClerkClient.mockReturnValue({ authenticateRequest: authSpy } as unknown as ClerkClient);

    const middleware = clerkMiddleware();
    // One Request object the adapter will wrongly hand to two different users.
    const reusedRequest = requestForUser('user_A');
    const context = new RouterContextProvider();

    // First logical request: user_A. Middleware resolves and caches it on the object.
    await middleware({ request: reusedRequest, context } as unknown as LoaderFunctionArgs, () =>
      Promise.resolve(new Response('A')),
    );

    // Adapter now serves user_B but reuses the very same Request object.
    servingUser = 'user_B';
    const resolvedForSecondUser = await readUserId({
      request: reusedRequest,
      context,
    } as unknown as LoaderFunctionArgs);

    // The cache is keyed by the Request, so user_B is served user_A's auth, and the
    // auth layer is never re-invoked for the second request. Documents the leak the
    // adapter must fix; not something keying by Request can detect.
    expect(resolvedForSecondUser).toBe('user_A');
    expect(authSpy).toHaveBeenCalledTimes(1);
  });
});
