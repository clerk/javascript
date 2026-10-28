import { Confirmation } from '../../../blocks/confirmation';
import { ReverificationDialog } from '../../../blocks/reverification';
import { Section } from '../../../components/section';
import { fill, useMessages } from '../../../localization';
import {
  UserProfileConnectedAccountRowView,
  UserProfileConnectProviderRowView,
} from './user-profile-connected-account-row.view';
import type { UserProfileConnectedAccountsSectionViewProps } from './user-profile-connected-accounts-section.types';

export type {
  UserProfileConnectedAccount,
  UserProfileConnectedAccountsSectionViewProps,
  UserProfileConnectionProvider,
} from './user-profile-connected-accounts-section.types';

export function UserProfileConnectedAccountsSectionView({
  accounts,
  sectionRef,
  availableProviders = [],
  pendingId,
  onConnect,
  onReconnect,
  registerTrigger,
  remove,
  finalFocus,
  reconnectReverification,
  reconnectFinalFocus,
  connectReverification,
  connectFinalFocus,
}: UserProfileConnectedAccountsSectionViewProps) {
  const m = useMessages('userProfile').connectedAccounts;
  const hasRows = accounts.length > 0 || (availableProviders.length > 0 && Boolean(onConnect));
  const isBusy = pendingId !== undefined;

  return (
    <>
      {hasRows ? (
        <Section.Root search={{ label: m.title }}>
          <Section.Group
            ref={sectionRef}
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
                  triggerRef={registerTrigger(account.id)}
                  isDisabled={isBusy}
                  onReconnect={onReconnect}
                  onRemove={remove ? account => remove.open(account) : undefined}
                />
              ))}
              {onConnect
                ? availableProviders.map(provider => (
                    <UserProfileConnectProviderRowView
                      key={provider.id}
                      provider={provider}
                      triggerRef={registerTrigger(provider.id)}
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
      {remove ? (
        <Confirmation
          controller={remove}
          title={m.removeDialog.title}
          description={account => fill(m.removeDialog.description, { provider: account.provider })}
          actionLabel={m.removeDialog.confirm}
          cancelLabel={m.removeDialog.cancel}
          finalFocus={finalFocus}
        />
      ) : null}
      {reconnectReverification ? (
        <ReverificationDialog
          controller={reconnectReverification}
          finalFocus={reconnectFinalFocus}
        />
      ) : null}
      {connectReverification ? (
        <ReverificationDialog
          controller={connectReverification}
          finalFocus={connectFinalFocus}
        />
      ) : null}
    </>
  );
}
