import type { BillingPayerResourceType } from '@clerk/shared/types';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, waitFor } from '@/test/utils';

import { localizationKeys } from '../../../customizables';
import { SubscriptionsList } from '../SubscriptionsList';

const { createFixtures } = bindCreateFixtures('UserProfile');

const props = {
  title: localizationKeys('userProfile.billingPage.subscriptionsListSection.title'),
  switchPlansLabel: localizationKeys('userProfile.billingPage.subscriptionsListSection.actionLabel__switchPlan'),
  newSubscriptionLabel: localizationKeys(
    'userProfile.billingPage.subscriptionsListSection.actionLabel__newSubscription',
  ),
  manageSubscriptionLabel: localizationKeys(
    'userProfile.billingPage.subscriptionsListSection.actionLabel__manageSubscription',
  ),
} as const;

describe('SubscriptionsList', () => {
  it('shows New subscription CTA and hides Manage when there are no subscriptions', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
      f.withBilling();
    });

    fixtures.clerk.user.getPaymentMethods.mockRejectedValue(null);
    fixtures.clerk.billing.getSubscription.mockResolvedValue({
      id: 'sub_top_empty',
      status: 'active',
      activeAt: new Date('2021-01-01'),
      createdAt: new Date('2021-01-01'),
      nextPayment: null,
      pastDueAt: null,
      updatedAt: null,
      subscriptionItems: [],
      pathRoot: '',
      reload: vi.fn(),
    });

    const { getByText, queryByText } = render(<SubscriptionsList {...props} />, { wrapper });

    await waitFor(() => {
      expect(getByText('Subscribe to a plan')).toBeVisible();
    });

    expect(queryByText('Manage')).toBeNull();
    expect(fixtures.clerk.billing.getPlans).not.toHaveBeenCalled();
    expect(fixtures.clerk.billing.getStatements).not.toHaveBeenCalled();
    expect(fixtures.clerk.billing.getSubscription).toHaveBeenCalled();
    expect(fixtures.clerk.user.getPaymentMethods).toHaveBeenCalled();
  });

  it('shows switch plans CTA and hides Manage when there on free plan', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
      f.withBilling();
    });

    fixtures.clerk.billing.getPlans.mockRejectedValue(null);
    fixtures.clerk.billing.getStatements.mockRejectedValue(null);
    fixtures.clerk.user.getPaymentMethods.mockRejectedValue(null);
    fixtures.clerk.billing.getSubscription.mockResolvedValue({
      id: 'sub_top_empty',
      status: 'active',
      activeAt: new Date('2021-01-01'),
      createdAt: new Date('2021-01-01'),
      nextPayment: null,
      pastDueAt: null,
      updatedAt: null,
      subscriptionItems: [
        {
          id: 'sub_free',
          plan: {
            id: 'plan_free',
            name: 'Free Plan',
            fee: { amount: 0, amountFormatted: '0.00', currencySymbol: '$', currency: 'USD' },
            annualFee: { amount: 0, amountFormatted: '0.00', currencySymbol: '$', currency: 'USD' },
            annualMonthlyFee: { amount: 0, amountFormatted: '0.00', currencySymbol: '$', currency: 'USD' },
            description: 'Free Plan Description',
            isDefault: true,
            isRecurring: true,
            hasBaseFee: false,
            forPayerType: 'user' as BillingPayerResourceType,
            publiclyVisible: true,
            slug: 'free-plan',
            avatarUrl: '',
            features: [],
            freeTrialDays: null,
            freeTrialEnabled: false,
            pathRoot: '',
            reload: vi.fn(),
          },
          status: 'active',
          createdAt: new Date('2021-01-01'),
          periodStart: new Date('2021-01-01'),
          periodEnd: new Date('2021-01-15'),
          canceledAt: null,
          planPeriod: 'month' as const,
          isFreeTrial: false,
          pastDueAt: null,
          cancel: vi.fn(),
          pathRoot: '',
          reload: vi.fn(),
        },
      ],
      pathRoot: '',
      reload: vi.fn(),
    });

    const testProps = {
      title: localizationKeys('userProfile.billingPage.subscriptionsListSection.title'),
      switchPlansLabel: localizationKeys('userProfile.billingPage.subscriptionsListSection.actionLabel__switchPlan'),
      newSubscriptionLabel: localizationKeys(
        'userProfile.billingPage.subscriptionsListSection.actionLabel__newSubscription',
      ),
      manageSubscriptionLabel: localizationKeys(
        'userProfile.billingPage.subscriptionsListSection.actionLabel__manageSubscription',
      ),
    } as const;

    const { getByText, queryByText } = render(<SubscriptionsList {...testProps} />, { wrapper });

    await waitFor(() => {
      expect(getByText('Switch plans')).toBeVisible();
    });
    expect(queryByText('Subscribe to a plan')).toBeNull();
    expect(queryByText('Manage')).toBeNull();
  });

  it('displays free trial badge when subscription is in free trial', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
      f.withBilling();
    });

    const freeTrialSubscription = {
      id: 'sub_trial',
      plan: {
        id: 'plan_trial',
        name: 'Pro Plan',
        fee: { amount: 2000, amountFormatted: '20.00', currencySymbol: '$', currency: 'USD' },
        annualFee: { amount: 20000, amountFormatted: '200.00', currencySymbol: '$', currency: 'USD' },
        annualMonthlyFee: { amount: 1667, amountFormatted: '16.67', currencySymbol: '$', currency: 'USD' },
        description: 'Pro Plan Description',
        isDefault: false,
        isRecurring: true,
        hasBaseFee: true,
        forPayerType: 'user' as BillingPayerResourceType,
        publiclyVisible: true,
        slug: 'pro-plan',
        avatarUrl: '',
        features: [],
        freeTrialDays: 14,
        freeTrialEnabled: true,
        pathRoot: '',
        reload: vi.fn(),
      },
      createdAt: new Date('2021-01-01'),
      periodStart: new Date('2021-01-01'),
      periodEnd: new Date('2021-01-15'),
      canceledAt: null,
      planPeriod: 'month' as const,
      status: 'active' as const,
      isFreeTrial: true, // This subscription is in a free trial
      pastDueAt: null,
      cancel: vi.fn(),
      pathRoot: '',
      reload: vi.fn(),
    };

    fixtures.clerk.billing.getPlans.mockRejectedValue(null);
    fixtures.clerk.billing.getStatements.mockRejectedValue(null);
    fixtures.clerk.user.getPaymentMethods.mockRejectedValue(null);
    fixtures.clerk.billing.getSubscription.mockResolvedValue({
      id: 'sub_top',
      status: 'active',
      activeAt: new Date('2021-01-01'),
      createdAt: new Date('2021-01-01'),
      nextPayment: null,
      pastDueAt: null,
      updatedAt: null,
      subscriptionItems: [freeTrialSubscription],
      pathRoot: '',
      reload: vi.fn(),
    });

    const { getByText } = render(<SubscriptionsList {...props} />, { wrapper });

    await waitFor(() => {
      expect(getByText('Pro Plan')).toBeVisible();
      // Free trial subscription should show the Free trial badge
      expect(getByText('Free trial')).toBeVisible();
    });
  });

  it('on past due, no badge, but past due date is shown', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
      f.withBilling();
    });

    const pastDueSubscription = {
      id: 'sub_past_due',
      plan: {
        id: 'plan_past_due',
        name: 'Pro Plan',
        fee: { amount: 2000, amountFormatted: '20.00', currencySymbol: '$', currency: 'USD' },
        annualFee: { amount: 20000, amountFormatted: '200.00', currencySymbol: '$', currency: 'USD' },
        annualMonthlyFee: { amount: 1667, amountFormatted: '16.67', currencySymbol: '$', currency: 'USD' },
        description: 'Pro Plan Description',
        isDefault: false,
        isRecurring: true,
        hasBaseFee: true,
        forPayerType: 'user' as BillingPayerResourceType,
        publiclyVisible: true,
        slug: 'pro-plan',
        avatarUrl: '',
        features: [],
        freeTrialDays: null,
        freeTrialEnabled: false,
        pathRoot: '',
        reload: vi.fn(),
      },
      createdAt: new Date('2021-01-01'),
      periodStart: new Date('2021-01-01'),
      periodEnd: new Date('2021-02-01'),
      canceledAt: null,
      planPeriod: 'month' as const,
      status: 'past_due' as const,
      isFreeTrial: false,
      pastDueAt: new Date('2021-01-15'),
      cancel: vi.fn(),
      pathRoot: '',
      reload: vi.fn(),
    };

    fixtures.clerk.billing.getPlans.mockRejectedValue(null);
    fixtures.clerk.billing.getStatements.mockRejectedValue(null);
    fixtures.clerk.user.getPaymentMethods.mockRejectedValue(null);
    fixtures.clerk.billing.getSubscription.mockResolvedValue({
      id: 'sub_top',
      status: 'past_due',
      activeAt: new Date('2021-01-01'),
      createdAt: new Date('2021-01-01'),
      nextPayment: null,
      pastDueAt: new Date('2021-01-15'),
      updatedAt: null,
      subscriptionItems: [pastDueSubscription],
      pathRoot: '',
      reload: vi.fn(),
    });

    const { getByText, queryByText } = render(<SubscriptionsList {...props} />, { wrapper });

    await waitFor(() => {
      expect(getByText('Pro Plan')).toBeVisible();
      // Past due subscription should show the Past due badge
      expect(queryByText(/^Past due$/)).toBeNull();
      expect(getByText(/Past due Jan 15, 2021/)).toBeVisible();
    });
  });

  it('does not display active badge when subscription is active and it is a single item', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
      f.withBilling();
    });
    fixtures.clerk.billing.getPlans.mockRejectedValue(null);
    fixtures.clerk.billing.getStatements.mockRejectedValue(null);
    fixtures.clerk.user.getPaymentMethods.mockRejectedValue(null);

    const activeSubscription = {
      id: 'sub_active',
      plan: {
        id: 'plan_active',
        name: 'Pro Plan',
        fee: { amount: 2000, amountFormatted: '20.00', currencySymbol: '$', currency: 'USD' },
        annualFee: { amount: 20000, amountFormatted: '200.00', currencySymbol: '$', currency: 'USD' },
        annualMonthlyFee: { amount: 1667, amountFormatted: '16.67', currencySymbol: '$', currency: 'USD' },
        description: 'Pro Plan Description',
        isDefault: false,
        isRecurring: true,
        hasBaseFee: true,
        forPayerType: 'user' as BillingPayerResourceType,
        publiclyVisible: true,
        slug: 'pro-plan',
        avatarUrl: '',
        features: [],
        freeTrialDays: null,
        freeTrialEnabled: false,
        pathRoot: '',
        reload: vi.fn(),
      },
      createdAt: new Date('2021-01-01'),
      periodStart: new Date('2021-01-01'),
      periodEnd: new Date('2021-02-01'),
      canceledAt: null,
      planPeriod: 'month' as const,
      status: 'active' as const,
      isFreeTrial: false,
      pastDueAt: null,
      cancel: vi.fn(),
      pathRoot: '',
      reload: vi.fn(),
    };

    fixtures.clerk.billing.getSubscription.mockResolvedValue({
      id: 'sub_top',
      status: 'active',
      activeAt: new Date('2021-01-01'),
      createdAt: new Date('2021-01-01'),
      nextPayment: null,
      pastDueAt: null,
      updatedAt: null,
      subscriptionItems: [activeSubscription],
      pathRoot: '',
      reload: vi.fn(),
    });

    const { getByText, queryByText } = render(<SubscriptionsList {...props} />, { wrapper });

    await waitFor(() => {
      expect(getByText('Pro Plan')).toBeVisible();
      // Active subscription should show the Active badge
      expect(queryByText(/^Active$/)).toBeNull();
    });
  });

  it('renders upcomming badge when current subscription is canceled but active', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
      f.withBilling();
    });

    const upcomingSubscription = {
      id: 'sub_upcoming',
      plan: {
        id: 'plan_upcoming',
        name: 'Plus Plan',
        fee: { amount: 2000, amountFormatted: '20.00', currencySymbol: '$', currency: 'USD' },
        annualFee: { amount: 20000, amountFormatted: '200.00', currencySymbol: '$', currency: 'USD' },
        annualMonthlyFee: { amount: 1667, amountFormatted: '16.67', currencySymbol: '$', currency: 'USD' },
        description: 'Pro Plan Description',
        isDefault: false,
        isRecurring: true,
        hasBaseFee: true,
        forPayerType: 'user' as BillingPayerResourceType,
        publiclyVisible: true,
        slug: 'plus-plan',
        avatarUrl: '',
        features: [],
        freeTrialDays: null,
        freeTrialEnabled: false,
        pathRoot: '',
        reload: vi.fn(),
      },
      createdAt: new Date('2021-01-01'),
      periodStart: new Date('2021-02-01'),
      periodEnd: new Date('2021-03-01'),
      canceledAt: null,
      planPeriod: 'month' as const,
      status: 'upcoming' as const,
      isFreeTrial: false,
      pastDueAt: null,
      cancel: vi.fn(),
      pathRoot: '',
      reload: vi.fn(),
    };

    const activeCanceledSubscription = {
      id: 'sub_active_canceled',
      plan: {
        id: 'plan_active_canceled',
        name: 'Pro Plan',
        fee: { amount: 2000, amountFormatted: '20.00', currencySymbol: '$', currency: 'USD' },
        annualFee: { amount: 20000, amountFormatted: '200.00', currencySymbol: '$', currency: 'USD' },
        annualMonthlyFee: { amount: 1667, amountFormatted: '16.67', currencySymbol: '$', currency: 'USD' },
        description: 'Pro Plan Description',
        isDefault: false,
        isRecurring: true,
        hasBaseFee: true,
        forPayerType: 'user' as BillingPayerResourceType,
        publiclyVisible: true,
        slug: 'pro-plan',
        avatarUrl: '',
        features: [],
        freeTrialDays: null,
        freeTrialEnabled: false,
        pathRoot: '',
        reload: vi.fn(),
      },
      createdAt: new Date('2021-01-01'),
      periodStart: new Date('2021-01-01'),
      periodEnd: new Date('2021-02-01'),
      canceledAt: new Date('2021-01-15'),
      planPeriod: 'month' as const,
      status: 'active' as const,
      isFreeTrial: false,
      pastDueAt: null,
      cancel: vi.fn(),
      pathRoot: '',
      reload: vi.fn(),
    };

    fixtures.clerk.billing.getPlans.mockRejectedValue(null);
    fixtures.clerk.billing.getStatements.mockRejectedValue(null);
    fixtures.clerk.user.getPaymentMethods.mockRejectedValue(null);
    fixtures.clerk.billing.getSubscription.mockResolvedValue({
      id: 'sub_top',
      status: 'active',
      activeAt: new Date('2021-01-01'),
      createdAt: new Date('2021-01-01'),
      nextPayment: null,
      pastDueAt: null,
      updatedAt: null,
      subscriptionItems: [activeCanceledSubscription, upcomingSubscription],
      pathRoot: '',
      reload: vi.fn(),
    });

    const { getByText, queryByText } = render(<SubscriptionsList {...props} />, { wrapper });

    await waitFor(() => {
      expect(getByText('Pro Plan')).toBeVisible();
      expect(queryByText(/^Active$/)).toBeVisible();
      expect(queryByText('Canceled • Ends Feb 1, 2021')).toBeVisible();

      expect(getByText('Plus Plan')).toBeVisible();
      expect(queryByText(/^Upcoming$/)).toBeVisible();
      expect(queryByText('Starts Feb 1, 2021')).toBeVisible();
    });
  });
});
