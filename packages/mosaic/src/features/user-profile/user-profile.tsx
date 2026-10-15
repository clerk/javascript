'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';

import { useUserProfilePages } from '../switcher/switcher.pages';
import type { UserProfileOptions } from './user-profile.provider';
import { UserProfileProvider } from './user-profile.provider';
import type { UserProfileViewProps } from './user-profile.view';
import { UserProfileView } from './user-profile.view';
import { UserProfileApiKeysPanel } from './user-profile-api-keys-panel';
import { UserProfileProfilePanel } from './user-profile-profile-panel';
import { UserProfileSecurityPanel } from './user-profile-security-panel';
import { useUserProfileUserModel } from './user-profile-user.model';

export interface UserProfileProps
  extends Pick<UserProfileViewProps, 'customPages' | 'pageOrder'>, Pick<UserProfileOptions, 'additionalOAuthScopes'> {
  defaultPage?: UserProfileViewProps['activePage'];
  fallback?: ReactNode;
}

export function UserProfile({
  customPages,
  pageOrder,
  defaultPage,
  additionalOAuthScopes,
  fallback,
}: UserProfileProps) {
  const model = useUserProfileUserModel();
  const builtInPages = useUserProfilePages();
  const [activePage, setActivePage] = useState<UserProfileViewProps['activePage']>(
    defaultPage ?? pageOrder?.[0] ?? 'account',
  );

  if (model.status === 'loading') {
    return fallback ?? null;
  }
  if (model.status === 'hidden') {
    return null;
  }

  return (
    <UserProfileProvider
      additionalOAuthScopes={additionalOAuthScopes}
      mode='mounted'
    >
      <UserProfileView
        activePage={activePage}
        onPageChange={setActivePage}
        customPages={customPages}
        pageOrder={pageOrder}
        pages={{
          account: <UserProfileProfilePanel />,
          security: <UserProfileSecurityPanel />,
          apiKeys: builtInPages.includes('apiKeys') ? <UserProfileApiKeysPanel /> : undefined,
        }}
      />
    </UserProfileProvider>
  );
}
