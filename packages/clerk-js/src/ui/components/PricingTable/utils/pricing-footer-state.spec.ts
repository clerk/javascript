import type {
  BillingPlanResource,
  BillingSubscriptionItemResource,
  BillingSubscriptionPlanPeriod,
} from '@clerk/shared/types';
import { describe, expect, it } from 'vitest';

import { getPricingFooterState } from './pricing-footer-state';

const basePlan: BillingPlanResource = {
  id: 'plan_1',
  name: 'Pro',
  fee: { amount: 1000, amountFormatted: '10.00', currency: 'USD', currencySymbol: '$' },
  annualFee: { amount: 10000, amountFormatted: '100.00', currency: 'USD', currencySymbol: '$' },
  annualMonthlyFee: { amount: 833, amountFormatted: '8.33', currency: 'USD', currencySymbol: '$' },
  description: 'desc',
  isDefault: false,
  isRecurring: true,
  hasBaseFee: true,
  forPayerType: 'user',
  publiclyVisible: true,
  slug: 'pro',
  avatarUrl: '',
  features: [],
  freeTrialDays: 14,
  freeTrialEnabled: true,
  pathRoot: '',
  reload: async () => undefined as any,
};

const makeSub = (overrides: Partial<BillingSubscriptionItemResource>): BillingSubscriptionItemResource => ({
  id: 'si_1',
  plan: basePlan,
  planPeriod: 'month',
  status: 'active',
  createdAt: new Date('2021-01-01'),
  pastDueAt: null,
  periodStart: new Date('2021-01-01'),
  periodEnd: new Date('2021-01-31'),
  canceledAt: null,
  isFreeTrial: false,
  cancel: async () => undefined as any,
  pathRoot: '',
  reload: async () => undefined as any,
  ...overrides,
});

const run = (args: {
  subscription?: BillingSubscriptionItemResource;
  plan?: BillingPlanResource;
  planPeriod?: BillingSubscriptionPlanPeriod;
  for?: 'user' | 'organization';
  hasActiveOrganization?: boolean;
}) =>
  getPricingFooterState({
    subscription: args.subscription,
    plan: args.plan ?? basePlan,
    planPeriod: args.planPeriod ?? 'month',
    for: args.for,
    hasActiveOrganization: args.hasActiveOrganization ?? false,
  });

describe('usePricingFooterState', () => {
  it('hides footer when org plans and no active org', () => {
    const res = run({ subscription: undefined, for: 'organization', hasActiveOrganization: false });
    expect(res).toEqual({ shouldShowFooter: false, shouldShowFooterNotice: false });
  });

  it('shows footer when no subscription and user plans', () => {
    const res = run({ subscription: undefined, for: 'user' });
    expect(res).toEqual({ shouldShowFooter: true, shouldShowFooterNotice: false });
  });

  it('shows notice when subscription is upcoming', () => {
    const res = run({ subscription: makeSub({ status: 'upcoming' }) });
    expect(res).toEqual({ shouldShowFooter: true, shouldShowFooterNotice: true });
  });

  it('shows footer when active but canceled', () => {
    const res = run({ subscription: makeSub({ status: 'active', canceledAt: new Date('2021-02-01') }) });
    expect(res).toEqual({ shouldShowFooter: true, shouldShowFooterNotice: false });
  });

  it('shows footer when switching period to paid annual', () => {
    const res = run({
      subscription: makeSub({ status: 'active', planPeriod: 'month' }),
      planPeriod: 'annual',
      plan: basePlan,
    });
    expect(res).toEqual({ shouldShowFooter: true, shouldShowFooterNotice: false });
  });

  it('shows notice when active free trial', () => {
    const res = run({ subscription: makeSub({ status: 'active', isFreeTrial: true }) });
    expect(res).toEqual({ shouldShowFooter: true, shouldShowFooterNotice: true });
  });

  it('hides footer when active and matching period without trial', () => {
    const res = run({ subscription: makeSub({ status: 'active', planPeriod: 'month', isFreeTrial: false }) });
    expect(res).toEqual({ shouldShowFooter: false, shouldShowFooterNotice: false });
  });

  it('shows footer when switching period to paid monthly', () => {
    const res = run({
      subscription: makeSub({ status: 'active', planPeriod: 'annual' }),
      planPeriod: 'month',
      plan: basePlan,
    });
    expect(res).toEqual({ shouldShowFooter: true, shouldShowFooterNotice: false });
  });

  it('does not show footer when switching period if annualMonthlyFee is 0', () => {
    const freeAnnualPlan: BillingPlanResource = {
      ...basePlan,
      annualMonthlyFee: { ...basePlan.annualMonthlyFee, amount: 0, amountFormatted: '0.00' },
    };
    const res = run({
      subscription: makeSub({ status: 'active', planPeriod: 'month' }),
      planPeriod: 'annual',
      plan: freeAnnualPlan,
    });
    expect(res).toEqual({ shouldShowFooter: false, shouldShowFooterNotice: false });
  });

  it('hides footer when subscription is past_due', () => {
    const res = run({ subscription: makeSub({ status: 'past_due' }) });
    expect(res).toEqual({ shouldShowFooter: false, shouldShowFooterNotice: false });
  });
});
