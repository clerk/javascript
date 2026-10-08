import { ClerkAPIResponseError } from '@clerk/shared/error';
import type { SessionWithActivitiesResource } from '@clerk/shared/types';
import { createDeferredPromise } from '@clerk/shared/utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, render, renderHook, waitFor } from '@/test/utils';

import { useActiveDeviceController } from '../active-devices.controller';
import { useActiveDevicesModel } from '../active-devices.model';
import { ActiveDevicesSection } from '../ActiveDevicesSection';

const state = vi.hoisted(() => ({
  sessions: [] as SessionWithActivitiesResource[],
  isLoading: false,
  revalidate: vi.fn(),
}));

vi.mock('@/ui/hooks', async importOriginal => ({
  ...(await importOriginal<typeof import('@/ui/hooks')>()),
  useFetch: () => ({ data: state.sessions, isLoading: state.isLoading, revalidate: state.revalidate }),
}));

const { createFixtures } = bindCreateFixtures('UserProfile');

function device(id: string, status = 'active'): SessionWithActivitiesResource {
  return {
    id,
    status,
    lastActiveAt: new Date('2026-01-01T12:00:00Z'),
    latestActivity: { id: `activity_${id}`, browserName: 'Firefox', city: 'Austin', ipAddress: '127.0.0.1' },
    actor: null,
    revoke: vi.fn(),
  } as unknown as SessionWithActivitiesResource;
}

beforeEach(() => {
  state.sessions = [];
  state.isLoading = false;
  state.revalidate.mockReset();
});

