import { useMemo, useRef } from 'react';

import { Confirmation } from '../../blocks/confirmation';
import { Section } from '../../components/section';
import { useListRemovalFocus } from '../../hooks/useListRemovalFocus';
import { fill, useMessages } from '../../localization';
import type { ReverificationController } from '../reverification';
import { UserProfileConnectedAccountRowView } from './user-profile-connected-account-row.view';
import { UserProfileConnectedAccountsReverificationDialog } from './user-profile-connected-accounts-reverification.dialog';

export interface UserProfileConnectionProvider {
  id: string;
  provider: string;
  iconUrl?: string;
  monochromeIcon?: boolean;
  connectError?: string;
}

export interface UserProfileConnectedAccount extends UserProfileConnectionProvider {
  identifier?: string;
  canRemove?: boolean;
  status?: 'connected' | 'reconnect' | 'error';
  verificationError?: string;
  reconnectError?: string;
}

export interface UserProfileConnectedAccountsSectionViewProps {
  fallbackFocus?: () => HTMLElement | null;
  accounts: UserProfileConnectedAccount[];
  availableProviders?: UserProfileConnectionProvider[];
  pendingId?: string;
  connectReverification?: ReverificationController;
  removeReverification?: ReverificationController;
  onConnect?: (id: string) => void;
  onReconnect?: (id: string) => void;
  onRemove?: (id: string) => void | Promise<void>;
}

export function UserProfileConnectedAccountsSectionView({
  accounts,
  fallbackFocus,
  availableProviders = [],
  pendingId,
  connectReverification,
  removeReverification,
  onConnect,
  onReconnect,
  onRemove,
}: UserProfileConnectedAccountsSectionViewProps) {
  const m = useMessages('userProfileConnectedAccounts');
  const section = useRef<HTMLElement>(null);
  const actionTriggers = useRef(new Map<string, HTMLButtonElement>());
  const lastActionId = useRef<string | undefined>(undefined);
  const removalFocus = useListRemovalFocus({
    ids: accounts.map(account => account.id),
    onRemove,
    fallback: () =>
      section.current?.querySelector<HTMLButtonElement>('button:not([disabled])') ??
      section.current ??
      fallbackFocus?.() ??
      null,
  });
  const removeAccount = useMemo(() => Confirmation.createHandle<UserProfileConnectedAccount>(), []);
  const hasRows = accounts.length > 0 || (availableProviders.length > 0 && Boolean(onConnect));
  const isBusy = pendingId !== undefined;

  const registerActionTrigger = (id: string) => (element: HTMLButtonElement | null) => {
    if (element) {
      actionTriggers.current.set(id, element);
    } else {
      actionTriggers.current.delete(id);
    }
  };

  const reverificationFinalFocus = () => {
    const id = lastActionId.current;
    if (!id) {
      return true;
    }
    return actionTriggers.current.get(id) ?? true;
  };

  const handleConnect = onConnect
    ? (id: string) => {
        lastActionId.current = id;
        onConnect(id);
      }
    : undefined;

  const handleReconnect = onReconnect
    ? (id: string) => {
        lastActionId.current = id;
        onReconnect(id);
      }
    : undefined;

  return (
    <>
      {hasRows ? (
        <Section.Root
          ref={section}
          tabIndex={-1}
        >
          <Section.Title>{m.title}</Section.Title>
          <Section.Group>
            {accounts.map(account => (
              <UserProfileConnectedAccountRowView
                key={account.id}
                account={account}
                triggerRef={element => {
                  removalFocus.registerTrigger(account.id)(element);
                  registerActionTrigger(account.id)(element);
                }}
                isDisabled={isBusy}
                onReconnect={handleReconnect}
                onRemove={onRemove ? account => removeAccount.open(account) : undefined}
              />
            ))}
            {handleConnect
              ? availableProviders.map(provider => (
                  <UserProfileConnectedAccountRowView
                    key={provider.id}
                    account={provider}
                    triggerRef={registerActionTrigger(provider.id)}
                    isPending={pendingId === provider.id}
                    isDisabled={isBusy}
                    onConnect={handleConnect}
                  />
                ))
              : null}
          </Section.Group>
        </Section.Root>
      ) : null}
      {onRemove ? (
        <Confirmation
          handle={removeAccount}
          title={m.removeDialog.title}
          description={account => fill(m.removeDialog.description, { provider: account.provider })}
          actionLabel={m.removeDialog.confirm}
          cancelLabel={m.removeDialog.cancel}
          finalFocus={removalFocus.finalFocus}
          onConfirm={account => removalFocus.remove(account.id)}
          reverification={removeReverification}
        />
      ) : null}
      {connectReverification ? (
        <UserProfileConnectedAccountsReverificationDialog
          reverification={connectReverification}
          finalFocus={reverificationFinalFocus}
        />
      ) : null}
    </>
  );
}
