import { Clerk } from '@clerk/clerk-js';
import { bindClerk } from '@clerk/loom/clerk';
import { LoomProvider, useLoom, useSessions } from '@clerk/loom/react';
import { createDeferredPromise } from '@clerk/shared/utils';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { StrictMode, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { fapiUrl, publishableKey, serveFapi, worker } from '../../../__tests__/feature/fake-fapi';
import { fapiClient, fapiSession, fapiUser } from '../../../__tests__/feature/fapi';

function setup() {
  const user = fapiUser({ id: 'user_loom_direct' });
  const device = (id: string) => ({
    ...fapiSession({ id, user }),
    user: null,
    ownerUserId: user.id,
    latest_activity: { object: 'session_activity' as const, id: `activity_${id}` },
  });
  serveFapi({
    client: fapiClient([fapiSession({ id: 'sess_current', user })]),
    activeDevices: [device('sess_current'), device('sess_other')],
    deviceTrackingEnabled: true,
  });
}

function Consumer() {
  const loom = useLoom();
  const [show, setShow] = useState(false);
  return (
    <>
      <button
        type='button'
        onMouseEnter={() => void loom.prefetch()}
        onClick={() => setShow(value => !value)}
      >
        Devices
      </button>
      {show && <List />}
    </>
  );
}

function List() {
  const query = useSessions();
  return <output>{query.data?.map(item => item.id).join(',') ?? 'Loading'}</output>;
}

describe('Loom with ClerkJS and no ClerkProvider', () => {
  it('preserves user read status, retry delay, error code, and trace', async () => {
    serveFapi({ client: fapiClient([fapiSession({ id: 'sess_current', user: fapiUser({ id: 'user_a' }) })]) });
    const clerk = new Clerk(publishableKey());
    await clerk.load({ routerPush: () => Promise.resolve(), routerReplace: () => Promise.resolve() });
    worker.use(
      http.get(fapiUrl('/v1/me'), () =>
        HttpResponse.json(
          { errors: [{ code: 'rate_limit_exceeded', long_message: 'Try again later' }] },
          { status: 429, headers: { 'retry-after': '12', 'x-clerk-trace-id': 'trace_user' } },
        ),
      ),
    );
    const binding = bindClerk(clerk);
    try {
      await expect(binding.getSnapshot()?.fetchUser()).rejects.toMatchObject({
        status: 429,
        retryAfter: 12,
        clerkTraceId: 'trace_user',
        errors: [{ code: 'rate_limit_exceeded', longMessage: 'Try again later' }],
      });
      expect(clerk.user?.id).toBe('user_a');
    } finally {
      binding.dispose();
    }
  });

  it('reads fresh display data without mutating the live ClerkJS user', async () => {
    const user = fapiUser({ id: 'user_detached', first_name: 'Original' });
    const fapi = serveFapi({ client: fapiClient([fapiSession({ id: 'sess_current', user })]) });
    const clerk = new Clerk(publishableKey());
    await clerk.load({ routerPush: () => Promise.resolve(), routerReplace: () => Promise.resolve() });
    const current = clerk.user;
    const fresh = fapi.client.sessions[0]?.user;
    if (!fresh) {
      throw new Error('Expected a backend user.');
    }
    fresh.first_name = 'Fresh';
    const binding = bindClerk(clerk);
    try {
      expect(await binding.getSnapshot()?.fetchUser()).toMatchObject({ firstName: 'Fresh' });
      expect(clerk.user).toBe(current);
      expect(clerk.user?.firstName).toBe('Original');
    } finally {
      binding.dispose();
    }
  });

  it.each([403, 500])('does not sign out the new session after recovery fails with %s', async status => {
    serveFapi({
      client: fapiClient([
        fapiSession({ id: 'sess_first', user: fapiUser({ id: 'user_first' }) }),
        fapiSession({ id: 'sess_second', user: fapiUser({ id: 'user_second' }) }),
      ]),
    });
    const clerk = new Clerk(publishableKey());
    await clerk.load({ routerPush: () => Promise.resolve(), routerReplace: () => Promise.resolve() });
    const recovery = vi.spyOn(clerk, 'handleUnauthenticated');
    const binding = bindClerk(clerk);
    const owner = binding.getSnapshot();
    if (!owner) {
      throw new Error('Expected an authenticated owner.');
    }
    const entered = vi.fn();
    const release = createDeferredPromise<void>();
    const previous = Object.getOwnPropertyDescriptor(window, '__internal_onBeforeSetActive');
    Object.defineProperty(window, '__internal_onBeforeSetActive', {
      configurable: true,
      value: async (reason: string | undefined) => {
        if (reason === 'sign-out') {
          entered();
          await release.promise;
        }
      },
    });
    worker.use(
      http.get(fapiUrl('/v1/me'), () =>
        HttpResponse.json({ errors: [{ code: 'session_not_found' }] }, { status: 401 }),
      ),
      http.get(fapiUrl('/v1/client'), () =>
        HttpResponse.json({ errors: [{ code: 'client_unavailable' }] }, { status }),
      ),
    );
    const pending = owner.fetchUser().catch(error => error);
    try {
      await waitFor(() => expect(entered).toHaveBeenCalledTimes(1));
      await clerk.setActive({ session: 'sess_second' });
      release.resolve();
      await pending;
      await recovery.mock.results[0]?.value.catch(() => {});
      expect(clerk.user?.id).toBe('user_second');
      expect(clerk.session?.id).toBe('sess_second');
    } finally {
      release.resolve();
      await pending;
      binding.dispose();
      if (previous) {
        Object.defineProperty(window, '__internal_onBeforeSetActive', previous);
      } else {
        Reflect.deleteProperty(window, '__internal_onBeforeSetActive');
      }
    }
  });

  it('keeps the new session when an old user read is recovering from a 401', async () => {
    const first = fapiUser({ id: 'user_first' });
    const second = fapiUser({ id: 'user_second' });
    serveFapi({
      client: fapiClient([
        fapiSession({ id: 'sess_first', user: first }),
        fapiSession({ id: 'sess_second', user: second }),
      ]),
    });
    const clerk = new Clerk(publishableKey());
    await clerk.load({ routerPush: () => Promise.resolve(), routerReplace: () => Promise.resolve() });
    const binding = bindClerk(clerk);
    const owner = binding.getSnapshot();
    if (!owner) {
      throw new Error('Expected an authenticated owner.');
    }
    const entered = vi.fn();
    const release = createDeferredPromise<void>();
    worker.use(
      http.get(fapiUrl('/v1/me'), () =>
        HttpResponse.json({ errors: [{ code: 'session_not_found' }] }, { status: 401 }),
      ),
      http.get(fapiUrl('/v1/client'), async () => {
        entered();
        await release.promise;
        return HttpResponse.json({ response: fapiClient() });
      }),
    );
    const pending = owner.fetchUser().catch(error => error);
    try {
      await waitFor(() => expect(entered).toHaveBeenCalledTimes(1));
      await clerk.setActive({ session: 'sess_second' });
      release.resolve();
      await pending;
      expect(clerk.user?.id).toBe('user_second');
      expect(clerk.session?.id).toBe('sess_second');
      expect(binding.getSnapshot()?.scope.userId).toBe('user_second');
      expect(owner.queryClient.getQueryCache().getAll()).toHaveLength(0);
    } finally {
      release.resolve();
      await pending;
      binding.dispose();
    }
  });

  it.each(['resource', 'loom'] as const)('recovers an expired session during a %s user read', async mode => {
    const user = fapiUser({ id: 'user_expired' });
    const fapi = serveFapi({ client: fapiClient([fapiSession({ id: 'sess_expired', user })]) });
    const clerk = new Clerk(publishableKey());
    await clerk.load({ routerPush: () => Promise.resolve(), routerReplace: () => Promise.resolve() });
    const binding = bindClerk(clerk);
    const owner = binding.getSnapshot();
    const currentUser = clerk.user;
    if (!owner || !currentUser) {
      throw new Error('Expected an authenticated user.');
    }
    fapi.client = fapiClient();
    worker.use(
      http.get(fapiUrl('/v1/me'), () =>
        HttpResponse.json({ errors: [{ code: 'session_not_found', message: 'Session expired' }] }, { status: 401 }),
      ),
    );
    try {
      await expect(mode === 'resource' ? currentUser.reload() : owner.fetchUser()).rejects.toBeDefined();
      await waitFor(() => expect(clerk.user).toBeNull());
      expect(binding.getSnapshot()).toBeNull();
      expect(owner.queryClient.getQueryCache().getAll()).toHaveLength(0);
    } finally {
      binding.dispose();
    }
  });

  it('prefetches once, reuses data across view remounts, and clears on sign-out', async () => {
    setup();
    const reads = vi.fn();
    worker.use(
      http.get(fapiUrl('/v1/me/sessions/active'), () => {
        reads();
        return undefined;
      }),
    );
    const clerk = new Clerk(publishableKey());
    await clerk.load({ routerPush: () => Promise.resolve(), routerReplace: () => Promise.resolve() });
    const view = render(
      <StrictMode>
        <LoomProvider
          clerk={clerk}
          fallback={<p>Signed out</p>}
        >
          <Consumer />
        </LoomProvider>
      </StrictMode>,
    );
    const user = userEvent.setup();
    const button = await screen.findByRole('button', { name: 'Devices' });
    await user.hover(button);
    await waitFor(() => expect(reads).toHaveBeenCalledTimes(1));
    await user.click(button);
    expect(await screen.findByText('sess_current,sess_other')).toBeVisible();
    await user.click(button);
    await user.click(button);
    expect(screen.getByText('sess_current,sess_other')).toBeVisible();
    expect(reads).toHaveBeenCalledTimes(1);
    await act(() => clerk.signOut());
    expect(await screen.findByText('Signed out')).toBeVisible();
    view.unmount();
  });
});
