import { render, waitFor } from '../../../../testUtils';
import { bindCreateFixtures } from '../../../utils/test/createFixtures';
import { PricingTable } from '..';

const { createFixtures } = bindCreateFixtures('PricingTable');

describe('PricingTable - trial info', () => {
  const trialPlan = {
    id: 'plan_trial',
    name: 'Pro',
    amount: 2000,
    amountFormatted: '20.00',
    annualAmount: 20000,
    annualAmountFormatted: '200.00',
    annualMonthlyAmount: 1667,
    annualMonthlyAmountFormatted: '16.67',
    currencySymbol: '$',
    description: 'Pro plan with trial',
    hasBaseFee: true,
    isRecurring: true,
    currency: 'USD',
    isDefault: false,
    forPayerType: 'user',
    publiclyVisible: true,
    slug: 'pro',
    avatarUrl: '',
    features: [] as any[],
    freeTrialEnabled: true,
    freeTrialDays: 14,
    __internal_toSnapshot: jest.fn(),
    pathRoot: '',
    reload: jest.fn(),
  } as const;

  it('shows footer notice with trial end date when active subscription is in free trial', async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });

    // Provide empty props to the PricingTable context
    props.setProps({});

    fixtures.clerk.billing.getPlans.mockResolvedValue({ data: [trialPlan as any], total_count: 1 });
    fixtures.clerk.billing.getSubscription.mockResolvedValue({
      id: 'sub_1',
      status: 'active',
      activeAt: new Date('2021-01-01'),
      createdAt: new Date('2021-01-01'),
      nextPayment: null,
      pastDueAt: null,
      updatedAt: null,
      subscriptionItems: [
        {
          id: 'si_1',
          plan: trialPlan,
          createdAt: new Date('2021-01-01'),
          paymentSourceId: 'src_1',
          pastDueAt: null,
          canceledAt: null,
          periodStart: new Date('2021-01-01'),
          periodEnd: new Date('2021-01-15'),
          planPeriod: 'month' as const,
          status: 'active' as const,
          isFreeTrial: true,
          cancel: jest.fn(),
          pathRoot: '',
          reload: jest.fn(),
        },
      ],
      pathRoot: '',
      reload: jest.fn(),
    });

    const { findByRole, getByText, userEvent } = render(<PricingTable />, { wrapper });

    // Wait for the plan to appear
    await findByRole('heading', { name: 'Pro' });

    // Default period is annual in mounted mode; switch to monthly to match the subscription
    const periodSwitch = await findByRole('switch', { name: /billed annually/i });
    await userEvent.click(periodSwitch);

    await waitFor(() => {
      // Trial footer notice uses badge__trialEndsAt localization (short date format)
      expect(getByText('Trial ends Jan 15, 2021')).toBeVisible();
    });
  });

  it('shows CTA "Start N-day free trial" when eligible and plan has trial', async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });

    // Provide empty props to the PricingTable context
    props.setProps({});

    fixtures.clerk.billing.getPlans.mockResolvedValue({ data: [trialPlan as any], total_count: 1 });
    fixtures.clerk.billing.getSubscription.mockResolvedValue({
      id: 'sub_top',
      status: 'active',
      activeAt: new Date('2021-01-01'),
      createdAt: new Date('2021-01-01'),
      nextPayment: null,
      pastDueAt: null,
      updatedAt: null,
      eligibleForFreeTrial: true,
      // No subscription items for the trial plan yet
      subscriptionItems: [],
      pathRoot: '',
      reload: jest.fn(),
    });

    const { getByRole, getByText } = render(<PricingTable />, { wrapper });

    await waitFor(() => {
      expect(getByRole('heading', { name: 'Pro' })).toBeVisible();
      // Button text from Plans.buttonPropsForPlan via freeTrialOr
      expect(getByText('Start 14-day free trial')).toBeVisible();
    });
  });

  it('shows CTA "Start N-day free trial" when user is signed out and plan has trial', async () => {
    const { wrapper, fixtures, props } = await createFixtures();

    // Provide empty props to the PricingTable context
    props.setProps({});

    fixtures.clerk.billing.getPlans.mockResolvedValue({ data: [trialPlan as any], total_count: 1 });
    // When signed out, getSubscription should throw or return empty response
    fixtures.clerk.billing.getSubscription.mockRejectedValue(new Error('Unauthenticated'));

    const { getByRole, getByText } = render(<PricingTable />, { wrapper });

    await waitFor(() => {
      expect(getByRole('heading', { name: 'Pro' })).toBeVisible();
      // Signed out users should see free trial CTA when plan has trial enabled
      expect(getByText('Start 14-day free trial')).toBeVisible();
    });
  });

  it('shows CTA "Subscribe" when user is signed out and plan has no trial', async () => {
    const { wrapper, fixtures, props } = await createFixtures();

    const nonTrialPlan = {
      ...trialPlan,
      id: 'plan_no_trial',
      name: 'Basic',
      freeTrialEnabled: false,
      freeTrialDays: 0,
    };

    // Provide empty props to the PricingTable context
    props.setProps({});

    fixtures.clerk.billing.getPlans.mockResolvedValue({ data: [nonTrialPlan as any], total_count: 1 });
    // When signed out, getSubscription should throw or return empty response
    fixtures.clerk.billing.getSubscription.mockRejectedValue(new Error('Unauthenticated'));

    const { getByRole, getByText } = render(<PricingTable />, { wrapper });

    await waitFor(() => {
      expect(getByRole('heading', { name: 'Basic' })).toBeVisible();
      // Signed out users should see regular "Subscribe" for non-trial plans
      expect(getByText('Subscribe')).toBeVisible();
    });
  });
});
