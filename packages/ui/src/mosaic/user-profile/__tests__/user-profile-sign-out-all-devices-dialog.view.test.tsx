import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../MosaicProvider';
import { UserProfileSignOutAllDevicesDialogView } from '../user-profile-sign-out-all-devices-dialog.view';

describe('UserProfileSignOutAllDevicesDialogView', () => {
  it('renders an accessible sign-out confirmation', () => {
    render(
      <MosaicProvider>
        <UserProfileSignOutAllDevicesDialogView
          open
          onSignOut={vi.fn()}
        />
      </MosaicProvider>,
    );

    expect(screen.getByRole('alertdialog', { name: 'Sign out of all devices?' })).toHaveAccessibleDescription(
      'You will be signed out of all devices except this one.',
    );
  });

  it('calls the sign-out action without dismissing before it completes', async () => {
    const onSignOut = vi.fn();
    const user = userEvent.setup();
    render(
      <MosaicProvider>
        <UserProfileSignOutAllDevicesDialogView
          open
          onSignOut={onSignOut}
        />
      </MosaicProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Sign out of all devices' }));

    expect(onSignOut).toHaveBeenCalledOnce();
    expect(screen.getByRole('alertdialog', { name: 'Sign out of all devices?' })).toBeInTheDocument();
  });
});
