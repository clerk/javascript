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
  showEligibleActions,
  canManageAccount,
  canReconnectAccount,
  canConnectProvider,
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
}: UserProfileConnectedAccountsSectionViewProps) {
  const m = useMessages('userProfileConnectedAccounts');
  const hasRows = accounts.length > 0 || availableProviders.length > 0;
  const isBusy = pendingId !== undefined;

  return (
    <>
      {hasRows ? (
        <Section.Root>
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
                  eligibility={showEligibleActions ? account.eligibility : undefined}
                  triggerRef={registerTrigger?.(account.id)}
                  isDisabled={isBusy}
                  onReconnect={canReconnectAccount?.(account.id) === false ? undefined : onReconnect}
                  onRemove={
                    remove && canManageAccount?.(account.id) !== false ? account => remove.open(account) : undefined
                  }
                />
              ))}
              {availableProviders.map(provider => (
                <UserProfileConnectProviderRowView
                  key={provider.id}
                  provider={provider}
                  isPending={pendingId === provider.id}
                  isDisabled={isBusy}
                  onConnect={canConnectProvider?.(provider.id) === false ? undefined : onConnect}
                />
              ))}
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
    </>
  );
}
