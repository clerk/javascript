import {
  __experimental_CheckoutProvider as CheckoutProvider,
  __experimental_useCheckout as useCheckout,
} from '@clerk/shared/react';
import { useEffect, useMemo } from 'react';

import { useCheckoutContext } from '@/ui/contexts/components';

const Initiator = () => {
  const { checkout } = useCheckout();

  useEffect(() => {
    void checkout.start();
  }, []);
  return null;
};

const Root = ({ children }: { children: React.ReactNode }) => {
  const { planId, planPeriod, for: _for } = useCheckoutContext();

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
    >
      <Initiator />
      {children}
    </CheckoutProvider>
  );
};

const Stage = ({
  children,
  name,
}: {
  children: React.ReactNode;
  name: ReturnType<typeof useCheckout>['checkout']['status'];
}) => {
  const { checkout } = useCheckout();
  if (checkout.status !== name) {
    return null;
  }
  return children;
};

const FetchStatus = ({
  children,
  status,
}: {
  children: React.ReactNode;
  status: 'idle' | 'fetching' | 'generic_error' | 'invalid_plan_change' | 'missing_payer_email';
}) => {
  const { errors, fetchStatus } = useCheckout();

  const internalFetchStatus = useMemo(() => {
    if (errors.global) {
      const errorCodes = errors.global.flatMap(e => {
        if (e.isClerkApiResponseError()) {
          return e.errors.map(e => e.code);
        }
      });

      console.log({ errorCodes });

      if (errorCodes.includes('missing_payer_email')) {
        return 'missing_payer_email';
      }

      if (errorCodes.includes('invalid_plan_change')) {
        return 'invalid_plan_change';
      }
      return 'generic_error';
    }

    return fetchStatus;
  }, [fetchStatus]);

  if (internalFetchStatus !== status) {
    return null;
  }
  return children;
};

export { Root, Stage, FetchStatus };
