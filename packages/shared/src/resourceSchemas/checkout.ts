import type { ResourceSchema } from './types';

/**
 * Checkout uses raw/global errors only, no field-level errors.
 */
type CheckoutFields = Record<string, never>;

/**
 * Schema for the Checkout resource.
 * Multiple instances cached by params (keyed).
 */
export const checkoutSchema: ResourceSchema<CheckoutFields> = {
  name: 'checkout',
  resourceType: 'keyed',
  errorFields: {},
  properties: {
    status: { default: 'needs_initialization' },
    externalClientSecret: { default: null },
    externalGatewayId: { default: null },
    plan: { default: null },
    planPeriod: { default: null },
    totals: { default: null },
    isImmediatePlanChange: { default: false },
    freeTrialEndsAt: { default: null },
    payer: { default: null },
    paymentMethod: { default: null },
    planPeriodStart: { default: null },
    needsPaymentMethod: { default: null },
  },
  methods: ['start', 'confirm', 'finalize'],
};
