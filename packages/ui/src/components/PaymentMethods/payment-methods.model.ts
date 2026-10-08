import { ClerkRuntimeError } from '@clerk/shared/error';
import {
  __internal_useOrganizationBase,
  useClerk,
  useSafeLayoutEffect,
  useSession,
  useUser,
} from '@clerk/shared/react';
import { useRef } from 'react';

import { usePaymentMethods, useSubscriberTypeContext, useSubscriberTypeLocalizationRoot } from '../../contexts';
import { projectPaymentMethodPreview } from './payment-methods.layout';
import type { AddPaymentMethodModel, PaymentMethodsModel, PaymentToken } from './payment-methods.types';

function requireBillingSubject<Resource extends { id: string }>(
  resource: Resource | null | undefined,
  subject: string | undefined,
  actor: string | undefined,
  currentActor: string | undefined,
): Resource {
  if (!actor || actor !== currentActor || !subject || resource?.id !== subject) {
    throw new ClerkRuntimeError('The active billing account has changed. Open the payment form again.', {
      code: 'billing_subject_changed',
    });
  }
  return resource;
}

const usePaymentSubjectModel = () => {
  const clerk = useClerk();
  const subscriberType = useSubscriberTypeContext();
  const localizationRoot = useSubscriberTypeLocalizationRoot();
  const { user } = useUser();
  const organization = __internal_useOrganizationBase();
  const resource = subscriberType === 'organization' ? organization : user;
  const subject = resource?.id;
  const actor = user?.id;
  const { session } = useSession();
  const sessionId = session?.id;
  const clientId = clerk.client?.id;
  const identity = JSON.stringify([actor, sessionId, clientId, subscriberType, subject]);
  const current = useRef({ identity, clerk, version: 0, generation: {} });
  if (current.current.identity !== identity || current.current.clerk !== clerk) {
    current.current = { identity, clerk, version: current.current.version + 1, generation: {} };
  }
  const owner = current.current;
  const mounted = useRef(true);
  useSafeLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      owner.generation = {};
    };
  }, [owner]);
  const requireCurrentSubject = () =>
    requireBillingSubject(
      subscriberType === 'organization' ? clerk.organization : clerk.user,
      subject,
      actor,
      clerk.user?.id,
    );
  const createGuard = (canContinue: () => boolean) => {
    const generation = owner.generation;
    return () =>
      mounted.current &&
      current.current === owner &&
      owner.generation === generation &&
      !!actor &&
      clerk.user?.id === actor &&
      !!subject &&
      (subscriberType === 'organization' ? clerk.organization : clerk.user)?.id === subject &&
      clerk.session?.id === sessionId &&
      clerk.client?.id === clientId &&
      canContinue();
  };

  return {
    resource,
    scope: JSON.stringify([identity, owner.version]),
    subject,
    subscriberType,
    localizationRoot,
    requireCurrentSubject,
    createGuard,
  };
};

export const usePaymentMethodsModel = (): PaymentMethodsModel => {
  const { resource, scope, subject, subscriberType, localizationRoot, requireCurrentSubject, createGuard } =
    usePaymentSubjectModel();
  const { data: paymentMethods, isLoading, revalidate } = usePaymentMethods({ keepPreviousData: false });
  const latest = useRef<{ paymentMethods: typeof paymentMethods; revalidate: typeof revalidate }>();
  latest.current = { paymentMethods, revalidate };
  useSafeLayoutEffect(() => {
    latest.current = { paymentMethods, revalidate };
    return () => {
      latest.current = undefined;
    };
  }, [scope]);
  const sortedPaymentMethods = [...paymentMethods].sort(
    (a, b) => Number(Boolean(b.isDefault)) - Number(Boolean(a.isDefault)),
  );

  const run = async (id: string, action: 'remove' | 'makeDefault', canContinue: () => boolean) => {
    if (!canContinue()) {
      return false;
    }
    requireCurrentSubject();
    const isCurrent = createGuard(canContinue);
    const target = latest.current?.paymentMethods.find(item => item.id === id);
    if (!isCurrent() || !target) {
      return false;
    }
    try {
      await target[action]({ orgId: subscriberType === 'organization' ? subject : undefined });
      return isCurrent();
    } catch (error) {
      if (isCurrent()) {
        throw error;
      }
      return false;
    }
  };

  return {
    subject,
    scope,
    isVisible: !!resource && (!__BUILD_DISABLE_RHC__ || sortedPaymentMethods.length > 0),
    canAdd: !__BUILD_DISABLE_RHC__,
    localizationRoot,
    isLoading,
    paymentMethods: sortedPaymentMethods.map(paymentMethod => {
      const id = paymentMethod.id;
      return {
        id: paymentMethod.id,
        ...projectPaymentMethodPreview(paymentMethod),
        identifier: `${paymentMethod.paymentType === 'card' ? paymentMethod.cardType : paymentMethod.paymentType} ${paymentMethod.paymentType === 'card' ? `⋯ ${paymentMethod.last4}` : '-'}`,
        isRemovable: paymentMethod.isRemovable,
        remove: (canContinue = () => true) => run(id, 'remove', canContinue),
        makeDefault: (canContinue = () => true) => run(id, 'makeDefault', canContinue),
      };
    }),
    revalidate: async (canContinue = () => true) => {
      const isCurrent = createGuard(canContinue);
      if (!isCurrent() || !latest.current) {
        return false;
      }
      try {
        await latest.current.revalidate();
        return isCurrent();
      } catch (error) {
        if (isCurrent()) {
          throw error;
        }
        return false;
      }
    },
  };
};

export const useAddPaymentMethodModel = (): AddPaymentMethodModel => {
  const { scope, localizationRoot, requireCurrentSubject, createGuard } = usePaymentSubjectModel();

  return {
    scope,
    localizationRoot,
    addPaymentMethod: async (context: PaymentToken, canContinue = () => true) => {
      if (!canContinue()) {
        return false;
      }
      const resource = requireCurrentSubject();
      const isCurrent = createGuard(canContinue);
      if (!isCurrent()) {
        return false;
      }
      try {
        await resource.addPaymentMethod(context);
        return isCurrent();
      } catch (error) {
        if (isCurrent()) {
          throw error;
        }
        return false;
      }
    },
  };
};
