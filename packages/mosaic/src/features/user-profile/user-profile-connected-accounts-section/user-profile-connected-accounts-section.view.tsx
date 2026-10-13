import { useMemo, useRef } from 'react';

import { Confirmation } from '../../../blocks/confirmation';
import { Section } from '../../../components/section';
import { useListRemovalFocus } from '../../../hooks/use-list-removal-focus';
import { fill, useMessages } from '../../../localization';
import {
  UserProfileConnectedAccountRowView,
  UserProfileConnectProviderRowView,
} from './user-profile-connected-account-row.view';
import type {
  UserProfileConnectedAccount,
  UserProfileConnectedAccountsSectionViewProps,
} from './user-profile-connected-accounts-section.types';

export type {
  UserProfileConnectedAccount,
  UserProfileConnectedAccountsSectionViewProps,
  UserProfileConnectionProvider,
} from './user-profile-connected-accounts-section.types';

export function UserProfileConnectedAccountsSectionView({
  accounts,
  fallbackFocus,
  availableProviders = [],
  pendingId,
  onConnect,
  onReconnect,
  onRemove,
}: UserProfileConnectedAccountsSectionViewProps) {
  const m = useMessages('userProfileConnectedAccounts');
  const section = useRef<HTMLDivElement>(null);
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

  return (
    <>
      {hasRows ? (
        <Section.Root>
          <Section.Group
            ref={section}
            tabIndex={-1}
          >
            <Section.Header>
              <Section.Content>
                <Section.Title>{m.title}</Section.Title>
              </Section.Content>
            </Section.Header>
            <Section.Body>
              {accounts.map(account => (
                <UserProfileConnectedAccountRowView
                  key={account.id}
                  account={account}
                  triggerRef={removalFocus.registerTrigger(account.id)}
                  isDisabled={isBusy}
                  onReconnect={onReconnect}
                  onRemove={onRemove ? account => removeAccount.open(account) : undefined}
                />
              ))}
              {onConnect
                ? availableProviders.map(provider => (
                    <UserProfileConnectProviderRowView
                      key={provider.id}
                      provider={provider}
                      isPending={pendingId === provider.id}
                      isDisabled={isBusy}
                      onConnect={onConnect}
                    />
                  ))
                : null}
            </Section.Body>
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
