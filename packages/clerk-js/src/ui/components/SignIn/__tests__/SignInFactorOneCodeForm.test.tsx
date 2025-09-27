import { beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render } from '@/test/utils';

import { CardStateProvider } from '../../../elements/contexts';
import { clearFetchCache, useFetch } from '../../../hooks';
import { localizationKeys } from '../../../localization';
import { SignInFactorOneCodeForm } from '../SignInFactorOneCodeForm';

const { createFixtures } = bindCreateFixtures('SignIn');

vi.mock('../../../hooks', async () => {
  const actual = await vi.importActual('../../../hooks');
  return {
    ...actual,
    useFetch: vi.fn(),
  };
});

describe('SignInFactorOneCodeForm', () => {
  beforeEach(() => {
    clearFetchCache();
    vi.mocked(useFetch).mockClear();
  });

  const renderWithProviders = (component: React.ReactElement, options?: any) => {
    return render(<CardStateProvider>{component}</CardStateProvider>, options);
  };

  const defaultProps = {
    factor: {
      strategy: 'phone_code' as const,
      phoneNumberId: 'idn_123',
      safeIdentifier: '+1234567890',
    },
    factorAlreadyPrepared: false,
    onFactorPrepare: vi.fn(),
    cardTitle: localizationKeys('signIn.phoneCode.title'),
    cardSubtitle: localizationKeys('signIn.phoneCode.subtitle'),
    inputLabel: localizationKeys('signIn.phoneCode.formTitle'),
    resendButton: localizationKeys('signIn.phoneCode.resendButton'),
  };

  describe('Cache Key Generation', () => {
    it('generates cache key without signIn.id to prevent extra API calls', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withPhoneNumber();
        f.startSignInWithPhoneNumber({ supportPhoneCode: true });
      });

      renderWithProviders(<SignInFactorOneCodeForm {...defaultProps} />, { wrapper });

      expect(vi.mocked(useFetch)).toHaveBeenCalledWith(
        expect.any(Function),
        {
          name: 'signIn.prepareFirstFactor',
          factorKey: 'phone_code_idn_123',
        },
        expect.objectContaining({
          staleTime: 100,
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        }),
      );
    });

    it('includes channel in cache key for phone code with WhatsApp', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withPhoneNumber();
        f.startSignInWithPhoneNumber({ supportPhoneCode: true });
      });

      const phonePropsWithChannel = {
        factor: {
          strategy: 'phone_code' as const,
          phoneNumberId: 'idn_123',
          safeIdentifier: '+1234567890',
          channel: 'whatsapp' as const,
        },
        factorAlreadyPrepared: false,
        onFactorPrepare: vi.fn(),
        cardTitle: localizationKeys('signIn.phoneCode.title'),
        cardSubtitle: localizationKeys('signIn.phoneCode.subtitle'),
        inputLabel: localizationKeys('signIn.phoneCode.formTitle'),
        resendButton: localizationKeys('signIn.phoneCode.resendButton'),
      };

      renderWithProviders(<SignInFactorOneCodeForm {...phonePropsWithChannel} />, { wrapper });

      expect(vi.mocked(useFetch)).toHaveBeenCalledWith(
        expect.any(Function),
        {
          name: 'signIn.prepareFirstFactor',
          factorKey: 'phone_code_idn_123_whatsapp',
        },
        expect.objectContaining({
          staleTime: 100,
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        }),
      );
    });

    it('still calls prepare when factor is already prepared but verification not verified', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withPhoneNumber();
        f.startSignInWithPhoneNumber({ supportPhoneCode: true });
      });

      const props = {
        factor: {
          strategy: 'phone_code' as const,
          phoneNumberId: 'idn_123',
          safeIdentifier: '+1234567890',
        },
        factorAlreadyPrepared: true,
        onFactorPrepare: vi.fn(),
        cardTitle: localizationKeys('signIn.phoneCode.title'),
        cardSubtitle: localizationKeys('signIn.phoneCode.subtitle'),
        inputLabel: localizationKeys('signIn.phoneCode.formTitle'),
        resendButton: localizationKeys('signIn.phoneCode.resendButton'),
      };

      renderWithProviders(<SignInFactorOneCodeForm {...props} />, { wrapper });

      expect(vi.mocked(useFetch)).toHaveBeenCalledWith(expect.any(Function), expect.any(Object), expect.any(Object));
    });
  });

  describe('shouldAvoidPrepare Logic', () => {
    it('still calls prepare when factor is already prepared but verification not verified', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withPhoneNumber();
        f.startSignInWithPhoneNumber({ supportPhoneCode: true });
      });

      const propsWithFactorPrepared = {
        ...defaultProps,
        factorAlreadyPrepared: true,
      };

      renderWithProviders(<SignInFactorOneCodeForm {...propsWithFactorPrepared} />, { wrapper });

      expect(vi.mocked(useFetch)).toHaveBeenCalledWith(
        expect.any(Function), // fetcher should still be a function because shouldAvoidPrepare requires BOTH conditions
        expect.any(Object),
        expect.any(Object),
      );
    });

    it('allows prepare when factor is not already prepared', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withPhoneNumber();
        f.startSignInWithPhoneNumber({ supportPhoneCode: true });
      });

      const propsWithFactorNotPrepared = {
        ...defaultProps,
        factorAlreadyPrepared: false,
      };

      renderWithProviders(<SignInFactorOneCodeForm {...propsWithFactorNotPrepared} />, { wrapper });

      expect(vi.mocked(useFetch)).toHaveBeenCalledWith(
        expect.any(Function), // fetcher should be a function when prepare is allowed
        expect.any(Object),
        expect.any(Object),
      );
    });
  });

  describe('Component Rendering', () => {
    it('renders phone code verification form', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withPhoneNumber();
        f.startSignInWithPhoneNumber({ supportPhoneCode: true });
      });

      const { getByLabelText } = renderWithProviders(<SignInFactorOneCodeForm {...defaultProps} />, { wrapper });

      expect(getByLabelText('Enter verification code')).toBeInTheDocument();
    });

    it('renders email code verification form', async () => {
      const { wrapper } = await createFixtures(f => {
        f.withEmailAddress();
        f.startSignInWithEmailAddress({ supportEmailCode: true });
      });

      const emailProps = {
        factor: {
          strategy: 'email_code' as const,
          emailAddressId: 'idn_456',
          safeIdentifier: 'test@example.com',
        },
        factorAlreadyPrepared: false,
        onFactorPrepare: vi.fn(),
        cardTitle: localizationKeys('signIn.emailCode.title'),
        cardSubtitle: localizationKeys('signIn.emailCode.subtitle'),
        inputLabel: localizationKeys('signIn.emailCode.formTitle'),
        resendButton: localizationKeys('signIn.emailCode.resendButton'),
      };

      const { getByLabelText } = renderWithProviders(<SignInFactorOneCodeForm {...emailProps} />, { wrapper });

      expect(getByLabelText('Enter verification code')).toBeInTheDocument();
    });
  });
});
