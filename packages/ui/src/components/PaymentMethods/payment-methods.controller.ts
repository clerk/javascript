import { useEffect, useRef, useState } from 'react';

import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';

import { localizationKeys } from '../../customizables';
import { useActionContext } from '../../elements/Action/ActionRoot';
import type {
  AddPaymentMethodModel,
  AddPaymentMethodScreenData,
  PaymentMethodItem,
  PaymentMethodMenuData,
  PaymentMethodRowData,
  PaymentMethodsData,
  PaymentMethodsLocalizationRoot,
  PaymentMethodsModel,
  RemovePaymentMethodScreenData,
  RevalidatePaymentMethods,
} from './payment-methods.types';

export const useAddPaymentMethodController = (
  model: AddPaymentMethodModel,
  onSuccess: RevalidatePaymentMethods,
): AddPaymentMethodScreenData => {
  const { close } = useActionContext();
  const current = useRef({ scope: model.scope, active: true, generation: {} });
  if (current.current.scope !== model.scope) {
    current.current = { scope: model.scope, active: true, generation: {} };
  }
  const owner = current.current;
  useEffect(() => {
    owner.active = true;
    return () => {
      owner.active = false;
      owner.generation = {};
    };
  }, [owner]);
  const canRun = () => current.current === owner && owner.active;

  return {
    localizationRoot: model.localizationRoot,
    cancel: () => {
      if (canRun()) {
        close();
      }
    },
    onSuccess: async (context: { gateway: 'stripe'; paymentToken: string }, canContinue = () => true) => {
      const generation = owner.generation;
      const isCurrent = () => canRun() && owner.generation === generation && canContinue();
      if (!isCurrent() || !(await model.addPaymentMethod(context, isCurrent)) || !isCurrent()) {
        return;
      }
      if ((await onSuccess(isCurrent)) && isCurrent()) {
        close();
      }
    },
  };
};

export const useRemovePaymentMethodController = (
  paymentMethod: Pick<PaymentMethodItem, 'identifier' | 'remove'>,
  localizationRoot: PaymentMethodsLocalizationRoot,
  revalidate: RevalidatePaymentMethods,
): RemovePaymentMethodScreenData => {
  const { close } = useActionContext();
  const identifier = useRef(paymentMethod.identifier);
  const hasRemoved = useRef(false);
  const lifetime = useRef<object>();
  useEffect(() => {
    lifetime.current = {};
    return () => {
      lifetime.current = undefined;
    };
  }, []);

  return {
    identifier: identifier.current,
    localizationRoot,
    close,
    remove: async (canContinue = () => true) => {
      const generation = lifetime.current;
      const isCurrent = () => !!generation && lifetime.current === generation && canContinue();
      if (!isCurrent()) {
        return false;
      }
      if (!hasRemoved.current) {
        if (!(await paymentMethod.remove(isCurrent)) || !isCurrent()) {
          return false;
        }
        hasRemoved.current = true;
      }
      return (await revalidate(isCurrent)) && isCurrent();
    },
  };
};

export const usePaymentMethodsController = (model: PaymentMethodsModel): PaymentMethodsData => {
  const card = useCardState();
  const current = useRef({ scope: model.scope, pending: false, active: true, generation: {} });
  if (current.current.scope !== model.scope) {
    current.current = { scope: model.scope, pending: false, active: true, generation: {} };
  }
  const owner = current.current;
  const [pendingOwner, setPendingOwner] = useState<typeof owner>();
  useEffect(() => {
    owner.active = true;
    return () => {
      owner.active = false;
      owner.pending = false;
      owner.generation = {};
    };
  }, [owner]);

  const canOpen = () => current.current === owner && owner.active && !owner.pending;
  const makeDefault = (command: PaymentMethodItem['makeDefault']) => {
    if (!canOpen()) {
      return;
    }
    const generation = owner.generation;
    const isCurrent = () => current.current === owner && owner.active && owner.generation === generation;
    owner.pending = true;
    setPendingOwner(owner);
    card.setError(undefined);
    void (async () => {
      try {
        if ((await command(isCurrent)) && isCurrent()) {
          await model.revalidate(isCurrent);
        }
      } catch (error) {
        if (isCurrent()) {
          handleError(error as Error, [], card.setError);
        }
      } finally {
        if (isCurrent()) {
          owner.pending = false;
          setPendingOwner(undefined);
        }
      }
    })();
  };

  return {
    ...model,
    paymentMethods: model.paymentMethods.map(paymentMethod => ({
      ...paymentMethod,
      isPending: pendingOwner === owner,
      canOpen,
      makeDefault: () => makeDefault(paymentMethod.makeDefault),
    })),
  };
};

export const usePaymentMethodMenuController = (
  paymentMethod: PaymentMethodRowData,
  localizationRoot: PaymentMethodsLocalizationRoot,
): PaymentMethodMenuData => {
  const { open } = useActionContext();
  const actions: PaymentMethodMenuData['actions'] = [
    {
      label: localizationKeys(`${localizationRoot}.billingPage.paymentMethodsSection.actionLabel__remove`),
      isDestructive: true,
      onClick: () => {
        if (paymentMethod.canOpen() && paymentMethod.isRemovable) {
          open(`remove-${paymentMethod.id}`);
        }
      },
      isDisabled: paymentMethod.isPending || !paymentMethod.isRemovable,
    },
  ];
  if (!paymentMethod.isDefault) {
    actions.unshift({
      label: localizationKeys(`${localizationRoot}.billingPage.paymentMethodsSection.actionLabel__default`),
      isDestructive: false,
      onClick: paymentMethod.makeDefault,
      isDisabled: paymentMethod.isPending,
    });
  }
  return { actions };
};
