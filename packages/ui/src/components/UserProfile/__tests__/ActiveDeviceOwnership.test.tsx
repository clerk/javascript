import { ClerkAPIResponseError } from '@clerk/shared/error';
import type { SessionWithActivitiesResource } from '@clerk/shared/types';
import { createDeferredPromise } from '@clerk/shared/utils';
import { StrictMode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { clearFetchCache } from '@/hooks/useFetch';
import { bindCreateFixtures } from '@/test/create-fixtures';
import { act, render, renderHook, waitFor } from '@/test/utils';

import { useActiveDeviceController } from '../active-devices.controller';
import { useActiveDevicesModel } from '../active-devices.model';
import { ActiveDevicesSection } from '../ActiveDevicesSection';

const { createFixtures } = bindCreateFixtures('UserProfile');
function device(id: string, title = id): SessionWithActivitiesResource {
  return {
    id,
    status: 'active',
    lastActiveAt: new Date(),
    latestActivity: { id: `activity_${id}`, deviceType: title, browserName: 'Firefox' },
    actor: null,
    revoke: vi.fn(),
  } as unknown as SessionWithActivitiesResource;
}
const failure = () =>
  new ClerkAPIResponseError('Request failed', {
    status: 500,
    data: [{ code: 'internal_server_error', message: 'Request failed', long_message: 'Please try again' }],
  });
async function setup() {
  return createFixtures(f => {
    f.withUser({ email_addresses: ['test@clerk.com'] });
  });
}
beforeEach(() => {
  clearFetchCache();
});

describe('active-device ownership with session fetching', () => {
  it('ignores an old fetch after the same user switches sessions', async () => {
    const { wrapper, fixtures } = await setup();
    const first = createDeferredPromise<SessionWithActivitiesResource[]>();
    const second = createDeferredPromise<SessionWithActivitiesResource[]>();
    fixtures.clerk.user!.getSessions.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const view = render(<ActiveDevicesSection />, { wrapper });
    await waitFor(() => expect(fixtures.clerk.user!.getSessions).toHaveBeenCalledOnce());
    const session = { ...fixtures.clerk.session!, id: 'session_second' };
    vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue(session);
    fixtures.clerk.__internal_lastEmittedResources = { ...fixtures.clerk.__internal_lastEmittedResources!, session };
    view.rerender(<ActiveDevicesSection />);
    await waitFor(() => expect(fixtures.clerk.user!.getSessions).toHaveBeenCalledTimes(2));
    await act(async () => {
      second.resolve([device('second', 'Second session device')]);
      await second.promise;
    });
    expect(await view.findByText('Second session device')).toBeVisible();
    await act(async () => {
      first.resolve([device('first', 'Old session device')]);
      await first.promise;
    });
    expect(view.queryByText('Old session device')).not.toBeInTheDocument();
    expect(view.getByText('Second session device')).toBeVisible();
  });

  it('shows a current revocation failure and permits a retry', async () => {
    const { wrapper, fixtures } = await setup();
    const remote = device('remote');
    const pending = createDeferredPromise<unknown>();
    remote.revoke = vi.fn().mockReturnValueOnce(pending.promise).mockResolvedValueOnce(remote);
    fixtures.clerk.user!.getSessions.mockResolvedValueOnce([remote]).mockResolvedValue([]);
    const view = render(<ActiveDevicesSection />, { wrapper });
    await view.findByText('remote');
    await view.userEvent.click(view.getByRole('button', { name: 'Open menu' }));
    await view.userEvent.click(await view.findByRole('menuitem', { name: 'Sign out of device' }));
    await waitFor(() => expect(remote.revoke).toHaveBeenCalledOnce());
    await act(async () => {
      pending.reject(failure());
      await pending.promise.catch(() => {});
    });
    expect(await view.findByText('Please try again')).toBeVisible();
    await view.userEvent.click(view.getByRole('button', { name: 'Open menu' }));
    await view.userEvent.click(await view.findByRole('menuitem', { name: 'Sign out of device' }));
    await waitFor(() => expect(remote.revoke).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(view.queryByText('remote')).not.toBeInTheDocument());
  });

  it.each([false, true])('cancels a queued row request when the row closes (Strict Mode: %s)', async strict => {
    const { wrapper, fixtures } = await setup();
    const remote = device('remote');
    fixtures.clerk.user!.getSessions.mockResolvedValue([remote]);
    const model = renderHook(useActiveDevicesModel, { wrapper });
    await waitFor(() => expect(model.result.current.devices).toHaveLength(1));
    const controller = renderHook(() => useActiveDeviceController(model.result.current.devices[0]), {
      wrapper: ({ children }) => wrapper({ children: strict ? <StrictMode>{children}</StrictMode> : children }),
    });
    let request: Promise<void>;
    act(() => {
      request = controller.result.current.revoke();
      controller.unmount();
    });
    await act(async () => {
      await request;
    });
    expect(remote.revoke).not.toHaveBeenCalled();
    expect(model.result.current.devices).toHaveLength(1);
  });

  it.each(['success', 'failure'] as const)('keeps a replacement row pending after an old %s', async outcome => {
    const { wrapper, fixtures } = await setup();
    const first = createDeferredPromise<unknown>();
    const second = createDeferredPromise<unknown>();
    const remote = device('remote');
    remote.revoke = vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    fixtures.clerk.user!.getSessions.mockResolvedValue([remote]);
    const model = renderHook(useActiveDevicesModel, { wrapper });
    await waitFor(() => expect(model.result.current.devices).toHaveLength(1));
    const controller = renderHook(({ row }) => useActiveDeviceController(row), {
      wrapper,
      initialProps: { row: model.result.current.devices[0] },
    });
    let oldRequest: Promise<void>;
    act(() => {
      oldRequest = controller.result.current.revoke();
    });
    await waitFor(() => expect(remote.revoke).toHaveBeenCalledOnce());
    const session = { ...fixtures.clerk.session!, id: 'session_second' };
    vi.spyOn(fixtures.clerk, 'session', 'get').mockReturnValue(session);
    fixtures.clerk.__internal_lastEmittedResources = { ...fixtures.clerk.__internal_lastEmittedResources!, session };
    model.rerender();
    await waitFor(() => expect(model.result.current.devices).toHaveLength(1));
    controller.rerender({ row: model.result.current.devices[0] });
    expect(controller.result.current.isLoading).toBe(false);
    let freshRequest: Promise<void>;
    act(() => {
      freshRequest = controller.result.current.revoke();
    });
    await waitFor(() => expect(remote.revoke).toHaveBeenCalledTimes(2));
    await act(async () => {
      if (outcome === 'success') {
        first.resolve(remote);
      } else {
        first.reject(failure());
      }
      await oldRequest;
    });
    expect(controller.result.current.isLoading).toBe(true);
    expect(controller.result.current.error).toBeUndefined();
    await act(async () => {
      second.resolve(remote);
      await freshRequest;
    });
    expect(controller.result.current.isLoading).toBe(false);
  });

  it('releases only the removed row while another row remains pending', async () => {
    const { wrapper, fixtures } = await setup();
    const first = device('first');
    const second = device('second');
    const firstDone = createDeferredPromise<unknown>();
    const secondDone = createDeferredPromise<unknown>();
    first.revoke = vi.fn().mockReturnValue(firstDone.promise);
    second.revoke = vi.fn().mockReturnValue(secondDone.promise);
    fixtures.clerk.user!.getSessions.mockResolvedValue([first, second]);
    const model = renderHook(useActiveDevicesModel, { wrapper });
    await waitFor(() => expect(model.result.current.devices).toHaveLength(2));
    const rows = renderHook(
      () => ({
        first: useActiveDeviceController(model.result.current.devices[0]),
        second: useActiveDeviceController(model.result.current.devices[1]),
      }),
      { wrapper },
    );
    let request1: Promise<void>;
    let request2: Promise<void>;
    act(() => {
      request1 = rows.result.current.first.revoke();
      request2 = rows.result.current.second.revoke();
    });
    await waitFor(() => expect(second.revoke).toHaveBeenCalledOnce());
    await act(async () => {
      firstDone.resolve(first);
      await request1;
    });
    expect(rows.result.current.first.isLoading).toBe(false);
    expect(rows.result.current.second.isLoading).toBe(true);
    await act(async () => {
      secondDone.resolve(second);
      await request2;
    });
    expect(rows.result.current.second.isLoading).toBe(false);
  });
});
