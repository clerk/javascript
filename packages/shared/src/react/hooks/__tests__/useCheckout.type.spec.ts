import type {
  __experimental_CheckoutCacheState,
  __experimental_CheckoutInstance,
  ClerkAPIResponseError,
  CommerceCheckoutResource,
  CommerceSubscriptionPlanPeriod,
  ConfirmCheckoutParams,
} from '@clerk/types';
import { describe, expectTypeOf, it } from 'vitest';

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
        planPeriod: CommerceSubscriptionPlanPeriod;
      };
      expectTypeOf<ValidOptions>().toMatchTypeOf<UseCheckoutParameters>();
    });

    it('does not allow invalid "for" value', () => {
      type InvalidOptions = {
        for: 'invalid';
        planId: string;
        planPeriod: CommerceSubscriptionPlanPeriod;
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
        planPeriod: CommerceSubscriptionPlanPeriod;
        invalidProp: boolean;
      };
      expectTypeOf<UseCheckoutParameters>().not.toEqualTypeOf<InvalidOptions>();
    });
  });

  describe('return value', () => {
    type CheckoutObject = UseCheckoutReturn['checkout'];
    describe('methods', () => {
      it('has required methods', () => {
        type Methods = Pick<CheckoutObject, 'confirm' | 'start' | 'clear' | 'finalize' | 'getState'>;

        type MethodNames = keyof Methods;
        expectTypeOf<MethodNames>().toEqualTypeOf<'confirm' | 'start' | 'clear' | 'finalize' | 'getState'>();
      });

      it('has correct method signatures', () => {
        type Methods = Pick<CheckoutObject, 'confirm' | 'start' | 'clear' | 'finalize' | 'getState'>;
        type ConfirmMethod = Methods['confirm'];
        type StartMethod = Methods['start'];
        type ClearMethod = Methods['clear'];
        type FinalizeMethod = Methods['finalize'];
        type GetStateMethod = Methods['getState'];

        type CheckoutResult =
          | {
              data: CommerceCheckoutResource;
              error: null;
            }
          | {
              data: null;
              error: ClerkAPIResponseError;
            };

        expectTypeOf<ConfirmMethod>().parameter(0).toEqualTypeOf<ConfirmCheckoutParams>();
        expectTypeOf<ConfirmMethod>().returns.resolves.toEqualTypeOf<CheckoutResult>();
        expectTypeOf<StartMethod>().returns.resolves.toEqualTypeOf<CheckoutResult>();
        expectTypeOf<ClearMethod>().returns.toBeVoid();
        expectTypeOf<FinalizeMethod>().parameter(0).toEqualTypeOf<{ redirectUrl: string } | undefined>();
        expectTypeOf<GetStateMethod>().returns.toEqualTypeOf<__experimental_CheckoutCacheState>();
      });

      it('has correct return types for start and confirm', () => {
        type Methods = Pick<CheckoutObject, 'confirm' | 'start'>;
        type ConfirmMethod = Methods['confirm'];
        type StartMethod = Methods['start'];

        type CheckoutResult =
          | {
              data: CommerceCheckoutResource;
              error: null;
            }
          | {
              data: null;
              error: ClerkAPIResponseError;
            };

        // Test that start returns a Promise of CheckoutResult
        expectTypeOf<StartMethod>().parameters.toEqualTypeOf<[]>();
        expectTypeOf<StartMethod>().returns.resolves.toEqualTypeOf<CheckoutResult>();

        // Test that confirm returns a Promise of CheckoutResult and accepts correct parameters
        expectTypeOf<ConfirmMethod>().parameters.toEqualTypeOf<[ConfirmCheckoutParams]>();
        expectTypeOf<ConfirmMethod>().returns.resolves.toEqualTypeOf<CheckoutResult>();
      });
    });

    describe('properties', () => {
      it('has required status properties with correct types', () => {
        type StatusProps = Pick<CheckoutObject, 'isStarting' | 'isConfirming' | 'error' | 'status' | 'fetchStatus'>;
        type PropNames = keyof StatusProps;
        expectTypeOf<PropNames>().toEqualTypeOf<'isStarting' | 'isConfirming' | 'error' | 'status' | 'fetchStatus'>();

        type IsStarting = StatusProps['isStarting'];
        type IsConfirming = StatusProps['isConfirming'];
        type FetchStatus = StatusProps['fetchStatus'];

        expectTypeOf<IsStarting>().toBeBoolean();
        expectTypeOf<IsConfirming>().toBeBoolean();
        expectTypeOf<FetchStatus>().toEqualTypeOf<'idle' | 'fetching' | 'error'>();
      });

      it('has nullable checkout properties', () => {
        type CheckoutProps = Pick<
          CheckoutObject,
          | 'id'
          | 'externalClientSecret'
          | 'externalGatewayId'
          | 'totals'
          | 'isImmediatePlanChange'
          | 'planPeriod'
          | 'plan'
          | 'paymentSource'
        >;

        type PropNames = keyof CheckoutProps;
        expectTypeOf<PropNames>().toEqualTypeOf<
          | 'id'
          | 'externalClientSecret'
          | 'externalGatewayId'
          | 'totals'
          | 'isImmediatePlanChange'
          | 'planPeriod'
          | 'plan'
          | 'paymentSource'
        >();
      });
    });

    describe('discriminated unions', () => {
      describe('error state discrimination', () => {
        it('has correct fetchStatus type union', () => {
          type FetchStatus = CheckoutObject['fetchStatus'];
          expectTypeOf<FetchStatus>().toEqualTypeOf<'idle' | 'fetching' | 'error'>();
        });

        it('has correct error type union', () => {
          type ErrorType = CheckoutObject['error'];
          expectTypeOf<ErrorType>().toMatchTypeOf<ClerkAPIResponseError | null>();
        });

        it('enforces error state correlation', () => {
          // When fetchStatus is 'error', error should not be null
          type ErrorFetchState = CheckoutObject & { fetchStatus: 'error' };
          expectTypeOf<ErrorFetchState['error']>().not.toEqualTypeOf<null>();

          // When fetchStatus is not 'error', error must be null
          type NonErrorFetchState = CheckoutObject & { fetchStatus: 'idle' | 'fetching' };
          expectTypeOf<NonErrorFetchState['error']>().toEqualTypeOf<null>();
        });
      });

      describe('status-based property discrimination', () => {
        it('has correct status type union', () => {
          type Status = CheckoutObject['status'];
          expectTypeOf<Status>().toEqualTypeOf<'needs_initialization' | 'needs_confirmation' | 'completed'>();
        });

        it('enforces null properties when status is needs_initialization', () => {
          type InitializationState = CheckoutObject & { status: 'needs_initialization' };

          // Test that properties are nullable (null or undefined) in initialization state
          expectTypeOf<InitializationState['id']>().toEqualTypeOf<null>();
          expectTypeOf<InitializationState['externalClientSecret']>().toEqualTypeOf<null>();
          expectTypeOf<InitializationState['externalGatewayId']>().toEqualTypeOf<null>();
          expectTypeOf<InitializationState['totals']>().toEqualTypeOf<null>();
          expectTypeOf<InitializationState['isImmediatePlanChange']>().toEqualTypeOf<null>();
          expectTypeOf<InitializationState['planPeriod']>().toEqualTypeOf<null>();
          expectTypeOf<InitializationState['plan']>().toEqualTypeOf<null>();
          expectTypeOf<InitializationState['paymentSource']>().toEqualTypeOf<null | undefined>();

          // Test that the status property is correctly typed
          expectTypeOf<InitializationState['status']>().toEqualTypeOf<'needs_initialization'>();
        });

        it('enforces proper types when status is needs_confirmation or completed', () => {
          type ConfirmationState = CheckoutObject & { status: 'needs_confirmation' };
          type CompletedState = CheckoutObject & { status: 'completed' };

          // These should not be null for confirmation and completed states
          expectTypeOf<ConfirmationState['id']>().not.toEqualTypeOf<null>();
          expectTypeOf<ConfirmationState['totals']>().not.toEqualTypeOf<null>();
          expectTypeOf<ConfirmationState['plan']>().not.toEqualTypeOf<null>();

          expectTypeOf<CompletedState['id']>().not.toEqualTypeOf<null>();
          expectTypeOf<CompletedState['totals']>().not.toEqualTypeOf<null>();
          expectTypeOf<CompletedState['plan']>().not.toEqualTypeOf<null>();
        });
      });

      describe('type structure validation', () => {
        it('validates the overall discriminated union structure', () => {
          // Test that CheckoutObject is a proper discriminated union
          type CheckoutUnion = CheckoutObject;

          // Should include all required properties
          expectTypeOf<CheckoutUnion>().toHaveProperty('status');
          expectTypeOf<CheckoutUnion>().toHaveProperty('fetchStatus');
          expectTypeOf<CheckoutUnion>().toHaveProperty('error');
          expectTypeOf<CheckoutUnion>().toHaveProperty('id');
          expectTypeOf<CheckoutUnion>().toHaveProperty('confirm');
          expectTypeOf<CheckoutUnion>().toHaveProperty('start');
          expectTypeOf<CheckoutUnion>().toHaveProperty('clear');
          expectTypeOf<CheckoutUnion>().toHaveProperty('finalize');
          expectTypeOf<CheckoutUnion>().toHaveProperty('getState');
          expectTypeOf<CheckoutUnion>().toHaveProperty('isStarting');
          expectTypeOf<CheckoutUnion>().toHaveProperty('isConfirming');
        });

        it('validates method types remain unchanged', () => {
          // Ensure the discriminated union doesn't affect method types
          expectTypeOf<CheckoutObject['confirm']>().toEqualTypeOf<__experimental_CheckoutInstance['confirm']>();
          expectTypeOf<CheckoutObject['start']>().toEqualTypeOf<__experimental_CheckoutInstance['start']>();
          expectTypeOf<CheckoutObject['clear']>().toEqualTypeOf<() => void>();
          expectTypeOf<CheckoutObject['finalize']>().toEqualTypeOf<(params?: { redirectUrl: string }) => void>();
          expectTypeOf<CheckoutObject['getState']>().toEqualTypeOf<() => __experimental_CheckoutCacheState>();
        });
      });
    });
  });
});
