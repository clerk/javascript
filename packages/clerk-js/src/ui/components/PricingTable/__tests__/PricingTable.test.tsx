import { createDeferredPromise } from '@clerk/shared/utils/index';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, waitFor } from '@/test/utils';

import { PricingTable } from '..';

const { createFixtures } = bindCreateFixtures('PricingTable');

describe('PricingTable - trial info', () => {
  const trialPlan = {
    id: 'plan_trial',
    name: 'Pro',
    fee: {
      amount: 2000,
      amountFormatted: '20.00',
      currencySymbol: '$',
      currency: 'USD',
    },
    annualFee: {
      amount: 20000,
      amountFormatted: '200.00',
      currencySymbol: '$',
      currency: 'USD',
    },
    annualMonthlyFee: {
      amount: 1667,
      amountFormatted: '16.67',
      currencySymbol: '$',
      currency: 'USD',
    },
    description: 'Pro plan with trial',
    hasBaseFee: true,
    isRecurring: true,
    isDefault: false,
    forPayerType: 'user',
    publiclyVisible: true,
    slug: 'pro',
    avatarUrl: '',
    features: [] as any[],
    freeTrialEnabled: true,
    freeTrialDays: 14,
    __internal_toSnapshot: vi.fn(),
    pathRoot: '',
    reload: vi.fn(),
  } as const;

  it('shows footer notice with trial end date when active subscription is in free trial', async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withBilling();
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });

    // Provide empty props to the PricingTable context
    props.setProps({});

    fixtures.clerk.billing.getStatements.mockRejectedValue();
    fixtures.clerk.user.getPaymentMethods.mockRejectedValue();
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
          pastDueAt: null,
          canceledAt: null,
          periodStart: new Date('2021-01-01'),
          periodEnd: new Date('2021-01-15'),
          planPeriod: 'month' as const,
          status: 'active' as const,
          isFreeTrial: true,
          cancel: vi.fn(),
          pathRoot: '',
          reload: vi.fn(),
        },
      ],
      pathRoot: '',
      reload: vi.fn(),
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
      // Ensure API args: user flow
      expect(fixtures.clerk.billing.getPlans).toHaveBeenCalledWith(expect.objectContaining({ for: 'user' }));
      expect(fixtures.clerk.billing.getSubscription).toHaveBeenCalledWith(
        expect.objectContaining({ orgId: undefined }),
      );
    });
  });

  it('shows CTA "Start N-day free trial" when eligible and plan has trial', async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
      f.withBilling();
    });

    // Provide empty props to the PricingTable context
    props.setProps({});

    fixtures.clerk.billing.getStatements.mockRejectedValue();
    fixtures.clerk.user.getPaymentMethods.mockRejectedValue();
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
      reload: vi.fn(),
    });

    const { getByRole, getByText } = render(<PricingTable />, { wrapper });

    await waitFor(() => {
      expect(getByRole('heading', { name: 'Pro' })).toBeVisible();
      // Button text from Plans.buttonPropsForPlan via freeTrialOr
      expect(getByText('Start 14-day free trial')).toBeVisible();
      // Ensure API args: user flow
      expect(fixtures.clerk.billing.getPlans).toHaveBeenCalledWith(expect.objectContaining({ for: 'user' }));
      expect(fixtures.clerk.billing.getSubscription).toHaveBeenCalledWith(
        expect.objectContaining({ orgId: undefined }),
      );
    });
  });

  it('shows CTA "Start N-day free trial" when user is signed out and plan has trial', async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withBilling();
    });

    // Provide empty props to the PricingTable context
    props.setProps({});

    fixtures.clerk.billing.getStatements.mockRejectedValue();
    fixtures.clerk.billing.getPlans.mockResolvedValue({ data: [trialPlan as any], total_count: 1 });
    // When signed out, getSubscription should throw or return empty response
    fixtures.clerk.billing.getSubscription.mockRejectedValue(new Error('Unauthenticated'));

    const { getByRole, getByText } = render(<PricingTable />, { wrapper });

    await waitFor(() => {
      expect(getByRole('heading', { name: 'Pro' })).toBeVisible();
      // Signed out users should see free trial CTA when plan has trial enabled
      expect(getByText('Start 14-day free trial')).toBeVisible();
      // Ensure API args for signed-out flow: getPlans uses user context
      expect(fixtures.clerk.billing.getPlans).toHaveBeenCalledWith(expect.objectContaining({ for: 'user' }));
    });
  });

  it('shows CTA "Subscribe" when user is signed out and plan has no trial', async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withBilling();
    });

    const nonTrialPlan = {
      ...trialPlan,
      id: 'plan_no_trial',
      name: 'Basic',
      freeTrialEnabled: false,
      freeTrialDays: 0,
    };

    // Provide empty props to the PricingTable context
    props.setProps({});

    fixtures.clerk.billing.getStatements.mockRejectedValue();
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

  it('shows footer notice with "starts at" when subscription is upcoming and not a free trial', async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
      f.withBilling();
    });

    // Provide empty props to the PricingTable context
    props.setProps({});

    const nonTrialPlan = {
      ...trialPlan,
      freeTrialEnabled: false,
      freeTrialDays: 0,
    };

    fixtures.clerk.billing.getStatements.mockRejectedValue();
    fixtures.clerk.user.getPaymentMethods.mockRejectedValue();
    fixtures.clerk.billing.getPlans.mockResolvedValue({ data: [nonTrialPlan as any], total_count: 1 });
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
          plan: nonTrialPlan,
          createdAt: new Date('2021-01-01'),
          pastDueAt: null,
          canceledAt: null,
          periodStart: new Date('2021-02-01'),
          periodEnd: new Date('2021-02-15'),
          planPeriod: 'month' as const,
          status: 'upcoming' as const,
          isFreeTrial: false,
          cancel: vi.fn(),
          pathRoot: '',
          reload: vi.fn(),
        },
      ],
      pathRoot: '',
      reload: vi.fn(),
    });

    const { findByRole, getByText, userEvent } = render(<PricingTable />, { wrapper });

    // Wait for the plan to appear
    await findByRole('heading', { name: 'Pro' });

    // Default period is annual in mounted mode; switch to monthly to match the subscription
    const periodSwitch = await findByRole('switch', { name: /billed annually/i });
    await userEvent.click(periodSwitch);

    await waitFor(() => {
      // Non-trial upcoming subscription uses badge__startsAt localization
      expect(getByText('Starts Feb 1, 2021')).toBeVisible();
    });
  });
});

