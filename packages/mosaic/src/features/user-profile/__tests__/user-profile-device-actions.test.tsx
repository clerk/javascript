import { createDeferredPromise } from '@clerk/shared/utils';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../mosaic-provider';
import type { UserProfileDevice } from '../user-profile-active-devices-section/user-profile-active-devices.types';
import { UserProfileActiveDevicesSectionView } from '../user-profile-active-devices-section/user-profile-active-devices-section.view';

const current: UserProfileDevice = {
  id: 'current',
  name: 'Safari on macOS',
  description: 'Salt Lake City, UT, United States',
  type: 'desktop',
  isCurrent: true,
};

const mobile: UserProfileDevice = {
  id: 'mobile',
  name: 'Safari on iOS',
  description: 'Last seen 2 weeks ago · Orem, UT, United States',
  type: 'mobile',
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('signing out of all other devices', () => {
  function renderAll(onSignOutAllOtherDevices: () => void | Promise<void>, devices = [current, mobile]) {
    return render(
      <MosaicProvider>
        <UserProfileActiveDevicesSectionView
          devices={devices}
          onSignOutAllOtherDevices={onSignOutAllOtherDevices}
        />
      </MosaicProvider>,
    );
  }

  const confirmation = () => screen.getByRole('alertdialog');

  it('confirms first, naming how many devices it covers', async () => {
    const user = userEvent.setup();
    const onSignOutAllOtherDevices = vi.fn();
    renderAll(onSignOutAllOtherDevices, [current, mobile, { id: 'desktop', name: 'Clerk App', type: 'desktop' }]);
    await user.click(screen.getByRole('button', { name: 'Sign out of all devices' }));

    expect(within(confirmation()).getByText(/2 other devices will be signed out/)).toBeInTheDocument();
    expect(onSignOutAllOtherDevices).not.toHaveBeenCalled();

    await user.click(within(confirmation()).getByRole('button', { name: 'Sign out' }));
    expect(onSignOutAllOtherDevices).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  });

  it('leaves the devices alone when the confirmation is cancelled', async () => {
    const user = userEvent.setup();
    const onSignOutAllOtherDevices = vi.fn();
    renderAll(onSignOutAllOtherDevices);
    await user.click(screen.getByRole('button', { name: 'Sign out of all devices' }));
    await user.click(within(confirmation()).getByRole('button', { name: 'Cancel' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(onSignOutAllOtherDevices).not.toHaveBeenCalled();
  });

  it('holds the confirmation open and explains a failure', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();
    const onSignOutAllOtherDevices = vi
      .fn()
      .mockRejectedValueOnce(new Error('Cannot read properties of undefined'))
      .mockResolvedValue(undefined);
    renderAll(onSignOutAllOtherDevices);
    await user.click(screen.getByRole('button', { name: 'Sign out of all devices' }));
    await user.click(within(confirmation()).getByRole('button', { name: 'Sign out' }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Something went wrong signing these devices out. Please try again.',
      ),
    );
    expect(confirmation()).toBeInTheDocument();

    await user.click(within(confirmation()).getByRole('button', { name: 'Sign out' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(onSignOutAllOtherDevices).toHaveBeenCalledTimes(2);
  });

  it('ignores a second press while one is in flight', async () => {
    const user = userEvent.setup();
    const signOutAll = createDeferredPromise();
    const onSignOutAllOtherDevices = vi.fn(() => signOutAll.promise);
    renderAll(onSignOutAllOtherDevices);
    await user.click(screen.getByRole('button', { name: 'Sign out of all devices' }));
    const confirm = within(confirmation()).getByRole('button', { name: 'Sign out' });
    await user.click(confirm);
    await waitFor(() => expect(confirm).toHaveAttribute('aria-busy'));
    await user.click(confirm);

    expect(onSignOutAllOtherDevices).toHaveBeenCalledTimes(1);

    await act(async () => {
      signOutAll.resolve();
      await signOutAll.promise;
    });
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  });
});
