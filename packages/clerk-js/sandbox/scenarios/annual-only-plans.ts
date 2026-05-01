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

export function AnnualOnlyPlans(): MockScenario {
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
          name: 'Monthly-only',
          fee: money(5000),
          annual_fee: null,
          annual_monthly_fee: null,
          description: null,
          is_default: false,
          is_recurring: true,
          has_base_fee: true,
          for_payer_type: 'user',
          publicly_visible: true,
          slug: 'plan-a-sbb',
          avatar_url: null,
          features: mockFeatures,
          free_trial_enabled: false,
          free_trial_days: null,
        },
        {
          object: 'commerce_plan',
          id: 'plan_b_sbb',
          name: 'Monthly & Annual',
          fee: money(5000),
          annual_fee: money(50000),
          annual_monthly_fee: money(4167),
          description: null,
          is_default: false,
          is_recurring: true,
          has_base_fee: true,
          for_payer_type: 'user',
          publicly_visible: true,
          slug: 'plan-b-sbb',
          avatar_url: null,
          features: mockFeatures,
          free_trial_enabled: false,
          free_trial_days: null,
        },
        {
          object: 'commerce_plan',
          id: 'plan_c_sbb',
          name: 'Annual-only',
          fee: null,
          annual_fee: money(50000),
          annual_monthly_fee: money(4167),
          description: null,
          is_default: false,
          is_recurring: true,
          has_base_fee: false,
          for_payer_type: 'user',
          publicly_visible: true,
          slug: 'plan-c-sbb',
          avatar_url: null,
          features: mockFeatures,
          free_trial_enabled: false,
          free_trial_days: null,
        },
      ] as BillingPlanJSON[],
    });
  });

  return {
    description: 'PricingTable with annual-only billing plans',
    handlers: [plansHandler, subscriptionHandler, paymentMethodsHandler, ...clerkHandlers],
    initialState: { session, user },
    name: 'annual-only-plans',
  };
}
