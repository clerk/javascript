import {
  __experimental_CheckoutProvider as CheckoutProvider,
  __experimental_useCheckout as useCheckout,
} from '@clerk/shared/react';
import { useEffect, useMemo } from 'react';

import { useCheckoutContext } from '@/ui/contexts/components';

const Initiator = () => {
  const { checkout } = useCheckout();

  useEffect(() => {
    checkout.start().catch(() => null);
    return checkout.clear;
  }, []);
  return null;
};

const Root = ({ children }: { children: React.ReactNode }) => {
  const { planId, planPeriod, subscriberType } = useCheckoutContext();

  return (
    <CheckoutProvider
      for={subscriberType === 'org' ? 'organization' : undefined}
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
  status: 'idle' | 'fetching' | 'error' | 'invalid_plan_change' | 'missing_payer_email';
}) => {
  const { checkout } = useCheckout();
  const { fetchStatus, error } = checkout;

  const internalFetchStatus = useMemo(() => {
    if (fetchStatus === 'error' && error?.errors) {
      const errorCodes = error.errors.map(e => e.code);

      if (errorCodes.includes('missing_payer_email')) {
        return 'missing_payer_email';
      }

      if (errorCodes.includes('invalid_plan_change')) {
        return 'invalid_plan_change';
      }
    }

    return fetchStatus;
  }, [fetchStatus, error]);

  if (internalFetchStatus !== status) {
    return null;
  }
  return children;
};

export { Root, Stage, FetchStatus };