describe('Active device commands', () => {
  it('keeps the shared array unchanged and preserves other device order', async () => {
    const { wrapper, fixtures } = await createFixtures(f => f.withUser({ email_addresses: ['test@clerk.com'] }));
    const resources = [
      device('first'),
      device(fixtures.session!.id),
      device('pending', 'pending'),
      device('last'),
      device('ended', 'ended'),
    ];
    state.sessions = Object.freeze(resources) as unknown as SessionWithActivitiesResource[];
    const { result } = renderHook(useActiveDevicesModel, { wrapper });

    expect(result.current.devices.map(item => item.id)).toEqual([fixtures.session!.id, 'first', 'pending', 'last']);
    expect(state.sessions.map(item => item.id)).toEqual(['first', fixtures.session!.id, 'pending', 'last', 'ended']);
    expect(result.current.devices[0].isCurrent).toBe(true);
  });

  it('copies activity and date values and refreshes them on the next render', async () => {
    const source = device('other');
    state.sessions = [source];
    const { wrapper } = await createFixtures(f => f.withUser({ email_addresses: ['test@clerk.com'] }));
    const { result, rerender } = renderHook(useActiveDevicesModel, { wrapper });
    const snapshot = result.current.devices[0];
    const timestamp = source.lastActiveAt.getTime();
    source.lastActiveAt.setTime(timestamp + 1000);
    source.latestActivity.browserName = 'Chrome';
    source.latestActivity.city = 'Boston';

    expect(snapshot.lastActiveAt).toBe(timestamp);
    expect(snapshot.browser).toBe('Firefox');
    expect(snapshot.location).toBe('Austin');
    expect(snapshot).not.toHaveProperty('latestActivity');
    expect(snapshot).not.toHaveProperty('revoke');
    rerender();
    expect(result.current.devices[0].lastActiveAt).toBe(timestamp + 1000);
    expect(result.current.devices[0].browser).toBe('Chrome');
    expect(result.current.devices[0].location).toBe('Boston');
  });

  it('discards SDK results and refreshes after revocation', async () => {
    const source = device('other');
    source.revoke = vi.fn().mockResolvedValue(source);
    state.sessions = [source];
    const { wrapper } = await createFixtures(f => f.withUser({ email_addresses: ['test@clerk.com'] }));
    const { result } = renderHook(useActiveDevicesModel, { wrapper });

    await expect(result.current.devices[0].revokeSession()).resolves.toBeUndefined();
    expect(source.revoke).toHaveBeenCalledOnce();
    expect(state.revalidate).toHaveBeenCalledOnce();
  });

  it.each(['user', 'session'] as const)('does not revoke after the active %s changes', async change => {
    const source = device('other');
    source.revoke = vi.fn().mockResolvedValue(source);
    state.sessions = [source];
    const { wrapper, fixtures } = await createFixtures(f => f.withUser({ email_addresses: ['test@clerk.com'] }));
    const { result } = renderHook(useActiveDevicesModel, { wrapper });
    const retainedRevoke = result.current.devices[0].revokeSession;
    if (change === 'user') {
      vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue({ ...fixtures.clerk.user!, id: 'user_second' });
    } else {
      vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue({ ...fixtures.session!, id: source.id });
    }

    await expect(retainedRevoke()).resolves.toBeUndefined();
    expect(source.revoke).not.toHaveBeenCalled();
    expect(state.revalidate).not.toHaveBeenCalled();
  });

  it.each(['unchanged', 'user', 'session'] as const)('checks ownership after reverification when %s', async change => {
    const source = device('other');
    source.revoke = vi
      .fn()
      .mockRejectedValueOnce(
        new ClerkAPIResponseError('Reverification required', {
          status: 403,
          data: [{ code: 'session_reverification_required', message: 'Reverification required' }],
        }),
      )
      .mockResolvedValue(source);
    state.sessions = [source];
    const { wrapper, fixtures } = await createFixtures(f => f.withUser({ email_addresses: ['test@clerk.com'] }));
    const openReverification = vi.spyOn(fixtures.clerk, '__internal_openReverification').mockImplementation(() => {});
    const { result } = renderHook(useActiveDevicesModel, { wrapper });
    const pending = result.current.devices[0].revokeSession();
    await waitFor(() => expect(openReverification).toHaveBeenCalledOnce());
    if (change === 'user') {
      vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue({ ...fixtures.clerk.user!, id: 'user_second' });
    } else if (change === 'session') {
      vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue({ ...fixtures.session!, id: source.id });
    }
    openReverification.mock.calls[0][0].afterVerification?.();
    await pending;

    expect(source.revoke).toHaveBeenCalledTimes(change === 'unchanged' ? 2 : 1);
    expect(state.revalidate).toHaveBeenCalledTimes(change === 'unchanged' ? 1 : 0);
  });

  it('shares a pending revocation and ignores retained callbacks after unmount', async () => {
    const completion = createDeferredPromise();
    const source = device('other');
    source.revoke = vi.fn().mockReturnValue(completion.promise);
    state.sessions = [source];
    const { wrapper } = await createFixtures(f => f.withUser({ email_addresses: ['test@clerk.com'] }));
    const { result, unmount } = renderHook(() => useActiveDeviceController(useActiveDevicesModel().devices[0]), {
      wrapper,
    });
    const retainedRevoke = result.current.revoke;
    let first!: Promise<void>;
    let second!: Promise<void>;
    act(() => {
      first = retainedRevoke();
      second = retainedRevoke();
    });
    expect(first).toBe(second);
    await waitFor(() => expect(source.revoke).toHaveBeenCalledOnce());
    expect(result.current.isLoading).toBe(true);
    unmount();
    completion.resolve(source);
    await first;
    await retainedRevoke();
    expect(source.revoke).toHaveBeenCalledOnce();
    expect(state.revalidate).not.toHaveBeenCalled();
  });

  it('renders device information and hides the current device menu', async () => {
    const { wrapper, fixtures } = await createFixtures(f => f.withUser({ email_addresses: ['test@clerk.com'] }));
    const current = device(fixtures.session!.id);
    current.latestActivity.deviceType = 'Current device';
    const other = device('other');
    other.latestActivity.deviceType = 'Other device';
    state.sessions = [other, current];
    const { getByText, getAllByRole } = render(<ActiveDevicesSection />, { wrapper });

    expect(getByText('Current device')).toBeVisible();
    expect(getByText('Other device')).toBeVisible();
    expect(getByText('This device')).toBeVisible();
    expect(getAllByRole('button', { name: 'Open menu' })).toHaveLength(1);
  });

  it.each(['user', 'session', 'client', 'unmount', 'caller'] as const)(
    'does not refresh or report a late failure after losing its %s',
    async loss => {
      const completion = createDeferredPromise();
      const source = device('other');
      source.revoke = vi.fn().mockReturnValue(completion.promise);
      state.sessions = [source];
      const { wrapper, fixtures } = await createFixtures(f => f.withUser({ email_addresses: ['test@clerk.com'] }));
      const { result, unmount } = renderHook(useActiveDevicesModel, { wrapper });
      let active = true;
      const request = result.current.devices[0].revokeSession(() => active);
      if (loss === 'unmount') {
        unmount();
      } else if (loss === 'caller') {
        active = false;
      } else if (loss === 'user') {
        vi.spyOn(fixtures.clerk, 'user', 'get').mockReturnValue({ ...fixtures.clerk.user!, id: 'user_other' });
      } else if (loss === 'session') {
        vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue({ ...fixtures.clerk.session!, id: 'session_other' });
      } else {
        vi.spyOn(fixtures.clerk, 'client', 'get').mockReturnValue({ ...fixtures.clerk.client, id: 'client_other' });
      }
      completion.reject(
        new ClerkAPIResponseError('Request failed', {
          status: 500,
          data: [{ code: 'internal_server_error', message: 'Please try again' }],
        }),
      );
      await expect(request).resolves.toBeUndefined();
      expect(state.revalidate).not.toHaveBeenCalled();
    },
  );

  it.each(['session', 'client', 'unmount', 'caller'] as const)(
    'does not refresh after a successful revocation loses its %s',
    async loss => {
      const completion = createDeferredPromise();
      const source = device('other');
      source.revoke = vi.fn().mockReturnValue(completion.promise);
      state.sessions = [source];
      const { wrapper, fixtures } = await createFixtures(f => f.withUser({ email_addresses: ['test@clerk.com'] }));
      const { result, unmount } = renderHook(useActiveDevicesModel, { wrapper });
      let active = true;
      const request = result.current.devices[0].revokeSession(() => active);
      if (loss === 'unmount') {
        unmount();
      } else if (loss === 'caller') {
        active = false;
      } else if (loss === 'session') {
        vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue({ ...fixtures.clerk.session!, id: 'session_other' });
      } else {
        vi.spyOn(fixtures.clerk, 'client', 'get').mockReturnValue({ ...fixtures.clerk.client, id: 'client_other' });
      }
      completion.resolve(source);
      await request;
      expect(state.revalidate).not.toHaveBeenCalled();
    },
  );

  it.each(['session', 'client', 'unmount', 'caller'] as const)(
    'does not retry reverification after losing its %s',
    async loss => {
      const source = device('other');
      source.revoke = vi
        .fn()
        .mockRejectedValueOnce(
          new ClerkAPIResponseError('Verification required', {
            status: 403,
            data: [{ code: 'session_reverification_required', message: 'Verification required' }],
          }),
        )
        .mockResolvedValue(source);
      state.sessions = [source];
      const { wrapper, fixtures } = await createFixtures(f => f.withUser({ email_addresses: ['test@clerk.com'] }));
      const { result, unmount } = renderHook(useActiveDevicesModel, { wrapper });
      let active = true;
      const request = result.current.devices[0].revokeSession(() => active);
      await waitFor(() => expect(fixtures.clerk.__internal_openReverification).toHaveBeenCalledOnce());
      if (loss === 'unmount') {
        unmount();
      } else if (loss === 'caller') {
        active = false;
      } else if (loss === 'session') {
        vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue({ ...fixtures.clerk.session!, id: 'session_other' });
      } else {
        vi.spyOn(fixtures.clerk, 'client', 'get').mockReturnValue({ ...fixtures.clerk.client, id: 'client_other' });
      }
      fixtures.clerk.__internal_openReverification.mock.calls[0][0].afterVerification?.();
      await request;
      expect(source.revoke).toHaveBeenCalledOnce();
      expect(state.revalidate).not.toHaveBeenCalled();
    },
  );

  it.each(['removed', 'ended', 'replaced'] as const)(
    'resolves the target again after it is %s during reverification',
    async change => {
      const source = device('other');
      source.revoke = vi.fn().mockRejectedValueOnce(
        new ClerkAPIResponseError('Verification required', {
          status: 403,
          data: [{ code: 'session_reverification_required', message: 'Verification required' }],
        }),
      );
      state.sessions = [source];
      const { wrapper, fixtures } = await createFixtures(f => f.withUser({ email_addresses: ['test@clerk.com'] }));
      const { result, rerender } = renderHook(useActiveDevicesModel, { wrapper });
      const request = result.current.devices[0].revokeSession();
      await waitFor(() => expect(fixtures.clerk.__internal_openReverification).toHaveBeenCalledOnce());
      const replacement = device('other');
      replacement.revoke = vi.fn().mockResolvedValue(replacement);
      if (change === 'removed') {
        state.sessions = [];
      } else if (change === 'ended') {
        source.status = 'ended';
      } else {
        state.sessions = [replacement];
      }
      rerender();
      fixtures.clerk.__internal_openReverification.mock.calls[0][0].afterVerification?.();
      await request;
      expect(source.revoke).toHaveBeenCalledOnce();
      expect(replacement.revoke).toHaveBeenCalledTimes(change === 'replaced' ? 1 : 0);
      expect(state.revalidate).toHaveBeenCalledTimes(change === 'replaced' ? 1 : 0);
    },
  );

  it('does not revive retained commands when the session changes and returns', async () => {
    const source = device('other');
    state.sessions = [source];
    const { wrapper, fixtures } = await createFixtures(f => f.withUser({ email_addresses: ['test@clerk.com'] }));
    const { result, rerender } = renderHook(useActiveDevicesModel, { wrapper });
    const old = result.current;
    const session = fixtures.clerk.session!;
    const getter = vi.spyOn(fixtures.clerk, 'session', 'get');
    getter.mockReturnValue({ ...session, id: 'session_other' });
    fixtures.clerk.__internal_lastEmittedResources = {
      ...fixtures.clerk.__internal_lastEmittedResources!,
      session: fixtures.clerk.session,
    };
    rerender();
    getter.mockReturnValue(session);
    fixtures.clerk.__internal_lastEmittedResources = { ...fixtures.clerk.__internal_lastEmittedResources, session };
    rerender();
    expect(result.current.scopeKey).not.toBe(old.scopeKey);
    await old.devices[0].revokeSession();
    expect(source.revoke).not.toHaveBeenCalled();
  });

  it('rejects a direct revocation of the current session', async () => {
    const { wrapper, fixtures } = await createFixtures(f => f.withUser({ email_addresses: ['test@clerk.com'] }));
    const current = device(fixtures.clerk.session!.id);
    state.sessions = [current];
    const { result } = renderHook(useActiveDevicesModel, { wrapper });
    await result.current.devices[0].revokeSession();
    expect(current.revoke).not.toHaveBeenCalled();
    expect(state.revalidate).not.toHaveBeenCalled();
  });
});
