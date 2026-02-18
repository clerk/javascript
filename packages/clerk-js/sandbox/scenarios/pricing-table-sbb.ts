import {
  clerkHandlers,
  http,
  HttpResponse,
  EnvironmentService,
  SessionService,
  setClerkState,
  type MockScenario,
  UserService,
} from '@clerk/msw';
import type { BillingPlanJSON } from '@clerk/shared/types';

export function PricingTableSBB(): MockScenario {
  const user = UserService.create();
  const session = SessionService.create(user);
  const money = (amount: number) => ({
    amount,
    amount_formatted: (amount / 100).toFixed(2),
    currency: 'USD',
    currency_symbol: '$',
  });
  const mockFeatures = [
    {
      object: 'feature' as const,
      id: 'feature_custom_domains',
      name: 'Custom domains',
      description: 'Connect and manage branded domains.',
      slug: 'custom-domains',
      avatar_url: null,
    },
    {
      object: 'feature' as const,
      id: 'feature_saml_sso',
      name: 'SAML SSO',
      description: 'Single sign-on with enterprise identity providers.',
      slug: 'saml-sso',
      avatar_url: null,
    },
    {
      object: 'feature' as const,
      id: 'feature_audit_logs',
      name: 'Audit logs',
      description: 'Track account activity and security events.',
      slug: 'audit-logs',
      avatar_url: null,
    },
    {
      object: 'feature' as const,
      id: 'feature_priority_support',
      name: 'Priority support',
      description: 'Faster response times from the support team.',
      slug: 'priority-support',
      avatar_url: null,
    },
    {
      object: 'feature' as const,
      id: 'feature_rate_limit_boost',
      name: 'Rate limit boost',
      description: 'Higher API request thresholds for production traffic.',
      slug: 'rate-limit-boost',
      avatar_url: null,
    },
  ];

  setClerkState({
    environment: EnvironmentService.MULTI_SESSION,
    session,
    user,
  });

  const subscriptionHandler = http.get('https://*.clerk.accounts.dev/v1/me/billing/subscription', () => {
    return HttpResponse.json({
      response: {
        data: {},
      },
    });
  });

  const paymentMethodsHandler = http.get('https://*.clerk.accounts.dev/v1/me/billing/payment_methods', () => {
    return HttpResponse.json({
      response: {
        data: {},
      },
    });
  });

  const plansHandler = http.get('https://*.clerk.accounts.dev/v1/billing/plans', () => {
    return HttpResponse.json({
      data: [
        {
          object: 'commerce_plan',
          id: 'plan_a_sbb',
          name: 'Plan A',
          fee: money(12989),
          annual_fee: null,
          annual_monthly_fee: null,
          description: null,
          is_default: false,
          is_recurring: true,
          has_base_fee: true,
          for_payer_type: 'org',
          publicly_visible: true,
          slug: 'plan-a-sbb',
          avatar_url: null,
          features: mockFeatures,
          free_trial_enabled: false,
          free_trial_days: null,
          unit_prices: [
            {
              name: 'seat',
              block_size: 1,
              tiers: [
                {
                  id: 'tier_plan_a_seats_1',
                  object: 'commerce_unit_price',
                  starts_at_block: 1,
                  ends_after_block: 5,
                  fee_per_block: money(0),
                },
              ],
            },
          ],
        },
        {
          object: 'commerce_plan',
          id: 'plan_b_sbb',
          name: 'Plan B',
          fee: money(12989),
          annual_fee: null,
          annual_monthly_fee: null,
          description: null,
          is_default: false,
          is_recurring: true,
          has_base_fee: true,
          for_payer_type: 'org',
          publicly_visible: true,
          slug: 'plan-b-sbb',
          avatar_url: null,
          features: mockFeatures,
          free_trial_enabled: false,
          free_trial_days: null,
          unit_prices: [
            {
              name: 'seat',
              block_size: 1,
              tiers: [
                {
                  id: 'tier_plan_b_seats_1',
                  object: 'commerce_unit_price',
                  starts_at_block: 1,
                  ends_after_block: null,
                  fee_per_block: money(1200),
                },
              ],
            },
          ],
        },
        {
          object: 'commerce_plan',
          id: 'plan_c_sbb',
          name: 'Plan C',
          fee: money(0),
          annual_fee: null,
          annual_monthly_fee: null,
          description: null,
          is_default: false,
          is_recurring: true,
          has_base_fee: false,
          for_payer_type: 'org',
          publicly_visible: true,
          slug: 'plan-c-sbb',
          avatar_url: null,
          features: mockFeatures,
          free_trial_enabled: false,
          free_trial_days: null,
          unit_prices: [
            {
              name: 'seat',
              block_size: 1,
              tiers: [
                {
                  id: 'tier_plan_c_seats_1',
                  object: 'commerce_unit_price',
                  starts_at_block: 1,
                  ends_after_block: null,
                  fee_per_block: money(1200),
                },
              ],
            },
          ],
        },
        {
          object: 'commerce_plan',
          id: 'plan_d_sbb',
          name: 'Plan D',
          fee: money(12989),
          annual_fee: null,
          annual_monthly_fee: null,
          description: null,
          is_default: false,
          is_recurring: true,
          has_base_fee: true,
          for_payer_type: 'org',
          publicly_visible: true,
          slug: 'plan-d-sbb',
          avatar_url: null,
          features: mockFeatures,
          free_trial_enabled: false,
          free_trial_days: null,
          unit_prices: [
            {
              name: 'seat',
              block_size: 1,
              tiers: [
                {
                  id: 'tier_plan_d_seats_1',
                  object: 'commerce_unit_price',
                  starts_at_block: 1,
                  ends_after_block: 5,
                  fee_per_block: money(0),
                },
                {
                  id: 'tier_plan_d_seats_2',
                  object: 'commerce_unit_price',
                  starts_at_block: 6,
                  ends_after_block: null,
                  fee_per_block: money(1200),
                },
              ],
            },
          ],
        },
        {
          object: 'commerce_plan',
          id: 'plan_e_sbb',
          name: 'Plan E',
          fee: money(12989),
          annual_fee: null,
          annual_monthly_fee: null,
          description: null,
          is_default: false,
          is_recurring: true,
          has_base_fee: true,
          for_payer_type: 'org',
          publicly_visible: true,
          slug: 'plan-e-sbb',
          avatar_url: null,
          features: mockFeatures,
          free_trial_enabled: false,
          free_trial_days: null,
        },
        {
          object: 'commerce_plan',
          id: 'plan_f_sbb',
          name: 'Plan F',
          fee: money(0),
          annual_fee: null,
          annual_monthly_fee: null,
          description: null,
          is_default: true,
          is_recurring: true,
          has_base_fee: false,
          for_payer_type: 'org',
          publicly_visible: true,
          slug: 'plan-f-sbb',
          avatar_url: null,
          features: mockFeatures,
          free_trial_enabled: false,
          free_trial_days: null,
          unit_prices: [
            {
              name: 'seat',
              block_size: 1,
              tiers: [
                {
                  id: 'tier_plan_f_seats_1',
                  object: 'commerce_unit_price',
                  starts_at_block: 1,
                  ends_after_block: 5,
                  fee_per_block: money(0),
                },
                {
                  id: 'tier_plan_f_seats_2',
                  object: 'commerce_unit_price',
                  starts_at_block: 6,
                  ends_after_block: null,
                  fee_per_block: money(1200),
                },
              ],
            },
          ],
        },
        {
          object: 'commerce_plan',
          id: 'plan_g_sbb',
          name: 'Plan G',
          fee: money(0),
          annual_fee: null,
          annual_monthly_fee: null,
          description: null,
          is_default: false,
          is_recurring: true,
          has_base_fee: false,
          for_payer_type: 'org',
          publicly_visible: true,
          slug: 'plan-g-sbb',
          avatar_url: null,
          features: mockFeatures,
          free_trial_enabled: false,
          free_trial_days: null,
          unit_prices: [
            {
              name: 'seat',
              block_size: 1,
              tiers: [
                {
                  id: 'tier_plan_g_seats_1',
                  object: 'commerce_unit_price',
                  starts_at_block: 1,
                  ends_after_block: null,
                  fee_per_block: money(0),
                },
              ],
            },
          ],
        },
      ] as BillingPlanJSON[],
    });
  });

  return {
    description: 'PricingTable with seat-based billing plans',
    handlers: [plansHandler, subscriptionHandler, paymentMethodsHandler, ...clerkHandlers],
    initialState: { session, user },
    name: 'pricing-table-sbb',
  };
}
