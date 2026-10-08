import type React from 'react';
import { useEffect, useRef } from 'react';

import { useCardState } from '@/elements/contexts';
import { localizationKeys } from '@/ui/customizables';
import { handleError } from '@/ui/utils/errorHandler';
import { useFormControl } from '@/ui/utils/useFormControl';

import type { SmsCodeFlowModel } from './sms-code-flow.types';

export const useSmsAddPhoneController = (model: SmsCodeFlowModel, onSuccess: () => void, onReset: () => void) => {
  const card = useCardState();
  const latest = useRef({ model, onSuccess, onReset, card });
  latest.current = { model, onSuccess, onReset, card };
  const mounted = useRef(true);
  const pending = useRef<Promise<void>>();
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const canRun = () => mounted.current && latest.current.model.canRun();
  const phoneField = useFormControl('phoneNumber', '', {
    type: 'tel',
    label: localizationKeys('formFieldLabel__phoneNumber'),
    isRequired: true,
  });

  const addPhone = (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    if (!canRun() || !latest.current.model.hasUser) {
      return Promise.resolve();
    }
    if (pending.current) {
      return pending.current;
    }
    const phoneNumber = phoneField.value;
    const action = Promise.resolve()
      .then(async () => {
        if (!canRun()) {
          return;
        }
        try {
          if ((await latest.current.model.createPhone(phoneNumber, canRun)) && canRun()) {
            latest.current.onSuccess();
          }
        } catch (error) {
          if (canRun()) {
            handleError(error as Error, [phoneField], latest.current.card.setError);
          }
        }
      })
      .finally(() => {
        if (pending.current === action) {
          pending.current = undefined;
        }
      });
    pending.current = action;
    return action;
  };

  return {
    phoneField,
    error: card.error,
    canSubmit: phoneField.value.length > 1 && model.username !== phoneField.value,
    addPhone,
    onReset: () => {
      if (canRun() && !pending.current && !latest.current.card.isLoading) {
        latest.current.onReset();
      }
    },
  };
};
