import { createDeferredPromise } from '@clerk/shared/utils';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../MosaicProvider';
import type { UserProfileDevice } from '../user-profile-active-devices.types';
import { UserProfileActiveDevicesSectionView } from '../user-profile-active-devices-section.view';

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
  lastActive: '4 days ago',
  model: 'iPhone 16 Pro',
  browser: 'Safari 18.4',
  ipAddress: '2600:100e:b10b:787b:e8ae:6e75',
  location: 'Orem, UT, United States',
  signedInAt: 'July 5th, 2026',
};

function renderDevices(onSignOutDevice?: (id: string) => void | Promise<void>) {
  return render(
    <MosaicProvider>
      <UserProfileActiveDevicesSectionView
        devices={[current, mobile]}
        onSignOutDevice={onSignOutDevice}
      />
    </MosaicProvider>,
  );
}

async function openMenu(user: ReturnType<typeof userEvent.setup>, device: UserProfileDevice) {
  await user.click(screen.getByRole('button', { name: `Manage ${device.name}` }));
}

describe('active device details', () => {
  it('opens the details of the device the menu belongs to', async () => {
    const user = userEvent.setup();
    renderDevices();
    await openMenu(user, mobile);
    await user.click(screen.getByRole('menuitem', { name: 'View details' }));

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: 'Safari on iOS' })).toBeInTheDocument();
    expect(within(dialog).getByText('Last active 4 days ago')).toBeInTheDocument();
    expect(within(dialog).getByText('iPhone 16 Pro')).toBeInTheDocument();
    expect(within(dialog).getByText('2600:100e:b10b:787b:e8ae:6e75')).toBeInTheDocument();
    expect(within(dialog).getByText('July 5th, 2026')).toBeInTheDocument();
  });

  it('omits the rows a device has no detail for', async () => {
    const user = userEvent.setup();
    renderDevices();
    await openMenu(user, current);
    await user.click(screen.getByRole('menuitem', { name: 'View details' }));

    expect(within(screen.getByRole('dialog')).queryByText('Browser')).not.toBeInTheDocument();
  });

  it('closes the current device from the footer, with nothing to sign out', async () => {
    const user = userEvent.setup();
    renderDevices(vi.fn());
    await openMenu(user, current);
    await user.click(screen.getByRole('menuitem', { name: 'View details' }));

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).queryByRole('button', { name: 'Sign out' })).not.toBeInTheDocument();
    // The header's corner dismiss is also named Close, so this picks the footer's by its text.
    await user.click(within(dialog).getByText('Close'));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});

