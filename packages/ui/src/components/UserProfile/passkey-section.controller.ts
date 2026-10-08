import type { FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';

import { localizationKeys, useLocalizations } from '@/ui/customizables';
import { useActionContext } from '@/ui/elements/Action/ActionRoot';
import { useCardState } from '@/ui/elements/contexts';
import type { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';
import type { PropsOfComponent } from '@/ui/styledSystem';
import { handleError } from '@/ui/utils/errorHandler';
import { getRelativeToNowDateKey } from '@/ui/utils/getRelativeToNowDateKey';
import { useFormControl } from '@/ui/utils/useFormControl';

import type { PasskeyRow, useAddPasskeyModel, usePasskeyModel } from './passkey-section.model';

export const useUpdatePasskeyController = (
  model: ReturnType<typeof usePasskeyModel>,
  props: { onSuccess: () => void; onReset: () => void },
) => {
  const card = useCardState();
  const mounted = useRef(true);
  const pending = useRef<Promise<void>>();
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const isCurrent = () => mounted.current && model.canRun();
  const passkeyNameField = useFormControl('passkeyName', model.name, {
    type: 'text',
    label: localizationKeys('formFieldLabel__passkeyName'),
    isRequired: true,
  });

  const canSubmit = passkeyNameField.value.length > 1 && model.originalName !== passkeyNameField.value;

  const renamePasskey = (event: FormEvent) => {
    event.preventDefault();
    if (!isCurrent()) {
      return Promise.resolve();
    }
    if (pending.current) {
      return pending.current;
    }
    const request = model
      .updateName(passkeyNameField.value)
      .then(completed => {
        if (completed && isCurrent()) {
          props.onSuccess();
        }
      })
      .catch(error => {
        if (isCurrent()) {
          handleError(error, [passkeyNameField], card.setError);
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
    passkeyNameField: { id: passkeyNameField.id, props: passkeyNameField.props },
    canSubmit,
    renamePasskey,
    onReset: () => {
      if (isCurrent()) {
        props.onReset();
      }
    },
  };
};

export const usePasskeySectionController = () => {
  const [actionValue, setActionValue] = useState<string | null>(null);
  return { actionValue, setActionValue, closeAction: () => setActionValue(null) };
};

export const usePasskeyItemController = (model: PasskeyRow) => {
  const { t } = useLocalizations();
  const { open } = useActionContext();
  const actions = [
    {
      label: localizationKeys('userProfile.start.passkeysSection.menuAction__rename'),
      onClick: () => open(`rename-${model.id}`),
    },
    {
      label: localizationKeys('userProfile.start.passkeysSection.menuAction__destructive'),
      isDestructive: true,
      onClick: () => open(`remove-${model.id}`),
    },
  ] satisfies PropsOfComponent<typeof ThreeDotsMenu>['actions'];

  return {
    id: model.id,
    name: model.name,
    createdAt: t(getRelativeToNowDateKey(model.createdAt)),
    hasLastUsedAt: !!model.lastUsedAt,
    lastUsedAt: model.lastUsedAt ? t(getRelativeToNowDateKey(model.lastUsedAt)) : undefined,
    actions,
  };
};

export const useAddPasskeyController = (model: ReturnType<typeof useAddPasskeyModel>, onClick?: () => void) => {
  const card = useCardState();
  const [pendingKey, setPendingKey] = useState<string>();
  const pending = useRef<Promise<void>>();
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    pending.current = undefined;
    return () => {
      mounted.current = false;
      pending.current = undefined;
    };
  }, [model.requestKey]);
  const isCurrent = () => mounted.current && model.canRun();
  const handleCreatePasskey = () => {
    if (!isCurrent() || !model.hasUser) {
      return Promise.resolve();
    }
    if (pending.current) {
      return pending.current;
    }
    onClick?.();
    card.setError(undefined);
    setPendingKey(model.requestKey);
    const request = model
      .createPasskey()
      .then(() => undefined)
      .catch(error => {
        if (isCurrent()) {
          handleError(error, [], card.setError);
        }
      })
      .finally(() => {
        if (pending.current === request) {
          pending.current = undefined;
          if (mounted.current) {
            setPendingKey(undefined);
          }
        }
      });
    pending.current = request;
    return request;
  };
  return { isSatellite: model.isSatellite, isLoading: pendingKey === model.requestKey, handleCreatePasskey };
};
