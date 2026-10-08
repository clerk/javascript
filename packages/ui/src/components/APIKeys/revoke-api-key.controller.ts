import type { FormEvent } from 'react';
import { useEffect, useRef } from 'react';

import { useCardState } from '@/ui/elements/contexts';
import { localizationKeys } from '@/ui/localization';
import { handleError } from '@/ui/utils/errorHandler';
import { useFormControl } from '@/ui/utils/useFormControl';

import type { RevokeAPIKeyConfirmationModalProps, RevokeAPIKeyData, RevokeAPIKeyModel } from './api-keys.types';

export const useRevokeAPIKeyController = (
  model: RevokeAPIKeyModel,
  props: RevokeAPIKeyConfirmationModalProps,
): RevokeAPIKeyData => {
  const card = useCardState();
  const latest = useRef({ model, props, card });
  latest.current = { model, props, card };
  const scopeKey = useRef(model.scopeKey);
  const mounted = useRef(true);
  const pending = useRef<Promise<void>>();
  const finished = useRef(false);
  useEffect(() => {
    mounted.current = true;
    if (latest.current.props.isOpen) {
      latest.current.card.setError(undefined);
    }
    return () => {
      mounted.current = false;
    };
  }, []);
  const canRun = () =>
    mounted.current &&
    !finished.current &&
    latest.current.props.isOpen &&
    latest.current.model.scopeKey === scopeKey.current &&
    latest.current.model.canRun();
  const revokeField = useFormControl('apiKeyRevokeConfirmation', '', {
    type: 'text',
    label: localizationKeys('apiKeys.revokeConfirmation.inputLabel'),
    placeholder: localizationKeys('apiKeys.revokeConfirmation.confirmationText'),
    isRequired: true,
  });
  const canSubmit = revokeField.value === model.confirmationText;
  const close = () => {
    finished.current = true;
    latest.current.props.onClose();
    revokeField.setValue('');
  };
  const handleClose = () => {
    if (canRun() && !pending.current && !latest.current.card.isLoading) {
      close();
    }
  };
  const handleSubmit = (event: FormEvent): Promise<void> => {
    event.preventDefault();
    if (!canRun() || !props.apiKeyID || !canSubmit) {
      return Promise.resolve();
    }
    if (pending.current) {
      return pending.current;
    }
    const apiKeyID = props.apiKeyID;
    const isCurrent = () => canRun() && latest.current.props.apiKeyID === apiKeyID;
    latest.current.card.setError(undefined);
    const action = Promise.resolve()
      .then(async () => {
        if (!isCurrent()) {
          return;
        }
        try {
          if (!(await latest.current.model.revoke(apiKeyID, isCurrent)) || !isCurrent()) {
            return;
          }
          await latest.current.props.onRevokeSuccess?.();
          if (isCurrent()) {
            close();
          }
        } catch (error) {
          if (isCurrent()) {
            handleError(error as Error, [revokeField], latest.current.card.setError);
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
    isOpen: props.isOpen,
    onOpen: () => {
      if (canRun()) {
        latest.current.props.onOpen();
      }
    },
    handleClose,
    apiKeyName: props.apiKeyName,
    modalRoot: props.modalRoot,
    revokeField: { id: revokeField.id, props: revokeField.props },
    canSubmit,
    handleSubmit,
  };
};
