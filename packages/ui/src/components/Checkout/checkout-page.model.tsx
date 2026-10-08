import {
  __experimental_CheckoutProvider as CheckoutProvider,
  __experimental_useCheckout as useCheckout,
} from '@clerk/shared/react';
import { useEffect, useMemo, useRef } from 'react';

import { useCheckoutContext } from '@/ui/contexts/components';

import { useCheckoutRequestScopeModel } from './checkout-request-scope.model';

export type CheckoutStage = ReturnType<typeof useCheckout>['checkout']['status'];
export type CheckoutFetchStatus = 'idle' | 'fetching' | 'generic_error' | 'invalid_plan_change' | 'missing_payer_email';

const CheckoutLifecycle = () => {
  const { checkout } = useCheckout();
  const { onSubscriptionComplete } = useCheckoutContext();
  const scope = useCheckoutRequestScopeModel(checkout);
  const status = checkout.status;
  const previous = useRef({ key: scope.requestKey, status });
  const latest = useRef({ scope, onSubscriptionComplete });
  latest.current = { scope, onSubscriptionComplete };

  useEffect(() => {
    const before = previous.current;
    previous.current = { key: scope.requestKey, status };
    if (
      before.key === scope.requestKey &&
      before.status === 'needs_confirmation' &&
      status === 'completed' &&
      latest.current.scope.canRun()
    ) {
      latest.current.onSubscriptionComplete?.();
    }
  }, [scope.requestKey, status]);

  useEffect(() => {
    if (latest.current.scope.canRun()) {
      void checkout.start();
    }
  }, [checkout]);
  return null;
};

export const CheckoutProviderModel = ({ children }: { children: React.ReactNode }) => {
  const { planId, planPeriod, for: _for, seatsQuantity, priceId } = useCheckoutContext();

  return (
    <CheckoutProvider
      for={_for}
      planId={
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        planId!
      }
      planPeriod={
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        planPeriod!
      }
      seatsQuantity={seatsQuantity}
      priceId={priceId}
    >
      <CheckoutLifecycle />
      {children}
    </CheckoutProvider>
  );
};

export const useCheckoutStageModel = () => {
  const { checkout } = useCheckout();
  return { stage: checkout.status };
};

export const useCheckoutFetchStatusModel = () => {
  const { errors, fetchStatus } = useCheckout();

  const internalFetchStatus = useMemo(() => {
    if (errors.global) {
      const errorCodes = errors.global.flatMap(error => {
        if (error.isClerkAPIResponseError()) {
          return error.errors.map(responseError => responseError.code);
        }
      });

      if (errorCodes.includes('missing_payer_email')) {
        return 'missing_payer_email';
      }

      if (errorCodes.includes('invalid_plan_change')) {
        return 'invalid_plan_change';
      }
      return 'generic_error';
    }

    return fetchStatus;
  }, [fetchStatus, errors.global]);

  return { status: internalFetchStatus };
};
