import type { BillingPlanResource } from '@clerk/shared/types';
import { describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render } from '@/test/utils';

import { PricingTable } from '..';

const { createFixtures } = bindCreateFixtures('PricingTable');
const money = (amount: number) => ({
  amount,
  amountFormatted: (amount / 100).toFixed(2),
  currencySymbol: '$',
  currency: 'USD',
});

const createPlan = () =>
  ({
    id: 'plan_current',
    name: 'Current plan',
    slug: 'current',
    description: 'Current plan description',
    fee: money(2000),
    annualFee: money(20000),
    annualMonthlyFee: money(1667),
    hasBaseFee: true,
    isRecurring: true,
    isDefault: false,
    forPayerType: 'user',
    publiclyVisible: true,
    avatarUrl: '',
    features: [],
    freeTrialEnabled: false,
    freeTrialDays: 0,
    unitPrices: [],
    __internal_toSnapshot: vi.fn(),
    pathRoot: '',
    reload: vi.fn(),
  }) as unknown as BillingPlanResource;

async function setup(plan: BillingPlanResource, matrix = false) {
  const { wrapper, fixtures, props } = await createFixtures(f => f.withBilling());
  props.setProps({});
  fixtures.clerk.billing.getPlans.mockResolvedValue({ data: [plan], total_count: 1 });
  return { ...render(matrix ? <PricingTable {...{ layout: 'matrix' }} /> : <PricingTable />, { wrapper }), fixtures };
}

describe('Pricing card data boundaries', () => {
  it('updates the displayed fee when the same resource changes', async () => {
    const plan = createPlan();
    const { findByText, getByText, queryByText, rerender } = await setup(plan);
    await findByText('$16.67');
    Object.assign(plan.annualMonthlyFee!, money(2500));
    rerender(<PricingTable />);
    expect(getByText('$25')).toBeVisible();
    expect(queryByText('$16.67')).not.toBeInTheDocument();
  });

  it('updates seat capacity and per-seat cost when existing tiers change', async () => {
    const plan = createPlan();
    plan.unitPrices = [
      {
        name: 'seats',
        blockSize: 1,
        tiers: [{ id: 'tier_seats', startsAtBlock: 1, feePerBlock: money(500), endsAfterBlock: 10 }],
      },
    ];
    const { findByText, getByText, queryByText, rerender } = await setup(plan);
    await findByText(/Up to 10 seats/i);
    plan.unitPrices[0].tiers[0].endsAfterBlock = 20;
    Object.assign(plan.unitPrices[0].tiers[0].feePerBlock, money(700));
    rerender(<PricingTable />);
    expect(getByText(/Up to 20 seats/i)).toBeVisible();
    expect(getByText(/\$7.*seat/i)).toBeVisible();
    expect(queryByText(/Up to 10 seats/i)).not.toBeInTheDocument();
  });

  it('updates unit-only pricing when the existing fee changes', async () => {
    const plan = createPlan();
    plan.hasBaseFee = false;
    plan.unitPrices = [
      {
        name: 'seats',
        blockSize: 1,
        tiers: [{ id: 'tier_seats', startsAtBlock: 1, feePerBlock: money(500), endsAfterBlock: null }],
      },
    ];
    const { findByText, getByText, queryByText, rerender } = await setup(plan);
    await findByText('$5');
    Object.assign(plan.unitPrices[0].tiers[0].feePerBlock, money(800));
    rerender(<PricingTable />);
    expect(getByText('$8')).toBeVisible();
    expect(queryByText('$5')).not.toBeInTheDocument();
  });

  it('keeps details actions in the model and opens the displayed plan', async () => {
    const plan = createPlan();
    plan.features = Array.from({ length: 9 }, (_, index) => ({
      id: `feature_${index}`,
      slug: `feature-${index}`,
      name: `Feature ${index}`,
      description: null,
      avatarUrl: null,
      pathRoot: '',
      reload: vi.fn(),
      __internal_toSnapshot: vi.fn(),
    }));
    const { findByRole, userEvent, fixtures } = await setup(plan);
    await userEvent.click(await findByRole('button', { name: /See all features/i }));
    expect(fixtures.clerk.__internal_openPlanDetails).toHaveBeenCalledWith(
      expect.objectContaining({ plan, initialPlanPeriod: 'annual' }),
    );
  });
});

describe('Pricing matrix data boundaries', () => {
  it('updates feature rows when the existing plan feature changes', async () => {
    const plan = createPlan();
    plan.features = [
      {
        id: 'feature_1',
        slug: 'first',
        name: 'First feature',
        description: null,
        avatarUrl: null,
        pathRoot: '',
        reload: vi.fn(),
        __internal_toSnapshot: vi.fn(),
      },
    ];
    const { findByRole, getByRole, queryByRole, rerender } = await setup(plan, true);
    await findByRole('cell', { name: 'First feature' });
    plan.features[0].name = 'Updated feature';
    rerender(<PricingTable {...{ layout: 'matrix' }} />);
    expect(getByRole('cell', { name: 'Updated feature' })).toBeVisible();
    expect(queryByRole('cell', { name: 'First feature' })).not.toBeInTheDocument();
  });

  it('adds accessible cycle controls when the same plan gains annual pricing', async () => {
    const plan = createPlan();
    plan.annualMonthlyFee = null;
    const { findByRole, getByRole, queryByRole, rerender, userEvent, getByText } = await setup(plan, true);
    await findByRole('heading', { name: plan.name });
    expect(queryByRole('radiogroup', { name: 'Billing cycle' })).not.toBeInTheDocument();
    plan.annualMonthlyFee = money(1667);
    rerender(<PricingTable {...{ layout: 'matrix' }} />);
    expect(getByRole('radiogroup', { name: 'Billing cycle' })).toBeVisible();
    await userEvent.click(getByRole('radio', { name: 'Monthly' }));
    expect(getByText('$20.00')).toBeVisible();
    await userEvent.click(getByRole('radio', { name: 'Annually' }));
    expect(getByText('$16.67')).toBeVisible();
  });
});

for (const matrix of [false, true]) {
  describe(`${matrix ? 'matrix' : 'card'} selection identity`, () => {
    it('does not select a resource whose ID changed after rendering', async () => {
      const plan = createPlan();
      const { findByRole, userEvent, fixtures } = await setup(plan, matrix);
      const button = await findByRole('button', { name: 'Subscribe' });
      plan.id = 'plan_other';
      await userEvent.click(button);
      expect(fixtures.clerk.redirectToSignIn).not.toHaveBeenCalled();
      expect(fixtures.clerk.__internal_openCheckout).not.toHaveBeenCalled();
    });

    it('keeps the sign-in action for the displayed plan', async () => {
      const { findByRole, userEvent, fixtures } = await setup(createPlan(), matrix);
      await userEvent.click(await findByRole('button', { name: 'Subscribe' }));
      expect(fixtures.clerk.redirectToSignIn).toHaveBeenCalledOnce();
    });
  });
}
