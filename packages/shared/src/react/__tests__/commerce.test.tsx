import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { __experimental_PaymentElement, __experimental_PaymentElementProvider } from '../commerce';
import { OptionsContext } from '../contexts';

// Mock the Stripe components
vi.mock('../stripe-react', () => ({
  Elements: ({ children, options }: { children: React.ReactNode; options: any }) => (
    <div
      data-testid='stripe-elements'
      data-locale={options.locale}
    >
      {children}
    </div>
  ),
  PaymentElement: ({ fallback }: { fallback?: React.ReactNode }) => <div>{fallback}</div>,
  useElements: () => null,
  useStripe: () => null,
}));

// Mock the hooks
const mockGetOption = vi.fn();
vi.mock('../hooks/useClerk', () => ({
  useClerk: () => ({
    __internal_loadStripeJs: vi.fn().mockResolvedValue(() => Promise.resolve({})),
    __internal_getOption: mockGetOption,
    __unstable__environment: {
      commerceSettings: {
        billing: {
          stripePublishableKey: 'pk_test_123',
        },
      },
      displayConfig: {
        userProfileUrl: 'https://example.com/profile',
        organizationProfileUrl: 'https://example.com/org-profile',
      },
    },
  }),
}));

vi.mock('../hooks/useUser', () => ({
  useUser: () => ({
    user: {
      id: 'user_123',
      initializePaymentSource: vi.fn().mockResolvedValue({
        externalGatewayId: 'acct_123',
        externalClientSecret: 'seti_123',
        paymentMethodOrder: ['card'],
      }),
    },
  }),
}));

vi.mock('../hooks/useOrganization', () => ({
  useOrganization: () => ({
    organization: null,
  }),
}));

vi.mock('swr', () => ({
  __esModule: true,
  default: () => ({ data: { loadStripe: vi.fn().mockResolvedValue({}) } }),
}));

vi.mock('swr/mutation', () => ({
  __esModule: true,
  default: () => ({
    data: {
      externalGatewayId: 'acct_123',
      externalClientSecret: 'seti_123',
      paymentMethodOrder: ['card'],
    },
    trigger: vi.fn().mockResolvedValue({
      externalGatewayId: 'acct_123',
      externalClientSecret: 'seti_123',
      paymentMethodOrder: ['card'],
    }),
  }),
}));

