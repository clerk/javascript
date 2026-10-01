import type { ReactNode } from 'react';

import { useMessages } from '../../../localization';
import { UserProfileConnectedAccountsSectionView } from '../user-profile-connected-accounts-section.view';
import { useUserProfileConnectedAccountsController } from './user-profile-connected-accounts-section.controller';
import type {
  AdditionalOAuthScopes,
  UserProfileConnectedAccountsModel,
} from './user-profile-connected-accounts-section.model';
import { useUserProfileConnectedAccountsModel } from './user-profile-connected-accounts-section.model';

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
  const m = useMessages('userProfileConnectedAccounts');
  const controller = useUserProfileConnectedAccountsController({
    accounts: model.accounts,
    availableProviders: model.availableProviders,
    onConnect: model.connect,
    onReconnect: model.reconnect,
    fallbackErrorMessage: m.errors.generic,
  });

  return (
    <UserProfileConnectedAccountsSectionView
      {...controller}
      fallbackFocus={fallbackFocus}
      onRemove={model.remove}
    />
  );
}