describe('active device sign out', () => {
  it('confirms before signing a device out', async () => {
    const user = userEvent.setup();
    const onSignOutDevice = vi.fn();
    renderDevices(onSignOutDevice);
    await openMenu(user, mobile);
    await user.click(screen.getByRole('menuitem', { name: 'Sign out' }));

    const confirmation = screen.getByRole('alertdialog');
    expect(within(confirmation).getByText(/Safari on iOS will be signed out/)).toBeInTheDocument();
    expect(onSignOutDevice).not.toHaveBeenCalled();

    await user.click(within(confirmation).getByRole('button', { name: 'Sign out' }));
    expect(onSignOutDevice).toHaveBeenCalledWith('mobile');
  });

  it('shows a failure in the confirmation and allows retrying', async () => {
    const user = userEvent.setup();
    const onSignOutDevice = vi.fn().mockRejectedValueOnce(new Error('Unable to sign out')).mockResolvedValue(undefined);
    renderDevices(onSignOutDevice);
    await openMenu(user, mobile);
    await user.click(screen.getByRole('menuitem', { name: 'Sign out' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Sign out' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to sign out');

    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Sign out' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(onSignOutDevice).toHaveBeenCalledTimes(2);
  });

  it('signs out from the details dialog without a second confirmation', async () => {
    const user = userEvent.setup();
    function Example() {
      const [devices, setDevices] = useState([current, mobile]);
      return (
        <MosaicProvider>
          <UserProfileActiveDevicesSectionView
            devices={devices}
            onSignOutDevice={id => setDevices(list => list.filter(device => device.id !== id))}
          />
        </MosaicProvider>
      );
    }
    render(<Example />);
    await openMenu(user, mobile);
    await user.click(screen.getByRole('menuitem', { name: 'View details' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Sign out' }));

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Manage Safari on iOS' })).not.toBeInTheDocument();
  });

  it('holds the details dialog open while the sign out is in flight', async () => {
    const user = userEvent.setup();
    const signOut = createDeferredPromise();
    renderDevices(() => signOut.promise);
    await openMenu(user, mobile);
    await user.click(screen.getByRole('menuitem', { name: 'View details' }));
    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Sign out' }));

    await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Sign out' })).toHaveAttribute('aria-busy'));
    expect(dialog).toBeInTheDocument();

    await act(async () => {
      signOut.resolve();
      await signOut.promise;
    });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('keeps the details dialog open and explains a failed sign out', async () => {
    const user = userEvent.setup();
    const onSignOutDevice = vi.fn().mockRejectedValueOnce(new Error('Unable to sign out')).mockResolvedValue(undefined);
    renderDevices(onSignOutDevice);
    await openMenu(user, mobile);
    await user.click(screen.getByRole('menuitem', { name: 'View details' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Sign out' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to sign out');
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Sign out' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(onSignOutDevice).toHaveBeenCalledTimes(2);
  });
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
    expect(screen.getByRole('button', { name: 'Sign out of all devices' })).toHaveFocus();
  });

  it('holds the confirmation open and explains a failure', async () => {
    const user = userEvent.setup();
    const onSignOutAllOtherDevices = vi
      .fn()
      .mockRejectedValueOnce(new Error('Unable to sign out of all devices'))
      .mockResolvedValue(undefined);
    renderAll(onSignOutAllOtherDevices);
    await user.click(screen.getByRole('button', { name: 'Sign out of all devices' }));
    await user.click(within(confirmation()).getByRole('button', { name: 'Sign out' }));

    expect(await screen.findByText('Unable to sign out of all devices')).toBeInTheDocument();
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

describe('focus after signing a device out', () => {
  const desktop: UserProfileDevice = { id: 'desktop', name: 'Clerk App on macOS', type: 'desktop' };

  function Example({ devices: initial }: { devices: UserProfileDevice[] }) {
    const [devices, setDevices] = useState(initial);
    return (
      <MosaicProvider>
        <UserProfileActiveDevicesSectionView
          devices={devices}
          onSignOutDevice={id => setDevices(list => list.filter(device => device.id !== id))}
        />
      </MosaicProvider>
    );
  }

  it('hands focus to the row that took its place, from the confirmation', async () => {
    const user = userEvent.setup();
    render(<Example devices={[current, mobile, desktop]} />);
    await openMenu(user, mobile);
    await user.click(screen.getByRole('menuitem', { name: 'Sign out' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Sign out' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Manage Clerk App on macOS' })).toHaveFocus());
  });

  it('hands focus to the row that took its place, from the details dialog', async () => {
    const user = userEvent.setup();
    render(<Example devices={[current, mobile, desktop]} />);
    await openMenu(user, mobile);
    await user.click(screen.getByRole('menuitem', { name: 'View details' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Sign out' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Manage Clerk App on macOS' })).toHaveFocus());
  });

  it('falls back to the last row, then to the current device', async () => {
    const user = userEvent.setup();
    render(<Example devices={[current, mobile, desktop]} />);
    await openMenu(user, desktop);
    await user.click(screen.getByRole('menuitem', { name: 'Sign out' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Sign out' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Manage Safari on iOS' })).toHaveFocus());

    await openMenu(user, mobile);
    await user.click(screen.getByRole('menuitem', { name: 'Sign out' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Sign out' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Manage Safari on macOS' })).toHaveFocus());
  });

  it('skips the signed-out row when the list only catches up later', async () => {
    const user = userEvent.setup();
    const catchUp = createDeferredPromise();
    function LateExample() {
      const [devices, setDevices] = useState([current, mobile, desktop]);
      return (
        <MosaicProvider>
          <UserProfileActiveDevicesSectionView
            devices={devices}
            // Resolves before the row goes, the way a revoke followed by a refetch does.
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

  it('still returns focus to the row itself when the sign out is cancelled', async () => {
    const user = userEvent.setup();
    render(<Example devices={[current, mobile, desktop]} />);
    await openMenu(user, mobile);
    await user.click(screen.getByRole('menuitem', { name: 'Sign out' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Cancel' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Manage Safari on iOS' })).toHaveFocus());
  });
});
