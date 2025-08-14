import type { CommercePayerResourceType } from '@clerk/types';

import { render, waitFor } from '../../../../testUtils';
import { localizationKeys } from '../../../customizables';
import { bindCreateFixtures } from '../../../utils/test/createFixtures';
import { SubscriptionsList } from '../SubscriptionsList';

const { createFixtures } = bindCreateFixtures('UserProfile');

const props = {
  title: localizationKeys('userProfile.billingPage.subscriptionsListSection.title'),
  arrowButtonText: localizationKeys('userProfile.billingPage.subscriptionsListSection.actionLabel__switchPlan'),
  arrowButtonEmptyText: localizationKeys(
    'userProfile.billingPage.subscriptionsListSection.actionLabel__newSubscription',
  ),
};

describe('SubscriptionsList', () => {
  it('displays free trial badge when subscription is in free trial', async () => {
    const { wrapper, fixtures } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
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
        forPayerType: 'user' as CommercePayerResourceType,
        publiclyVisible: true,
        slug: 'pro-plan',
        avatarUrl: '',
        features: [],
        freeTrialDays: 14,
        freeTrialEnabled: true,
        pathRoot: '',
        reload: jest.fn(),
      },
      createdAt: new Date('2021-01-01'),
      periodStart: new Date('2021-01-01'),
      periodEnd: new Date('2021-01-15'),
      canceledAt: null,
      paymentSourceId: 'src_trial',
      planPeriod: 'month' as const,
      status: 'active' as const,
      isFreeTrial: true, // This subscription is in a free trial
      pastDueAt: null,
      cancel: jest.fn(),
      pathRoot: '',
      reload: jest.fn(),
    };

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
      reload: jest.fn(),
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
        forPayerType: 'user' as CommercePayerResourceType,
        publiclyVisible: true,
        slug: 'pro-plan',
        avatarUrl: '',
        features: [],
        freeTrialDays: null,
        freeTrialEnabled: false,
        pathRoot: '',
        reload: jest.fn(),
      },
      createdAt: new Date('2021-01-01'),
      periodStart: new Date('2021-01-01'),
      periodEnd: new Date('2021-02-01'),
      canceledAt: null,
      paymentSourceId: 'src_past_due',
      planPeriod: 'month' as const,
      status: 'past_due' as const,
      isFreeTrial: false,
      pastDueAt: new Date('2021-01-15'),
      cancel: jest.fn(),
      pathRoot: '',
      reload: jest.fn(),
    };

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
      reload: jest.fn(),
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
    });

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
        forPayerType: 'user' as CommercePayerResourceType,
        publiclyVisible: true,
        slug: 'pro-plan',
        avatarUrl: '',
        features: [],
        freeTrialDays: null,
        freeTrialEnabled: false,
        pathRoot: '',
        reload: jest.fn(),
      },
      createdAt: new Date('2021-01-01'),
      periodStart: new Date('2021-01-01'),
      periodEnd: new Date('2021-02-01'),
      canceledAt: null,
      paymentSourceId: 'src_active',
      planPeriod: 'month' as const,
      status: 'active' as const,
      isFreeTrial: false,
      pastDueAt: null,
      cancel: jest.fn(),
      pathRoot: '',
      reload: jest.fn(),
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
      reload: jest.fn(),
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
        forPayerType: 'user' as CommercePayerResourceType,
        publiclyVisible: true,
        slug: 'plus-plan',
        avatarUrl: '',
        features: [],
        freeTrialDays: null,
        freeTrialEnabled: false,
        pathRoot: '',
        reload: jest.fn(),
      },
      createdAt: new Date('2021-01-01'),
      periodStart: new Date('2021-02-01'),
      periodEnd: new Date('2021-03-01'),
      canceledAt: null,
      paymentSourceId: 'src_upcoming',
      planPeriod: 'month' as const,
      status: 'upcoming' as const,
      isFreeTrial: false,
      pastDueAt: null,
      cancel: jest.fn(),
      pathRoot: '',
      reload: jest.fn(),
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
        forPayerType: 'user' as CommercePayerResourceType,
        publiclyVisible: true,
        slug: 'pro-plan',
        avatarUrl: '',
        features: [],
        freeTrialDays: null,
        freeTrialEnabled: false,
        pathRoot: '',
        reload: jest.fn(),
      },
      createdAt: new Date('2021-01-01'),
      periodStart: new Date('2021-01-01'),
      periodEnd: new Date('2021-02-01'),
      canceledAt: new Date('2021-01-15'),
      paymentSourceId: 'src_active_canceled',
      planPeriod: 'month' as const,
      status: 'active' as const,
      isFreeTrial: false,
      pastDueAt: null,
      cancel: jest.fn(),
      pathRoot: '',
      reload: jest.fn(),
    };

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
      reload: jest.fn(),
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
