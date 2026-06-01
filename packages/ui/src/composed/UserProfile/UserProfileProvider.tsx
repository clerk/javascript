import type { ModuleManager } from '@clerk/shared/moduleManager';
import { useClerk, useUser } from '@clerk/shared/react';
import type { EnvironmentResource, OAuthProvider, OAuthScope } from '@clerk/shared/types';
import type { PropsWithChildren, ReactNode } from 'react';

import { getModuleManager } from '@/ui/internal/moduleManagerStore';
import type { Appearance } from '@/ui/internal/appearance';

import { UserProfileContext } from '../../contexts/components/UserProfile';
import { ProfileProviderShell, fallbackModuleManager } from '../ProfileProviderShell';

type UserProfileProviderProps = PropsWithChildren<{
  appearance?: Appearance;
  additionalOAuthScopes?: Partial<Record<OAuthProvider, OAuthScope[]>>;
}>;

export const UserProfileProvider = (props: UserProfileProviderProps): ReactNode => {
  const { children, appearance, additionalOAuthScopes } = props;
  const clerk = useClerk();
  const { isLoaded, user } = useUser();

  const environment = (clerk as any).__internal_environment as EnvironmentResource | null | undefined;
  const moduleManager: ModuleManager = getModuleManager() ?? fallbackModuleManager;

  if (!isLoaded || !user || !environment) {
    return null;
  }

  const userProfileCtxValue = {
    componentName: 'UserProfile' as const,
    mode: 'mounted' as const,
    routing: 'hash' as const,
    path: undefined,
    additionalOAuthScopes,
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
