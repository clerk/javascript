import { useMemo, useRef } from 'react';

import { Confirmation } from '../../blocks/confirmation';
import { Section } from '../../components/section';
import { useListRemovalFocus } from '../../hooks/useListRemovalFocus';
import { fill, useMessages } from '../../localization';
import { UserProfileConnectedAccountRowView } from './user-profile-connected-account-row.view';

export interface UserProfileConnectionProvider {
  id: string;
  provider: string;
  iconUrl?: string;
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
  onConnect?: (id: string) => void;
  onReconnect?: (id: string) => void;
  onRemove?: (id: string) => void | Promise<void>;
}

export function UserProfileConnectedAccountsSectionView({
  accounts,
  fallbackFocus,
  availableProviders = [],
  onConnect,
  onReconnect,
  onRemove,
}: UserProfileConnectedAccountsSectionViewProps) {
  const m = useMessages('userProfileConnectedAccounts');
  const section = useRef<HTMLElement>(null);
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

  return (
    <>
      {hasRows ? (
        <Section.Root
          ref={section}
          tabIndex={-1}
        >
          <Section.Group>
            <Section.Title>{m.title}</Section.Title>
            <Section.Surface>
              {accounts.map(account => (
                <UserProfileConnectedAccountRowView
                  key={account.id}
                  account={account}
                  triggerRef={removalFocus.registerTrigger(account.id)}
                  onReconnect={onReconnect}
                  onRemove={onRemove ? account => removeAccount.open(account) : undefined}
                />
              ))}
              {onConnect
                ? availableProviders.map(provider => (
                    <UserProfileConnectedAccountRowView
                      key={provider.id}
                      account={provider}
                      onConnect={onConnect}
                    />
                  ))
                : null}
            </Section.Surface>
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
        />
      ) : null}
    </>
  );
}
