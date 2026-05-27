import type { SignInResource } from '@clerk/shared/types';
import { describe, expect, it, vi } from 'vitest';

import { renderForSnapshot } from '@/test/render-for-snapshot';

import { SignInFactorOneView, type SignInFactorOneViewProps } from '../SignInFactorOneView';

const noop = vi.fn();
const asyncNoop = vi.fn().mockResolvedValue(undefined);

const defaultProps: SignInFactorOneViewProps = {
  currentFactor: { strategy: 'password' } as any,
  signInStatus: 'needs_first_factor',

  showAllStrategies: false,
  showForgotPasswordStrategies: false,
  passwordErrorCode: null,

  hasAnyAlternativeStrategy: true,
  hasResetPasswordFactor: false,
  hasMultipleEnterpriseConnections: false,
  factorAlreadyPrepared: false,
  shouldAvoidPrepare: false,

  identifier: 'user@example.com',
  avatarUrl: undefined,

  enterpriseConnections: [],

  onGoBack: noop,
  onToggleAllStrategies: noop,
  onToggleForgotPasswordStrategies: noop,
  onSelectFactor: noop,
  onFactorPrepare: noop,
  onClearPasswordError: noop,

  onAttemptPassword: asyncNoop,
  onAttemptCode: noop as any,
  onPrepareFirstFactor: asyncNoop as any,

  authenticateWithPasskey: asyncNoop,

  onEnterpriseSSO: noop,

  signIn: {} as SignInResource,
  onEmailLinkVerificationComplete: asyncNoop,
  onUserLockedError: vi.fn().mockReturnValue(false),
  emailLinkRedirectUrl: 'https://example.com/verify',

  alternativeMethodsMode: 'default',

  onResetPasswordBackLink: noop,
};

describe('SignInFactorOneView snapshots', () => {
  it('renders password card', () => {
    const { container } = renderForSnapshot(<SignInFactorOneView {...defaultProps} />);
    expect(container).toMatchSnapshot();
  });

  it('renders passkey card', () => {
    const { container } = renderForSnapshot(
      <SignInFactorOneView
        {...defaultProps}
        currentFactor={{ strategy: 'passkey' } as any}
      />,
    );
    expect(container).toMatchSnapshot();
  });

  it('renders email code card', () => {
    const { container } = renderForSnapshot(
      <SignInFactorOneView
        {...defaultProps}
        currentFactor={{ strategy: 'email_code', emailAddressId: 'idn_123', safeIdentifier: 'u***@example.com' } as any}
      />,
    );
    expect(container).toMatchSnapshot();
  });

  it('renders phone code card', () => {
    const { container } = renderForSnapshot(
      <SignInFactorOneView
        {...defaultProps}
        currentFactor={{ strategy: 'phone_code', phoneNumberId: 'idn_123', safeIdentifier: '+1***1234' } as any}
      />,
    );
    expect(container).toMatchSnapshot();
  });

  it('renders error state when no available methods', () => {
    const { container } = renderForSnapshot(
      <SignInFactorOneView
        {...defaultProps}
        currentFactor={null}
        signInStatus='needs_first_factor'
      />,
    );
    expect(container).toMatchSnapshot();
  });

  it('renders loading state when signIn status is null', () => {
    const { container } = renderForSnapshot(
      <SignInFactorOneView
        {...defaultProps}
        currentFactor={null}
        signInStatus={null}
      />,
    );
    expect(container).toMatchSnapshot();
  });

  it('renders reset password phone code card', () => {
    const { container } = renderForSnapshot(
      <SignInFactorOneView
        {...defaultProps}
        currentFactor={{ strategy: 'reset_password_phone_code', phoneNumberId: 'idn_123' } as any}
      />,
    );
    expect(container).toMatchSnapshot();
  });

  it('renders reset password email code card', () => {
    const { container } = renderForSnapshot(
      <SignInFactorOneView
        {...defaultProps}
        currentFactor={{ strategy: 'reset_password_email_code', emailAddressId: 'idn_123' } as any}
      />,
    );
    expect(container).toMatchSnapshot();
  });

  it('renders default/loading for unknown strategy', () => {
    const { container } = renderForSnapshot(
      <SignInFactorOneView
        {...defaultProps}
        currentFactor={{ strategy: 'unknown_strategy' } as any}
      />,
    );
    expect(container).toMatchSnapshot();
  });
});
