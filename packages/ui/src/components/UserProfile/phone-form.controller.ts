import type { FormEvent } from 'react';
import { useEffect, useRef } from 'react';

import { localizationKeys } from '@/ui/customizables';
import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';
import { useFormControl } from '@/ui/utils/useFormControl';

import type { AddPhoneData, AddPhoneOptions, AddPhoneViewData } from './phone-form.types';

export const useAddPhoneController = (model: AddPhoneData, props: AddPhoneOptions): AddPhoneViewData => {
  const card = useCardState();
  const pending = useRef<Promise<void>>();
  const mounted = useRef(true);
  const current = useRef({ key: model.requestKey });
  if (current.current.key !== model.requestKey) {
    current.current = { key: model.requestKey };
  }
  const owner = current.current;
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      pending.current = undefined;
    };
  }, [model.requestKey]);
  const isCurrent = () => mounted.current && current.current === owner && (model.canRun?.() ?? true);
  const phoneField = useFormControl('phoneNumber', '', {
    type: 'tel',
    label: localizationKeys('formFieldLabel__phoneNumber'),
    isRequired: true,
  });

  const addPhone = (event: FormEvent) => {
    event.preventDefault();
    if (!isCurrent()) {
      return Promise.resolve();
    }
    if (pending.current) {
      return pending.current;
    }
    const request = model
      .createPhone(phoneField.value, isCurrent)
      .then(completed => {
        if (completed && isCurrent()) {
          props.onSuccess();
        }
      })
      .catch(error => {
        if (isCurrent()) {
          handleError(error, [phoneField], card.setError);
        }
      })
      .finally(() => {
        if (pending.current === request) {
          pending.current = undefined;
        }
      });
    pending.current = request;
    return request;
  };

  return {
    title: props.title,
    phoneField: { id: phoneField.id, props: phoneField.props },
    canSubmit: phoneField.value.length > 1 && model.username !== phoneField.value,
    hasExistingNumber: model.hasExistingNumber && !!props.onUseExistingNumberClick,
    onUseExistingNumberClick: props.onUseExistingNumberClick,
    onReset: props.onReset,
    addPhone,
  };
};
