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

export function CheckoutAccountCredit(): MockScenario {
  const user = UserService.create();
  const session = SessionService.create(user);

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

  const checkoutAccountCreditHandler = http.post('https://*.clerk.accounts.dev/v1/me/billing/checkouts', () => {
    return HttpResponse.json({
      response: {
        object: 'commerce_checkout',
        id: 'string',
        plan: {
          object: 'commerce_plan',
          id: 'string',
          name: 'Pro',
          fee: {
            amount: 0,
            amount_formatted: '25.00',
            currency: 'string',
            currency_symbol: '$',
          },
          annual_monthly_fee: {
            amount: 0,
            amount_formatted: 'string',
            currency: 'string',
            currency_symbol: 'string',
          },
          annual_fee: {
            amount: 0,
            amount_formatted: 'string',
            currency: 'string',
            currency_symbol: 'string',
          },
          description: null,
          is_default: true,
          is_recurring: true,
          publicly_visible: true,
          has_base_fee: true,
          for_payer_type: 'string',
          slug: 'string',
          avatar_url: null,
          free_trial_enabled: true,
          free_trial_days: null,
          features: [
            {
              object: 'feature',
              id: 'string',
              name: 'string',
              description: null,
              slug: 'string',
              avatar_url: null,
            },
          ],
        },
        plan_period: 'month',
        payer: {
          object: 'commerce_payer',
          id: 'string',
          instance_id: 'string',
          user_id: null,
          first_name: null,
          last_name: null,
          email: null,
          organization_id: null,
          organization_name: null,
          image_url: 'https://example.com',
          created_at: 1,
          updated_at: 1,
        },
        payment_method: {
          object: 'commerce_payment_method',
          id: 'string',
          payer_id: 'string',
          payment_type: 'card',
          is_default: true,
          gateway: 'string',
          gateway_external_id: 'string',
          gateway_external_account_id: null,
          last4: null,
          status: 'active',
          wallet_type: null,
          card_type: null,
          expiry_year: null,
          expiry_month: null,
          created_at: 1,
          updated_at: 1,
          is_removable: true,
        },
        external_gateway_id: 'string',
        status: 'needs_confirmation',
        totals: {
          subtotal: {
            amount: 1,
            amount_formatted: '25.00',
            currency: 'string',
            currency_symbol: '$',
          },
          tax_total: {
            amount: 1,
            amount_formatted: 'string',
            currency: 'string',
            currency_symbol: 'string',
          },
          grand_total: {
            amount: 1,
            amount_formatted: 'string',
            currency: 'string',
            currency_symbol: 'string',
          },
          total_due_after_free_trial: {
            amount: 1,
            amount_formatted: 'string',
            currency: 'string',
            currency_symbol: 'string',
          },
          total_due_now: {
            amount: 1,
            amount_formatted: '10.00',
            currency: 'string',
            currency_symbol: '$',
          },
          past_due: null,
          credit: {
            amount: 1,
            amount_formatted: '5.00',
            currency: 'string',
            currency_symbol: '$',
          },
          credits: {
            proration: {
              amount: {
                amount: 1,
                amount_formatted: '5.00',
                currency: 'string',
                currency_symbol: '$',
              },
              cycle_days_remaining: 1,
              cycle_days_total: 1,
              cycle_remaining_percent: 1,
            },
            payer: {
              remaining_balance: {
                amount: 1,
                amount_formatted: '100.00',
                currency: 'string',
                currency_symbol: '$',
              },
              applied_amount: {
                amount: 1,
                amount_formatted: '10.00',
                currency: 'string',
                currency_symbol: '$',
              },
            },
            total: {
              amount: 1,
              amount_formatted: '15.00',
              currency: 'string',
              currency_symbol: '$',
            },
          },
        },
        subscription_item: {
          object: 'commerce_subscription_item',
          id: 'string',
          instance_id: 'string',
          status: 'active',
          credit: {
            amount: {
              amount: 1,
              amount_formatted: 'string',
              currency: 'string',
              currency_symbol: 'string',
            },
            cycle_days_remaining: 1,
            cycle_days_total: 1,
            cycle_remaining_percent: 1,
          },
          plan_id: 'string',
          price_id: 'string',
          plan: {
            object: 'commerce_plan',
            id: 'string',
            name: 'string',
            fee: {
              amount: 0,
              amount_formatted: 'string',
              currency: 'string',
              currency_symbol: 'string',
            },
            annual_monthly_fee: {
              amount: 0,
              amount_formatted: 'string',
              currency: 'string',
              currency_symbol: 'string',
            },
            annual_fee: {
              amount: 0,
              amount_formatted: 'string',
              currency: 'string',
              currency_symbol: 'string',
            },
            description: null,
            is_default: true,
            is_recurring: true,
            publicly_visible: true,
            has_base_fee: true,
            for_payer_type: 'string',
            slug: 'string',
            avatar_url: null,
            free_trial_enabled: true,
            free_trial_days: null,
            features: [
              {
                object: 'feature',
                id: 'string',
                name: 'string',
                description: null,
                slug: 'string',
                avatar_url: null,
              },
            ],
          },
          plan_period: 'month',
          payment_method_id: 'string',
          payment_method: {
            object: 'commerce_payment_method',
            id: 'string',
            payer_id: 'string',
            payment_type: 'card',
            is_default: true,
            gateway: 'string',
            gateway_external_id: 'string',
            gateway_external_account_id: null,
            last4: null,
            status: 'active',
            wallet_type: null,
            card_type: null,
            expiry_year: null,
            expiry_month: null,
            created_at: 1,
            updated_at: 1,
            is_removable: true,
          },
          lifetime_paid: {
            amount: 0,
            amount_formatted: 'string',
            currency: 'string',
            currency_symbol: 'string',
          },
          amount: {
            amount: 0,
            amount_formatted: 'string',
            currency: 'string',
            currency_symbol: 'string',
          },
          next_payment: {
            amount: {
              amount: 0,
              amount_formatted: 'string',
              currency: 'string',
              currency_symbol: 'string',
            },
            date: 1,
          },
          payer_id: 'string',
          payer: {
            object: 'commerce_payer',
            id: 'string',
            instance_id: 'string',
            user_id: null,
            first_name: null,
            last_name: null,
            email: null,
            organization_id: null,
            organization_name: null,
            image_url: 'https://example.com',
            created_at: 1,
            updated_at: 1,
          },
          is_free_trial: true,
          period_start: 1,
          period_end: null,
          proration_date: 'string',
          canceled_at: null,
          past_due_at: null,
          ended_at: null,
          created_at: 1,
          updated_at: 1,
        },
        plan_period_start: 1,
        is_immediate_plan_change: true,
        free_trial_ends_at: 1,
        needs_payment_method: true,
      },
    });
  });

  return {
    description: 'Checkout with account credit',
    handlers: [checkoutAccountCreditHandler, subscriptionHandler, paymentMethodsHandler, ...clerkHandlers],
    initialState: { session, user },
    name: 'checkout-account-credit',
  };
}
