import type {
  __experimental_CheckoutCacheState,
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

        expectTypeOf<ConfirmMethod>().parameter(0).toEqualTypeOf<ConfirmCheckoutParams>();
        expectTypeOf<ConfirmMethod>().returns.toEqualTypeOf<Promise<CommerceCheckoutResource>>();
        expectTypeOf<StartMethod>().returns.toEqualTypeOf<Promise<CommerceCheckoutResource>>();
        expectTypeOf<ClearMethod>().returns.toBeVoid();
        expectTypeOf<FinalizeMethod>().parameter(0).toEqualTypeOf<{ redirectUrl: string } | undefined>();
        expectTypeOf<GetStateMethod>().returns.toEqualTypeOf<__experimental_CheckoutCacheState>();
      });

      it('has correct return types for start and confirm', () => {
        type Methods = Pick<CheckoutObject, 'confirm' | 'start'>;
        type ConfirmMethod = Methods['confirm'];
        type StartMethod = Methods['start'];

        // Test that start returns a Promise
        expectTypeOf<StartMethod>().parameters.toEqualTypeOf<[]>();
        expectTypeOf<StartMethod>().returns.toEqualTypeOf<Promise<CommerceCheckoutResource>>();

        // Test that confirm returns a Promise and accepts correct parameters
        expectTypeOf<ConfirmMethod>().parameters.toEqualTypeOf<[ConfirmCheckoutParams]>();
        expectTypeOf<ConfirmMethod>().returns.toEqualTypeOf<Promise<CommerceCheckoutResource>>();
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
          | 'statement_id'
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
          | 'statement_id'
          | 'totals'
          | 'isImmediatePlanChange'
          | 'planPeriod'
          | 'plan'
          | 'paymentSource'
        >();
      });
    });
  });
});
