import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Card } from '../../components/card';
import { Dialog } from '../../components/dialog';
import { MosaicProvider } from '../../MosaicProvider';
import type { UserProfileDeviceDetailsFlowState } from '../dialogs/flow.types';
import { UserProfileDeviceDialogView } from '../user-profile-device-dialog.view';

const state: UserProfileDeviceDetailsFlowState = {
  device: {
    id: 'desktop',
    title: 'Macbook Pro · Chrome',
    lastActiveAtLabel: 'Last active 4 days ago',
    deviceName: 'Macbook Pro',
    browserName: 'Chrome 150.0.0.0',
    ipAddress: '2600:100e:b10b:787b:e8ae:6e75:fc2f:b10',
    location: 'Salt Lake City, UT, United States',
    locationFlag: '🇺🇸',
    originalSignInAtLabel: 'July 5th, 2026',
  },
  isSubmitting: false,
  errors: {},
};

describe('UserProfileDeviceDialogView', () => {
  it('renders the selected device details', () => {
    render(
      <MosaicProvider>
        <DeviceDialog
          state={state}
          onSignOut={vi.fn()}
        />
      </MosaicProvider>,
    );

    expect(screen.getByRole('dialog', { name: 'Macbook Pro · Chrome' })).toHaveAccessibleDescription(
      'Last active 4 days ago',
    );
    expect(screen.getByText('Chrome 150.0.0.0')).toBeInTheDocument();
    expect(screen.getByText('Salt Lake City, UT, United States')).toBeInTheDocument();
  });

  it('submits device sign-out directly', async () => {
    const onSignOut = vi.fn();
    const user = userEvent.setup();
    render(
      <MosaicProvider>
        <DeviceDialog
          state={state}
          onSignOut={onSignOut}
        />
      </MosaicProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(onSignOut).toHaveBeenCalledOnce();
  });

  it('announces pending and error states', async () => {
    render(
      <MosaicProvider>
        <DeviceDialog
          state={{ ...state, isSubmitting: true, errors: { form: 'Something went wrong. Please try again.' } }}
          onSignOut={vi.fn()}
        />
      </MosaicProvider>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong. Please try again.');
    expect(screen.getByRole('button', { name: 'Sign out' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('progressbar', { name: 'Signing out device' })).toBeInTheDocument();
  });
});

function DeviceDialog({ state, onSignOut }: { state: UserProfileDeviceDetailsFlowState; onSignOut: () => void }) {
  return (
    <Dialog.Root
      size='card'
      open
    >
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Viewport>
          <Dialog.Popup
            render={
              <Card.Root
                elevation='overlay'
                renderBranding={false}
              />
            }
          >
            <UserProfileDeviceDialogView
              state={state}
              onSignOut={onSignOut}
            />
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
