'use client';

import { useClerk, useUser } from '@clerk/shared/react';
import type { EnvironmentResource, OAuthProvider, OAuthScope, UserProfileProps } from '@clerk/shared/types';
import type { PropsWithChildren, ReactNode } from 'react';

import type { Appearance } from '@/ui/internal/appearance';

import { UserProfileContext } from '../../contexts/components/UserProfile';
import { fallbackModuleManager, ProfileProviderShell } from '../ProfileProviderShell';

type UserProfileProviderProps = PropsWithChildren<{
  appearance?: Appearance;
  additionalOAuthScopes?: Partial<Record<OAuthProvider, OAuthScope[]>>;
  apiKeysProps?: UserProfileProps['apiKeysProps'];
}>;

export const UserProfileProvider = (props: UserProfileProviderProps): ReactNode => {
  const { children, appearance, additionalOAuthScopes, apiKeysProps } = props;
  const clerk = useClerk();
  const { isLoaded, user } = useUser();

  const environment = (clerk as any).__internal_environment as EnvironmentResource | null | undefined;
  const moduleManager = clerk.__internal_moduleManager ?? fallbackModuleManager;

  if (!isLoaded || !user || !environment) {
    return null;
  }

  const userProfileCtxValue = {
    componentName: 'UserProfile' as const,
    mode: 'mounted' as const,
    routing: 'hash' as const,
    path: undefined,
    additionalOAuthScopes,
    apiKeysProps,
    customPages: [],
  };

  return (
    <ProfileProviderShell
      clerk={clerk}
      environment={environment}
      moduleManager={moduleManager}
      appearanceKey='userProfile'
      flow='userProfile'
      globalAppearance={clerk.__internal_getOption('appearance')}
      appearance={appearance}
    >
      <UserProfileContext.Provider value={userProfileCtxValue}>{children}</UserProfileContext.Provider>
    </ProfileProviderShell>
  );
};
