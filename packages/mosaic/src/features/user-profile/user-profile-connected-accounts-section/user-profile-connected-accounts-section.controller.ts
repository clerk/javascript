import type { Ref } from 'react';
import { useRef } from 'react';

import type { ConfirmController } from '../../../blocks/confirm';
import { useConfirmController } from '../../../blocks/confirm';
import type { DialogFocusTarget } from '../../../components/dialog';
import { usePanelTitle } from '../../../components/panel';
import { useListRemovalFocus } from '../../../hooks/use-list-removal-focus';
import { usePendingAction } from '../../../hooks/use-pending-action';
import { useMessages } from '../../../localization';
import type { ReverificationController } from '../../reverification';
import type {
  ConnectedAccountActionResult,
  UserProfileConnectedAccount,
  UserProfileConnectionProvider,
} from './user-profile-connected-accounts-section.types';

export interface UserProfileConnectedAccountsControllerOptions {
  accounts: UserProfileConnectedAccount[];
  availableProviders: UserProfileConnectionProvider[];
  onConnect: (id: string) => Promise<ConnectedAccountActionResult>;
  onReconnect: (id: string) => Promise<ConnectedAccountActionResult>;
  onRemove?: (id: string) => void | Promise<void>;
  reverification: ReverificationController;
}

export interface UserProfileConnectedAccountsController {
  accounts: UserProfileConnectedAccount[];
  availableProviders: UserProfileConnectionProvider[];
  pendingId: string | undefined;
  onConnect: (id: string) => void;
  onReconnect: (id: string) => void;
  sectionRef: Ref<HTMLDivElement>;
  registerTrigger: (id: string) => Ref<HTMLButtonElement>;
  remove: ConfirmController<UserProfileConnectedAccount> | undefined;
  finalFocus: DialogFocusTarget;
}

const OAUTH_REDIRECT_HOLD_MS = 2000;

export function useUserProfileConnectedAccountsController({
  accounts,
  availableProviders,
  onConnect,
  onReconnect,
  onRemove,
  reverification,
}: UserProfileConnectedAccountsControllerOptions): UserProfileConnectedAccountsController {
  const messages = useMessages('userProfileConnectedAccounts');
  const actions = usePendingAction({ errorFallback: messages.errors.generic });
  const sectionRef = useRef<HTMLDivElement>(null);
  const panelTitle = usePanelTitle();
  const removalFocus = useListRemovalFocus({
    ids: accounts.map(account => account.id),
    onRemove,
    fallback: () =>
      sectionRef.current?.querySelector<HTMLButtonElement>('button:not([disabled])') ??
      sectionRef.current ??
      panelTitle(),
  });
  const remove = useConfirmController<UserProfileConnectedAccount>({
    onConfirm: account => removalFocus.remove(account.id),
    reverification,
  });

  const run = (id: string, action: (id: string) => Promise<ConnectedAccountActionResult>) =>
    void actions.run(id, async () => {
      if ((await action(id)) === 'redirecting') {
        await new Promise(resolve => setTimeout(resolve, OAUTH_REDIRECT_HOLD_MS));
      }
    });

  return {
    accounts: accounts.map(account =>
      actions.errorKey === account.id ? { ...account, reconnectError: actions.error } : account,
    ),
    availableProviders: availableProviders.map(provider =>
      actions.errorKey === provider.id ? { ...provider, connectError: actions.error } : provider,
    ),
    pendingId: actions.pendingKey,
    onConnect: id => run(id, onConnect),
    onReconnect: id => run(id, onReconnect),
    sectionRef,
    registerTrigger: removalFocus.registerTrigger,
    remove: onRemove ? remove : undefined,
    finalFocus: removalFocus.finalFocus,
  };
}
