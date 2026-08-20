import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../MosaicProvider';
import type { UserProfileDeviceDetailsFlowState } from '../dialogs/flow.types';
import { UserProfileDeviceDialogView } from '../user-profile-device-dialog.view';

const state: UserProfileDeviceDetailsFlowState = {
  step: 'details',
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

const DeviceDialogHarness = (props: {
  isSubmitting?: boolean;
  errors?: UserProfileDeviceDetailsFlowState['errors'];
  onSignOut?: () => void;
}) => {
  const [step, setStep] = useState<UserProfileDeviceDetailsFlowState['step']>('details');

  return (
    <MosaicProvider>
      <UserProfileDeviceDialogView
        open
        state={{
          ...state,
          step,
          isSubmitting: step === 'confirm' && Boolean(props.isSubmitting),
          errors: step === 'confirm' ? (props.errors ?? {}) : {},
        }}
        onRequestSignOut={() => setStep('confirm')}
        onCancelSignOut={() => setStep('details')}
        onSignOut={props.onSignOut ?? vi.fn()}
      />
    </MosaicProvider>
  );
};

describe('UserProfileDeviceDialogView', () => {
  it('renders the selected device details', () => {
    render(
      <MosaicProvider>
        <UserProfileDeviceDialogView
          open
          state={state}
          onRequestSignOut={vi.fn()}
          onCancelSignOut={vi.fn()}
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

  it('requests confirmation before submitting the device sign-out', async () => {
    const user = userEvent.setup();
    render(<DeviceDialogHarness />);

    await user.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(await screen.findByRole('alertdialog', { name: 'Sign out of this device?' })).toHaveAccessibleDescription(
      'You will need to sign in again to use your account on this device.',
    );
  });

  it('submits from the confirmation without dismissing early', async () => {
    const onSignOut = vi.fn();
    const user = userEvent.setup();
    render(<DeviceDialogHarness onSignOut={onSignOut} />);

    await user.click(screen.getByRole('button', { name: 'Sign out' }));
    const confirmation = await screen.findByRole('alertdialog', { name: 'Sign out of this device?' });

    await user.click(within(confirmation).getByRole('button', { name: 'Sign out' }));

    expect(onSignOut).toHaveBeenCalledOnce();
    expect(screen.getByRole('alertdialog', { name: 'Sign out of this device?' })).toBeInTheDocument();
  });

  it('announces pending and error states', async () => {
    const user = userEvent.setup();
    render(
      <DeviceDialogHarness
        isSubmitting
        errors={{ form: 'Something went wrong. Please try again.' }}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Sign out' }));
    const confirmation = await screen.findByRole('alertdialog', { name: 'Sign out of this device?' });

    expect(within(confirmation).getByRole('alert')).toHaveTextContent('Something went wrong. Please try again.');
    expect(within(confirmation).getByRole('button', { name: 'Sign out' })).toHaveAttribute('aria-busy', 'true');
    expect(within(confirmation).getByRole('progressbar', { name: 'Signing out device' })).toBeInTheDocument();
  });
});
