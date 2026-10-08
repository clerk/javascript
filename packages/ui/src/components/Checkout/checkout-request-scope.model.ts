import {
  __internal_useOrganizationBase,
  useClerk,
  useSafeLayoutEffect,
  useSession,
  useUser,
} from '@clerk/shared/react';
import type { CheckoutFlowResource } from '@clerk/shared/types';
import { useRef } from 'react';

import { useCheckoutContext, useSubscriberTypeContext } from '../../contexts';

export const useCheckoutRequestScopeModel = (checkout: CheckoutFlowResource) => {
  const clerk = useClerk();
  const { user } = useUser();
  const { session } = useSession();
  const organization = __internal_useOrganizationBase();
  const subscriberType = useSubscriberTypeContext();
  const { planId, planPeriod, seatsQuantity, priceId } = useCheckoutContext();
  const userId = user?.id;
  const sessionId = session?.id;
  const clientId = clerk.client?.id;
  const subjectId = subscriberType === 'organization' ? organization?.id : userId;
  const secret = checkout.externalClientSecret;
  const identity = JSON.stringify([
    userId,
    sessionId,
    clientId,
    subscriberType,
    subjectId,
    planId,
    planPeriod,
    seatsQuantity,
    priceId,
    secret,
  ]);
  const current = useRef({ identity, version: 0 });
  if (current.current.identity !== identity) {
    current.current = { identity, version: current.current.version + 1 };
  }
  const owner = current.current;
  const mounted = useRef(true);
  useSafeLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  return {
    requestKey: JSON.stringify([identity, owner.version]),
    canRun: () =>
      mounted.current &&
      current.current === owner &&
      !!userId &&
      !!subjectId &&
      clerk.user?.id === userId &&
      clerk.session?.id === sessionId &&
      clerk.client?.id === clientId &&
      (subscriberType === 'organization' ? clerk.organization : clerk.user)?.id === subjectId &&
      checkout.externalClientSecret === secret,
  };
};