describe('PaymentElement Localization', () => {
  const mockCheckout = {
    id: 'checkout_123',
    needsPaymentMethod: true,
    plan: {
      id: 'plan_123',
      name: 'Test Plan',
      description: 'Test plan description',
      fee: { amount: 1000, amountFormatted: '$10.00', currency: 'usd', currencySymbol: '$' },
      annualFee: { amount: 10000, amountFormatted: '$100.00', currency: 'usd', currencySymbol: '$' },
      annualMonthlyFee: { amount: 833, amountFormatted: '$8.33', currency: 'usd', currencySymbol: '$' },
      currency: 'usd',
      interval: 'month' as const,
      intervalCount: 1,
      maxAllowedInstances: 1,
      trialDays: 0,
      isAddon: false,
      isPopular: false,
      isPerSeat: false,
      isUsageBased: false,
      isFree: false,
      isLegacy: false,
      isDefault: false,
      isRecurring: true,
      hasBaseFee: true,
      forPayerType: 'user' as const,
      publiclyVisible: true,
      slug: 'test-plan',
      avatarUrl: '',
      freeTrialDays: 0,
      freeTrialEnabled: false,
      pathRoot: '/',
      reload: vi.fn(),
      features: [],
      limits: {},
      metadata: {},
    },
    totals: {
      subtotal: { amount: 1000, amountFormatted: '$10.00', currency: 'usd', currencySymbol: '$' },
      grandTotal: { amount: 1000, amountFormatted: '$10.00', currency: 'usd', currencySymbol: '$' },
      taxTotal: { amount: 0, amountFormatted: '$0.00', currency: 'usd', currencySymbol: '$' },
      totalDueNow: { amount: 1000, amountFormatted: '$10.00', currency: 'usd', currencySymbol: '$' },
      credit: { amount: 0, amountFormatted: '$0.00', currency: 'usd', currencySymbol: '$' },
      pastDue: { amount: 0, amountFormatted: '$0.00', currency: 'usd', currencySymbol: '$' },
    },
    status: 'needs_confirmation' as const,
    error: null,
    fetchStatus: 'idle' as const,
    confirm: vi.fn(),
    start: vi.fn(),
    clear: vi.fn(),
    finalize: vi.fn(),
    getState: vi.fn(),
    isConfirming: false,
    isStarting: false,
    planPeriod: 'month' as const,
    externalClientSecret: 'seti_123',
    externalGatewayId: 'acct_123',
    isImmediatePlanChange: false,
    paymentMethodOrder: ['card'],
    freeTrialEndsAt: null,
    payer: {
      id: 'payer_123',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
      imageUrl: null,
      userId: 'user_123',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      organizationId: undefined,
      organizationName: undefined,
      pathRoot: '/',
      reload: vi.fn(),
    },
  };

  const renderWithLocale = (locale: string) => {
    // Mock the __internal_getOption to return the expected localization
    mockGetOption.mockImplementation(key => {
      if (key === 'localization') {
        return { locale };
      }
      return undefined;
    });

    const options = {
      localization: { locale },
    };

    return render(
      <OptionsContext.Provider value={options}>
        <__experimental_PaymentElementProvider checkout={mockCheckout}>
          <__experimental_PaymentElement fallback={<div>Loading...</div>} />
        </__experimental_PaymentElementProvider>
      </OptionsContext.Provider>,
    );
  };

  it('should pass the correct locale to Stripe Elements', () => {
    renderWithLocale('es');

    const elements = screen.getByTestId('stripe-elements');
    expect(elements.getAttribute('data-locale')).toBe('es');
  });

  it('should default to "en" when no locale is provided', () => {
    // Mock the __internal_getOption to return undefined for localization
    mockGetOption.mockImplementation(key => {
      if (key === 'localization') {
        return undefined;
      }
      return undefined;
    });

    const options = {};

    render(
      <OptionsContext.Provider value={options}>
        <__experimental_PaymentElementProvider checkout={mockCheckout}>
          <__experimental_PaymentElement fallback={<div>Loading...</div>} />
        </__experimental_PaymentElementProvider>
      </OptionsContext.Provider>,
    );

    const elements = screen.getByTestId('stripe-elements');
    expect(elements.getAttribute('data-locale')).toBe('en');
  });

  it('should normalize full locale strings to 2-letter codes for Stripe', () => {
    const testCases = [
      { input: 'en', expected: 'en' },
      { input: 'en-US', expected: 'en' },
      { input: 'fr-FR', expected: 'fr' },
      { input: 'es-ES', expected: 'es' },
      { input: 'de-DE', expected: 'de' },
      { input: 'it-IT', expected: 'it' },
      { input: 'pt-BR', expected: 'pt' },
    ];

    testCases.forEach(({ input, expected }) => {
      // Mock the __internal_getOption to return the expected localization
      mockGetOption.mockImplementation(key => {
        if (key === 'localization') {
          return { locale: input };
        }
        return undefined;
      });

      const options = {
        localization: { locale: input },
      };

      const { unmount } = render(
        <OptionsContext.Provider value={options}>
          <__experimental_PaymentElementProvider checkout={mockCheckout}>
            <__experimental_PaymentElement fallback={<div>Loading...</div>} />
          </__experimental_PaymentElementProvider>
        </OptionsContext.Provider>,
      );

      const elements = screen.getByTestId('stripe-elements');
      expect(elements.getAttribute('data-locale')).toBe(expected);

      unmount();
    });
  });
});
