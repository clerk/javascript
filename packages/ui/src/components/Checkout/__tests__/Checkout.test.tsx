import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, waitFor } from '@/test/utils';
import { Drawer } from '@/ui/elements/Drawer';

import { Checkout } from '..';

const { createFixtures } = bindCreateFixtures('Checkout');

// Mock Payment Element to be ready so the submit button is rendered during tests
vi.mock('@clerk/shared/react', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    __experimental_PaymentElementProvider: ({ children }: { children: any }) => children,
    __experimental_PaymentElement: (_: { fallback?: any }) => null,
    __experimental_usePaymentElement: () => ({
      submit: vi.fn().mockResolvedValue({ data: { gateway: 'stripe', paymentToken: 'tok_test' }, error: null }),
      reset: vi.fn().mockResolvedValue(undefined),
      isFormReady: true,
      provider: { name: 'stripe' },
      isProviderReady: true,
    }),
  };
});

describe('Checkout', () => {
  it('displays spinner when checkout is initializing', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
      f.withBilling();
    });

    // Mock billing to prevent actual API calls and stay in loading state
    fixtures.clerk.billing.startCheckout.mockResolvedValue({} as any);

    const { baseElement, getByRole } = render(
      <Drawer.Root
        open
        onOpenChange={() => {}}
      >
        <Checkout
          planId='plan_123'
          planPeriod='month'
        />
      </Drawer.Root>,
      { wrapper },
    );

    await waitFor(() => {
      // Verify the checkout drawer renders
      expect(baseElement.querySelector('[role="dialog"]')).toBeVisible();

      // Verify the checkout title is displayed
      expect(getByRole('heading', { name: 'Checkout' })).toBeVisible();

      // Verify spinner is shown during initialization
      const spinner = baseElement.querySelector('span[aria-live="polite"]');
      expect(spinner).toBeVisible();
    });
  });

  it('renders drawer structure and localization correctly', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });

    // Mock billing to prevent actual API calls
    fixtures.clerk.billing.startCheckout.mockResolvedValue({} as any);

    const { baseElement, getByRole } = render(
      <Drawer.Root
        open
        onOpenChange={() => {}}
      >
        <Checkout
          planId='plan_456'
          planPeriod='annual'
        />
      </Drawer.Root>,
      { wrapper },
    );

    await waitFor(() => {
      // Verify localized title is displayed
      expect(getByRole('heading', { name: 'Checkout' })).toBeVisible();

      // Verify drawer structure
      expect(baseElement.querySelector('[role="dialog"]')).toBeVisible();
      expect(baseElement.querySelector('.cl-checkout-root')).toBeVisible();

      // Verify close button is present
      const closeButton = baseElement.querySelector('[aria-label="Close drawer"]');
      expect(closeButton).toBeVisible();
    });
  });

  it('handles checkout initialization errors gracefully', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
      f.withBilling();
    });

    // Mock billing to reject with a Clerk-like error shape
    fixtures.clerk.billing.startCheckout.mockRejectedValue({
      status: 400,
      errors: [{ code: 'unknown_error' }],
    });

    const { getByRole, baseElement } = render(
      <Drawer.Root
        open
        onOpenChange={() => {}}
      >
        <Checkout
          planId='plan_error'
          planPeriod='month'
        />
      </Drawer.Root>,
      { wrapper },
    );

    await waitFor(() => {
      // Component should still render the drawer structure even with errors
      expect(baseElement.querySelector('[role="dialog"]')).toBeVisible();
      expect(getByRole('heading', { name: 'Checkout' })).toBeVisible();
    });
  });

  it('displays proper loading state during checkout initialization', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
      f.withBilling();
    });

    // Mock billing to stay in loading state
    fixtures.clerk.billing.startCheckout.mockResolvedValue({} as any);

    const { baseElement } = render(
      <Drawer.Root
        open
        onOpenChange={() => {}}
      >
        <Checkout
          planId='plan_loading'
          planPeriod='month'
        />
      </Drawer.Root>,
      { wrapper },
    );

    await waitFor(() => {
      // Should show loading state while checkout initializes
      const spinner = baseElement.querySelector('span[aria-live="polite"]');
      expect(spinner).toBeVisible();
      expect(spinner).toHaveAttribute('aria-busy', 'true');

      // Should not show any checkout content yet
      expect(baseElement.querySelector('form')).toBeNull();
    });
  });

  it('maintains accessibility attributes correctly', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
      f.withBilling();
    });

    fixtures.clerk.billing.startCheckout.mockResolvedValue({} as any);

    const { baseElement, getByRole } = render(
      <Drawer.Root
        open
        onOpenChange={() => {}}
      >
        <Checkout
          planId='plan_a11y'
          planPeriod='month'
        />
      </Drawer.Root>,
      { wrapper },
    );

    await waitFor(() => {
      // Check dialog accessibility
      const dialog = baseElement.querySelector('[role="dialog"]');
      expect(dialog).toBeVisible();
      expect(dialog).toHaveAttribute('tabindex', '-1');

      // Check heading hierarchy
      const heading = getByRole('heading', { name: 'Checkout' });
      expect(heading).toBeVisible();

      // Check focus guards for modal
      const focusGuards = baseElement.querySelectorAll('[data-floating-ui-focus-guard]');
      expect(focusGuards.length).toBeGreaterThan(0);

      // Check spinner accessibility
      const spinner = baseElement.querySelector('[aria-live="polite"]');
      expect(spinner).toHaveAttribute('aria-busy', 'true');
    });
  });

  it('renders without crashing when all required props are provided', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
      f.withBilling();
    });

    // Mock billing to prevent actual API calls
    fixtures.clerk.billing.startCheckout.mockResolvedValue({} as any);

    const { baseElement } = render(
      <Drawer.Root
        open
        onOpenChange={() => {}}
      >
        <Checkout
          planId='plan_stable'
          planPeriod='annual'
        />
      </Drawer.Root>,
      { wrapper },
    );

    await waitFor(() => {
      // Basic smoke test - component renders without throwing
      expect(baseElement.querySelector('[role="dialog"]')).toBeVisible();
    });
  });

  it('renders without errors for monthly period', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
      f.withBilling();
    });
    fixtures.clerk.billing.startCheckout.mockResolvedValue({} as any);
    const { baseElement } = render(
      <Drawer.Root
        open
        onOpenChange={() => {}}
      >
        <Checkout
          planId='plan_monthly'
          planPeriod='month'
        />
      </Drawer.Root>,
      { wrapper },
    );
    await waitFor(() => {
      expect(baseElement.querySelector('[role="dialog"]')).toBeVisible();
    });
  });

  it('renders without errors for annual period', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });
    fixtures.clerk.billing.startCheckout.mockResolvedValue({} as any);
    const { baseElement } = render(
      <Drawer.Root
        open
        onOpenChange={() => {}}
      >
        <Checkout
          planId='plan_annual'
          planPeriod='annual'
        />
      </Drawer.Root>,
      { wrapper },
    );
    await waitFor(() => {
      expect(baseElement.querySelector('[role="dialog"]')).toBeVisible();
    });
  });

  it('renders with correct CSS classes and structure', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
      f.withBilling();
    });

    fixtures.clerk.billing.startCheckout.mockResolvedValue({} as any);

    const { baseElement } = render(
      <Drawer.Root
        open
        onOpenChange={() => {}}
      >
        <Checkout
          planId='plan_css'
          planPeriod='month'
        />
      </Drawer.Root>,
      { wrapper },
    );

    await waitFor(() => {
      // Verify CSS classes are applied
      expect(baseElement.querySelector('.cl-checkout-root')).toBeVisible();
      expect(baseElement.querySelector('.cl-drawerRoot')).toBeVisible();
      expect(baseElement.querySelector('.cl-drawerContent')).toBeVisible();
      expect(baseElement.querySelector('.cl-drawerHeader')).toBeVisible();
      expect(baseElement.querySelector('.cl-drawerTitle')).toBeVisible();
      // Close button present
      const closeButton = baseElement.querySelector('[aria-label="Close drawer"]');
      expect(closeButton).toBeVisible();
    });
  });

  it('renders credit details', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
      f.withBilling();
    });

    fixtures.clerk.user?.getPaymentMethods.mockResolvedValue({
      data: [],
      total_count: 0,
    });

    fixtures.clerk.billing.startCheckout.mockResolvedValue({
      id: 'chk_credits_1',
      status: 'needs_confirmation',
      externalClientSecret: 'cs_test_credits_1',
      externalGatewayId: 'gw_test',
      totals: {
        subtotal: { amount: 2500, amountFormatted: '25.00', currency: 'USD', currencySymbol: '$' },
        grandTotal: { amount: 1000, amountFormatted: '10.00', currency: 'USD', currencySymbol: '$' },
        taxTotal: { amount: 0, amountFormatted: '0.00', currency: 'USD', currencySymbol: '$' },
        credit: { amount: 0, amountFormatted: '0.00', currency: 'USD', currencySymbol: '$' },
        credits: {
          proration: {
            amount: { amount: 500, amountFormatted: '5.00', currency: 'USD', currencySymbol: '$' },
            cycleDaysRemaining: 15,
            cycleDaysTotal: 30,
            cycleRemainingPercent: 50,
          },
          payer: {
            remainingBalance: { amount: 2000, amountFormatted: '20.00', currency: 'USD', currencySymbol: '$' },
            appliedAmount: { amount: 1000, amountFormatted: '10.00', currency: 'USD', currencySymbol: '$' },
          },
          total: { amount: 1500, amountFormatted: '15.00', currency: 'USD', currencySymbol: '$' },
        },
        pastDue: { amount: 0, amountFormatted: '0.00', currency: 'USD', currencySymbol: '$' },
        totalDueNow: { amount: 1000, amountFormatted: '10.00', currency: 'USD', currencySymbol: '$' },
      },
      isImmediatePlanChange: true,
      planPeriod: 'month',
      plan: {
        id: 'plan_credits',
        name: 'Pro',
        description: 'Pro plan',
        features: [],
        fee: {
          amount: 2500,
          amountFormatted: '25.00',
          currency: 'USD',
          currencySymbol: '$',
        },
        annualFee: {
          amount: 30000,
          amountFormatted: '300.00',
          currency: 'USD',
          currencySymbol: '$',
        },
        annualMonthlyFee: {
          amount: 2500,
          amountFormatted: '25.00',
          currency: 'USD',
          currencySymbol: '$',
        },
        slug: 'pro',
        avatarUrl: '',
        publiclyVisible: true,
        isDefault: true,
        isRecurring: true,
        hasBaseFee: false,
        forPayerType: 'user',
        freeTrialDays: 7,
        freeTrialEnabled: true,
      },
      paymentMethod: undefined,
      confirm: vi.fn(),
      freeTrialEndsAt: null,
      needsPaymentMethod: false,
    } as any);

    const { getByRole, getByText } = render(
      <Drawer.Root
        open
        onOpenChange={() => {}}
      >
        <Checkout
          planId='plan_credits'
          planPeriod='month'
        />
      </Drawer.Root>,
      { wrapper },
    );

    await waitFor(() => {
      expect(getByRole('heading', { name: 'Checkout' })).toBeVisible();
    });

    const prorationCreditRow = getByText('Credit for the remainder of your current subscription.').closest(
      '.cl-lineItemsGroup',
    );
    const accountCreditRow = getByText('Credit from account balance.').closest('.cl-lineItemsGroup');

    expect(prorationCreditRow).toBeInTheDocument();
    expect(accountCreditRow).toBeInTheDocument();

    expect(prorationCreditRow).toHaveTextContent('- $5.00');
    expect(accountCreditRow).toHaveTextContent('- $10.00');
  });

  it('renders free trial details during confirmation stage', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
      f.withBilling();
    });

    const freeTrialEndsAt = new Date('2025-08-19');

    fixtures.clerk.user?.getPaymentMethods.mockResolvedValue({
      data: [],
      total_count: 0,
    });

    fixtures.clerk.billing.startCheckout.mockResolvedValue({
      id: 'chk_trial_1',
      status: 'needs_confirmation',
      externalClientSecret: 'cs_test_trial',
      externalGatewayId: 'gw_test',
      totals: {
        subtotal: { amount: 1000, amountFormatted: '10.00', currency: 'USD', currencySymbol: '$' },
        grandTotal: { amount: 1000, amountFormatted: '10.00', currency: 'USD', currencySymbol: '$' },
        taxTotal: { amount: 0, amountFormatted: '0.00', currency: 'USD', currencySymbol: '$' },
        credit: { amount: 0, amountFormatted: '0.00', currency: 'USD', currencySymbol: '$' },
        pastDue: { amount: 0, amountFormatted: '0.00', currency: 'USD', currencySymbol: '$' },
        totalDueAfterFreeTrial: { amount: 1000, amountFormatted: '10.00', currency: 'USD', currencySymbol: '$' },
        totalDueNow: { amount: 0, amountFormatted: '0.00', currency: 'USD', currencySymbol: '$' },
      },
      isImmediatePlanChange: true,
      planPeriod: 'month',
      plan: {
        id: 'plan_trial',
        name: 'Pro',
        description: 'Pro plan',
        features: [],
        fee: {
          amount: 1000,
          amountFormatted: '10.00',
          currency: 'USD',
          currencySymbol: '$',
        },
        annualFee: {
          amount: 12000,
          amountFormatted: '120.00',
          currency: 'USD',
          currencySymbol: '$',
        },
        annualMonthlyFee: {
          amount: 1000,
          amountFormatted: '10.00',
          currency: 'USD',
          currencySymbol: '$',
        },
        slug: 'pro',
        avatarUrl: '',
        publiclyVisible: true,
        isDefault: true,
        isRecurring: true,
        hasBaseFee: false,
        forPayerType: 'user',
        freeTrialDays: 14,
        freeTrialEnabled: true,
      },
      paymentMethod: undefined,
      confirm: vi.fn(),
      freeTrialEndsAt,
    } as any);

    const { getByRole, getByText } = render(
      <Drawer.Root
        open
        onOpenChange={() => {}}
      >
        <Checkout
          planId='plan_trial'
          planPeriod='month'
        />
      </Drawer.Root>,
      { wrapper },
    );

    await waitFor(() => {
      expect(getByRole('heading', { name: 'Checkout' })).toBeVisible();

      expect(getByText('Free trial')).toBeVisible();

      expect(getByText('Total Due after trial ends in 14 days')).toBeVisible();
      expect(getByRole('button', { name: 'Start free trial' })).toBeVisible();
    });
  });

  it('renders trial success details in completed stage', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
      f.withBilling();
    });

    const freeTrialEndsAt = new Date('2025-08-19');

    fixtures.clerk.billing.startCheckout.mockResolvedValue({
      id: 'chk_trial_2',
      status: 'completed',
      externalClientSecret: 'cs_test_trial_2',
      externalGatewayId: 'gw_test',
      totals: {
        subtotal: { amount: 1000, amountFormatted: '10.00', currency: 'USD', currencySymbol: '$' },
        grandTotal: { amount: 1000, amountFormatted: '10.00', currency: 'USD', currencySymbol: '$' },
        taxTotal: { amount: 0, amountFormatted: '0.00', currency: 'USD', currencySymbol: '$' },
        credit: { amount: 0, amountFormatted: '0.00', currency: 'USD', currencySymbol: '$' },
        pastDue: { amount: 0, amountFormatted: '0.00', currency: 'USD', currencySymbol: '$' },
        totalDueNow: { amount: 0, amountFormatted: '0.00', currency: 'USD', currencySymbol: '$' },
      },
      isImmediatePlanChange: true,
      planPeriod: 'month',
      plan: {
        id: 'plan_trial',
        name: 'Pro',
        description: 'Pro plan',
        features: [],
        fee: {
          amount: 1000,
          amountFormatted: '10.00',
          currency: 'USD',
          currencySymbol: '$',
        },
        annualFee: {
          amount: 12000,
          amountFormatted: '120.00',
          currency: 'USD',
          currencySymbol: '$',
        },
        annualMonthlyFee: {
          amount: 1000,
          amountFormatted: '10.00',
          currency: 'USD',
          currencySymbol: '$',
        },
        slug: 'pro',
        avatarUrl: '',
        publiclyVisible: true,
        isDefault: true,
        isRecurring: true,
        hasBaseFee: false,
        forPayerType: 'user',
        freeTrialDays: 7,
        freeTrialEnabled: true,
      },
      paymentMethod: undefined,
      confirm: vi.fn(),
      freeTrialEndsAt,
    } as any);

    const { getByText } = render(
      <Drawer.Root
        open
        onOpenChange={() => {}}
      >
        <Checkout
          planId='plan_trial_complete'
          planPeriod='month'
        />
      </Drawer.Root>,
      { wrapper },
    );

    await waitFor(() => {
      // Title indicates trial success
      expect(getByText('Trial successfully started!')).toBeVisible();
      expect(getByText('Trial ends on')).toBeVisible();
      expect(getByText('August 19, 2025')).toBeVisible();
    });
  });

  it('renders subscription start data on completed stage for downgrades', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
      f.withBilling();
    });

    fixtures.clerk.billing.startCheckout.mockResolvedValue({
      id: 'chk_payment_method_2',
      status: 'completed',
      externalClientSecret: 'cs_test_payment_method_2',
      externalGatewayId: 'gw_test',
      totals: {
        subtotal: { amount: 1000, amountFormatted: '10.00', currency: 'USD', currencySymbol: '$' },
        grandTotal: { amount: 1000, amountFormatted: '10.00', currency: 'USD', currencySymbol: '$' },
        taxTotal: { amount: 0, amountFormatted: '0.00', currency: 'USD', currencySymbol: '$' },
        credit: { amount: 0, amountFormatted: '0.00', currency: 'USD', currencySymbol: '$' },
        pastDue: { amount: 0, amountFormatted: '0.00', currency: 'USD', currencySymbol: '$' },
        totalDueNow: { amount: 0, amountFormatted: '0.00', currency: 'USD', currencySymbol: '$' },
      },
      isImmediatePlanChange: true,
      planPeriod: 'month',
      plan: {
        id: 'plan_trial',
        name: 'Pro',
        description: 'Pro plan',
        features: [],
        fee: {
          amount: 1000,
          amountFormatted: '10.00',
          currency: 'USD',
          currencySymbol: '$',
        },
        annualFee: {
          amount: 12000,
          amountFormatted: '120.00',
          currency: 'USD',
          currencySymbol: '$',
        },
        annualMonthlyFee: {
          amount: 1000,
          amountFormatted: '10.00',
          currency: 'USD',
          currencySymbol: '$',
        },
        slug: 'pro',
        avatarUrl: '',
        publiclyVisible: true,
        isDefault: true,
        isRecurring: true,
        hasBaseFee: false,
        forPayerType: 'user',
        freeTrialDays: 7,
        freeTrialEnabled: true,
      },
      paymentMethod: {
        id: 'pm_test_visa',
        last4: '4242',
        paymentType: 'card',
        cardType: 'visa',
        isDefault: true,
        isRemovable: true,
        status: 'active',
        walletType: undefined,
        remove: vi.fn(),
        makeDefault: vi.fn(),
        pathRoot: '/',
        reload: vi.fn(),
      },
      planPeriodStart: new Date('2025-08-19'),
      confirm: vi.fn(),
      freeTrialEndsAt: null,
      needsPaymentMethod: false,
    } as any);

    const { getByText } = render(
      <Drawer.Root
        open
        onOpenChange={() => {}}
      >
        <Checkout
          planId='plan_payment_method_complete'
          planPeriod='month'
        />
      </Drawer.Root>,
      { wrapper },
    );

    await waitFor(() => {
      expect(getByText('Subscription begins')).toBeVisible();
      expect(getByText('August 19, 2025')).toBeVisible();
    });
  });

  it('renders payment method on completed stage', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
      f.withBilling();
    });

    fixtures.clerk.billing.startCheckout.mockResolvedValue({
      id: 'chk_payment_method_2',
      status: 'completed',
      externalClientSecret: 'cs_test_payment_method_2',
      externalGatewayId: 'gw_test',
      totals: {
        subtotal: { amount: 1000, amountFormatted: '10.00', currency: 'USD', currencySymbol: '$' },
        grandTotal: { amount: 1000, amountFormatted: '10.00', currency: 'USD', currencySymbol: '$' },
        taxTotal: { amount: 0, amountFormatted: '0.00', currency: 'USD', currencySymbol: '$' },
        credit: { amount: 0, amountFormatted: '0.00', currency: 'USD', currencySymbol: '$' },
        pastDue: { amount: 0, amountFormatted: '0.00', currency: 'USD', currencySymbol: '$' },
        totalDueNow: { amount: 1000, amountFormatted: '10.00', currency: 'USD', currencySymbol: '$' },
      },
      isImmediatePlanChange: true,
      planPeriod: 'month',
      plan: {
        id: 'plan_trial',
        name: 'Pro',
        description: 'Pro plan',
        features: [],
        fee: {
          amount: 1000,
          amountFormatted: '10.00',
          currency: 'USD',
          currencySymbol: '$',
        },
        annualFee: {
          amount: 12000,
          amountFormatted: '120.00',
          currency: 'USD',
          currencySymbol: '$',
        },
        annualMonthlyFee: {
          amount: 1000,
          amountFormatted: '10.00',
          currency: 'USD',
          currencySymbol: '$',
        },
        slug: 'pro',
        avatarUrl: '',
        publiclyVisible: true,
        isDefault: true,
        isRecurring: true,
        hasBaseFee: false,
        forPayerType: 'user',
        freeTrialDays: 7,
        freeTrialEnabled: true,
      },
      paymentMethod: {
        id: 'pm_test_visa',
        last4: '4242',
        paymentType: 'card',
        cardType: 'visa',
        isDefault: true,
        isRemovable: true,
        status: 'active',
        walletType: undefined,
        remove: vi.fn(),
        makeDefault: vi.fn(),
        pathRoot: '/',
        reload: vi.fn(),
      },
      confirm: vi.fn(),
      freeTrialEndsAt: null,
      needsPaymentMethod: true,
    } as any);

    const { getByText } = render(
      <Drawer.Root
        open
        onOpenChange={() => {}}
      >
        <Checkout
          planId='plan_payment_method_complete'
          planPeriod='month'
        />
      </Drawer.Root>,
      { wrapper },
    );

    await waitFor(() => {
      expect(getByText('Visa ⋯ 4242')).toBeVisible();
    });
  });

  describe('render payment methods', () => {
    it('shows tabs with select when payments methods exist and plan is free trial', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
        f.withBilling();
      });

      fixtures.clerk.user?.getPaymentMethods.mockResolvedValue({
        data: [
          {
            id: 'pm_test_visa',
            last4: '4242',
            paymentType: 'card',
            cardType: 'visa',
            isDefault: true,
            isRemovable: true,
            status: 'active',
            walletType: undefined,
            remove: vi.fn(),
            makeDefault: vi.fn(),
            pathRoot: '/',
            reload: vi.fn(),
          },
          {
            id: 'pm_test_mastercard',
            last4: '5555',
            paymentType: 'card',
            cardType: 'mastercard',
            isDefault: false,
            isRemovable: true,
            status: 'active',
            walletType: undefined,
            remove: vi.fn(),
            makeDefault: vi.fn(),
            pathRoot: '/',
            reload: vi.fn(),
          },
        ],
        total_count: 2,
      });

      fixtures.clerk.billing.startCheckout.mockResolvedValue({
        id: 'chk_trial_2',
        status: 'needs_confirmation',
        externalClientSecret: 'cs_test_trial_2',
        externalGatewayId: 'gw_test',
        totals: {
          subtotal: { amount: 1000, amountFormatted: '10.00', currency: 'USD', currencySymbol: '$' },
          grandTotal: { amount: 1000, amountFormatted: '10.00', currency: 'USD', currencySymbol: '$' },
          taxTotal: { amount: 0, amountFormatted: '0.00', currency: 'USD', currencySymbol: '$' },
          credit: { amount: 0, amountFormatted: '0.00', currency: 'USD', currencySymbol: '$' },
          pastDue: { amount: 0, amountFormatted: '0.00', currency: 'USD', currencySymbol: '$' },
          totalDueNow: { amount: 0, amountFormatted: '0.00', currency: 'USD', currencySymbol: '$' },
        },
        isImmediatePlanChange: true,
        planPeriod: 'month',
        plan: {
          id: 'plan_trial',
          name: 'Pro',
          description: 'Pro plan',
          features: [],
          fee: {
            amount: 1000,
            amountFormatted: '10.00',
            currency: 'USD',
            currencySymbol: '$',
          },
          annualFee: {
            amount: 12000,
            amountFormatted: '120.00',
            currency: 'USD',
            currencySymbol: '$',
          },
          annualMonthlyFee: {
            amount: 1000,
            amountFormatted: '10.00',
            currency: 'USD',
            currencySymbol: '$',
          },
          slug: 'pro',
          avatarUrl: '',
          publiclyVisible: true,
          isDefault: true,
          isRecurring: true,
          hasBaseFee: false,
          forPayerType: 'user',
          freeTrialDays: 7,
          freeTrialEnabled: true,
        },
        paymentMethod: undefined,
        confirm: vi.fn(),
        freeTrialEndsAt: new Date('2025-08-19'),
        needsPaymentMethod: true,
      } as any);

      const { baseElement, getByText, getByRole, userEvent } = render(
        <Drawer.Root
          open
          onOpenChange={() => {}}
        >
          <Checkout
            planId='plan_with_payment_methods'
            planPeriod='month'
          />
        </Drawer.Root>,
        { wrapper },
      );

      await waitFor(async () => {
        // Verify checkout title is displayed
        expect(getByRole('heading', { name: 'Checkout' })).toBeVisible();

        // Verify segmented control for payment method source is rendered
        const paymentMethodsButton = getByText('Payment Methods');
        expect(paymentMethodsButton).toBeVisible();

        const addPaymentMethodButton = getByText('Add payment method');
        expect(addPaymentMethodButton).toBeVisible();

        await userEvent.click(paymentMethodsButton);
      });

      await waitFor(() => {
        const visaPaymentMethod = getByText('visa');
        expect(visaPaymentMethod).toBeVisible();

        const last4Digits = getByText('⋯ 4242');
        expect(last4Digits).toBeVisible();

        // Verify the default badge is shown for the first payment method
        const defaultBadge = getByText('Default');
        expect(defaultBadge).toBeVisible();

        // Verify the hidden input contains the correct payment method id
        const hiddenInput = baseElement.querySelector('input[name="payment_method_id"]');
        expect(hiddenInput).toHaveAttribute('value', 'pm_test_visa');

        expect(getByRole('button', { name: 'Start free trial' })).toBeInTheDocument();
      });
    });

    it('shows tabs with select when payments methods exist and plan is immediate with total due now', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
        f.withBilling();
      });

      fixtures.clerk.user?.getPaymentMethods.mockResolvedValue({
        data: [
          {
            id: 'pm_test_visa',
            last4: '4242',
            paymentType: 'card',
            cardType: 'visa',
            isDefault: true,
            isRemovable: true,
            status: 'active',
            walletType: undefined,
            remove: vi.fn(),
            makeDefault: vi.fn(),
            pathRoot: '/',
            reload: vi.fn(),
          },
          {
            id: 'pm_test_mastercard',
            last4: '5555',
            paymentType: 'card',
            cardType: 'mastercard',
            isDefault: false,
            isRemovable: true,
            status: 'active',
            walletType: undefined,
            remove: vi.fn(),
            makeDefault: vi.fn(),
            pathRoot: '/',
            reload: vi.fn(),
          },
        ],
        total_count: 2,
      });

      fixtures.clerk.billing.startCheckout.mockResolvedValue({
        id: 'chk_trial_2',
        status: 'needs_confirmation',
        externalClientSecret: 'cs_test_trial_2',
        externalGatewayId: 'gw_test',
        totals: {
          subtotal: { amount: 1000, amountFormatted: '10.00', currency: 'USD', currencySymbol: '$' },
          grandTotal: { amount: 1000, amountFormatted: '10.00', currency: 'USD', currencySymbol: '$' },
          taxTotal: { amount: 0, amountFormatted: '0.00', currency: 'USD', currencySymbol: '$' },
          credit: { amount: 0, amountFormatted: '0.00', currency: 'USD', currencySymbol: '$' },
          pastDue: { amount: 0, amountFormatted: '0.00', currency: 'USD', currencySymbol: '$' },
          totalDueNow: { amount: 1000, amountFormatted: '10.00', currency: 'USD', currencySymbol: '$' },
        },
        isImmediatePlanChange: true,
        planPeriod: 'month',
        plan: {
          id: 'plan_trial',
          name: 'Pro',
          description: 'Pro plan',
          features: [],
          fee: {
            amount: 1000,
            amountFormatted: '10.00',
            currency: 'USD',
            currencySymbol: '$',
          },
          annualFee: {
            amount: 12000,
            amountFormatted: '120.00',
            currency: 'USD',
            currencySymbol: '$',
          },
          annualMonthlyFee: {
            amount: 1000,
            amountFormatted: '10.00',
            currency: 'USD',
            currencySymbol: '$',
          },
          slug: 'pro',
          avatarUrl: '',
          publiclyVisible: true,
          isDefault: true,
          isRecurring: true,
          hasBaseFee: false,
          forPayerType: 'user',
          freeTrialDays: 7,
          freeTrialEnabled: true,
        },
        paymentMethod: undefined,
        confirm: vi.fn(),
        freeTrialEndsAt: null,
        needsPaymentMethod: true,
      } as any);

      const { baseElement, getByText, getByRole, userEvent } = render(
        <Drawer.Root
          open
          onOpenChange={() => {}}
        >
          <Checkout
            planId='plan_with_payment_methods'
            planPeriod='month'
          />
        </Drawer.Root>,
        { wrapper },
      );

      await waitFor(async () => {
        // Verify checkout title is displayed
        expect(getByRole('heading', { name: 'Checkout' })).toBeVisible();

        // Verify segmented control for payment method source is rendered
        const paymentMethodsButton = getByText('Payment Methods');
        expect(paymentMethodsButton).toBeVisible();

        const addPaymentMethodButton = getByText('Add payment method');
        expect(addPaymentMethodButton).toBeVisible();

        await userEvent.click(paymentMethodsButton);
      });

      await waitFor(() => {
        const visaPaymentMethod = getByText('visa');
        expect(visaPaymentMethod).toBeVisible();

        const last4Digits = getByText('⋯ 4242');
        expect(last4Digits).toBeVisible();

        // Verify the default badge is shown for the first payment method
        const defaultBadge = getByText('Default');
        expect(defaultBadge).toBeVisible();

        // Verify the hidden input contains the correct payment method id
        const hiddenInput = baseElement.querySelector('input[name="payment_method_id"]');
        expect(hiddenInput).toHaveAttribute('value', 'pm_test_visa');

        const payButton = getByRole('button', { name: 'Pay $10.00' });
        expect(payButton).toBeInTheDocument();
      });
    });

    it('renders free trial submit in Add payment method tab for free trial', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
        f.withBilling();
      });

      fixtures.clerk.user?.getPaymentMethods.mockResolvedValue({
        data: [
          {
            id: 'pm_test_visa',
            last4: '4242',
            paymentType: 'card',
            cardType: 'visa',
            isDefault: true,
            isRemovable: true,
            status: 'active',
            walletType: undefined,
            remove: vi.fn(),
            makeDefault: vi.fn(),
            pathRoot: '/',
            reload: vi.fn(),
          },
        ],
        total_count: 1,
      });

      fixtures.clerk.billing.startCheckout.mockResolvedValue({
        id: 'chk_trial_tabs_new',
        status: 'needs_confirmation',
        externalClientSecret: 'cs_test_trial_tabs_new',
        externalGatewayId: 'gw_test',
        totals: {
          subtotal: { amount: 1000, amountFormatted: '10.00', currency: 'USD', currencySymbol: '$' },
          grandTotal: { amount: 1000, amountFormatted: '10.00', currency: 'USD', currencySymbol: '$' },
          taxTotal: { amount: 0, amountFormatted: '0.00', currency: 'USD', currencySymbol: '$' },
          credit: { amount: 0, amountFormatted: '0.00', currency: 'USD', currencySymbol: '$' },
          pastDue: { amount: 0, amountFormatted: '0.00', currency: 'USD', currencySymbol: '$' },
          totalDueNow: { amount: 0, amountFormatted: '0.00', currency: 'USD', currencySymbol: '$' },
        },
        isImmediatePlanChange: true,
        planPeriod: 'month',
        plan: {
          id: 'plan_trial',
          name: 'Pro',
          description: 'Pro plan',
          features: [],
          fee: {
            amount: 1000,
            amountFormatted: '10.00',
            currency: 'USD',
            currencySymbol: '$',
          },
          annualFee: {
            amount: 12000,
            amountFormatted: '120.00',
            currency: 'USD',
            currencySymbol: '$',
          },
          annualMonthlyFee: {
            amount: 1000,
            amountFormatted: '10.00',
            currency: 'USD',
            currencySymbol: '$',
          },
          slug: 'pro',
          avatarUrl: '',
          publiclyVisible: true,
          isDefault: true,
          isRecurring: true,
          hasBaseFee: false,
          forPayerType: 'user',
          freeTrialDays: 7,
          freeTrialEnabled: true,
        },
        paymentMethod: undefined,
        confirm: vi.fn(),
        freeTrialEndsAt: new Date('2025-08-19'),
        needsPaymentMethod: true,
      } as any);

      const { getByText, getByRole, userEvent } = render(
        <Drawer.Root
          open
          onOpenChange={() => {}}
        >
          <Checkout
            planId='plan_with_payment_methods_free_trial_new'
            planPeriod='month'
          />
        </Drawer.Root>,
        { wrapper },
      );

      await waitFor(() => {
        expect(getByRole('heading', { name: 'Checkout' })).toBeVisible();
      });

      const addPaymentMethodButton = await waitFor(() => {
        const button = getByText('Add payment method');
        expect(button).toBeVisible();
        return button;
      });

      await userEvent.click(addPaymentMethodButton);

      await waitFor(() => {
        expect(getByRole('button', { name: 'Start free trial' })).toBeInTheDocument();
      });
    });

    it('prompts for adding payment method for free trial if none exists and requires payment method', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
        f.withBilling();
      });

      fixtures.clerk.user?.getPaymentMethods.mockResolvedValue({
        data: [],
        total_count: 0,
      });

      fixtures.clerk.billing.startCheckout.mockResolvedValue({
        id: 'chk_trial_tabs_new',
        status: 'needs_confirmation',
        externalClientSecret: 'cs_test_trial_tabs_new',
        externalGatewayId: 'gw_test',
        totals: {
          subtotal: { amount: 1000, amountFormatted: '10.00', currency: 'USD', currencySymbol: '$' },
          grandTotal: { amount: 1000, amountFormatted: '10.00', currency: 'USD', currencySymbol: '$' },
          taxTotal: { amount: 0, amountFormatted: '0.00', currency: 'USD', currencySymbol: '$' },
          credit: { amount: 0, amountFormatted: '0.00', currency: 'USD', currencySymbol: '$' },
          pastDue: { amount: 0, amountFormatted: '0.00', currency: 'USD', currencySymbol: '$' },
          totalDueNow: { amount: 0, amountFormatted: '0.00', currency: 'USD', currencySymbol: '$' },
        },
        isImmediatePlanChange: true,
        planPeriod: 'month',
        plan: {
          id: 'plan_trial',
          name: 'Pro',
          description: 'Pro plan',
          features: [],
          fee: {
            amount: 1000,
            amountFormatted: '10.00',
            currency: 'USD',
            currencySymbol: '$',
          },
          annualFee: {
            amount: 12000,
            amountFormatted: '120.00',
            currency: 'USD',
            currencySymbol: '$',
          },
          annualMonthlyFee: {
            amount: 1000,
            amountFormatted: '10.00',
            currency: 'USD',
            currencySymbol: '$',
          },
          slug: 'pro',
          avatarUrl: '',
          publiclyVisible: true,
          isDefault: true,
          isRecurring: true,
          hasBaseFee: false,
          forPayerType: 'user',
          freeTrialDays: 7,
          freeTrialEnabled: true,
        },
        paymentMethod: undefined,
        confirm: vi.fn(),
        freeTrialEndsAt: new Date('2025-08-19'),
        needsPaymentMethod: true,
      } as any);

      const { queryByText, getByRole } = render(
        <Drawer.Root
          open
          onOpenChange={() => {}}
        >
          <Checkout
            planId='plan_with_payment_methods_free_trial_new'
            planPeriod='month'
          />
        </Drawer.Root>,
        { wrapper },
      );

      await waitFor(async () => {
        expect(getByRole('heading', { name: 'Checkout' })).toBeVisible();

        // Verify segmented control for payment method source is hidden
        const paymentMethodsButton = queryByText('Payment Methods');
        expect(paymentMethodsButton).toBeNull();
        const addPaymentMethodButton = queryByText('Add payment method');
        expect(addPaymentMethodButton).toBeNull();

        expect(getByRole('button', { name: 'Start free trial' })).toBeInTheDocument();
      });
    });

    it('does not prompt payment methods for free trial when not required', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
        f.withBilling();
      });

      fixtures.clerk.user?.getPaymentMethods.mockResolvedValue({
        data: [],
        total_count: 0,
      });

      fixtures.clerk.billing.startCheckout.mockResolvedValue({
        id: 'chk_trial_tabs_new',
        status: 'needs_confirmation',
        externalClientSecret: 'cs_test_trial_tabs_new',
        externalGatewayId: 'gw_test',
        totals: {
          subtotal: { amount: 1000, amountFormatted: '10.00', currency: 'USD', currencySymbol: '$' },
          grandTotal: { amount: 1000, amountFormatted: '10.00', currency: 'USD', currencySymbol: '$' },
          taxTotal: { amount: 0, amountFormatted: '0.00', currency: 'USD', currencySymbol: '$' },
          credit: { amount: 0, amountFormatted: '0.00', currency: 'USD', currencySymbol: '$' },
          pastDue: { amount: 0, amountFormatted: '0.00', currency: 'USD', currencySymbol: '$' },
          totalDueNow: { amount: 0, amountFormatted: '0.00', currency: 'USD', currencySymbol: '$' },
        },
        isImmediatePlanChange: true,
        planPeriod: 'month',
        plan: {
          id: 'plan_trial',
          name: 'Pro',
          description: 'Pro plan',
          features: [],
          fee: {
            amount: 1000,
            amountFormatted: '10.00',
            currency: 'USD',
            currencySymbol: '$',
          },
          annualFee: {
            amount: 12000,
            amountFormatted: '120.00',
            currency: 'USD',
            currencySymbol: '$',
          },
          annualMonthlyFee: {
            amount: 1000,
            amountFormatted: '10.00',
            currency: 'USD',
            currencySymbol: '$',
          },
          slug: 'pro',
          avatarUrl: '',
          publiclyVisible: true,
          isDefault: true,
          isRecurring: true,
          hasBaseFee: false,
          forPayerType: 'user',
          freeTrialDays: 7,
          freeTrialEnabled: true,
        },
        paymentMethod: undefined,
        confirm: vi.fn(),
        freeTrialEndsAt: new Date('2025-08-19'),
        needsPaymentMethod: false,
      } as any);

      const { queryByText, getByRole, baseElement } = render(
        <Drawer.Root
          open
          onOpenChange={() => {}}
        >
          <Checkout
            planId='plan_with_payment_methods_free_trial_new'
            planPeriod='month'
          />
        </Drawer.Root>,
        { wrapper },
      );

      await waitFor(async () => {
        expect(getByRole('heading', { name: 'Checkout' })).toBeVisible();

        // Verify segmented control for payment method source is hidden
        const paymentMethodsButton = queryByText('Payment Methods');
        expect(paymentMethodsButton).toBeNull();
        const addPaymentMethodButton = queryByText('Add payment method');
        expect(addPaymentMethodButton).toBeNull();

        expect(queryByText('Development mode')).toBeNull();

        // Verify the hidden input is not rendered
        const hiddenInput = baseElement.querySelector('input[name="payment_method_id"]');
        expect(hiddenInput).toBeNull();

        expect(getByRole('button', { name: 'Start free trial' })).toBeInTheDocument();
      });
    });

    it('does not prompt payment methods for free trial when not required, even with stored payment methods', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
        f.withBilling();
      });

      fixtures.clerk.user?.getPaymentMethods.mockResolvedValue({
        data: [
          {
            id: 'pm_test_visa',
            last4: '4242',
            paymentType: 'card',
            cardType: 'visa',
            isDefault: true,
          },
        ],
        total_count: 1,
      });

      fixtures.clerk.billing.startCheckout.mockResolvedValue({
        id: 'chk_trial_tabs_new',
        status: 'needs_confirmation',
        externalClientSecret: 'cs_test_trial_tabs_new',
        externalGatewayId: 'gw_test',
        totals: {
          subtotal: { amount: 1000, amountFormatted: '10.00', currency: 'USD', currencySymbol: '$' },
          grandTotal: { amount: 1000, amountFormatted: '10.00', currency: 'USD', currencySymbol: '$' },
          taxTotal: { amount: 0, amountFormatted: '0.00', currency: 'USD', currencySymbol: '$' },
          credit: { amount: 0, amountFormatted: '0.00', currency: 'USD', currencySymbol: '$' },
          pastDue: { amount: 0, amountFormatted: '0.00', currency: 'USD', currencySymbol: '$' },
          totalDueNow: { amount: 0, amountFormatted: '0.00', currency: 'USD', currencySymbol: '$' },
        },
        isImmediatePlanChange: true,
        planPeriod: 'month',
        plan: {
          id: 'plan_trial',
          name: 'Pro',
          description: 'Pro plan',
          features: [],
          fee: {
            amount: 1000,
            amountFormatted: '10.00',
            currency: 'USD',
            currencySymbol: '$',
          },
          annualFee: {
            amount: 12000,
            amountFormatted: '120.00',
            currency: 'USD',
            currencySymbol: '$',
          },
          annualMonthlyFee: {
            amount: 1000,
            amountFormatted: '10.00',
            currency: 'USD',
            currencySymbol: '$',
          },
          slug: 'pro',
          avatarUrl: '',
          publiclyVisible: true,
          isDefault: true,
          isRecurring: true,
          hasBaseFee: false,
          forPayerType: 'user',
          freeTrialDays: 7,
          freeTrialEnabled: true,
        },
        paymentMethod: undefined,
        confirm: vi.fn(),
        freeTrialEndsAt: new Date('2025-08-19'),
        needsPaymentMethod: false,
      } as any);

      const { queryByText, getByRole, baseElement } = render(
        <Drawer.Root
          open
          onOpenChange={() => {}}
        >
          <Checkout
            planId='plan_with_payment_methods_free_trial_new'
            planPeriod='month'
          />
        </Drawer.Root>,
        { wrapper },
      );

      await waitFor(async () => {
        expect(getByRole('heading', { name: 'Checkout' })).toBeVisible();

        // Verify segmented control for payment method source is hidden
        const paymentMethodsButton = queryByText('Payment Methods');
        expect(paymentMethodsButton).toBeNull();
        const addPaymentMethodButton = queryByText('Add payment method');
        expect(addPaymentMethodButton).toBeNull();

        expect(queryByText('Development mode')).toBeNull();

        const visaPaymentMethod = queryByText('visa');
        expect(visaPaymentMethod).toBeNull();

        const last4Digits = queryByText('⋯ 4242');
        expect(last4Digits).toBeNull();

        // Verify the hidden input is not rendered
        const hiddenInput = baseElement.querySelector('input[name="payment_method_id"]');
        expect(hiddenInput).toBeNull();

        expect(getByRole('button', { name: 'Start free trial' })).toBeInTheDocument();
      });
    });

    it('hides tabs and select when subscription is a downgrade', async () => {
      const { wrapper, fixtures } = await createFixtures(f => {
        f.withUser({ email_addresses: ['test@clerk.com'] });
        f.withBilling();
      });

      fixtures.clerk.user?.getPaymentMethods.mockResolvedValue({
        data: [
          {
            id: 'pm_test_visa',
            last4: '4242',
            paymentType: 'card',
            cardType: 'visa',
            isDefault: true,
            isRemovable: true,
            status: 'active',
            walletType: undefined,
            remove: vi.fn(),
            makeDefault: vi.fn(),
            pathRoot: '/',
            reload: vi.fn(),
          },
          {
            id: 'pm_test_mastercard',
            last4: '5555',
            paymentType: 'card',
            cardType: 'mastercard',
            isDefault: false,
            isRemovable: true,
            status: 'active',
            walletType: undefined,
            remove: vi.fn(),
            makeDefault: vi.fn(),
            pathRoot: '/',
            reload: vi.fn(),
          },
        ],
        total_count: 2,
      });

      fixtures.clerk.billing.startCheckout.mockResolvedValue({
        id: 'chk_trial_2',
        status: 'needs_confirmation',
        externalClientSecret: 'cs_test_trial_2',
        externalGatewayId: 'gw_test',
        totals: {
          subtotal: { amount: 1000, amountFormatted: '10.00', currency: 'USD', currencySymbol: '$' },
          grandTotal: { amount: 1000, amountFormatted: '10.00', currency: 'USD', currencySymbol: '$' },
          taxTotal: { amount: 0, amountFormatted: '0.00', currency: 'USD', currencySymbol: '$' },
          credit: { amount: 0, amountFormatted: '0.00', currency: 'USD', currencySymbol: '$' },
          pastDue: { amount: 0, amountFormatted: '0.00', currency: 'USD', currencySymbol: '$' },
          totalDueNow: { amount: 0, amountFormatted: '0.00', currency: 'USD', currencySymbol: '$' },
        },
        isImmediatePlanChange: false,
        planPeriod: 'month',
        plan: {
          id: 'plan_trial',
          name: 'Pro',
          description: 'Pro plan',
          features: [],
          fee: {
            amount: 1000,
            amountFormatted: '10.00',
            currency: 'USD',
            currencySymbol: '$',
          },
          annualFee: {
            amount: 12000,
            amountFormatted: '120.00',
            currency: 'USD',
            currencySymbol: '$',
          },
          annualMonthlyFee: {
            amount: 1000,
            amountFormatted: '10.00',
            currency: 'USD',
            currencySymbol: '$',
          },
          slug: 'pro',
          avatarUrl: '',
          publiclyVisible: true,
          isDefault: true,
          isRecurring: true,
          hasBaseFee: false,
          forPayerType: 'user',
          freeTrialDays: 7,
          freeTrialEnabled: true,
        },
        paymentMethod: undefined,
        confirm: vi.fn(),
        freeTrialEndsAt: null,
        needsPaymentMethod: true,
      } as any);

      const { baseElement, queryByText, queryByRole, getByText } = render(
        <Drawer.Root
          open
          onOpenChange={() => {}}
        >
          <Checkout
            planId='plan_with_payment_methods'
            planPeriod='month'
          />
        </Drawer.Root>,
        { wrapper },
      );

      await waitFor(async () => {
        // Verify checkout title is displayed
        expect(queryByRole('heading', { name: 'Checkout' })).toBeVisible();
      });

      await waitFor(() => {
        const paymentMethodsButton = queryByRole('button', { name: 'Payment Methods' });
        expect(paymentMethodsButton).toBeNull();

        const addPaymentMethodButton = queryByText('Add payment method');
        expect(addPaymentMethodButton).toBeNull();

        const visaPaymentMethod = queryByText('visa');
        expect(visaPaymentMethod).toBeNull();

        expect(
          getByText(
            'You will keep your current subscription and its features until the end of the billing cycle, then you will be switched to this subscription.',
          ),
        ).toBeInTheDocument();

        // Verify the hidden input contains the correct payment method id
        const hiddenInput = baseElement.querySelector('input[name="payment_method_id"]');
        expect(hiddenInput).toHaveAttribute('value', 'pm_test_visa');

        expect(queryByRole('button', { name: 'Subscribe' })).toBeInTheDocument();
      });
    });
  });
});
