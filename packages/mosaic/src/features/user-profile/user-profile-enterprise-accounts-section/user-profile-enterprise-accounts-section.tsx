import type { ReactNode } from 'react';

import { useUserProfileEnterpriseAccountsController } from './user-profile-enterprise-accounts-section.controller';
import {
  type UserProfileEnterpriseAccountsModel,
  useUserProfileEnterpriseAccountsModel,
} from './user-profile-enterprise-accounts-section.model';
import { UserProfileEnterpriseAccountsSectionView } from './user-profile-enterprise-accounts-section.view';

type Ready = Extract<UserProfileEnterpriseAccountsModel, { status: 'ready' }>;

function ReadyEnterpriseAccountsSection({ model }: { model: Ready }) {
  const controller = useUserProfileEnterpriseAccountsController(model);
  return <UserProfileEnterpriseAccountsSectionView {...controller} />;
}

export function UserProfileEnterpriseAccountsSection({
  fallback,
  mode,
}: {
  fallback?: ReactNode;
  mode?: 'modal' | 'mounted';
}) {
  const model = useUserProfileEnterpriseAccountsModel({ mode });
  if (model.status === 'loading') {
    return fallback ?? null;
  }
  if (model.status === 'hidden') {
    return null;
  }
  return <ReadyEnterpriseAccountsSection model={model} />;
}
