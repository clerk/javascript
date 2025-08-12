import { Drawer } from '@/ui/elements/Drawer';

import { render, waitFor } from '../../../../testUtils';
import { bindCreateFixtures } from '../../../utils/test/createFixtures';
import { SubscriptionDetails } from '..';

const { createFixtures } = bindCreateFixtures('SubscriptionDetails');

describe('SubscriptionDetails', () => {
  it('Displays spinner when init loading', async () => {
    const { wrapper } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });

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
    });

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
            amount: 1000,
            amountFormatted: '10.00',
            annualAmount: 10000,
            annualAmountFormatted: '100.00',
            annualMonthlyAmount: 8333,
            annualMonthlyAmountFormatted: '83.33',
            currencySymbol: '$',
            description: 'Test Plan',
            hasBaseFee: true,
            isRecurring: true,
            currency: 'USD',
            isDefault: false,
          },
          createdAt: new Date('2021-01-01'),
          periodStart: new Date('2021-01-01'),
          periodEnd: new Date('2021-02-01'),
          canceledAt: null,
          paymentSourceId: 'src_123',
          planPeriod: 'month',
          status: 'active',
        },
      ],
    });

    const { getByRole, getByText, queryByText, getAllByText, userEvent } = render(
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

    const menuButton = getByRole('button', { name: /Open menu/i });
    expect(menuButton).toBeVisible();
    await userEvent.click(menuButton);

    await waitFor(() => {
      expect(getByText('Switch to annual $100.00 / year')).toBeVisible();
      expect(getByText('Cancel subscription')).toBeVisible();
    });
  });

  it('single active annual subscription', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });

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
            amount: 1000,
            amountFormatted: '10.00',
            annualAmount: 10000,
            annualAmountFormatted: '100.00',
            annualMonthlyAmount: 8333,
            annualMonthlyAmountFormatted: '83.33',
            currencySymbol: '$',
            description: 'Test Plan',
            hasBaseFee: true,
            isRecurring: true,
            currency: 'USD',
            isDefault: false,
          },
          createdAt: new Date('2021-01-01'),
          periodStart: new Date('2021-01-01'),
          periodEnd: new Date('2022-01-01'),
          canceledAt: null,
          paymentSourceId: 'src_123',
          planPeriod: 'annual' as const,
          status: 'active' as const,
        },
      ],
    });

    const { getByRole, getByText, queryByText, getAllByText, userEvent } = render(
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

    const menuButton = getByRole('button', { name: /Open menu/i });
    expect(menuButton).toBeVisible();
    await userEvent.click(menuButton);

    await waitFor(() => {
      expect(getByText('Switch to monthly $10.00 / month')).toBeVisible();
      expect(getByText('Cancel subscription')).toBeVisible();
    });
  });

  it('active free subscription', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });

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
            amount: 0,
            amountFormatted: '0.00',
            annualAmount: 0,
            annualAmountFormatted: '0.00',
            annualMonthlyAmount: 0,
            annualMonthlyAmountFormatted: '0.00',
            currencySymbol: '$',
            description: 'Free Plan description',
            hasBaseFee: false,
            isRecurring: true,
            currency: 'USD',
            isDefault: true,
          },
          createdAt: new Date('2021-01-01'),
          periodStart: new Date('2021-01-01'),
          periodEnd: new Date('2021-02-01'),
          canceledAt: null,
          paymentSourceId: 'src_123',
          planPeriod: 'month' as const,
          status: 'active' as const,
        },
      ],
    });

    const { getByRole, getByText, queryByText, queryByRole } = render(
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
      expect(queryByRole('button', { name: /Open menu/i })).toBeNull();
    });
  });

  it('one active annual and one upcoming monthly subscription', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });

    const planAnnual = {
      id: 'plan_annual',
      name: 'Annual Plan',
      amount: 1300,
      amountFormatted: '13.00',
      annualAmount: 12000,
      annualAmountFormatted: '120.00',
      annualMonthlyAmount: 1000,
      annualMonthlyAmountFormatted: '10.00',
      currencySymbol: '$',
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
    const planMonthly = {
      id: 'plan_monthly',
      name: 'Monthly Plan',
      amount: 1000,
      amountFormatted: '10.00',
      annualAmount: 9000,
      annualAmountFormatted: '90.00',
      annualMonthlyAmount: 750,
      annualMonthlyAmountFormatted: '7.50',
      currencySymbol: '$',
      description: 'Monthly Plan',
      hasBaseFee: true,
      isRecurring: true,
      currency: 'USD',
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
          paymentSourceId: 'src_annual',
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
          paymentSourceId: 'src_monthly',
          planPeriod: 'month' as const,
          status: 'upcoming' as const,
        },
      ],
    });

    const { getByRole, getByText, getAllByText, queryByText, getAllByRole, userEvent } = render(
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

    const [menuButton, upcomingMenuButton] = getAllByRole('button', { name: /Open menu/i });
    await userEvent.click(menuButton);

    await waitFor(() => {
      expect(getByText('Switch to monthly $13.00 / month')).toBeVisible();
      expect(getByText('Resubscribe')).toBeVisible();
      expect(queryByText('Cancel subscription')).toBeNull();
    });

    await userEvent.click(upcomingMenuButton);

    await waitFor(() => {
      expect(getByText('Switch to annual $90.00 / year')).toBeVisible();
      expect(getByText('Cancel subscription')).toBeVisible();
    });
  });

  it('one active and one upcoming FREE subscription', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });

    const planMonthly = {
      id: 'plan_monthly',
      name: 'Monthly Plan',
      amount: 1000,
      amountFormatted: '10.00',
      annualAmount: 9000,
      annualAmountFormatted: '90.00',
      annualMonthlyAmount: 750,
      annualMonthlyAmountFormatted: '7.50',
      currencySymbol: '$',
      description: 'Monthly Plan',
      hasBaseFee: true,
      isRecurring: true,
      currency: 'USD',
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
      amount: 0,
      amountFormatted: '0.00',
      annualAmount: 0,
      annualAmountFormatted: '0.00',
      annualMonthlyAmount: 0,
      annualMonthlyAmountFormatted: '0.00',
      currencySymbol: '$',
      description: 'Upcoming Free Plan',
      hasBaseFee: false,
      isRecurring: true,
      currency: 'USD',
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
          paymentSourceId: 'src_free_active',
          planPeriod: 'month' as const,
          status: 'active' as const,
        },
        {
          id: 'sub_free_upcoming',
          plan: planFreeUpcoming,
          createdAt: new Date('2021-01-03'),
          periodStart: new Date('2021-02-01'),
          canceledAt: null,
          paymentSourceId: 'src_free_upcoming',
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
    });

    const cancelSubscriptionMock = jest.fn().mockResolvedValue({});

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
            amount: 1000,
            amountFormatted: '10.00',
            annualAmount: 10000,
            annualAmountFormatted: '100.00',
            annualMonthlyAmount: 8333,
            annualMonthlyAmountFormatted: '83.33',
            currencySymbol: '$',
            description: 'Monthly Plan',
            hasBaseFee: true,
            isRecurring: true,
            currency: 'USD',
            isDefault: false,
          },
          createdAt: new Date('2021-01-01'),
          periodStart: new Date('2021-01-01'),
          periodEnd: new Date('2021-02-01'),
          canceledAt: null,
          paymentSourceId: 'src_123',
          planPeriod: 'month' as const,
          status: 'active' as const,
          cancel: cancelSubscriptionMock,
        },
      ],
    });

    const { getByRole, getByText, userEvent } = render(
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

    // Open the menu
    const menuButton = getByRole('button', { name: /Open menu/i });
    await userEvent.click(menuButton);

    // Wait for the cancel option to appear and click it
    await userEvent.click(getByText('Cancel subscription'));

    await waitFor(() => {
      expect(getByText('Cancel Monthly Plan Subscription?')).toBeVisible();
      expect(
        getByText(
          "You can keep using 'Monthly Plan' features until February 1, 2021, after which you will no longer have access.",
        ),
      ).toBeVisible();
      expect(getByText('Keep subscription')).toBeVisible();
    });

    await userEvent.click(getByText('Cancel subscription'));

    // Assert that the cancelSubscription method was called
    await waitFor(() => {
      expect(cancelSubscriptionMock).toHaveBeenCalled();
    });
  });

  it('calls resubscribe when the user clicks Resubscribe for a canceled subscription', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });

    const plan = {
      id: 'plan_annual',
      name: 'Annual Plan',
      amount: 12000,
      amountFormatted: '120.00',
      annualAmount: 12000,
      annualAmountFormatted: '120.00',
      annualMonthlyAmount: 1000,
      annualMonthlyAmountFormatted: '10.00',
      currencySymbol: '$',
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
      __internal_toSnapshot: jest.fn(),
      pathRoot: '',
      reload: jest.fn(),
    };

    const subscription = {
      id: 'sub_annual',
      plan,
      createdAt: new Date('2021-01-01'),
      periodStart: new Date('2021-01-01'),
      periodEnd: new Date('2022-01-01'),
      canceledAt: new Date('2021-04-01'),
      paymentSourceId: 'src_annual',
      planPeriod: 'annual' as const,
      status: 'active' as const,
      cancel: jest.fn(),
      pathRoot: '',
      reload: jest.fn(),
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

    const { getByRole, getByText, userEvent } = render(
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

    // Open the menu
    const menuButton = getByRole('button', { name: /Open menu/i });
    await userEvent.click(menuButton);

    // Wait for the Resubscribe option and click it
    await userEvent.click(getByText('Resubscribe'));

    // Assert resubscribe was called
    await waitFor(() => {
      expect(fixtures.clerk.__internal_openCheckout).toHaveBeenCalled();
    });
  });

  it('calls switchToMonthly when the user clicks Switch to monthly for an annual subscription', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });

    const plan = {
      id: 'plan_annual',
      name: 'Annual Plan',
      amount: 12000,
      amountFormatted: '120.00',
      annualAmount: 12000,
      annualAmountFormatted: '120.00',
      annualMonthlyAmount: 1000,
      annualMonthlyAmountFormatted: '10.00',
      currencySymbol: '$',
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
      paymentSourceId: 'src_annual',
      planPeriod: 'annual' as const,
      status: 'active' as const,
      cancel: jest.fn(),
      pathRoot: '',
      reload: jest.fn(),
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

    const { getByRole, getByText, userEvent } = render(
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

    // Open the menu
    const menuButton = getByRole('button', { name: /Open menu/i });
    await userEvent.click(menuButton);

    // Wait for the Switch to monthly option and click it
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
    });

    const plan = {
      id: 'plan_monthly',
      name: 'Monthly Plan',
      amount: 1000,
      amountFormatted: '10.00',
      annualAmount: 9000,
      annualAmountFormatted: '90.00',
      annualMonthlyAmount: 750,
      annualMonthlyAmountFormatted: '7.50',
      currencySymbol: '$',
      description: 'Monthly Plan',
      hasBaseFee: true,
      isRecurring: true,
      currency: 'USD',
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
          paymentSourceId: 'src_123',
          planPeriod: 'month' as const,
          status: 'past_due' as const,
          pastDueAt: new Date('2021-01-15'),
        },
      ],
    });

    const { getByRole, getByText, queryByText, queryByRole } = render(
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

      // Menu button should be present but disabled
      expect(queryByRole('button', { name: /Open menu/i })).toBeNull();
    });
  });
});
