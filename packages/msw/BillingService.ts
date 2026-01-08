import type {
  BillingPaymentSourceJSON,
  BillingPlanJSON,
  BillingSubscriptionJSON,
  SessionResource,
  UserResource,
} from '@clerk/shared/types';

type AuthCheckResult<T> = { authorized: true; data: T } | { authorized: false; error: string; status: number };

export class BillingService {
  private static createPaymentSources(): BillingPaymentSourceJSON[] {
    return [
      {
        card_type: 'visa',
        id: 'card_mock_4242',
        is_default: true,
        is_removable: true,
        last4: '4242',
        object: 'commerce_payment_method',
        payment_method: 'card',
        payment_type: 'card',
        status: 'active',
        wallet_type: null,
      } as any,
    ];
  }

  private static createPlans(): BillingPlanJSON[] {
    return [
      {
        amount: 999,
        amount_formatted: '9.99',
        annual_amount: 9900,
        annual_amount_formatted: '99.00',
        annual_fee: { amount: 9900, amount_formatted: '99.00', currency: 'usd', currency_symbol: '$' },
        annual_monthly_amount: 825,
        annual_monthly_amount_formatted: '8.25',
        annual_monthly_fee: { amount: 825, amount_formatted: '8.25', currency: 'usd', currency_symbol: '$' },
        avatar_url: '',
        currency: 'usd',
        currency_symbol: '$',
        description: 'Basic plan with essential features',
        features: [
          {
            avatar_url: '',
            description: 'Feature 1',
            id: 'feat_1',
            name: 'Feature 1',
            object: 'feature',
            slug: 'feature-1',
          },
          {
            avatar_url: '',
            description: 'Feature 2',
            id: 'feat_2',
            name: 'Feature 2',
            object: 'feature',
            slug: 'feature-2',
          },
          {
            avatar_url: '',
            description: 'Feature 3',
            id: 'feat_3',
            name: 'Feature 3',
            object: 'feature',
            slug: 'feature-3',
          },
        ],
        fee: { amount: 999, amount_formatted: '9.99', currency: 'usd', currency_symbol: '$' },
        for_payer_type: 'user',
        free_trial_days: 14,
        free_trial_enabled: true,
        has_base_fee: true,
        id: 'plan_basic_monthly',
        is_default: false,
        is_recurring: true,
        name: 'Basic',
        object: 'commerce_plan',
        publicly_visible: true,
        slug: 'basic',
      },
    ];
  }

  private static createSubscription(): BillingSubscriptionJSON {
    const now = Date.now();
    const thirtyDaysFromNow = now + 30 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    return {
      active_at: thirtyDaysAgo,
      created_at: thirtyDaysAgo,
      eligible_for_free_trial: false,
      id: 'sub_mock_active',
      next_payment: {
        amount: {
          amount: 999,
          amount_formatted: '9.99',
          currency: 'usd',
          currency_symbol: '$',
        },
        date: thirtyDaysFromNow,
      } as any,
      object: 'commerce_subscription',
      past_due_at: null,
      status: 'active',
      subscription_items: [
        {
          amount: {
            amount: 999,
            amount_formatted: '9.99',
            currency: 'usd',
            currency_symbol: '$',
          },
          canceled_at: null,
          created_at: thirtyDaysAgo,
          id: 'subi_mock_basic',
          is_free_trial: false,
          object: 'commerce_subscription_item',
          past_due_at: null,
          payment_method_id: 'card_mock_4242',
          period_end: thirtyDaysFromNow,
          period_start: thirtyDaysAgo,
          plan: this.createPlans()[0],
          plan_period: 'month',
          status: 'active',
          upcoming_at: null,
          updated_at: now,
        },
      ] as any,
      updated_at: now,
    };
  }

  private static createEligibleSubscription(): BillingSubscriptionJSON {
    const now = Date.now();

    return {
      active_at: null,
      created_at: now,
      eligible_for_free_trial: true,
      id: 'sub_mock_eligible',
      next_payment: null,
      object: 'commerce_subscription',
      past_due_at: null,
      status: 'inactive',
      subscription_items: [],
      updated_at: now,
    } as unknown as BillingSubscriptionJSON;
  }

