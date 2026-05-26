import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderForSnapshot } from '@/test/render-for-snapshot';

import { clearFetchCache, useFetch } from '../../../hooks';
import { localizationKeys } from '../../../localization';
import { SignInFactorOneCodeForm } from '../SignInFactorOneCodeForm';

vi.mock('../../../hooks', async () => {
  const actual = await vi.importActual('../../../hooks');
  return {
    ...actual,
    useFetch: vi.fn(),
  };
});

describe('SignInFactorOneCodeForm snapshots', () => {
  beforeEach(() => {
    clearFetchCache();
    vi.mocked(useFetch).mockClear();
  });

  const defaultProps = {
    factor: {
      strategy: 'email_code' as const,
      emailAddressId: 'ea_123',
      safeIdentifier: 'user@example.com',
    },
    factorAlreadyPrepared: true,
    onFactorPrepare: vi.fn(),
    onAttemptCode: vi.fn(),
    onPrepare: vi.fn().mockResolvedValue({}),
    onGoBack: vi.fn(),
    identifier: 'user@example.com',
    avatarUrl: undefined,
    shouldAvoidPrepare: true,
    cardTitle: localizationKeys('signIn.emailCode.title'),
    cardSubtitle: localizationKeys('signIn.emailCode.subtitle'),
    inputLabel: localizationKeys('signIn.emailCode.formTitle'),
    resendButton: localizationKeys('signIn.emailCode.resendButton'),
  };

  it('renders email code card', () => {
    const { container } = renderForSnapshot(<SignInFactorOneCodeForm {...defaultProps} />);
    expect(container).toMatchSnapshot();
  });

  it('renders with alternative methods', () => {
    const { container } = renderForSnapshot(
      <SignInFactorOneCodeForm
        {...defaultProps}
        onShowAlternativeMethodsClicked={vi.fn()}
      />,
    );
    expect(container).toMatchSnapshot();
  });

  it('renders phone code card', () => {
    const { container } = renderForSnapshot(
      <SignInFactorOneCodeForm
        {...defaultProps}
        factor={{
          strategy: 'phone_code' as const,
          phoneNumberId: 'pn_123',
          safeIdentifier: '+1 (555) 123-4567',
        }}
        cardTitle={localizationKeys('signIn.phoneCode.title')}
        cardSubtitle={localizationKeys('signIn.phoneCode.subtitle')}
        inputLabel={localizationKeys('signIn.phoneCode.formTitle')}
        resendButton={localizationKeys('signIn.phoneCode.resendButton')}
      />,
    );
    expect(container).toMatchSnapshot();
  });
});
