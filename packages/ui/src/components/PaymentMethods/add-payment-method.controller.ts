import type { FormEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';

import { localizationKeys } from '../../customizables';
import type { LocalizationKey } from '../../localization';
import type {
  AddPaymentMethodContextData,
  AddPaymentMethodFormData,
  AddPaymentMethodFormModel,
  AddPaymentMethodProps,
} from './add-payment-method.types';

export const useAddPaymentMethodRootController = (
  props: Pick<AddPaymentMethodProps, 'onSuccess' | 'cancelAction'> & { hasCheckout: boolean; requestKey: string },
): AddPaymentMethodContextData => {
  const card = useCardState();
  const setError = useRef(card.setError);
  setError.current = card.setError;
  useEffect(() => {
    setError.current(undefined);
  }, [props.requestKey]);
  const [headerTitle, setHeaderTitle] = useState<LocalizationKey | undefined>(undefined);
  const [headerSubtitle, setHeaderSubtitle] = useState<LocalizationKey | undefined>(undefined);
  const [submitLabel, setSubmitLabel] = useState<LocalizationKey | undefined>(undefined);

  return {
    headerTitle,
    headerSubtitle,
    submitLabel,
    setHeaderTitle,
    setHeaderSubtitle,
    setSubmitLabel,
    hasCheckout: props.hasCheckout,
    onSuccess: props.onSuccess,
    cancelAction: props.cancelAction,
  };
};

export const useAddPaymentMethodFormController = (model: AddPaymentMethodFormModel): AddPaymentMethodFormData => {
  const card = useCardState();
  const mounted = useRef(true);
  const latest = useRef(model);
  latest.current = model;
  const current = useRef({
    key: model.requestKey,
    generation: {},
    pending: null as Promise<void> | null,
  });
  if (current.current.key !== model.requestKey) {
    current.current = { key: model.requestKey, generation: {}, pending: null };
  }
  const owner = current.current;
  const canRun = () => mounted.current && current.current === owner && latest.current.canRun();
  const cancelPending = useCallback(() => {
    owner.generation = {};
    owner.pending = null;
  }, [owner]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      cancelPending();
    };
  }, [cancelPending]);

  const submit = async (origin: object) => {
    const isCurrent = () => canRun() && owner.generation === origin;
    const source = latest.current;
    let shouldReset = false;
    let failed = false;
    try {
      const result = await source.submit(isCurrent);
      if (!isCurrent()) {
        return;
      }
      if (result.status === 'error') {
        card.setError(result.message);
      }
      if (result.status !== 'ready') {
        return;
      }
      shouldReset = true;
      await source.complete(isCurrent);
    } catch (error) {
      failed = true;
      if (isCurrent()) {
        handleError(error as Error, [], card.setError);
      }
    } finally {
      try {
        if (shouldReset && isCurrent()) {
          await source.reset(isCurrent);
        }
      } catch (error) {
        if (!failed && isCurrent()) {
          handleError(error as Error, [], card.setError);
        }
      }
    }
  };

  return {
    requestKey: model.requestKey,
    headerTitle: model.headerTitle,
    headerSubtitle: model.headerSubtitle,
    submitLabel:
      model.submitLabel ??
      localizationKeys(`${model.localizationRoot}.billingPage.paymentMethodsSection.formButtonPrimary__add`),
    cancelAction: model.cancelAction
      ? () => {
          if (canRun()) {
            cancelPending();
            latest.current.cancelAction?.();
          }
        }
      : undefined,
    hasCheckout: model.hasCheckout,
    isProviderReady: model.isProviderReady,
    isFormReady: model.isFormReady,
    error: card.error,
    onSubmit: (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!canRun()) {
        return Promise.resolve();
      }
      if (owner.pending) {
        return owner.pending;
      }
      if (!latest.current.isFormReady) {
        return Promise.resolve();
      }
      card.setError(undefined);
      const origin = owner.generation;
      const pending = submit(origin).finally(() => {
        if (owner.pending === pending) {
          owner.pending = null;
        }
      });
      owner.pending = pending;
      return pending;
    },
  };
};
