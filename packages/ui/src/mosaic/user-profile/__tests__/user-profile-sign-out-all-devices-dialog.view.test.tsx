import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AlertDialog } from '../../components/alert-dialog';
import { MosaicProvider } from '../../MosaicProvider';
import { UserProfileSignOutAllDevicesDialogView } from '../user-profile-sign-out-all-devices-dialog.view';

describe('UserProfileSignOutAllDevicesDialogView', () => {
  it('renders an accessible sign-out confirmation', () => {
    render(
      <MosaicProvider>
        <AlertDialog open>
          <UserProfileSignOutAllDevicesDialogView
            state={{ isSubmitting: false, errors: {} }}
            onCancel={vi.fn()}
            onSignOut={vi.fn()}
          />
        </AlertDialog>
      </MosaicProvider>,
    );

    expect(screen.getByRole('alertdialog', { name: 'Sign out of all other devices?' })).toHaveAccessibleDescription(
      'You will be signed out of all devices except this one.',
    );
  });

  it('calls the sign-out action without dismissing before it completes', async () => {
    const onSignOut = vi.fn();
    const user = userEvent.setup();
    render(
      <MosaicProvider>
        <AlertDialog open>
          <UserProfileSignOutAllDevicesDialogView
            state={{ isSubmitting: false, errors: {} }}
            onCancel={vi.fn()}
            onSignOut={onSignOut}
          />
        </AlertDialog>
      </MosaicProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Sign out of all other devices' }));

    expect(onSignOut).toHaveBeenCalledOnce();
    expect(screen.getByRole('alertdialog', { name: 'Sign out of all other devices?' })).toBeInTheDocument();
  });

  it('renders an unattributed form error', () => {
    render(
      <MosaicProvider>
        <AlertDialog open>
          <UserProfileSignOutAllDevicesDialogView
            state={{ isSubmitting: false, errors: { form: 'Something went wrong. Please try again.' } }}
            onCancel={vi.fn()}
            onSignOut={vi.fn()}
          />
        </AlertDialog>
      </MosaicProvider>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong. Please try again.');
  });

  it('announces a pending sign-out without changing the button label', () => {
    render(
      <MosaicProvider>
        <AlertDialog open>
          <UserProfileSignOutAllDevicesDialogView
            state={{ isSubmitting: true, errors: {} }}
            onCancel={vi.fn()}
            onSignOut={vi.fn()}
          />
        </AlertDialog>
      </MosaicProvider>,
    );

    expect(screen.getByRole('button', { name: 'Sign out of all other devices' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('progressbar', { name: 'Signing out of all other devices' })).toBeInTheDocument();
  });
});
