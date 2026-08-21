import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../MosaicProvider';
import type {
  ReverificationChallengeState,
  UserProfileDeviceDetailsFlowState,
  UserProfileSecurityPanelFlows,
} from '../dialogs/flow.types';
import { UserProfileSecurityPanelView } from '../user-profile-security-panel.view';

const verificationState: ReverificationChallengeState = {
  strategy: 'email_code',
  identifier: 'i••••@clerk.dev',
  value: '',
  status: 'idle',
  errors: {},
  resend: { isResending: false, secondsRemaining: 0 },
};

const verificationActions = {
  onCancel: vi.fn(),
  onResend: vi.fn(),
  onSubmit: vi.fn(),
  onValueChange: vi.fn(),
};

const deviceState: UserProfileDeviceDetailsFlowState = {
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
  isSubmitting: true,
  errors: {},
};

function renderPanel(flows: UserProfileSecurityPanelFlows = {}) {
  return render(
    <MosaicProvider>
      <UserProfileSecurityPanelView {...flows} />
    </MosaicProvider>,
  );
}

describe('UserProfileSecurityPanelView flows', () => {
  it('renders no modal surface when no flow is supplied', () => {
    renderPanel();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('renders password editing from the panel itself', () => {
    renderPanel({
      password: {
        state: {
          mode: 'change',
          values: { newPassword: '', confirmPassword: '', signOutOfOtherSessions: true },
          isSubmitting: false,
          errors: {},
        },
        onCancel: vi.fn(),
        onSubmit: vi.fn(),
        onValueChange: vi.fn(),
      },
    });

    expect(screen.getByRole('dialog', { name: 'Change password' })).toBeInTheDocument();
  });

  it('renders destructive confirmation flows as alert dialogs', () => {
    renderPanel({
      removePasskey: {
        state: { id: 'passkey', name: 'Chrome on macOS', isSubmitting: false, errors: {} },
        onCancel: vi.fn(),
        onRemove: vi.fn(),
      },
    });

    expect(screen.getByRole('alertdialog', { name: 'Remove passkey' })).toBeInTheDocument();
  });

  it('stacks reverification inside the password dialog it interrupted', () => {
    renderPanel({
      password: {
        state: {
          mode: 'change',
          values: { newPassword: 'correct-horse', confirmPassword: 'correct-horse', signOutOfOtherSessions: true },
          isSubmitting: true,
          errors: {},
        },
        onCancel: vi.fn(),
        onSubmit: vi.fn(),
        onValueChange: vi.fn(),
      },
      reverification: {
        operation: 'password',
        state: verificationState,
        ...verificationActions,
      },
    });

    expect(screen.getByRole('heading', { name: 'Verify it’s you' })).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Change password', hidden: true })).toBeInTheDocument();
    expect(screen.getByLabelText('New password', { selector: 'input' })).toBeDisabled();
  });

  it('stacks device reverification inside details when details initiated sign-out', () => {
    renderPanel({
      device: { state: deviceState, onCancel: vi.fn(), onSignOut: vi.fn() },
      reverification: {
        operation: 'sign-out-device',
        state: verificationState,
        ...verificationActions,
      },
    });

    expect(screen.getByRole('heading', { name: 'Verify it’s you' })).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Macbook Pro · Chrome', hidden: true })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign out', hidden: true })).toHaveAttribute('aria-disabled', 'true');
  });

  it('renders direct device sign-out reverification without a host dialog', () => {
    renderPanel({
      reverification: {
        operation: 'sign-out-device',
        state: verificationState,
        ...verificationActions,
      },
    });

    expect(screen.getByRole('dialog', { name: 'Verify it’s you' })).toBeInTheDocument();
  });
});
