import { describe, expectTypeOf, it } from 'vitest';

import type { ClerkError } from '@/error';
import type {
  BillingSubscriptionPlanPeriod,
  CheckoutErrors,
  CheckoutFlowFinalizeParams,
  CheckoutFlowResource,
  ConfirmCheckoutParams,
} from '@/types';

import type { useCheckout } from '../useCheckout';

type UseCheckoutParameters = Parameters<typeof useCheckout>[0];
type UseCheckoutReturn = ReturnType<typeof useCheckout>;

describe('useCheckout type tests', () => {
  describe('parameters', () => {
    it('allows undefined parameters', () => {
      expectTypeOf<UseCheckoutParameters>().extract<undefined>().toBeUndefined();
    });

    it('allows valid options object', () => {
      type ValidOptions = {
        for: 'organization';
        planId: string;
        planPeriod: BillingSubscriptionPlanPeriod;
      };
      expectTypeOf<ValidOptions>().toMatchTypeOf<UseCheckoutParameters>();
    });

    it('does not allow invalid "for" value', () => {
      type InvalidOptions = {
        for: 'invalid';
        planId: string;
        planPeriod: BillingSubscriptionPlanPeriod;
      };
      expectTypeOf<UseCheckoutParameters>().not.toEqualTypeOf<InvalidOptions>();
    });

    it('does not allow invalid planPeriod value', () => {
      type InvalidOptions = {
        for: 'organization';
        planId: string;
        planPeriod: 'invalid';
      };
      expectTypeOf<UseCheckoutParameters>().not.toEqualTypeOf<InvalidOptions>();
    });

    it('does not allow additional properties', () => {
      type InvalidOptions = {
        for: 'organization';
        planId: string;
        planPeriod: BillingSubscriptionPlanPeriod;
        invalidProp: boolean;
      };
      expectTypeOf<UseCheckoutParameters>().not.toEqualTypeOf<InvalidOptions>();
    });
  });

  describe('return value', () => {
    it('has correct top-level structure', () => {
      expectTypeOf<UseCheckoutReturn>().toHaveProperty('errors');
      expectTypeOf<UseCheckoutReturn>().toHaveProperty('fetchStatus');
      expectTypeOf<UseCheckoutReturn>().toHaveProperty('checkout');
    });

    it('has correct errors type', () => {
      type Errors = UseCheckoutReturn['errors'];
      expectTypeOf<Errors>().toEqualTypeOf<CheckoutErrors>();
      expectTypeOf<Errors>().toHaveProperty('raw');
      expectTypeOf<Errors>().toHaveProperty('global');
    });

    it('has correct fetchStatus type', () => {
      type FetchStatus = UseCheckoutReturn['fetchStatus'];
      expectTypeOf<FetchStatus>().toEqualTypeOf<'idle' | 'fetching'>();
    });

    type CheckoutObject = UseCheckoutReturn['checkout'];

    describe('methods', () => {
      it('has required methods', () => {
        type Methods = Pick<CheckoutObject, 'confirm' | 'start' | 'finalize'>;

        type MethodNames = keyof Methods;
        expectTypeOf<MethodNames>().toEqualTypeOf<'confirm' | 'start' | 'finalize'>();
      });

      it('has correct method signatures', () => {
        type Methods = Pick<CheckoutObject, 'confirm' | 'start' | 'finalize'>;
        type ConfirmMethod = Methods['confirm'];
        type StartMethod = Methods['start'];
        type FinalizeMethod = Methods['finalize'];

        type MethodResult = Promise<{ error: ClerkError | null }>;

        expectTypeOf<ConfirmMethod>().parameter(0).toEqualTypeOf<ConfirmCheckoutParams>();
        expectTypeOf<ConfirmMethod>().returns.toEqualTypeOf<MethodResult>();
        expectTypeOf<StartMethod>().parameters.toEqualTypeOf<[]>();
        expectTypeOf<StartMethod>().returns.toEqualTypeOf<MethodResult>();
        expectTypeOf<FinalizeMethod>().parameter(0).toEqualTypeOf<CheckoutFlowFinalizeParams | undefined>();
        expectTypeOf<FinalizeMethod>().returns.toEqualTypeOf<MethodResult>();
      });

      it('has correct return types for start and confirm', () => {
        type Methods = Pick<CheckoutObject, 'confirm' | 'start'>;
        type ConfirmMethod = Methods['confirm'];
        type StartMethod = Methods['start'];

        type MethodResult = Promise<{ error: ClerkError | null }>;

        // Test that start returns a Promise of { error: ClerkError | null }
        expectTypeOf<StartMethod>().parameters.toEqualTypeOf<[]>();
        expectTypeOf<StartMethod>().returns.toEqualTypeOf<MethodResult>();

        // Test that confirm returns a Promise of { error: ClerkError | null } and accepts correct parameters
        expectTypeOf<ConfirmMethod>().parameters.toEqualTypeOf<[ConfirmCheckoutParams]>();
        expectTypeOf<ConfirmMethod>().returns.toEqualTypeOf<MethodResult>();
      });
    });

    describe('properties', () => {
      it('has required status property', () => {
        type Status = CheckoutObject['status'];
        expectTypeOf<Status>().toEqualTypeOf<'needs_initialization' | 'needs_confirmation' | 'completed'>();
      });

      it('has checkout data properties', () => {
        type CheckoutProps = Pick<
          CheckoutObject,
          | 'externalClientSecret'
          | 'externalGatewayId'
          | 'totals'
          | 'isImmediatePlanChange'
          | 'planPeriod'
          | 'plan'
          | 'paymentMethod'
          | 'payer'
          | 'needsPaymentMethod'
          | 'planPeriodStart'
          | 'freeTrialEndsAt'
        >;

        type PropNames = keyof CheckoutProps;
        expectTypeOf<PropNames>().toEqualTypeOf<
          | 'externalClientSecret'
          | 'externalGatewayId'
          | 'totals'
          | 'isImmediatePlanChange'
          | 'planPeriod'
          | 'plan'
          | 'paymentMethod'
          | 'payer'
          | 'needsPaymentMethod'
          | 'planPeriodStart'
          | 'freeTrialEndsAt'
        >();
      });
    });

    describe('discriminated unions', () => {
      describe('status-based property discrimination', () => {
        it('has correct status type union', () => {
          type Status = CheckoutObject['status'];
          expectTypeOf<Status>().toEqualTypeOf<'needs_initialization' | 'needs_confirmation' | 'completed'>();
        });

        it('enforces null properties when status is needs_initialization', () => {
          type InitializationState = CheckoutObject & { status: 'needs_initialization' };

          // Test that properties are null in initialization state
          expectTypeOf<InitializationState['externalClientSecret']>().toEqualTypeOf<null>();
          expectTypeOf<InitializationState['externalGatewayId']>().toEqualTypeOf<null>();
          expectTypeOf<InitializationState['totals']>().toEqualTypeOf<null>();
          expectTypeOf<InitializationState['isImmediatePlanChange']>().toEqualTypeOf<null>();
          expectTypeOf<InitializationState['planPeriod']>().toEqualTypeOf<null>();
          expectTypeOf<InitializationState['plan']>().toEqualTypeOf<null>();
          expectTypeOf<InitializationState['paymentMethod']>().toEqualTypeOf<null>();
          expectTypeOf<InitializationState['payer']>().toEqualTypeOf<null>();
          expectTypeOf<InitializationState['needsPaymentMethod']>().toEqualTypeOf<null>();

          // Test that the status property is correctly typed
          expectTypeOf<InitializationState['status']>().toEqualTypeOf<'needs_initialization'>();
        });

        it('enforces proper types when status is needs_confirmation or completed', () => {
          type ConfirmationState = CheckoutObject & { status: 'needs_confirmation' };
          type CompletedState = CheckoutObject & { status: 'completed' };

          // These should not be null for confirmation and completed states
          expectTypeOf<ConfirmationState['externalClientSecret']>().not.toEqualTypeOf<null>();
          expectTypeOf<ConfirmationState['totals']>().not.toEqualTypeOf<null>();
          expectTypeOf<ConfirmationState['plan']>().not.toEqualTypeOf<null>();
          expectTypeOf<ConfirmationState['payer']>().not.toEqualTypeOf<null>();

          expectTypeOf<CompletedState['externalClientSecret']>().not.toEqualTypeOf<null>();
          expectTypeOf<CompletedState['totals']>().not.toEqualTypeOf<null>();
          expectTypeOf<CompletedState['plan']>().not.toEqualTypeOf<null>();
          expectTypeOf<CompletedState['payer']>().not.toEqualTypeOf<null>();
        });
      });

      describe('type structure validation', () => {
        it('validates the overall discriminated union structure', () => {
          // Test that CheckoutObject is a proper discriminated union
          type CheckoutUnion = CheckoutObject;

          // Should include all required properties and methods
          expectTypeOf<CheckoutUnion>().toHaveProperty('status');
          expectTypeOf<CheckoutUnion>().toHaveProperty('externalClientSecret');
          expectTypeOf<CheckoutUnion>().toHaveProperty('externalGatewayId');
          expectTypeOf<CheckoutUnion>().toHaveProperty('totals');
          expectTypeOf<CheckoutUnion>().toHaveProperty('plan');
          expectTypeOf<CheckoutUnion>().toHaveProperty('confirm');
          expectTypeOf<CheckoutUnion>().toHaveProperty('start');
          expectTypeOf<CheckoutUnion>().toHaveProperty('finalize');
        });

        it('validates method types are consistent across all status states', () => {
          type MethodResult = Promise<{ error: ClerkError | null }>;

          // Methods should have the same signature regardless of status
          expectTypeOf<CheckoutObject['confirm']>().toEqualTypeOf<(params: ConfirmCheckoutParams) => MethodResult>();
          expectTypeOf<CheckoutObject['start']>().toEqualTypeOf<() => MethodResult>();
          expectTypeOf<CheckoutObject['finalize']>().toEqualTypeOf<
            (params?: CheckoutFlowFinalizeParams) => MethodResult
          >();
        });

        it('validates CheckoutFlowResource type', () => {
          // Ensure CheckoutObject matches CheckoutFlowResource
          expectTypeOf<CheckoutObject>().toEqualTypeOf<CheckoutFlowResource>();
        });
      });
    });
  });
});
