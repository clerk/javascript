import { useMemo, useRef } from 'react';

import { Confirmation } from '../../../blocks/confirmation';
import { Section } from '../../../components/section';
import { useListRemovalFocus } from '../../../hooks/use-list-removal-focus';
import { useProviderRows } from '../../../hooks/use-provider-rows';
import { fill, useMessages } from '../../../localization';
import { UserProfileConnectedAccountRowView } from './user-profile-connected-account-row.view';
import type {
  UserProfileConnectedAccount,
  UserProfileConnectedAccountsSectionViewProps,
  UserProfileConnectionProvider,
} from './user-profile-connected-accounts-section.types';

export type {
  UserProfileConnectedAccount,
  UserProfileConnectedAccountsSectionViewProps,
  UserProfileConnectionProvider,
} from './user-profile-connected-accounts-section.types';

const providerOf = (account: UserProfileConnectedAccount) => account.providerId;
const noProviders: UserProfileConnectionProvider[] = [];

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
  const rows = useProviderRows(accounts, onConnect ? availableProviders : noProviders, providerOf);

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
              {rows.map(({ key, connected: account, provider }) => (
                <UserProfileConnectedAccountRowView
                  key={key}
                  account={account}
                  provider={provider}
                  triggerRef={account ? removalFocus.registerTrigger(account.id) : undefined}
                  isPending={provider !== undefined && pendingId === provider.id}
                  isDisabled={isBusy}
                  onConnect={onConnect}
                  onReconnect={onReconnect}
                  onRemove={onRemove ? account => removeAccount.open(account) : undefined}
                />
              ))}
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