  private static createFreeTrialSubscription(): BillingSubscriptionJSON {
    const now = Date.now();
    const fourteenDaysFromNow = now + 14 * 24 * 60 * 60 * 1000;

    return {
      active_at: now,
      created_at: now,
      eligible_for_free_trial: false,
      id: 'sub_mock_trial',
      next_payment: {
        amount: {
          amount: 999,
          amount_formatted: '9.99',
          currency: 'usd',
          currency_symbol: '$',
        },
        date: fourteenDaysFromNow,
      },
      object: 'commerce_subscription',
      past_due_at: null,
      status: 'trialing',
      subscription_items: [
        {
          amount: {
            amount: 0,
            amount_formatted: '0.00',
            currency: 'usd',
            currency_symbol: '$',
          },
          canceled_at: null,
          created_at: now,
          id: 'subi_mock_trial_basic',
          is_free_trial: true,
          object: 'commerce_subscription_item',
          past_due_at: null,
          payment_method_id: null,
          period_end: fourteenDaysFromNow,
          period_start: now,
          plan: this.createPlans()[0],
          plan_period: 'trial',
          status: 'trialing',
          upcoming_at: fourteenDaysFromNow,
          updated_at: now,
        },
      ],
      updated_at: now,
    } as unknown as BillingSubscriptionJSON;
  }

  static getPaymentSources(
    session: SessionResource | null,
    user: UserResource | null,
  ): AuthCheckResult<{
    data: BillingPaymentSourceJSON[];
    response: { data: BillingPaymentSourceJSON[]; total_count: number };
    total_count: number;
  }> {
    if (!session || !user) {
      return { authorized: false, error: 'No active session', status: 401 };
    }

    const paymentSources = this.createPaymentSources();

    return {
      authorized: true,
      data: {
        data: paymentSources,
        response: {
          data: paymentSources,
          total_count: paymentSources.length,
        },
        total_count: paymentSources.length,
      },
    };
  }

  static initializePaymentSource(
    session: SessionResource | null,
    user: UserResource | null,
  ): AuthCheckResult<{ response: { client_secret: string; object: string; status: string } }> {
    if (!session || !user) {
      return { authorized: false, error: 'No active session', status: 401 };
    }

    return {
      authorized: true,
      data: {
        response: {
          client_secret: 'mock_client_secret_' + Math.random().toString(36).substring(2, 15),
          object: 'payment_intent',
          status: 'requires_payment_method',
        },
      },
    };
  }

  static createPaymentSource(
    session: SessionResource | null,
    user: UserResource | null,
  ): AuthCheckResult<{ response: BillingPaymentSourceJSON }> {
    if (!session || !user) {
      return { authorized: false, error: 'No active session', status: 401 };
    }

    return {
      authorized: true,
      data: {
        response: {
          card_type: 'visa',
          id: 'card_mock_' + Math.random().toString(36).substring(2, 9),
          is_default: false,
          is_removable: true,
          last4: '4242',
          object: 'commerce_payment_source',
          payment_method: 'card',
          payment_type: 'card',
          status: 'active',
          wallet_type: null,
        } as any,
      },
    };
  }

  static updatePaymentSource(
    session: SessionResource | null,
    user: UserResource | null,
  ): AuthCheckResult<{ response: { success: boolean } }> {
    if (!session || !user) {
      return { authorized: false, error: 'No active session', status: 401 };
    }

    return {
      authorized: true,
      data: {
        response: {
          success: true,
        },
      },
    };
  }

  static deletePaymentSource(
    session: SessionResource | null,
    user: UserResource | null,
  ): AuthCheckResult<{ response: { deleted: boolean; id: string; object: string } }> {
    if (!session || !user) {
      return { authorized: false, error: 'No active session', status: 401 };
    }

    return {
      authorized: true,
      data: {
        response: {
          deleted: true,
          id: 'card_mock_deleted',
          object: 'commerce_payment_source',
        },
      },
    };
  }

  static getPlans() {
    const plans = this.createPlans();

    return {
      data: plans,
      response: {
        data: plans,
        total_count: plans.length,
      },
      total_count: plans.length,
    };
  }

  static getStatements() {
    return {
      data: [],
      total_count: 0,
    };
  }

  static getSubscription(
    session: SessionResource | null,
    user: UserResource | null,
    subscriptionOverride?: BillingSubscriptionJSON | null,
  ): AuthCheckResult<{ response: BillingSubscriptionJSON }> {
    if (!session || !user) {
      return { authorized: false, error: 'No active session', status: 401 };
    }

    const subscription = subscriptionOverride ?? this.createEligibleSubscription();

    return {
      authorized: true,
      data: {
        response: subscription,
      },
    };
  }

  static getSubscriptions() {
    return {
      data: [],
      total_count: 0,
    };
  }

  static startFreeTrial(
    session: SessionResource | null,
    user: UserResource | null,
  ): AuthCheckResult<{ response: BillingSubscriptionJSON }> {
    if (!session || !user) {
      return { authorized: false, error: 'No active session', status: 401 };
    }

    const subscription = this.createFreeTrialSubscription();

    return {
      authorized: true,
      data: {
        response: subscription,
      },
    };
  }
}
