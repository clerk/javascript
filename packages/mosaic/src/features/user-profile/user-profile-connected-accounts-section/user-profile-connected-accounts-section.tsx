import type { ReactNode } from 'react';

import { useUserProfileConnectedAccountsController } from './user-profile-connected-accounts-section.controller';
import type { UserProfileConnectedAccountsModel } from './user-profile-connected-accounts-section.model';
import { useUserProfileConnectedAccountsModel } from './user-profile-connected-accounts-section.model';
import { UserProfileConnectedAccountsSectionView } from './user-profile-connected-accounts-section.view';

export type UserProfileConnectedAccountsSectionProps = {
  fallback?: ReactNode;
};

export function UserProfileConnectedAccountsSection({ fallback }: UserProfileConnectedAccountsSectionProps) {
  const model = useUserProfileConnectedAccountsModel();
  if (model.status === 'loading') {
    return fallback ?? null;
  }
  if (model.status === 'hidden') {
    return null;
  }
  return (
    <ConnectedAccounts
      key={model.userId}
      model={model}
    />
  );
}

function ConnectedAccounts({ model }: { model: Extract<UserProfileConnectedAccountsModel, { status: 'ready' }> }) {
  const controller = useUserProfileConnectedAccountsController({
    accounts: model.accounts,
    availableProviders: model.availableProviders,
    onConnect: model.connect,
    onReconnect: model.reconnect,
  });

  return (
    <UserProfileConnectedAccountsSectionView
      {...controller}
      onRemove={model.remove}
    />
  );
}
