import { useEffect, useRef, useState } from 'react';

import { localizationKeys } from '@/ui/customizables';
import { useActionContext } from '@/ui/elements/Action/ActionRoot';
import { useCardState } from '@/ui/elements/contexts';
import type { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';
import type { PropsOfComponent } from '@/ui/styledSystem';
import { handleError } from '@/ui/utils/errorHandler';

import type { useConnectedAccountModel } from './connected-accounts-section.model';

export const useConnectedAccountsSectionController = () => {
  const card = useCardState();
  const [actionValue, setActionValue] = useState<string | null>(null);

  return { error: card.error, actionValue, setActionValue, closeAction: () => setActionValue(null) };
};

export const useConnectedAccountController = (model: ReturnType<typeof useConnectedAccountModel>) => {
  const card = useCardState();
  const { open } = useActionContext();
  const pending = useRef<Promise<void>>();
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      pending.current = undefined;
    };
  }, [model.requestKey]);
  const isCurrent = () => mounted.current && model.canRun();

  const reconnect = () => {
    if (!isCurrent()) {
      return Promise.resolve();
    }
    if (pending.current) {
      return pending.current;
    }
    const request = model
      .reconnect()
      .then(() => undefined)
      .catch(error => {
        if (isCurrent()) {
          handleError(error, [], card.setError);
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

  const actions = [
    {
      label: localizationKeys('userProfile.start.connectedAccountsSection.destructiveActionTitle'),
      isDestructive: true,
      onClick: () => {
        if (isCurrent()) {
          open(`remove-${model.id}`);
        }
      },
    },
  ] satisfies PropsOfComponent<typeof ThreeDotsMenu>['actions'];

  return {
    id: model.id,
    provider: model.provider,
    providerName: model.providerName,
    providerIconUrl: model.providerIconUrl,
    label: model.label,
    fallbackErrorMessage: model.fallbackErrorMessage,
    hasErrorCode: model.hasErrorCode,
    shouldDisplayReconnect: model.shouldDisplayReconnect,
    reconnect,
    actions,
  };
};
