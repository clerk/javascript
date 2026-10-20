import { Clerk } from '@clerk/clerk-js';
import { ClerkLoomProvider, useLoom, useSessions } from '@clerk/loom/react';
import { ClerkProvider } from '@clerk/react';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { StrictMode, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { fapiUrl, publishableKey, serveFapi, worker } from '../../__tests__/feature/fake-fapi';
import { fapiClient, fapiSession, fapiUser } from '../../__tests__/feature/fapi';
import { openMenu } from '../../__tests__/feature/menu';
import { MosaicProvider } from '../../mosaic-provider';
import { LoomActiveDevices } from './loom-active-devices';

function setup() {
  const user = fapiUser({ id: 'user_loom' });
  const device = (id: string, deviceType: string) => ({
    ...fapiSession({ id, user }),
    user: null,
    ownerUserId: user.id,
    latest_activity: {
      object: 'session_activity' as const,
      id: `activity_${id}`,
      browser_name: 'Safari',
      device_type: deviceType,
    },
  });
  const devices = [device('sess_current', 'MacBook Pro'), device('sess_other', 'iPhone')];
  serveFapi({
    client: fapiClient([fapiSession({ id: 'sess_current', user })]),
    activeDevices: devices,
    deviceTrackingEnabled: true,
    verification: { secrets: { password: 'hunter2' } },
  });
  return devices;
}

function Toggle() {
  const client = useLoom();
  const [show, setShow] = useState(false);
  return (
    <>
      <button
        type='button'
        onMouseEnter={() => void client.prefetch()}
        onFocus={() => void client.prefetch()}
        onClick={() => setShow(value => !value)}
      >
        Devices
      </button>
      {show && <LoomActiveDevices />}
    </>
  );
}

function SessionCount() {
  return (
    <output aria-label='Shared session count'>
      {useSessions().data?.filter(item => item.status === 'active').length}
    </output>
  );
}

async function mount(ui = <LoomActiveDevices />) {
  const clerk = new Clerk(publishableKey());
  const view = render(
    <StrictMode>
      <ClerkProvider
        Clerk={clerk}
        publishableKey={publishableKey()}
        routerPush={() => Promise.resolve()}
        routerReplace={() => Promise.resolve()}
      >
        <ClerkLoomProvider
          host={clerk}
          fallback={<p>Waiting for Clerk</p>}
        >
          <MosaicProvider>{ui}</MosaicProvider>
        </ClerkLoomProvider>
      </ClerkProvider>
    </StrictMode>,
  );
  await waitFor(() => expect(clerk.loaded).toBe(true));
  return { ...view, clerk };
}

describe('Loom with real ClerkProvider and Mosaic', () => {
  it('creates a fresh owner after the real provider is fully remounted', async () => {
    setup();
    const reads = vi.fn();
    worker.use(
      http.get(fapiUrl('/v1/me/sessions/active'), () => {
        reads();
        return undefined;
      }),
    );
    const first = await mount();
    await screen.findByText('This device');
    first.unmount();
    await mount();
    await screen.findByText('This device');
    expect(reads).toHaveBeenCalledTimes(2);
  });
  it('renders fresh devices and reuses prefetched data across remounts', async () => {
    setup();
    const reads = vi.fn();
    worker.use(
      http.get(fapiUrl('/v1/me/sessions/active'), () => {
        reads();
        return undefined;
      }),
    );
    await mount(<Toggle />);
    const user = userEvent.setup();
    await user.hover(await screen.findByRole('button', { name: 'Devices' }));
    await waitFor(() => expect(reads).toHaveBeenCalledTimes(1));
    await user.click(screen.getByRole('button', { name: 'Devices' }));
    expect(await screen.findByText('This device')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Devices' }));
    await user.click(screen.getByRole('button', { name: 'Devices' }));
    expect(await screen.findByRole('button', { name: 'Manage Safari on iPhone' })).toBeVisible();
    expect(reads).toHaveBeenCalledTimes(1);
  });

  it('refreshes explicitly and preserves old rows on a background failure', async () => {
    setup();
    await mount();
    expect(await screen.findByText('This device')).toBeVisible();
    worker.use(
      http.get(fapiUrl('/v1/me/sessions/active'), () =>
        HttpResponse.json({ errors: [{ code: 'offline', message: 'Could not load devices' }] }, { status: 503 }),
      ),
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Refresh devices' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load devices');
    expect(screen.getByRole('button', { name: 'Manage Safari on iPhone' })).toBeVisible();
    worker.use(http.get(fapiUrl('/v1/me/sessions/active'), () => HttpResponse.json([])));
    await user.click(screen.getByRole('button', { name: 'Refresh devices' }));
    expect(await screen.findByText('No active devices')).toBeVisible();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('uses the existing reverification flow and updates the shared list after revoke', async () => {
    const devices = setup();
    let challenged = false;
    worker.use(
      http.post(fapiUrl('/v1/me/sessions/sess_other/revoke'), () => {
        if (challenged) {
          return undefined;
        }
        challenged = true;
        return HttpResponse.json(
          { errors: [{ code: 'session_reverification_required', message: 'Verification required' }] },
          { status: 400 },
        );
      }),
    );
    const { clerk } = await mount(
      <>
        <LoomActiveDevices />
        <SessionCount />
      </>,
    );
    const legacy = vi.spyOn(clerk, '__internal_openReverification').mockImplementation(() => {});
    const user = userEvent.setup();
    await openMenu(user, await screen.findByRole('button', { name: 'Manage Safari on iPhone' }));
    await user.click(screen.getByRole('menuitem', { name: 'Sign out' }));
    const dialog = screen.getByRole('alertdialog');
    await user.click(within(dialog).getByRole('button', { name: 'Sign out' }));
    expect(await within(dialog).findByText('Enter your current password to continue')).toBeVisible();
    expect(legacy).not.toHaveBeenCalled();
    await user.type(within(dialog).getByLabelText('Password'), 'hunter2{Enter}');
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(devices.find(item => item.id === 'sess_other')?.status).toBe('revoked');
    await waitFor(() => expect(screen.getByLabelText('Shared session count')).toHaveTextContent('1'));
    expect(screen.queryByRole('button', { name: 'Manage Safari on iPhone' })).toBeNull();
    await act(() => clerk.signOut());
    await waitFor(() => expect(screen.queryByText('This device')).toBeNull());
  });
});
