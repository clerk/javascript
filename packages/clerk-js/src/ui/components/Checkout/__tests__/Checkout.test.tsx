import { Drawer } from '@/ui/elements/Drawer';

import { render, waitFor } from '../../../../testUtils';
import { bindCreateFixtures } from '../../../utils/test/createFixtures';
import { Checkout } from '..';

const { createFixtures } = bindCreateFixtures('Checkout');

// Mock Payment Element to be ready so the submit button is rendered during tests
jest.mock('@clerk/shared/react', () => {
  const actual = jest.requireActual('@clerk/shared/react');
  return {
    ...actual,
    __experimental_PaymentElementProvider: ({ children }: { children: any }) => children,
    __experimental_PaymentElement: (_: { fallback?: any }) => null,
    __experimental_usePaymentElement: () => ({
      submit: jest.fn().mockResolvedValue({ data: { gateway: 'stripe', paymentToken: 'tok_test' }, error: null }),
      reset: jest.fn().mockResolvedValue(undefined),
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
    });

    // Mock billing to prevent actual API calls and stay in loading state
    fixtures.clerk.billing.startCheckout.mockImplementation(() => new Promise(() => {}));

    const { baseElement } = render(
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
      const title = baseElement.querySelector('[data-localization-key="commerce.checkout.title"]');
      expect(title).toBeVisible();
      expect(title).toHaveTextContent('Checkout');

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
    fixtures.clerk.billing.startCheckout.mockImplementation(() => new Promise(() => {}));

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
    });

    // Mock billing to reject with a Clerk-like error shape
    fixtures.clerk.billing.startCheckout.mockRejectedValue({
      status: 400,
      errors: [{ code: 'unknown_error' }],
    });

    const { baseElement } = render(
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
      expect(baseElement.querySelector('[data-localization-key="commerce.checkout.title"]')).toBeVisible();
    });
  });

  it('displays proper loading state during checkout initialization', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });

    // Mock billing to stay in loading state
    fixtures.clerk.billing.startCheckout.mockImplementation(() => new Promise(() => {}));

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
    });

    fixtures.clerk.billing.startCheckout.mockImplementation(() => new Promise(() => {}));

    const { baseElement } = render(
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
      const heading = baseElement.querySelector('h2[data-localization-key="commerce.checkout.title"]');
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
    });

    // Mock billing to prevent actual API calls
    fixtures.clerk.billing.startCheckout.mockImplementation(() => new Promise(() => {}));

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
    });
    fixtures.clerk.billing.startCheckout.mockImplementation(() => new Promise(() => {}));
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
    fixtures.clerk.billing.startCheckout.mockImplementation(() => new Promise(() => {}));
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
    });

    fixtures.clerk.billing.startCheckout.mockImplementation(() => new Promise(() => {}));

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

  it('renders free trial details during confirmation stage', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });

    const freeTrialEndsAt = new Date('2025-08-19');

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
      paymentSource: undefined,
      confirm: jest.fn(),
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
      paymentSource: undefined,
      confirm: jest.fn(),
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

  it('renders existing payment sources during checkout confirmation', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });

    fixtures.clerk.user?.getPaymentSources.mockResolvedValue({
      data: [
        {
          id: 'pm_test_visa',
          last4: '4242',
          paymentMethod: 'card',
          cardType: 'visa',
          isDefault: true,
          isRemovable: true,
          status: 'active',
          walletType: undefined,
          remove: jest.fn(),
          makeDefault: jest.fn(),
          pathRoot: '/',
          reload: jest.fn(),
        },
        {
          id: 'pm_test_mastercard',
          last4: '5555',
          paymentMethod: 'card',
          cardType: 'mastercard',
          isDefault: false,
          isRemovable: true,
          status: 'active',
          walletType: undefined,
          remove: jest.fn(),
          makeDefault: jest.fn(),
          pathRoot: '/',
          reload: jest.fn(),
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
      paymentSource: undefined,
      confirm: jest.fn(),
      freeTrialEndsAt: new Date('2025-08-19'),
    } as any);

    const { baseElement, getByText, getByRole, userEvent } = render(
      <Drawer.Root
        open
        onOpenChange={() => {}}
      >
        <Checkout
          planId='plan_with_payment_sources'
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
      const visaPaymentSource = getByText('visa');
      expect(visaPaymentSource).toBeVisible();

      const last4Digits = getByText('⋯ 4242');
      expect(last4Digits).toBeVisible();

      // Verify the default badge is shown for the first payment source
      const defaultBadge = getByText('Default');
      expect(defaultBadge).toBeVisible();

      // Verify the hidden input contains the correct payment source id
      const hiddenInput = baseElement.querySelector('input[name="payment_source_id"]');
      expect(hiddenInput).toHaveAttribute('value', 'pm_test_visa');
    });
  });
});
