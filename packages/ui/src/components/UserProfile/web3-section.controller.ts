import { useState } from 'react';

import { localizationKeys } from '@/ui/customizables';
import { useActionContext } from '@/ui/elements/Action/ActionRoot';
import { useCardState } from '@/ui/elements/contexts';
import type { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';
import type { PropsOfComponent } from '@/ui/styledSystem';
import { handleError } from '@/ui/utils/errorHandler';

import type { useWeb3WalletMenuModel } from './web3-section.model';

export const useWeb3SectionController = () => {
  const card = useCardState();
  const [actionValue, setActionValue] = useState<string | null>(null);

  return { error: card.error, actionValue, setActionValue };
};

export const useWeb3WalletMenuController = (
  model: ReturnType<typeof useWeb3WalletMenuModel>,
  walletId: string,
  isVerified: boolean,
) => {
  const card = useCardState();
  const { open } = useActionContext();

  const actions = (
    [
      // Only allow setting as primary if the wallet is verified and not already primary
      !model.isPrimary && isVerified
        ? {
            label: localizationKeys('userProfile.start.web3WalletsSection.detailsAction__nonPrimary'),
            onClick: () => {
              model.setPrimary().catch(error => handleError(error, [], card.setError));
            },
          }
        : null,
      {
        label: localizationKeys('userProfile.start.web3WalletsSection.destructiveAction'),
        isDestructive: true,
        onClick: () => open(`remove-${walletId}`),
      },
    ] satisfies (PropsOfComponent<typeof ThreeDotsMenu>['actions'][0] | null)[]
  ).filter(action => action !== null) as PropsOfComponent<typeof ThreeDotsMenu>['actions'];

  return { actions };
};
