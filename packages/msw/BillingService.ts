import type {
  BillingCheckoutJSON,
  BillingCheckoutTotalsJSON,
  BillingInitializedPaymentMethodJSON,
  BillingMoneyAmountJSON,
  BillingPaymentJSON,
  BillingPaymentMethodJSON,
  BillingPayerJSON,
  BillingPlanJSON,
  BillingStatementJSON,
  BillingSubscriptionItemJSON,
  BillingSubscriptionJSON,
  BillingSubscriptionPlanPeriod,
  FeatureJSON,
} from '@clerk/shared/types';

type BillingCheckoutTotalsWithOptionalAccountCredit = BillingCheckoutTotalsJSON & {
  account_credit?: BillingMoneyAmountJSON | null;
};

type BillingInitializedPaymentMethodWithOptionalId = BillingInitializedPaymentMethodJSON & {
  id?: string;
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const DEFAULT_CURRENCY = 'usd';
const DEFAULT_CURRENCY_SYMBOL = '$';

export class BillingService {
  private static createId(prefix: string): string {
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
  }

  private static slugify(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private static createMoney(
    amount: number,
    currency: string = DEFAULT_CURRENCY,
    currencySymbol: string = DEFAULT_CURRENCY_SYMBOL,
  ): BillingMoneyAmountJSON {
    return {
      amount,
      amount_formatted: (amount / 100).toFixed(2),
      currency,
      currency_symbol: currencySymbol,
    };
  }

  private static createFeature(name: string, description: string, id: string): FeatureJSON {
    return {
      object: 'feature',
      id,
      name,
      description,
      slug: this.slugify(name),
      avatar_url: null,
    };
  }

  static createPlan(overrides: Partial<BillingPlanJSON> = {}): BillingPlanJSON {
    const name = overrides.name ?? 'Starter';
    const slug = overrides.slug ?? this.slugify(name);
    const fee = overrides.fee ?? this.createMoney(1200);
    const annualFee =
      overrides.annual_fee === undefined
        ? fee.amount > 0
          ? this.createMoney(Math.round(fee.amount * 10))
          : null
        : overrides.annual_fee;
    const annualMonthlyFee =
      overrides.annual_monthly_fee === undefined
        ? annualFee
          ? this.createMoney(Math.round(annualFee.amount / 12))
          : null
        : overrides.annual_monthly_fee;

    return {
      object: 'commerce_plan',
      id: overrides.id ?? `plan_${overrides.for_payer_type ?? 'user'}_${slug}`,
      name,
      fee,
      annual_fee: annualFee,
      annual_monthly_fee: annualMonthlyFee,
      description: overrides.description ?? `${name} plan`,
      is_default: overrides.is_default ?? false,
      is_recurring: overrides.is_recurring ?? fee.amount > 0,
      has_base_fee: overrides.has_base_fee ?? fee.amount > 0,
      for_payer_type: overrides.for_payer_type ?? 'user',
      publicly_visible: overrides.publicly_visible ?? true,
      slug,
      avatar_url: overrides.avatar_url ?? null,
      features: overrides.features ?? [
        this.createFeature('Authentication', 'Email/password and social sign in', `${slug}_auth`),
        this.createFeature('Session management', 'Active session controls and limits', `${slug}_sessions`),
      ],
      free_trial_days: overrides.free_trial_days ?? (fee.amount > 0 ? 14 : null),
      free_trial_enabled: overrides.free_trial_enabled ?? fee.amount > 0,
    };
  }

  static createDefaultPlans(): BillingPlanJSON[] {
    const tiers = [
      { key: 'free', name: 'Free', description: 'Starter access for testing and development' },
      { key: 'bronze', name: 'Bronze', description: 'Entry paid tier for growing products' },
      { key: 'silver', name: 'Silver', description: 'Mid-tier plan for production workloads' },
      { key: 'gold', name: 'Gold', description: 'Premium tier for business-critical apps' },
    ] as const;

    const amountsByPayer: Record<BillingPlanJSON['for_payer_type'], Record<(typeof tiers)[number]['key'], number>> = {
      user: { free: 0, bronze: 1200, silver: 3200, gold: 7900 },
      org: { free: 0, bronze: 2900, silver: 6900, gold: 14900 },
    };

    const plans: BillingPlanJSON[] = [];

    for (const payerType of ['user', 'org'] as const) {
      for (const tier of tiers) {
        const amount = amountsByPayer[payerType][tier.key];
        const annualFee = amount > 0 ? this.createMoney(amount * 10) : null;
        const annualMonthlyFee = annualFee ? this.createMoney(Math.round(annualFee.amount / 12)) : null;
        const isFree = tier.key === 'free';
        const planName = `${tier.name} ${payerType === 'org' ? 'Organization' : 'User'}`;
        const baseSlug = `${tier.key}-${payerType}`;

        plans.push(
          this.createPlan({
            id: `plan_${payerType}_${tier.key}`,
            name: planName,
            slug: baseSlug,
            description: `${tier.description} (${payerType === 'org' ? 'organization' : 'user'} billing)`,
            fee: this.createMoney(amount),
            annual_fee: annualFee,
            annual_monthly_fee: annualMonthlyFee,
            for_payer_type: payerType,
            is_default: isFree,
            is_recurring: !isFree,
            has_base_fee: !isFree,
            free_trial_days: isFree ? null : 14,
            free_trial_enabled: !isFree,
            features: [
              this.createFeature('Authentication', 'Standard authentication flows', `${baseSlug}_auth`),
              this.createFeature(
                'Members',
                payerType === 'org' ? 'Organization membership controls' : 'User account management',
                `${baseSlug}_members`,
              ),
              this.createFeature(
                'Support',
                isFree ? 'Community support' : `${tier.name} plan support SLA`,
                `${baseSlug}_support`,
              ),
            ],
          }),
        );
      }
    }

    return plans;
  }

  private static resolvePlanAmount(
    plan: BillingPlanJSON,
    planPeriod: BillingSubscriptionPlanPeriod,
  ): BillingMoneyAmountJSON {
    if (planPeriod === 'annual') {
      return plan.annual_fee ?? plan.fee;
    }
    return plan.fee;
  }

  static createSubscriptionItem(
    plan: BillingPlanJSON,
    overrides: Partial<BillingSubscriptionItemJSON> = {},
  ): BillingSubscriptionItemJSON {
    const now = Date.now();
    const itemPlan = overrides.plan ?? plan;
    const planPeriod = overrides.plan_period ?? 'month';
    const resolvedAmount = overrides.amount ?? this.resolvePlanAmount(itemPlan, planPeriod);
    const defaultPeriodEnd =
      resolvedAmount.amount === 0 && !itemPlan.is_recurring
        ? null
        : now + (planPeriod === 'annual' ? 365 * DAY_IN_MS : 30 * DAY_IN_MS);

    return {
      object: 'commerce_subscription_item',
      id: overrides.id ?? this.createId('subi'),
      amount: resolvedAmount,
      credit: overrides.credit,
      plan: itemPlan,
      plan_period: planPeriod,
      status: overrides.status ?? 'active',
      created_at: overrides.created_at ?? now - DAY_IN_MS,
      period_start: overrides.period_start ?? now - DAY_IN_MS,
      period_end: overrides.period_end === undefined ? defaultPeriodEnd : overrides.period_end,
      canceled_at: overrides.canceled_at ?? null,
      past_due_at: overrides.past_due_at ?? null,
      is_free_trial: overrides.is_free_trial ?? false,
    };
  }

  static createSubscription(
    plan: BillingPlanJSON,
    overrides: Partial<BillingSubscriptionJSON> = {},
  ): BillingSubscriptionJSON {
    const now = Date.now();
    const firstOverrideItem =
      Array.isArray(overrides.subscription_items) && overrides.subscription_items.length > 0
        ? overrides.subscription_items[0]
        : undefined;
    const planPeriod = firstOverrideItem?.plan_period ?? 'month';
    const status = overrides.status ?? 'active';
    const pastDueAt = overrides.past_due_at ?? (status === 'past_due' ? now - DAY_IN_MS : null);

    const baseItem = this.createSubscriptionItem(plan, {
      id: `subi_${plan.id}`,
      plan_period: planPeriod,
      status: status === 'past_due' ? 'past_due' : 'active',
      past_due_at: pastDueAt,
    });

    const hasSubscriptionItemsOverride = Object.prototype.hasOwnProperty.call(overrides, 'subscription_items');
    const subscriptionItems: BillingSubscriptionJSON['subscription_items'] = hasSubscriptionItemsOverride
      ? (overrides.subscription_items ?? null)
      : [baseItem];
    const firstSubscriptionItem =
      Array.isArray(subscriptionItems) && subscriptionItems.length > 0 ? subscriptionItems[0] : undefined;
    const nextPaymentPlan = firstSubscriptionItem?.plan ?? plan;
    const nextPaymentPeriod = firstSubscriptionItem?.plan_period ?? planPeriod;
    const nextPaymentAmount =
      firstSubscriptionItem?.amount ?? this.resolvePlanAmount(nextPaymentPlan, nextPaymentPeriod);
    const defaultNextPayment =
      nextPaymentAmount.amount > 0
        ? {
            amount: nextPaymentAmount,
            date: now + (nextPaymentPeriod === 'annual' ? 365 * DAY_IN_MS : 30 * DAY_IN_MS),
          }
        : undefined;

    const subscription: BillingSubscriptionJSON = {
      object: 'commerce_subscription',
      id: overrides.id ?? `sub_${plan.id}`,
      status,
      created_at: overrides.created_at ?? now - DAY_IN_MS,
      active_at: overrides.active_at ?? now - DAY_IN_MS,
      updated_at: overrides.updated_at ?? now,
      past_due_at: pastDueAt,
      subscription_items: subscriptionItems,
      eligible_for_free_trial: overrides.eligible_for_free_trial ?? false,
    };

    if (defaultNextPayment) {
      subscription.next_payment = defaultNextPayment;
    }

    if ('next_payment' in overrides) {
      subscription.next_payment = overrides.next_payment;
    }

    return subscription;
  }

  static createFreeTrialSubscription(plan: BillingPlanJSON): BillingSubscriptionJSON {
    const now = Date.now();
    const trialDays = plan.free_trial_days ?? 14;
    const trialEndsAt = now + trialDays * DAY_IN_MS;
    const postTrialAmount = this.resolvePlanAmount(plan, 'month');
    const trialItem = this.createSubscriptionItem(plan, {
      amount: this.createMoney(0, postTrialAmount.currency, postTrialAmount.currency_symbol),
      plan_period: 'month',
      period_start: now,
      period_end: trialEndsAt,
      status: 'active',
      is_free_trial: true,
    });

    return this.createSubscription(plan, {
      created_at: now,
      active_at: now,
      updated_at: now,
      eligible_for_free_trial: false,
      subscription_items: [trialItem],
      next_payment:
        postTrialAmount.amount > 0
          ? {
              amount: postTrialAmount,
              date: trialEndsAt,
            }
          : undefined,
    });
  }

  static createPaymentMethod(overrides: Partial<BillingPaymentMethodJSON> = {}): BillingPaymentMethodJSON {
    const now = Date.now();

    return {
      object: 'commerce_payment_method',
      id: overrides.id ?? this.createId('pm'),
      last4: overrides.last4 ?? '4242',
      payment_type: overrides.payment_type ?? 'card',
      card_type: overrides.card_type ?? 'visa',
      is_default: overrides.is_default ?? false,
      is_removable: overrides.is_removable ?? true,
      status: overrides.status ?? 'active',
      wallet_type: overrides.wallet_type ?? null,
      expiry_year: overrides.expiry_year ?? 2030,
      expiry_month: overrides.expiry_month ?? 1,
      created_at: overrides.created_at ?? now - DAY_IN_MS,
      updated_at: overrides.updated_at ?? now,
    };
  }

  static createPayer(overrides: Partial<BillingPayerJSON> = {}): BillingPayerJSON {
    const now = Date.now();

    return {
      object: 'commerce_payer',
      id: overrides.id ?? this.createId('payer'),
      created_at: overrides.created_at ?? now,
      updated_at: overrides.updated_at ?? now,
      image_url: overrides.image_url,
      user_id: overrides.user_id ?? null,
      email: overrides.email ?? null,
      first_name: overrides.first_name ?? null,
      last_name: overrides.last_name ?? null,
      organization_id: overrides.organization_id ?? null,
      organization_name: overrides.organization_name ?? null,
    };
  }

  private static createCheckoutTotals(amount: BillingMoneyAmountJSON): BillingCheckoutTotalsJSON {
    const tax = this.createMoney(0, amount.currency, amount.currency_symbol);
    const totals: BillingCheckoutTotalsWithOptionalAccountCredit = {
      grand_total: amount,
      subtotal: amount,
      tax_total: tax,
      total_due_now: amount,
      credit: null,
      past_due: null,
      total_due_after_free_trial: amount,
      account_credit: null,
    };
    return totals;
  }

  static createCheckout(plan: BillingPlanJSON, overrides: Partial<BillingCheckoutJSON> = {}): BillingCheckoutJSON {
    const now = Date.now();
    const planPeriod = overrides.plan_period ?? 'month';
    const planForCheckout = overrides.plan ?? plan;
    const selectedAmount = this.resolvePlanAmount(planForCheckout, planPeriod);
    const checkoutPlan: BillingPlanJSON = {
      ...planForCheckout,
      fee: selectedAmount,
    };

    const needsPaymentMethod =
      overrides.needs_payment_method ?? (selectedAmount.amount > 0 && !overrides.payment_method);
    const freeTrialEndsAt =
      overrides.free_trial_ends_at ??
      (planForCheckout.free_trial_enabled && planForCheckout.free_trial_days
        ? now + planForCheckout.free_trial_days * DAY_IN_MS
        : undefined);

    const checkout: BillingCheckoutJSON = {
      object: 'commerce_checkout',
      id: overrides.id ?? this.createId('chk'),
      external_client_secret: overrides.external_client_secret ?? `mock_checkout_secret_${this.createId('secret')}`,
      external_gateway_id: overrides.external_gateway_id ?? 'stripe',
      payment_method: overrides.payment_method,
      plan: checkoutPlan,
      plan_period: planPeriod,
      plan_period_start: overrides.plan_period_start ?? now,
      status: overrides.status ?? 'needs_confirmation',
      totals: overrides.totals ?? this.createCheckoutTotals(selectedAmount),
      is_immediate_plan_change: overrides.is_immediate_plan_change ?? true,
      payer: overrides.payer ?? this.createPayer(),
      needs_payment_method: needsPaymentMethod,
    };

    if (freeTrialEndsAt) {
      checkout.free_trial_ends_at = freeTrialEndsAt;
    }

    return checkout;
  }

  static createPaymentAttempt(plan: BillingPlanJSON, overrides: Partial<BillingPaymentJSON> = {}): BillingPaymentJSON {
    const now = Date.now();
    const status = overrides.status ?? 'paid';
    const subscriptionItem =
      overrides.subscription_item ??
      this.createSubscriptionItem(plan, {
        plan_period: 'month',
        status: status === 'failed' ? 'past_due' : 'active',
      });
    const amount = overrides.amount ?? this.resolvePlanAmount(subscriptionItem.plan, subscriptionItem.plan_period);

    return {
      object: 'commerce_payment',
      id: overrides.id ?? this.createId('pay'),
      amount,
      paid_at: overrides.paid_at ?? (status === 'paid' ? now - DAY_IN_MS : null),
      failed_at: overrides.failed_at ?? (status === 'failed' ? now - DAY_IN_MS : null),
      updated_at: overrides.updated_at ?? now,
      payment_method: overrides.payment_method ?? this.createPaymentMethod({ is_default: true }),
      subscription_item: subscriptionItem,
      charge_type: overrides.charge_type ?? 'recurring',
      status,
    };
  }

  static createStatement(plan: BillingPlanJSON, overrides: Partial<BillingStatementJSON> = {}): BillingStatementJSON {
    const now = Date.now();
    const payment = this.createPaymentAttempt(plan);
    const totals = this.createCheckoutTotals(payment.amount);

    return {
      object: 'commerce_statement',
      id: overrides.id ?? this.createId('stmt'),
      status: overrides.status ?? 'closed',
      timestamp: overrides.timestamp ?? now,
      groups: overrides.groups ?? [
        {
          object: 'commerce_statement_group',
          id: this.createId('stmtgrp'),
          timestamp: now,
          items: [payment],
        },
      ],
      totals: overrides.totals ?? {
        grand_total: totals.grand_total,
        subtotal: totals.subtotal,
        tax_total: totals.tax_total,
      },
    };
  }

  static createDefaultPaymentMethods(): BillingPaymentMethodJSON[] {
    return [
      this.createPaymentMethod({
        id: 'pm_mock_4242',
        last4: '4242',
        card_type: 'visa',
        is_default: true,
        is_removable: true,
      }),
    ];
  }

  static createInitializedPaymentMethod(
    overrides: Partial<BillingInitializedPaymentMethodJSON> = {},
  ): BillingInitializedPaymentMethodJSON {
    const response: BillingInitializedPaymentMethodWithOptionalId = {
      id: overrides.id ?? this.createId('pmi'),
      object: 'commerce_payment_method_initialize',
      external_client_secret:
        overrides.external_client_secret ?? `mock_client_secret_${Math.random().toString(36).slice(2, 15)}`,
      external_gateway_id: overrides.external_gateway_id ?? 'stripe',
      payment_method_order: overrides.payment_method_order ?? ['card'],
    };

    return response;
  }
}
