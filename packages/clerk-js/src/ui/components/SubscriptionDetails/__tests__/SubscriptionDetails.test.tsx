import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, waitFor } from '@/test/utils';
import { Drawer } from '@/ui/elements/Drawer';

import { SubscriptionDetails } from '..';

const { createFixtures } = bindCreateFixtures('SubscriptionDetails');

describe('SubscriptionDetails', () => {
  it('Displays spinner when init loading', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
      f.withBilling();
    });

    fixtures.clerk.billing.getSubscription.mockResolvedValue(null);

    const { baseElement } = render(
      <Drawer.Root
        open
        onOpenChange={() => {}}
      >
        <SubscriptionDetails />
      </Drawer.Root>,
      { wrapper },
    );

    await waitFor(() => {
      const spinner = baseElement.querySelector('span[aria-live="polite"]');
      expect(spinner).toBeVisible();
    });
  });

  it('single active monthly subscription', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
      f.withBilling();
    });
    fixtures.clerk.billing.getPlans.mockResolvedValue([]);
    fixtures.clerk.billing.getStatements.mockResolvedValue([]);
    fixtures.clerk.billing.getPaymentAttempts.mockResolvedValue([]);
    fixtures.clerk.user.getPaymentMethods.mockResolvedValue([]);

    fixtures.clerk.billing.getSubscription.mockResolvedValue({
      activeAt: new Date('2021-01-01'),
      createdAt: new Date('2021-01-01'),
      pastDueAt: null,
      id: 'sub_123',
      nextPayment: {
        amount: {
          amount: 1000,
          amountFormatted: '10.00',
          currency: 'USD',
          currencySymbol: '$',
        },
        date: new Date('2021-02-01'),
      },
      status: 'active',
      subscriptionItems: [
        {
          id: 'sub_123',
          plan: {
            id: 'plan_123',
            name: 'Test Plan',
            fee: {
              amount: 1000,
              amountFormatted: '10.00',
              currencySymbol: '$',
              currency: 'USD',
            },
            annualFee: {
              amount: 10000,
              amountFormatted: '100.00',
              currencySymbol: '$',
              currency: 'USD',
            },
            annualMonthlyFee: {
              amount: 8333,
              amountFormatted: '83.33',
              currencySymbol: '$',
              currency: 'USD',
            },
            description: 'Test Plan',
            hasBaseFee: true,
            isRecurring: true,
            isDefault: false,
          },
          createdAt: new Date('2021-01-01'),
          periodStart: new Date('2021-01-01'),
          periodEnd: new Date('2021-02-01'),
          canceledAt: null,
          planPeriod: 'month',
          status: 'active',
        },
      ],
    });

    const { getByRole, getByText, queryByText, getAllByText } = render(
      <Drawer.Root
        open
        onOpenChange={() => {}}
      >
        <SubscriptionDetails />
      </Drawer.Root>,
      { wrapper },
    );
    await waitFor(() => {
      expect(getByRole('heading', { name: /Subscription/i })).toBeVisible();

      expect(getByText('Test Plan')).toBeVisible();
      expect(getByText('Active')).toBeVisible();

      expect(getByText('$10.00 / Month')).toBeVisible();

      expect(getByText('Subscribed on')).toBeVisible();
      expect(getByText('January 1, 2021')).toBeVisible();
      expect(getByText('Renews at')).toBeVisible();

      expect(getByText('Current billing cycle')).toBeVisible();
      expect(getByText('Monthly')).toBeVisible();

      expect(getByText('Next payment on')).toBeVisible();
      const nextPaymentElements = getAllByText('February 1, 2021');
      expect(nextPaymentElements.length).toBe(2);

      expect(getByText('Next payment amount')).toBeVisible();
      expect(getByText('$10.00')).toBeVisible();
      expect(queryByText('Ends on')).toBeNull();
    });

    await waitFor(() => {
      expect(getByText('Switch to annual')).toBeVisible();
      expect(getByText('Cancel subscription')).toBeVisible();
    });
  });

  it('single active annual subscription', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
      f.withBilling();
    });
    fixtures.clerk.billing.getPlans.mockResolvedValue([]);
    fixtures.clerk.billing.getStatements.mockResolvedValue([]);
    fixtures.clerk.billing.getPaymentAttempts.mockResolvedValue([]);
    fixtures.clerk.user.getPaymentMethods.mockResolvedValue([]);

    fixtures.clerk.billing.getSubscription.mockResolvedValue({
      activeAt: new Date('2021-01-01'),
      createdAt: new Date('2021-01-01'),
      pastDueAt: null,
      id: 'sub_123',
      nextPayment: {
        amount: {
          amount: 10000,
          amountFormatted: '100.00',
          currency: 'USD',
          currencySymbol: '$',
        },
        date: new Date('2022-01-01'),
      },
      status: 'active',
      subscriptionItems: [
        {
          id: 'sub_123',
          plan: {
            id: 'plan_123',
            name: 'Test Plan',
            fee: {
              amount: 1000,
              amountFormatted: '10.00',
              currencySymbol: '$',
              currency: 'USD',
            },
            annualFee: {
              amount: 10000,
              amountFormatted: '100.00',
              currencySymbol: '$',
              currency: 'USD',
            },
            annualMonthlyFee: {
              amount: 8333,
              amountFormatted: '83.33',
              currencySymbol: '$',
              currency: 'USD',
            },
            description: 'Test Plan',
            hasBaseFee: true,
            isRecurring: true,
            isDefault: false,
          },
          createdAt: new Date('2021-01-01'),
          periodStart: new Date('2021-01-01'),
          periodEnd: new Date('2022-01-01'),
          canceledAt: null,
          planPeriod: 'annual' as const,
          status: 'active' as const,
        },
      ],
    });

    const { getByRole, getByText, queryByText, getAllByText } = render(
      <Drawer.Root
        open
        onOpenChange={() => {}}
      >
        <SubscriptionDetails />
      </Drawer.Root>,
      { wrapper },
    );
    await waitFor(() => {
      expect(getByRole('heading', { name: /Subscription/i })).toBeVisible();

      expect(getByText('Test Plan')).toBeVisible();
      expect(getByText('Active')).toBeVisible();

      expect(getByText('$100.00 / Year')).toBeVisible();

      expect(getByText('Subscribed on')).toBeVisible();
      expect(getByText('January 1, 2021')).toBeVisible();
      expect(getByText('Renews at')).toBeVisible();

      expect(getByText('Current billing cycle')).toBeVisible();
      expect(getByText('Annually')).toBeVisible();

      expect(getByText('Next payment on')).toBeVisible();
      const nextPaymentElements = getAllByText('January 1, 2022');
      expect(nextPaymentElements.length).toBe(2);

      expect(getByText('Next payment amount')).toBeVisible();
      expect(getByText('$100.00')).toBeVisible();
      expect(queryByText('Ends on')).toBeNull();
    });

    await waitFor(() => {
      expect(getByText('Switch to monthly')).toBeVisible();
      expect(getByText('Cancel subscription')).toBeVisible();
    });
  });

  it('active free subscription', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
      f.withBilling();
    });
    fixtures.clerk.billing.getPlans.mockResolvedValue([]);
    fixtures.clerk.billing.getStatements.mockResolvedValue([]);
    fixtures.clerk.billing.getPaymentAttempts.mockResolvedValue([]);
    fixtures.clerk.user.getPaymentMethods.mockResolvedValue([]);

    fixtures.clerk.billing.getSubscription.mockResolvedValue({
      activeAt: new Date('2021-01-01'),
      createdAt: new Date('2021-01-01'),
      pastDueAt: null,
      id: 'sub_123',
      status: 'active',
      nextPayment: null,
      subscriptionItems: [
        {
          id: 'sub_123',
          plan: {
            id: 'plan_123',
            name: 'Free Plan',
            fee: {
              amount: 0,
              amountFormatted: '0.00',
              currencySymbol: '$',
              currency: 'USD',
            },
            annualFee: null,
            annualMonthlyFee: null,
            description: 'Free Plan description',
            hasBaseFee: false,
            isRecurring: true,
            isDefault: true,
          },
          createdAt: new Date('2021-01-01'),
          periodStart: new Date('2021-01-01'),
          periodEnd: new Date('2021-02-01'),
          canceledAt: null,
          planPeriod: 'month' as const,
          status: 'active' as const,
        },
      ],
    });

    const { getByRole, getByText, queryByText } = render(
      <Drawer.Root
        open
        onOpenChange={() => {}}
      >
        <SubscriptionDetails />
      </Drawer.Root>,
      { wrapper },
    );
    await waitFor(() => {
      expect(getByRole('heading', { name: /Subscription/i })).toBeVisible();

      expect(getByText('Free Plan')).toBeVisible();
      expect(getByText('Active')).toBeVisible();

      expect(getByText('$0.00 / Month')).toBeVisible();

      expect(getByText('Subscribed on')).toBeVisible();
      expect(getByText('January 1, 2021')).toBeVisible();

      expect(getByText('Renews at')).toBeVisible();
      expect(queryByText('Ends on')).toBeNull();
      expect(queryByText('Current billing cycle')).toBeNull();
      expect(queryByText('Monthly')).toBeNull();
      expect(queryByText('Next payment on')).toBeNull();
      expect(queryByText('Next payment amount')).toBeNull();

      expect(queryByText('Cancel subscription')).toBeNull();
      expect(queryByText(/Switch to/i)).toBeNull();
    });
  });

  it('one active annual and one upcoming monthly subscription', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
      f.withBilling();
    });

    fixtures.clerk.billing.getPlans.mockResolvedValue([]);
    fixtures.clerk.billing.getStatements.mockResolvedValue([]);
    fixtures.clerk.billing.getPaymentAttempts.mockResolvedValue([]);
    fixtures.clerk.user.getPaymentMethods.mockResolvedValue([]);

    const planAnnual = {
      id: 'plan_annual',
      name: 'Annual Plan',
      fee: {
        amount: 1300,
        amountFormatted: '13.00',
        currencySymbol: '$',
        currency: 'USD',
      },
      annualFee: {
        amount: 12000,
        amountFormatted: '120.00',
        currencySymbol: '$',
        currency: 'USD',
      },
      annualMonthlyFee: {
        amount: 1000,
        amountFormatted: '10.00',
        currencySymbol: '$',
        currency: 'USD',
      },
      description: 'Annual Plan',
      hasBaseFee: true,
      isRecurring: true,
      isDefault: false,
      payerType: ['user'],
      publiclyVisible: true,
      slug: 'annual-plan',
      avatarUrl: '',
      features: [],
    };
    const planMonthly = {
      id: 'plan_monthly',
      name: 'Monthly Plan',
      fee: {
        amount: 1000,
        amountFormatted: '10.00',
        currencySymbol: '$',
        currency: 'USD',
      },
      annualFee: {
        amount: 9099,
        amountFormatted: '90.99',
        currencySymbol: '$',
        currency: 'USD',
      },
      annualMonthlyFee: {
        amount: 750,
        amountFormatted: '7.50',
        currencySymbol: '$',
        currency: 'USD',
      },
      description: 'Monthly Plan',
      hasBaseFee: true,
      isRecurring: true,
      isDefault: false,
      payerType: ['user'],
      publiclyVisible: true,
      slug: 'monthly-plan',
      avatarUrl: '',
      features: [],
    };

    fixtures.clerk.billing.getSubscription.mockResolvedValue({
      activeAt: new Date('2021-01-01'),
      createdAt: new Date('2021-01-01'),
      pastDueAt: null,
      id: 'sub_123',
      status: 'active',
      nextPayment: {
        amount: {
          amount: 1000,
          amountFormatted: '10.00',
          currency: 'USD',
          currencySymbol: '$',
        },
        date: new Date('2021-02-01'),
      },
      subscriptionItems: [
        {
          id: 'sub_annual',
          plan: planAnnual,
          createdAt: new Date('2021-01-01'),
          periodStart: new Date('2021-01-01'),
          periodEnd: new Date('2022-01-01'),
          canceledAt: new Date('2021-04-01'),
          planPeriod: 'annual' as const,
          status: 'active' as const,
        },
        {
          id: 'sub_monthly',
          plan: planMonthly,
          createdAt: new Date('2022-01-01'),
          periodStart: new Date('2022-02-01'),
          periodEnd: new Date('2022-03-01'),
          canceledAt: null,
          planPeriod: 'month' as const,
          status: 'upcoming' as const,
        },
      ],
    });

    const { getByRole, getByText, getAllByText, queryByText } = render(
      <Drawer.Root
        open
        onOpenChange={() => {}}
      >
        <SubscriptionDetails />
      </Drawer.Root>,
      { wrapper },
    );

    await waitFor(() => {
      expect(getByRole('heading', { name: /Subscription/i })).toBeVisible();
      expect(getByText('Annual Plan')).toBeVisible();
      expect(getByText('Active')).toBeVisible();
      expect(getByText('$120.00 / Year')).toBeVisible();
      expect(getByText('Subscribed on')).toBeVisible();
      expect(getByText('January 1, 2021')).toBeVisible();
      expect(getByText('Ends on')).toBeVisible();
      expect(getByText('January 1, 2022')).toBeVisible();
      expect(queryByText('Renews at')).toBeNull();
      expect(getByText('Current billing cycle')).toBeVisible();
      expect(getByText('Annually')).toBeVisible();
      expect(getByText('Next payment on')).toBeVisible();
      expect(getAllByText('January 1, 2022').length).toBeGreaterThan(0);
      expect(getByText('Next payment amount')).toBeVisible();
      expect(getByText('$10.00')).toBeVisible();
      // Check for the upcoming subscription details
      expect(getByText('Upcoming')).toBeVisible();
      expect(getByText('Monthly Plan')).toBeVisible();
      expect(getByText('$10.00 / Month')).toBeVisible();
      expect(getByText('Begins on')).toBeVisible();
    });

    await waitFor(() => {
      expect(getByText('Switch to monthly')).toBeVisible();
      expect(getByText('Resubscribe')).toBeVisible();
      expect(getAllByText('Cancel subscription').length).toBe(1);
    });
  });

  it('one active and one upcoming FREE subscription', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
      f.withBilling();
    });

    fixtures.clerk.billing.getPlans.mockResolvedValue([]);
    fixtures.clerk.billing.getStatements.mockResolvedValue([]);
    fixtures.clerk.billing.getPaymentAttempts.mockResolvedValue([]);
    fixtures.clerk.user.getPaymentMethods.mockResolvedValue([]);

    const planMonthly = {
      id: 'plan_monthly',
      name: 'Monthly Plan',

      fee: {
        amount: 1000,
        amountFormatted: '10.00',
        currencySymbol: '$',
        currency: 'USD',
      },
      annualFee: {
        amount: 9000,
        amountFormatted: '90.00',
        currencySymbol: '$',
        currency: 'USD',
      },
      annualMonthlyFee: {
        amount: 750,
        amountFormatted: '7.50',
        currencySymbol: '$',
        currency: 'USD',
      },
      description: 'Monthly Plan',
      hasBaseFee: true,
      isRecurring: true,
      isDefault: false,
      payerType: ['user'],
      publiclyVisible: true,
      slug: 'monthly-plan',
      avatarUrl: '',
      features: [],
    };

    const planFreeUpcoming = {
      id: 'plan_free_upcoming',
      name: 'Free Plan (Upcoming)',
      fee: {
        amount: 0,
        amountFormatted: '0.00',
        currencySymbol: '$',
        currency: 'USD',
      },
      annualFee: {
        amount: 0,
        amountFormatted: '0.00',
        currencySymbol: '$',
        currency: 'USD',
      },
      annualMonthlyFee: {
        amount: 0,
        amountFormatted: '0.00',
        currencySymbol: '$',
        currency: 'USD',
      },
      description: 'Upcoming Free Plan',
      hasBaseFee: false,
      isRecurring: true,
      isDefault: false,
      payerType: ['user'],
      publiclyVisible: true,
      slug: 'free-plan-upcoming',
      avatarUrl: '',
      features: [],
    };

    fixtures.clerk.billing.getSubscription.mockResolvedValue({
      activeAt: new Date('2021-01-01'),
      createdAt: new Date('2021-01-01'),
      pastDueAt: null,
      id: 'sub_123',
      status: 'active',
      nextPayment: null,
      subscriptionItems: [
        {
          id: 'test_active',
          plan: planMonthly,
          createdAt: new Date('2021-01-01'),
          periodStart: new Date('2021-01-01'),
          periodEnd: new Date('2021-02-01'),
          canceledAt: new Date('2021-01-03'),
          planPeriod: 'month' as const,
          status: 'active' as const,
        },
        {
          id: 'sub_free_upcoming',
          plan: planFreeUpcoming,
          createdAt: new Date('2021-01-03'),
          periodStart: new Date('2021-02-01'),
          canceledAt: null,
          planPeriod: 'month' as const,
          status: 'upcoming' as const,
        },
      ],
    });

    const { getByRole, getByText, queryByText, getAllByText } = render(
      <Drawer.Root
        open
        onOpenChange={() => {}}
      >
        <SubscriptionDetails />
      </Drawer.Root>,
      { wrapper },
    );

    await waitFor(() => {
      expect(getByRole('heading', { name: /Subscription/i })).toBeVisible();
      expect(getByText('Monthly Plan')).toBeVisible();
      expect(getByText('Active')).toBeVisible();
      expect(getByText('$10.00 / Month')).toBeVisible();
      expect(getByText('Subscribed on')).toBeVisible();
      expect(getByText('January 1, 2021')).toBeVisible();
      expect(getByText('Ends on')).toBeVisible();

      expect(queryByText('Renews at')).toBeNull();
      expect(queryByText('Current billing cycle')).toBeNull();
      expect(queryByText('Next payment on')).toBeNull();
      expect(queryByText('Next payment amount')).toBeNull();
      // Check for the upcoming free subscription details
      expect(getByText('Upcoming')).toBeVisible();
      expect(getByText('Free Plan (Upcoming)')).toBeVisible();
      expect(getByText('$0.00 / Month')).toBeVisible();
      expect(getByText('Begins on')).toBeVisible();

      const nextPaymentElements = getAllByText('February 1, 2021');
      expect(nextPaymentElements.length).toBe(2);
    });
  });

  it('allows cancelling a subscription of a monthly plan', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
      f.withBilling();
    });

    const cancelSubscriptionMock = vi.fn().mockResolvedValue({});

    fixtures.clerk.billing.getPlans.mockResolvedValue([]);
    fixtures.clerk.billing.getStatements.mockResolvedValue([]);
    fixtures.clerk.billing.getPaymentAttempts.mockResolvedValue([]);
    fixtures.clerk.user.getPaymentMethods.mockResolvedValue([]);

    fixtures.clerk.billing.getSubscription.mockResolvedValue({
      activeAt: new Date('2021-01-01'),
      createdAt: new Date('2021-01-01'),
      pastDueAt: null,
      id: 'sub_123',
      nextPayment: {
        amount: {
          amount: 1000,
          amountFormatted: '10.00',
          currency: 'USD',
          currencySymbol: '$',
        },
        date: new Date('2021-01-01'),
      },
      status: 'active',
      subscriptionItems: [
        {
          id: 'sub_123',
          plan: {
            id: 'plan_123',
            name: 'Monthly Plan',
            fee: {
              amount: 1000,
              amountFormatted: '10.00',
              currencySymbol: '$',
              currency: 'USD',
            },
            annualFee: {
              amount: 10000,
              amountFormatted: '100.00',
              currencySymbol: '$',
              currency: 'USD',
            },
            annualMonthlyFee: {
              amount: 8333,
              amountFormatted: '83.33',
              currencySymbol: '$',
              currency: 'USD',
            },
            description: 'Monthly Plan',
            hasBaseFee: true,
            isRecurring: true,
            isDefault: false,
          },
          createdAt: new Date('2021-01-01'),
          periodStart: new Date('2021-01-01'),
          periodEnd: new Date('2021-02-01'),
          canceledAt: null,
          planPeriod: 'month' as const,
          status: 'active' as const,
          cancel: cancelSubscriptionMock,
        },
      ],
    });

    const { getByText, getAllByText, userEvent } = render(
      <Drawer.Root
        open
        onOpenChange={() => {}}
      >
        <SubscriptionDetails />
      </Drawer.Root>,
      { wrapper },
    );

    // Wait for the subscription details to render
    await waitFor(() => {
      expect(getByText('Monthly Plan')).toBeVisible();
      expect(getByText('Active')).toBeVisible();
    });

    // Get the inline Cancel subscription button (first one, before confirmation dialog opens)
    const cancelButtons = getAllByText('Cancel subscription');
    await userEvent.click(cancelButtons[0]);

    await waitFor(() => {
      expect(getByText('Cancel Monthly Plan Subscription?')).toBeVisible();
      expect(
        getByText(
          "You can keep using 'Monthly Plan' features until February 1, 2021, after which you will no longer have access.",
        ),
      ).toBeVisible();
      expect(getByText('Keep subscription')).toBeVisible();
    });

    // Click the Cancel subscription button in the confirmation dialog
    // Use getAllByText and select the last one (confirmation dialog button)
    const allCancelButtons = getAllByText('Cancel subscription');
    await userEvent.click(allCancelButtons[allCancelButtons.length - 1]);

    // Assert that the cancelSubscription method was called
    await waitFor(() => {
      expect(cancelSubscriptionMock).toHaveBeenCalled();
    });
  });

  it('calls resubscribe when the user clicks Resubscribe for a canceled subscription', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
      f.withBilling();
    });

    fixtures.clerk.billing.getPlans.mockResolvedValue([]);
    fixtures.clerk.billing.getStatements.mockResolvedValue([]);
    fixtures.clerk.billing.getPaymentAttempts.mockResolvedValue([]);
    fixtures.clerk.user.getPaymentMethods.mockResolvedValue([]);

    const plan = {
      id: 'plan_annual',
      name: 'Annual Plan',

      fee: {
        amount: 12000,
        amountFormatted: '120.00',
        currencySymbol: '$',
        currency: 'USD',
      },
      annualFee: {
        amount: 12000,
        amountFormatted: '120.00',
        currencySymbol: '$',
        currency: 'USD',
      },
      annualMonthlyFee: {
        amount: 1000,
        amountFormatted: '10.00',
        currencySymbol: '$',
        currency: 'USD',
      },
      description: 'Annual Plan',
      hasBaseFee: true,
      isRecurring: true,
      currency: 'USD',
      isDefault: false,
      payerType: ['user'],
      publiclyVisible: true,
      slug: 'annual-plan',
      avatarUrl: '',
      features: [],
      __internal_toSnapshot: vi.fn(),
      pathRoot: '',
      reload: vi.fn(),
    };

    const subscription = {
      id: 'sub_annual',
      plan,
      createdAt: new Date('2021-01-01'),
      periodStart: new Date('2021-01-01'),
      periodEnd: new Date('2022-01-01'),
      canceledAt: new Date('2021-04-01'),
      planPeriod: 'annual' as const,
      status: 'active' as const,
      cancel: vi.fn(),
      pathRoot: '',
      reload: vi.fn(),
    };

    // Mock getSubscriptions to return the canceled subscription
    fixtures.clerk.billing.getSubscription.mockResolvedValue({
      activeAt: new Date('2021-01-01'),
      createdAt: new Date('2021-01-01'),
      pastDueAt: null,
      id: 'sub_123',
      nextPayment: {
        amount: {
          amount: 1000,
          amountFormatted: '10.00',
          currency: 'USD',
          currencySymbol: '$',
        },
        date: new Date('2021-01-01'),
      },
      subscriptionItems: [subscription],
    });

    const { getByText, userEvent } = render(
      <Drawer.Root
        open
        onOpenChange={() => {}}
      >
        <SubscriptionDetails />
      </Drawer.Root>,
      { wrapper },
    );

    await waitFor(() => {
      expect(getByText('Annual Plan')).toBeVisible();
    });

    await userEvent.click(getByText('Resubscribe'));

    // Assert resubscribe was called
    await waitFor(() => {
      expect(fixtures.clerk.__internal_openCheckout).toHaveBeenCalled();
    });
  });

  it('calls switchToMonthly when the user clicks Switch to monthly for an annual subscription', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
      f.withBilling();
    });

    fixtures.clerk.billing.getPlans.mockResolvedValue([]);
    fixtures.clerk.billing.getStatements.mockResolvedValue([]);
    fixtures.clerk.billing.getPaymentAttempts.mockResolvedValue([]);
    fixtures.clerk.user.getPaymentMethods.mockResolvedValue([]);

    const plan = {
      id: 'plan_annual',
      name: 'Annual Plan',

      fee: {
        amount: 12000,
        amountFormatted: '120.00',
        currencySymbol: '$',
        currency: 'USD',
      },
      annualFee: {
        amount: 12000,
        amountFormatted: '120.00',
        currencySymbol: '$',
        currency: 'USD',
      },
      annualMonthlyFee: {
        amount: 1000,
        amountFormatted: '10.00',
        currencySymbol: '$',
        currency: 'USD',
      },

      description: 'Annual Plan',
      hasBaseFee: true,
      isRecurring: true,
      currency: 'USD',
      isDefault: false,
      payerType: ['user'],
      publiclyVisible: true,
      slug: 'annual-plan',
      avatarUrl: '',
      features: [],
    };

    const subscription = {
      id: 'sub_annual',
      plan,
      createdAt: new Date('2021-01-01'),
      periodStart: new Date('2021-01-01'),
      periodEnd: new Date('2022-01-01'),
      canceledAt: null,
      planPeriod: 'annual' as const,
      status: 'active' as const,
      cancel: vi.fn(),
      pathRoot: '',
      reload: vi.fn(),
    };

    // Mock getSubscriptions to return the annual subscription
    fixtures.clerk.billing.getSubscription.mockResolvedValue({
      activeAt: new Date('2021-01-01'),
      createdAt: new Date('2021-01-01'),
      pastDueAt: null,
      id: 'sub_123',
      nextPayment: {
        amount: {
          amount: 1000,
          amountFormatted: '10.00',
          currency: 'USD',
          currencySymbol: '$',
        },
        date: new Date('2021-01-01'),
      },
      subscriptionItems: [subscription],
    });

    const { getByText, userEvent } = render(
      <Drawer.Root
        open
        onOpenChange={() => {}}
      >
        <SubscriptionDetails />
      </Drawer.Root>,
      { wrapper },
    );

    await waitFor(() => {
      expect(getByText('Annual Plan')).toBeVisible();
    });

    await userEvent.click(getByText(/Switch to monthly/i));

    // Assert switchToMonthly was called
    await waitFor(() => {
      expect(fixtures.clerk.__internal_openCheckout).toHaveBeenCalledWith(
        expect.objectContaining({
          planId: subscription.plan.id,
          planPeriod: 'month' as const,
        }),
      );
    });
  });

  it('past due subscription shows correct status and disables actions', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
      f.withBilling();
    });

    fixtures.clerk.billing.getPlans.mockResolvedValue([]);
    fixtures.clerk.billing.getStatements.mockResolvedValue([]);
    fixtures.clerk.billing.getPaymentAttempts.mockResolvedValue([]);
    fixtures.clerk.user.getPaymentMethods.mockResolvedValue([]);

    const plan = {
      id: 'plan_monthly',
      name: 'Monthly Plan',
      fee: {
        amount: 1000,
        amountFormatted: '10.00',
        currencySymbol: '$',
        currency: 'USD',
      },
      annualFee: {
        amount: 9000,
        amountFormatted: '90.00',
        currencySymbol: '$',
        currency: 'USD',
      },
      annualMonthlyFee: {
        amount: 750,
        amountFormatted: '7.50',
        currencySymbol: '$',
        currency: 'USD',
      },
      description: 'Monthly Plan',
      hasBaseFee: true,
      isRecurring: true,
      isDefault: false,
      payerType: ['user'],
      publiclyVisible: true,
      slug: 'monthly-plan',
      avatarUrl: '',
      features: [],
    };

    fixtures.clerk.billing.getSubscription.mockResolvedValue({
      activeAt: new Date('2021-01-01'),
      createdAt: new Date('2021-01-01'),
      pastDueAt: null,
      id: 'sub_123',
      nextPayment: {
        amount: {
          amount: 1000,
          amountFormatted: '10.00',
          currency: 'USD',
          currencySymbol: '$',
        },
        date: new Date('2021-01-01'),
      },
      subscriptionItems: [
        {
          id: 'sub_past_due',
          plan,
          createdAt: new Date('2021-01-01'),
          periodStart: new Date('2021-01-01'),
          periodEnd: new Date('2021-02-01'),
          canceledAt: null,
          planPeriod: 'month' as const,
          status: 'past_due' as const,
          pastDueAt: new Date('2021-01-15'),
        },
      ],
    });

    const { getByRole, getByText, queryByText } = render(
      <Drawer.Root
        open
        onOpenChange={() => {}}
      >
        <SubscriptionDetails />
      </Drawer.Root>,
      { wrapper },
    );

    await waitFor(() => {
      expect(getByRole('heading', { name: /Subscription/i })).toBeVisible();
      expect(getByText('Monthly Plan')).toBeVisible();
      expect(getByText('Past due')).toBeVisible();
      expect(getByText('$10.00 / Month')).toBeVisible();

      expect(queryByText('Subscribed on')).toBeNull();
      expect(getByText('Past due on')).toBeVisible();
      expect(getByText('January 15, 2021')).toBeVisible();
    });
  });

  it('active free trial subscription shows correct labels and behavior', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
      f.withBilling();
    });

    fixtures.clerk.billing.getPlans.mockResolvedValue([]);
    fixtures.clerk.billing.getStatements.mockResolvedValue([]);
    fixtures.clerk.billing.getPaymentAttempts.mockResolvedValue([]);
    fixtures.clerk.user.getPaymentMethods.mockResolvedValue([]);

    fixtures.clerk.billing.getSubscription.mockResolvedValue({
      activeAt: new Date('2021-01-01'),
      createdAt: new Date('2021-01-01'),
      pastDueAt: null,
      id: 'sub_123',
      nextPayment: {
        amount: {
          amount: 1000,
          amountFormatted: '10.00',
          currency: 'USD',
          currencySymbol: '$',
        },
        date: new Date('2021-02-01'),
      },
      status: 'active',
      subscriptionItems: [
        {
          id: 'sub_123',
          plan: {
            id: 'plan_123',
            name: 'Pro Plan',
            fee: {
              amount: 1000,
              amountFormatted: '10.00',
              currencySymbol: '$',
              currency: 'USD',
            },
            annualFee: {
              amount: 10000,
              amountFormatted: '100.00',
              currencySymbol: '$',
              currency: 'USD',
            },
            annualMonthlyFee: {
              amount: 8333,
              amountFormatted: '83.33',
              currencySymbol: '$',
              currency: 'USD',
            },
            description: 'Pro Plan',
            hasBaseFee: true,
            isRecurring: true,
            isDefault: false,
          },
          createdAt: new Date('2021-01-01'),
          periodStart: new Date('2021-01-01'),
          periodEnd: new Date('2021-02-01'),
          canceledAt: null,
          planPeriod: 'month',
          status: 'active',
          isFreeTrial: true,
        },
      ],
    });

    const { getByRole, getByText, getAllByText, queryByText } = render(
      <Drawer.Root
        open
        onOpenChange={() => {}}
      >
        <SubscriptionDetails />
      </Drawer.Root>,
      { wrapper },
    );

    await waitFor(() => {
      expect(getByRole('heading', { name: /Subscription/i })).toBeVisible();
      expect(getByText('Pro Plan')).toBeVisible();
      expect(getByText('Free trial')).toBeVisible();
      expect(getByText('$10.00 / Month')).toBeVisible();

      // Free trial specific labels
      expect(getByText('Trial started on')).toBeVisible();
      expect(getByText('January 1, 2021')).toBeVisible();
      expect(getByText('Trial ends on')).toBeVisible();

      // Should have multiple instances of February 1, 2021 (trial end and first payment)
      const februaryDates = getAllByText('February 1, 2021');
      expect(februaryDates.length).toBeGreaterThan(1);

      // Payment related labels should use "first payment" wording
      expect(getByText('First payment on')).toBeVisible();
      expect(getByText('First payment amount')).toBeVisible();
      expect(getByText('$10.00')).toBeVisible();

      // Should not show regular subscription labels
      expect(queryByText('Subscribed on')).toBeNull();
      expect(queryByText('Renews at')).toBeNull();
      expect(queryByText('Next payment on')).toBeNull();
      expect(queryByText('Next payment amount')).toBeNull();
    });

    // Test the inline button shows free trial specific option
    await waitFor(() => {
      expect(getByText('Cancel free trial')).toBeVisible();
    });
  });

  it('allows cancelling a free trial with specific dialog text', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
      f.withBilling();
    });

    fixtures.clerk.billing.getPlans.mockResolvedValue([]);
    fixtures.clerk.billing.getStatements.mockResolvedValue([]);
    fixtures.clerk.billing.getPaymentAttempts.mockResolvedValue([]);
    fixtures.clerk.user.getPaymentMethods.mockResolvedValue([]);

    const cancelSubscriptionMock = vi.fn().mockResolvedValue({});

    fixtures.clerk.billing.getSubscription.mockResolvedValue({
      activeAt: new Date('2021-01-01'),
      createdAt: new Date('2021-01-01'),
      pastDueAt: null,
      id: 'sub_123',
      nextPayment: {
        amount: {
          amount: 1000,
          amountFormatted: '10.00',
          currency: 'USD',
          currencySymbol: '$',
        },
        date: new Date('2021-02-01'),
      },
      status: 'active',
      subscriptionItems: [
        {
          id: 'sub_123',
          plan: {
            id: 'plan_123',
            name: 'Pro Plan',
            fee: {
              amount: 1000,
              amountFormatted: '10.00',
              currencySymbol: '$',
              currency: 'USD',
            },
            annualFee: {
              amount: 10000,
              amountFormatted: '100.00',
              currencySymbol: '$',
              currency: 'USD',
            },
            annualMonthlyFee: {
              amount: 8333,
              amountFormatted: '83.33',
              currencySymbol: '$',
              currency: 'USD',
            },
            description: 'Pro Plan',
            hasBaseFee: true,
            isRecurring: true,
            isDefault: false,
          },
          createdAt: new Date('2021-01-01'),
          periodStart: new Date('2021-01-01'),
          periodEnd: new Date('2021-02-01'),
          canceledAt: null,
          planPeriod: 'month',
          status: 'active',
          isFreeTrial: true,
          cancel: cancelSubscriptionMock,
        },
      ],
    });

    const { getByText, getAllByText, userEvent } = render(
      <Drawer.Root
        open
        onOpenChange={() => {}}
      >
        <SubscriptionDetails />
      </Drawer.Root>,
      { wrapper },
    );

    // Wait for the subscription details to render
    await waitFor(() => {
      expect(getByText('Pro Plan')).toBeVisible();
      expect(getByText('Free trial')).toBeVisible();
    });

    // Get the inline Cancel free trial button (first one, before confirmation dialog opens)
    const cancelTrialButtons = getAllByText('Cancel free trial');
    await userEvent.click(cancelTrialButtons[0]);

    await waitFor(() => {
      // Should show free trial specific cancellation dialog
      expect(getByText('Cancel free trial for Pro Plan plan?')).toBeVisible();
      expect(
        getByText(
          "Your trial will stay active until February 1, 2021. After that, you'll lose access to trial features. You won't be charged.",
        ),
      ).toBeVisible();
      expect(getByText('Keep free trial')).toBeVisible();
    });

    // Click the Cancel free trial button in the confirmation dialog
    // Use getAllByText and select the last one (confirmation dialog button)
    const allCancelTrialButtons = getAllByText('Cancel free trial');
    await userEvent.click(allCancelTrialButtons[allCancelTrialButtons.length - 1]);

    // Assert that the cancelSubscription method was called
    await waitFor(() => {
      expect(cancelSubscriptionMock).toHaveBeenCalled();
    });
  });
});
