import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { __experimental_PaymentElement, __experimental_PaymentElementProvider } from '../billing/payment-element';
import { ClerkInstanceContext, OptionsContext, OrganizationProvider, UserContext } from '../contexts';

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
    __internal__environment: {
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
      initializePaymentMethod: vi.fn().mockResolvedValue({
        externalGatewayId: 'acct_123',
        externalClientSecret: 'seti_123',
        paymentMethodOrder: ['card'],
      }),
    },
  }),
}));

const mockInitializePaymentMethod = vi.fn().mockResolvedValue({
  externalGatewayId: 'acct_123',
  externalClientSecret: 'seti_123',
  paymentMethodOrder: ['card'],
});

vi.mock('../billing/useInitializePaymentMethod', () => ({
  __internal_useInitializePaymentMethod: vi.fn(() => ({
    initializedPaymentMethod: {
      externalGatewayId: 'acct_123',
      externalClientSecret: 'seti_123',
      paymentMethodOrder: ['card'],
    },
    initializePaymentMethod: mockInitializePaymentMethod,
  })),
}));

const mockStripeLibs = {
  loadStripe: vi.fn().mockResolvedValue({}),
};

vi.mock('../billing/useStripeClerkLibs', () => ({
  __internal_useStripeClerkLibs: vi.fn(() => mockStripeLibs),
}));

const mockStripeInstance = {} as any;

vi.mock('../billing/useStripeLoader', () => ({
  __internal_useStripeLoader: vi.fn(() => mockStripeInstance),
}));

describe('PaymentElement Localization', () => {
  const mockCheckout = {
    id: 'checkout_123',
    needsPaymentMethod: true,
    paymentMethod: null,
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
      totalDueAfterFreeTrial: null,
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
    planPeriodStart: undefined,
    externalClientSecret: 'seti_123',
    externalGatewayId: 'acct_123',
    isImmediatePlanChange: false,
    paymentMethodOrder: ['card'],
    freeTrialEndsAt: undefined,
    payer: {
      id: 'payer_123',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
      imageUrl: undefined,
      userId: 'user_123',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      organizationId: null,
      organizationName: undefined,
      pathRoot: '/',
      reload: vi.fn(),
    },
  };

  const mockClerk = {
    __internal_loadStripeJs: vi.fn().mockResolvedValue(() => Promise.resolve({})),
    __internal_getOption: mockGetOption,
    __internal__environment: {
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
  };

  const mockUser = {
    id: 'user_123',
    initializePaymentMethod: mockInitializePaymentMethod,
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
      <ClerkInstanceContext.Provider value={{ value: mockClerk as any }}>
        <UserContext.Provider value={{ value: mockUser as any }}>
          <OrganizationProvider organization={null}>
            <OptionsContext.Provider value={options}>
              <__experimental_PaymentElementProvider checkout={mockCheckout}>
                <__experimental_PaymentElement fallback={<div>Loading...</div>} />
              </__experimental_PaymentElementProvider>
            </OptionsContext.Provider>
          </OrganizationProvider>
        </UserContext.Provider>
      </ClerkInstanceContext.Provider>,
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
      <ClerkInstanceContext.Provider value={{ value: mockClerk as any }}>
        <UserContext.Provider value={{ value: mockUser as any }}>
          <OrganizationProvider organization={null}>
            <OptionsContext.Provider value={options}>
              <__experimental_PaymentElementProvider checkout={mockCheckout}>
                <__experimental_PaymentElement fallback={<div>Loading...</div>} />
              </__experimental_PaymentElementProvider>
            </OptionsContext.Provider>
          </OrganizationProvider>
        </UserContext.Provider>
      </ClerkInstanceContext.Provider>,
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
        <ClerkInstanceContext.Provider value={{ value: mockClerk as any }}>
          <UserContext.Provider value={{ value: mockUser as any }}>
            <OrganizationProvider organization={null}>
              <OptionsContext.Provider value={options}>
                <__experimental_PaymentElementProvider checkout={mockCheckout}>
                  <__experimental_PaymentElement fallback={<div>Loading...</div>} />
                </__experimental_PaymentElementProvider>
              </OptionsContext.Provider>
            </OrganizationProvider>
          </UserContext.Provider>
        </ClerkInstanceContext.Provider>,
      );

      const elements = screen.getByTestId('stripe-elements');
      expect(elements.getAttribute('data-locale')).toBe(expected);

      unmount();
    });
  });
});
