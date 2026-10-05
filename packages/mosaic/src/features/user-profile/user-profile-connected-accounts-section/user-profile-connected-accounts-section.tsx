import type { ReactNode } from 'react';

import { useUserProfileConnectedAccountsController } from './user-profile-connected-accounts-section.controller';
import type {
  AdditionalOAuthScopes,
  UserProfileConnectedAccountsModel,
} from './user-profile-connected-accounts-section.model';
import { useUserProfileConnectedAccountsModel } from './user-profile-connected-accounts-section.model';
import { UserProfileConnectedAccountsSectionView } from './user-profile-connected-accounts-section.view';

export type UserProfileConnectedAccountsSectionProps = {
  additionalOAuthScopes?: AdditionalOAuthScopes;
  fallback?: ReactNode;
  fallbackFocus?: () => HTMLElement | null;
  mode?: 'modal' | 'mounted';
};

export function UserProfileConnectedAccountsSection({
  additionalOAuthScopes,
  fallback,
  fallbackFocus,
  mode,
}: UserProfileConnectedAccountsSectionProps) {
  const model = useUserProfileConnectedAccountsModel({ additionalOAuthScopes, mode });
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
      fallbackFocus={fallbackFocus}
    />
  );
}

function ConnectedAccounts({
  model,
  fallbackFocus,
}: {
  model: Extract<UserProfileConnectedAccountsModel, { status: 'ready' }>;
  fallbackFocus?: () => HTMLElement | null;
}) {
  const controller = useUserProfileConnectedAccountsController({
    accounts: model.accounts,
    availableProviders: model.availableProviders,
    onConnect: model.connect,
    onReconnect: model.reconnect,
  });

  return (
    <UserProfileConnectedAccountsSectionView
      {...controller}
      fallbackFocus={fallbackFocus}
      onRemove={model.remove}
    />
  );
}
