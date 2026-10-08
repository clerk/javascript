import { createDeferredPromise } from '@clerk/shared/utils';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
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

async function openMenu(user: ReturnType<typeof userEvent.setup>, device: UserProfileDevice) {
  await user.click(screen.getByRole('button', { name: `Manage ${device.name}` }));
}

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

  it('leaves the devices alone when the confirmation is canceled', async () => {
    const user = userEvent.setup();
    const onSignOutAllOtherDevices = vi.fn();
    renderAll(onSignOutAllOtherDevices);
    await user.click(screen.getByRole('button', { name: 'Sign out of all devices' }));
    await user.click(within(confirmation()).getByRole('button', { name: 'Cancel' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(onSignOutAllOtherDevices).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Sign out of all devices' })).toHaveFocus();
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

  it('hands focus to the current device once the others are gone', async () => {
    const user = userEvent.setup();
    function Example() {
      const [devices, setDevices] = useState([current, mobile]);
      return (
        <MosaicProvider>
          <UserProfileActiveDevicesSectionView
            devices={devices}
            onSignOutAllOtherDevices={() => setDevices(list => list.filter(device => device.isCurrent))}
          />
        </MosaicProvider>
      );
    }
    render(<Example />);
    await user.click(screen.getByRole('button', { name: 'Sign out of all devices' }));
    await user.click(within(confirmation()).getByRole('button', { name: 'Sign out' }));

    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Sign out of all devices' })).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(screen.getByRole('button', { name: 'Manage Safari on macOS' })).toHaveFocus());
  });
});

describe('focus after a delayed row update', () => {
  const desktop: UserProfileDevice = { id: 'desktop', name: 'Clerk App on macOS', type: 'desktop' };

  it('skips the signed-out row when the list only catches up later', async () => {
    const user = userEvent.setup();
    const catchUp = createDeferredPromise();
    function LateExample() {
      const [devices, setDevices] = useState([current, mobile, desktop]);
      return (
        <MosaicProvider>
          <UserProfileActiveDevicesSectionView
            devices={devices}
            onSignOutDevice={id => {
              void catchUp.promise.then(() => setDevices(list => list.filter(device => device.id !== id)));
              return Promise.resolve();
            }}
          />
        </MosaicProvider>
      );
    }
    render(<LateExample />);
    await openMenu(user, mobile);
    await user.click(screen.getByRole('menuitem', { name: 'Sign out' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Sign out' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Manage Clerk App on macOS' })).toHaveFocus());

    await act(async () => {
      catchUp.resolve();
      await catchUp.promise;
    });
    expect(screen.queryByRole('button', { name: 'Manage Safari on iOS' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Manage Clerk App on macOS' })).toHaveFocus();
  });
});
