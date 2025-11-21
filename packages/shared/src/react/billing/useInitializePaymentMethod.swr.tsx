import { useEffect } from 'react';
import useSWRMutation from 'swr/mutation';

import type { BillingInitializedPaymentMethodResource, ForPayerType } from '../../types';
import { useOrganizationContext, useUserContext } from '../contexts';

type InitializePaymentMethodOptions = {
  for?: ForPayerType;
};

export type UseInitializePaymentMethodResult = {
  initializedPaymentMethod: BillingInitializedPaymentMethodResource | undefined;
  initializePaymentMethod: () => Promise<BillingInitializedPaymentMethodResource | undefined>;
};

/**
 * This is the existing implementation of the payment method initializer using SWR.
 * It is kept here for backwards compatibility until our next major version.
 *
 * @internal
 */
function useInitializePaymentMethod(options?: InitializePaymentMethodOptions): UseInitializePaymentMethodResult {
  const { for: forType = 'user' } = options ?? {};
  const { organization } = useOrganizationContext();
  const user = useUserContext();

  const resource = forType === 'organization' ? organization : user;

  const { data, trigger } = useSWRMutation(
    resource?.id
      ? {
          key: 'billing-payment-method-initialize',
          resourceId: resource.id,
          for: forType,
        }
      : null,
    () => {
      return resource?.initializePaymentMethod({
        gateway: 'stripe',
      });
    },
  );

  useEffect(() => {
    if (!resource?.id) {
      return;
    }

    trigger().catch(() => {
      // ignore errors
    });
  }, [resource?.id, trigger]);

  return {
    initializedPaymentMethod: data,
    initializePaymentMethod: trigger,
  };
}

export { useInitializePaymentMethod as __internal_useInitializePaymentMethod };
