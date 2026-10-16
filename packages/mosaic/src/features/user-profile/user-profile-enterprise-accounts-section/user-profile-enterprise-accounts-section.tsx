import type { ReactNode } from 'react';

import { useMessages } from '../../../localization';
import { useUserProfileEnterpriseAccountsController } from './user-profile-enterprise-accounts-section.controller';
import type { UserProfileEnterpriseAccountsModel } from './user-profile-enterprise-accounts-section.model';
import { useUserProfileEnterpriseAccountsModel } from './user-profile-enterprise-accounts-section.model';
import { UserProfileEnterpriseAccountsSectionView } from './user-profile-enterprise-accounts-section.view';

export type UserProfileEnterpriseAccountsSectionProps = {
  fallback?: ReactNode;
};

export function UserProfileEnterpriseAccountsSection({ fallback }: UserProfileEnterpriseAccountsSectionProps) {
  const model = useUserProfileEnterpriseAccountsModel();
  if (model.status === 'loading') {
    return fallback ?? null;
  }
  if (model.status === 'hidden') {
    return null;
  }
  return (
    <EnterpriseAccounts
      key={model.userId}
      model={model}
    />
  );
}

function EnterpriseAccounts({ model }: { model: Extract<UserProfileEnterpriseAccountsModel, { status: 'ready' }> }) {
  const m = useMessages('userProfileEnterpriseAccountsSection');
  const controller = useUserProfileEnterpriseAccountsController({
    accounts: model.accounts,
    connections: model.connections,
    onConnect: model.connect,
    errorFallback: m.errors.generic,
  });

  return <UserProfileEnterpriseAccountsSectionView {...controller} />;
}
