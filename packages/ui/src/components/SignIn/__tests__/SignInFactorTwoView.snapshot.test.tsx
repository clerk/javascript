import type { SignInResource } from '@clerk/shared/types';
import { describe, expect, it, vi } from 'vitest';

import { renderForSnapshot } from '@/test/render-for-snapshot';

import { SignInFactorTwoView, type SignInFactorTwoViewProps } from '../SignInFactorTwoView';

const noop = vi.fn();
const asyncNoop = vi.fn().mockResolvedValue(undefined);

const defaultProps: SignInFactorTwoViewProps = {
  currentFactor: { strategy: 'totp' } as any,

  showAllStrategies: false,
  factorAlreadyPrepared: false,

  isResettingPassword: false,
  showNewDeviceVerificationNotice: false,

  avatarUrl: undefined,

  onToggleAllStrategies: noop,
  onSelectFactor: noop,
  onFactorPrepare: noop,

  onAttemptCode: noop as any,
  onAttemptBackupCode: asyncNoop,
  onPrepareSecondFactor: asyncNoop as any,

  signIn: {} as SignInResource,
  onEmailLinkVerificationComplete: asyncNoop,
  onUserLockedError: vi.fn().mockReturnValue(false),
  emailLinkRedirectUrl: 'https://example.com/verify',
  isNewDevice: false,
};

describe('SignInFactorTwoView snapshots', () => {
  it('renders TOTP card', () => {
    const { container } = renderForSnapshot(<SignInFactorTwoView {...defaultProps} />);
    expect(container).toMatchSnapshot();
  });

  it('renders phone code card', () => {
    const { container } = renderForSnapshot(
      <SignInFactorTwoView
        {...defaultProps}
        currentFactor={{ strategy: 'phone_code', phoneNumberId: 'idn_123', safeIdentifier: '+1***1234' } as any}
      />,
    );
    expect(container).toMatchSnapshot();
  });

  it('renders email code card', () => {
    const { container } = renderForSnapshot(
      <SignInFactorTwoView
        {...defaultProps}
        currentFactor={{ strategy: 'email_code', emailAddressId: 'idn_123', safeIdentifier: 'u***@example.com' } as any}
      />,
    );
    expect(container).toMatchSnapshot();
  });

  it('renders backup code card', () => {
    const { container } = renderForSnapshot(
      <SignInFactorTwoView
        {...defaultProps}
        currentFactor={{ strategy: 'backup_code' } as any}
      />,
    );
    expect(container).toMatchSnapshot();
  });

  it('renders loading state when no current factor', () => {
    const { container } = renderForSnapshot(
      <SignInFactorTwoView
        {...defaultProps}
        currentFactor={null}
      />,
    );
    expect(container).toMatchSnapshot();
  });

  it('renders with resetting password subtitle', () => {
    const { container } = renderForSnapshot(
      <SignInFactorTwoView
        {...defaultProps}
        isResettingPassword={true}
      />,
    );
    expect(container).toMatchSnapshot();
  });

  it('renders with new device verification notice', () => {
    const { container } = renderForSnapshot(
      <SignInFactorTwoView
        {...defaultProps}
        showNewDeviceVerificationNotice={true}
      />,
    );
    expect(container).toMatchSnapshot();
  });

  it('renders with client trust notice', () => {
    const { container } = renderForSnapshot(
      <SignInFactorTwoView
        {...defaultProps}
        currentFactor={{ strategy: 'phone_code', phoneNumberId: 'idn_123', safeIdentifier: '+1***1234' } as any}
        showClientTrustNotice={true}
      />,
    );
    expect(container).toMatchSnapshot();
  });

  it('renders default/loading for unknown strategy', () => {
    const { container } = renderForSnapshot(
      <SignInFactorTwoView
        {...defaultProps}
        currentFactor={{ strategy: 'unknown_strategy' } as any}
      />,
    );
    expect(container).toMatchSnapshot();
  });
});
