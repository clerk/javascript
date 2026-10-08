import { useEffect, useRef } from 'react';

import { localizationKeys } from '@/ui/customizables';
import { useActionContext } from '@/ui/elements/Action/ActionRoot';
import { useClipboard } from '@/ui/hooks';
import { useFormControl } from '@/ui/utils/useFormControl';

import type { CopyAPIKeyData, CopyAPIKeyModalProps } from './api-keys.types';

export const useCopyAPIKeyController = (model: CopyAPIKeyModalProps): CopyAPIKeyData => {
  const { onCopy } = useClipboard(model.apiKeySecret);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(
    () => () => {
      if (closeTimer.current !== undefined) {
        clearTimeout(closeTimer.current);
      }
    },
    [model.apiKeySecret],
  );
  const apiKeyField = useFormControl('apiKeySecret', model.apiKeySecret, {
    type: 'text',
    label: localizationKeys('formFieldLabel__apiKey'),
    isRequired: false,
  });
  const { close: closeActionCard } = useActionContext();

  const handleSubmit = () => {
    onCopy();
    model.onClose();
    if (closeTimer.current !== undefined) {
      clearTimeout(closeTimer.current);
    }
    closeTimer.current = setTimeout(() => {
      closeActionCard();
    }, 100);
  };

  return {
    isOpen: model.isOpen,
    onOpen: model.onOpen,
    onClose: model.onClose,
    apiKeyName: model.apiKeyName,
    apiKeySecret: model.apiKeySecret,
    modalRoot: model.modalRoot,
    apiKeyFieldProps: apiKeyField.props,
    handleSubmit,
  };
};
