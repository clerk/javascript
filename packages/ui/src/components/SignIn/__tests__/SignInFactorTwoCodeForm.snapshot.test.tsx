import { describe, expect, it, vi } from 'vitest';

import { renderForSnapshot } from '@/test/render-for-snapshot';

import { localizationKeys } from '../../../localization';
import { SignInFactorTwoCodeForm } from '../SignInFactorTwoCodeForm';

describe('SignInFactorTwoCodeForm snapshots', () => {
  const defaultProps = {
    factor: {
      strategy: 'phone_code' as const,
      phoneNumberId: 'pn_123',
      safeIdentifier: '+1 (555) 123-4567',
    },
    factorAlreadyPrepared: true,
    onFactorPrepare: vi.fn(),
    onAttemptCode: vi.fn(),
    avatarUrl: undefined,
    isResettingPassword: false,
    showNewDeviceVerificationNotice: false,
    cardTitle: localizationKeys('signIn.phoneCodeMfa.title'),
    cardSubtitle: localizationKeys('signIn.phoneCodeMfa.subtitle'),
    inputLabel: localizationKeys('signIn.phoneCodeMfa.formTitle'),
    resendButton: localizationKeys('signIn.phoneCodeMfa.resendButton'),
  };

  it('renders phone code MFA card', () => {
    const { container } = renderForSnapshot(<SignInFactorTwoCodeForm {...defaultProps} />);
    expect(container).toMatchSnapshot();
  });

  it('renders with reset password subtitle', () => {
    const { container } = renderForSnapshot(
      <SignInFactorTwoCodeForm
        {...defaultProps}
        isResettingPassword={true}
      />,
    );
    expect(container).toMatchSnapshot();
  });

  it('renders with new device verification notice', () => {
    const { container } = renderForSnapshot(
      <SignInFactorTwoCodeForm
        {...defaultProps}
        showNewDeviceVerificationNotice={true}
      />,
    );
    expect(container).toMatchSnapshot();
  });

  it('renders with client trust notice', () => {
    const { container } = renderForSnapshot(
      <SignInFactorTwoCodeForm
        {...defaultProps}
        showClientTrustNotice={true}
      />,
    );
    expect(container).toMatchSnapshot();
  });

  it('renders TOTP card', () => {
    const { container } = renderForSnapshot(
      <SignInFactorTwoCodeForm
        {...defaultProps}
        factor={{ strategy: 'totp' as const }}
        cardTitle={localizationKeys('signIn.totpMfa.title')}
        cardSubtitle={localizationKeys('signIn.totpMfa.subtitle')}
        inputLabel={localizationKeys('signIn.totpMfa.formTitle')}
        resendButton={undefined}
      />,
    );
    expect(container).toMatchSnapshot();
  });

  it('renders email code MFA card', () => {
    const { container } = renderForSnapshot(
      <SignInFactorTwoCodeForm
        {...defaultProps}
        factor={{
          strategy: 'email_code' as const,
          emailAddressId: 'ea_123',
          safeIdentifier: 'user@example.com',
        }}
        cardTitle={localizationKeys('signIn.emailCodeMfa.title')}
        cardSubtitle={localizationKeys('signIn.emailCodeMfa.subtitle')}
        inputLabel={localizationKeys('signIn.emailCodeMfa.formTitle')}
        resendButton={localizationKeys('signIn.emailCodeMfa.resendButton')}
      />,
    );
    expect(container).toMatchSnapshot();
  });
});