describe('PricingTable - plans visibility', () => {
  const testPlan = {
    id: 'plan_test',
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
      amount: 833,
      amountFormatted: '8.33',
      currencySymbol: '$',
      currency: 'USD',
    },
    description: 'Test plan description',
    hasBaseFee: true,
    isRecurring: true,
    isDefault: false,
    forPayerType: 'user',
    publiclyVisible: true,
    slug: 'test',
    avatarUrl: '',
    features: [] as any[],
    freeTrialEnabled: false,
    freeTrialDays: 0,
    __internal_toSnapshot: vi.fn(),
    pathRoot: '',
    reload: vi.fn(),
  } as const;

  it('shows no plans when user is signed in but has no subscription', async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
    });

    // Provide empty props to the PricingTable context
    props.setProps({});

    fixtures.clerk.billing.getStatements.mockRejectedValue();
    fixtures.clerk.user.getPaymentMethods.mockRejectedValue();
    fixtures.clerk.billing.getPlans.mockResolvedValue({ data: [testPlan as any], total_count: 1 });
    // Mock no subscription for signed-in user - empty subscription object
    fixtures.clerk.billing.getSubscription.mockResolvedValue({
      subscriptionItems: [],
      pathRoot: '',
      reload: vi.fn(),
    } as any);

    const { queryByRole } = render(<PricingTable />, { wrapper });

    await waitFor(() => {
      // Should not show any plans when signed in but no subscription
      expect(queryByRole('heading', { name: 'Test Plan' })).not.toBeInTheDocument();
    });
  });

  it('shows plans when user is signed in and has a subscription', async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
      f.withBilling();
    });

    // Provide empty props to the PricingTable context
    props.setProps({});

    fixtures.clerk.billing.getStatements.mockRejectedValue();
    fixtures.clerk.user.getPaymentMethods.mockRejectedValue();
    fixtures.clerk.billing.getPlans.mockResolvedValue({ data: [testPlan as any], total_count: 1 });
    // Mock active subscription for signed-in user
    fixtures.clerk.billing.getSubscription.mockResolvedValue({
      id: 'sub_active',
      status: 'active',
      activeAt: new Date('2021-01-01'),
      createdAt: new Date('2021-01-01'),
      nextPayment: null,
      pastDueAt: null,
      updatedAt: null,
      subscriptionItems: [
        {
          id: 'si_active',
          plan: testPlan,
          createdAt: new Date('2021-01-01'),
          pastDueAt: null,
          canceledAt: null,
          periodStart: new Date('2021-01-01'),
          periodEnd: new Date('2021-01-31'),
          planPeriod: 'month' as const,
          status: 'active' as const,
          isFreeTrial: false,
          cancel: vi.fn(),
          pathRoot: '',
          reload: vi.fn(),
        },
      ],
      pathRoot: '',
      reload: vi.fn(),
    });

    const { getByRole } = render(<PricingTable />, { wrapper });

    await waitFor(() => {
      // Should show plans when signed in and has subscription
      expect(getByRole('heading', { name: 'Test Plan' })).toBeVisible();
    });
  });

  it('shows plans when user is signed out', async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withBilling();
    });

    // Provide empty props to the PricingTable context
    props.setProps({});

    fixtures.clerk.billing.getStatements.mockRejectedValue();
    fixtures.clerk.billing.getPlans.mockResolvedValue({ data: [testPlan as any], total_count: 1 });
    // When signed out, getSubscription should throw or return empty response
    fixtures.clerk.billing.getSubscription.mockRejectedValue(new Error('Unauthenticated'));

    const { getByRole } = render(<PricingTable />, { wrapper });

    await waitFor(() => {
      // Should show plans when signed out
      expect(getByRole('heading', { name: 'Test Plan' })).toBeVisible();
    });
  });

  it('shows no plans when user is signed in but subscription is null', async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
      f.withBilling();
    });

    // Provide empty props to the PricingTable context
    props.setProps({});

    fixtures.clerk.billing.getStatements.mockRejectedValue();
    fixtures.clerk.user.getPaymentMethods.mockRejectedValue();
    fixtures.clerk.billing.getPlans.mockResolvedValue({ data: [testPlan as any], total_count: 1 });
    // Mock null subscription response (different from throwing error)
    fixtures.clerk.billing.getSubscription.mockResolvedValue(null as any);

    const { queryByRole } = render(<PricingTable />, { wrapper });

    await waitFor(() => {
      // Should not show any plans when signed in but subscription is null
      expect(queryByRole('heading', { name: 'Test Plan' })).not.toBeInTheDocument();
    });
  });

  it('shows no plans when user is signed in but subscription is undefined', async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
      f.withBilling();
    });

    // Provide empty props to the PricingTable context
    props.setProps({});

    fixtures.clerk.billing.getStatements.mockRejectedValue();
    fixtures.clerk.user.getPaymentMethods.mockRejectedValue();
    fixtures.clerk.billing.getPlans.mockResolvedValue({ data: [testPlan as any], total_count: 1 });
    const resolver = createDeferredPromise();

    // Mock undefined subscription response (loading state)
    fixtures.clerk.billing.getSubscription.mockResolvedValue(resolver.promise);
    const { queryByRole } = render(<PricingTable />, { wrapper });

    await waitFor(() => {
      // Should not show any plans when signed in but subscription is undefined (loading)
      expect(queryByRole('heading', { name: 'Test Plan' })).not.toBeInTheDocument();
    });
    resolver.resolve([]);
    await waitFor(() => {
      // Should not show any plans when signed in but subscription is undefined (loading)
      expect(queryByRole('heading', { name: 'Test Plan' })).toBeInTheDocument();
    });
  });

  it('prevents flicker by not showing plans while subscription is loading', async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
      f.withBilling();
    });

    // Provide empty props to the PricingTable context
    props.setProps({});

    fixtures.clerk.billing.getStatements.mockRejectedValue();
    fixtures.clerk.user.getPaymentMethods.mockRejectedValue();
    fixtures.clerk.billing.getPlans.mockResolvedValue({ data: [testPlan as any], total_count: 1 });

    // Create a pending promise and capture its resolver
    let resolveSubscription!: (value: any) => void;
    const pendingSubscriptionPromise = new Promise<any>(resolve => {
      resolveSubscription = resolve;
    });
    fixtures.clerk.billing.getSubscription.mockReturnValue(pendingSubscriptionPromise);

    const { queryByRole, findByRole } = render(<PricingTable />, { wrapper });

    // Assert no plans render while subscription is pending
    await waitFor(() => {
      expect(queryByRole('heading', { name: 'Test Plan' })).not.toBeInTheDocument();
    });

    // Resolve the subscription with an active subscription object
    resolveSubscription({
      id: 'sub_active',
      status: 'active',
      activeAt: new Date('2021-01-01'),
      createdAt: new Date('2021-01-01'),
      nextPayment: null,
      pastDueAt: null,
      updatedAt: null,
      subscriptionItems: [
        {
          id: 'si_active',
          plan: testPlan,
          createdAt: new Date('2021-01-01'),
          pastDueAt: null,
          canceledAt: null,
          periodStart: new Date('2021-01-01'),
          periodEnd: new Date('2021-01-31'),
          planPeriod: 'month' as const,
          status: 'active' as const,
          isFreeTrial: false,
          cancel: vi.fn(),
          pathRoot: '',
          reload: vi.fn(),
        },
      ],
      pathRoot: '',
      reload: vi.fn(),
    });

    // Assert the plan heading appears after subscription resolves
    await findByRole('heading', { name: 'Test Plan' });
  });

  it('fetches organization plans and renders when using legacy forOrganizations: true', async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withBilling();
      f.withOrganizations();
      f.withUser({ email_addresses: ['test@clerk.com'], organization_memberships: ['Org1'] });
    });

    // Set legacy prop via context provider
    props.setProps({ forOrganizations: true } as any);

    fixtures.clerk.billing.getStatements.mockRejectedValue();
    fixtures.clerk.organization.getPaymentMethods.mockRejectedValue();
    fixtures.clerk.billing.getPlans.mockResolvedValue({ data: [testPlan as any], total_count: 1 });
    fixtures.clerk.billing.getSubscription.mockResolvedValue({
      id: 'sub_org_active',
      status: 'active',
      activeAt: new Date('2021-01-01'),
      createdAt: new Date('2021-01-01'),
      nextPayment: null,
      pastDueAt: null,
      updatedAt: null,
      subscriptionItems: [
        {
          id: 'si_active_org',
          plan: { ...testPlan, forPayerType: 'organization' },
          createdAt: new Date('2021-01-01'),
          paymentMethodId: 'src_1',
          pastDueAt: null,
          canceledAt: null,
          periodStart: new Date('2021-01-01'),
          periodEnd: new Date('2021-01-31'),
          planPeriod: 'month' as const,
          status: 'active' as const,
          isFreeTrial: false,
          cancel: vi.fn(),
          pathRoot: '',
          reload: vi.fn(),
        },
      ],
      pathRoot: '',
      reload: vi.fn(),
    });

    const { getByRole } = render(<PricingTable />, { wrapper });

    await waitFor(() => {
      // Ensure plans rendered
      expect(getByRole('heading', { name: 'Test Plan' })).toBeVisible();
      // Ensure API args reflect org context
      expect(fixtures.clerk.billing.getPlans).toHaveBeenCalledWith(expect.objectContaining({ for: 'organization' }));
      // Ensure subscription called with active org
      expect(fixtures.clerk.billing.getSubscription).toHaveBeenCalledWith(expect.objectContaining({ orgId: 'Org1' }));
    });
  });

  it('fetches organization plans and renders when using for: organization', async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withBilling();
      f.withOrganizations();
      f.withUser({ email_addresses: ['test@clerk.com'], organization_memberships: ['Org1'] });
    });

    // Set new prop via context provider
    props.setProps({ for: 'organization' } as any);

    fixtures.clerk.billing.getStatements.mockRejectedValue();
    fixtures.clerk.organization.getPaymentMethods.mockRejectedValue();
    fixtures.clerk.billing.getPlans.mockResolvedValue({ data: [testPlan as any], total_count: 1 });
    fixtures.clerk.billing.getSubscription.mockResolvedValue({
      id: 'sub_org_active',
      status: 'active',
      activeAt: new Date('2021-01-01'),
      createdAt: new Date('2021-01-01'),
      nextPayment: null,
      pastDueAt: null,
      updatedAt: null,
      subscriptionItems: [
        {
          id: 'si_active_org',
          plan: { ...testPlan, forPayerType: 'organization' },
          createdAt: new Date('2021-01-01'),
          paymentMethodId: 'src_1',
          pastDueAt: null,
          canceledAt: null,
          periodStart: new Date('2021-01-01'),
          periodEnd: new Date('2021-01-31'),
          planPeriod: 'month' as const,
          status: 'active' as const,
          isFreeTrial: false,
          cancel: vi.fn(),
          pathRoot: '',
          reload: vi.fn(),
        },
      ],
      pathRoot: '',
      reload: vi.fn(),
    });

    const { getByRole } = render(<PricingTable />, { wrapper });

    await waitFor(() => {
      // Ensure plans rendered
      expect(getByRole('heading', { name: 'Test Plan' })).toBeVisible();
      // Ensure getPlans was called with organization filter
      expect(fixtures.clerk.billing.getPlans).toHaveBeenCalledWith(expect.objectContaining({ for: 'organization' }));
      // Ensure subscription called with active org
      expect(fixtures.clerk.billing.getSubscription).toHaveBeenCalledWith(expect.objectContaining({ orgId: 'Org1' }));
    });
  });

  it('fetches user plans and renders when using for: user', async () => {
    const { wrapper, fixtures, props } = await createFixtures(f => {
      f.withUser({ email_addresses: ['test@clerk.com'] });
      f.withBilling();
    });

    // Set new prop via context provider
    props.setProps({ for: 'user' } as any);

    fixtures.clerk.billing.getStatements.mockRejectedValue();
    fixtures.clerk.user.getPaymentMethods.mockRejectedValue();
    fixtures.clerk.billing.getPlans.mockResolvedValue({ data: [testPlan as any], total_count: 1 });
    fixtures.clerk.billing.getSubscription.mockResolvedValue({
      id: 'sub_active',
      status: 'active',
      activeAt: new Date('2021-01-01'),
      createdAt: new Date('2021-01-01'),
      nextPayment: null,
      pastDueAt: null,
      updatedAt: null,
      subscriptionItems: [
        {
          id: 'si_active',
          plan: testPlan,
          createdAt: new Date('2021-01-01'),
          paymentMethodId: 'src_1',
          pastDueAt: null,
          canceledAt: null,
          periodStart: new Date('2021-01-01'),
          periodEnd: new Date('2021-01-31'),
          planPeriod: 'month' as const,
          status: 'active' as const,
          isFreeTrial: false,
          cancel: vi.fn(),
          pathRoot: '',
          reload: vi.fn(),
        },
      ],
      pathRoot: '',
      reload: vi.fn(),
    });

    const { getByRole } = render(<PricingTable />, { wrapper });

    await waitFor(() => {
      // Should show plans when signed in and has subscription
      expect(getByRole('heading', { name: 'Test Plan' })).toBeVisible();
      // Ensure getPlans was called with user filter
      expect(fixtures.clerk.billing.getPlans).toHaveBeenCalledWith(expect.objectContaining({ for: 'user' }));
      // Ensure subscription call is for user (no org)
      expect(fixtures.clerk.billing.getSubscription).toHaveBeenCalledWith(
        expect.objectContaining({ orgId: undefined }),
      );
    });
  });
});
