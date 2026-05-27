import type { ModuleManager } from '@clerk/shared/moduleManager';
import { useClerk, useUser } from '@clerk/shared/react';
import type { EnvironmentResource, OAuthProvider, OAuthScope } from '@clerk/shared/types';
import React, { useMemo, type ReactNode } from 'react';

import { AppearanceProvider } from '@/ui/customizables/AppearanceContext';
import { FlowMetadataProvider } from '@/ui/elements/contexts';
import type { Appearance } from '@/ui/internal/appearance';
import { RouteContext } from '@/ui/router/RouteContext';
import { InternalThemeProvider } from '@/ui/styledSystem';
import { StyleCacheProvider } from '@/ui/styledSystem/StyleCacheProvider';

import { EnvironmentProvider } from '../../contexts/EnvironmentContext';
import { ModuleManagerProvider } from '../../contexts/ModuleManagerContext';
import { OptionsProvider } from '../../contexts/OptionsContext';
import { UserProfileContext } from '../../contexts/components/UserProfile';
import { ProfileCardPagePaddingProvider } from '../../elements/ProfileCard';
import { getModuleManager } from '../moduleManagerStore';
import { createComposedRouter } from '../stubRouter';

const fallbackModuleManager: ModuleManager = {
  import: () => Promise.resolve(undefined) as any,
};

type UserProfileProviderProps = React.PropsWithChildren<{
  appearance?: Appearance;
  additionalOAuthScopes?: Partial<Record<OAuthProvider, OAuthScope[]>>;
}>;

export const UserProfileProvider = (props: UserProfileProviderProps): ReactNode => {
  const { children, appearance, additionalOAuthScopes } = props;
  const clerk = useClerk();
  const { isLoaded, user } = useUser();

  const environment = (clerk as any).__internal_environment as EnvironmentResource | null | undefined;
  const moduleManager: ModuleManager = getModuleManager() ?? fallbackModuleManager;
  const router = useMemo(() => createComposedRouter(clerk.navigate), [clerk]);

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
    <StyleCacheProvider>
      <AppearanceProvider
        appearanceKey='userProfile'
        appearance={appearance}
      >
        <FlowMetadataProvider flow='userProfile'>
          <InternalThemeProvider>
            <ModuleManagerProvider moduleManager={moduleManager}>
              <OptionsProvider value={{}}>
                <EnvironmentProvider value={environment}>
                  <RouteContext.Provider value={router}>
                    <UserProfileContext.Provider value={userProfileCtxValue}>
                      <ProfileCardPagePaddingProvider value={false}>{children}</ProfileCardPagePaddingProvider>
                    </UserProfileContext.Provider>
                  </RouteContext.Provider>
                </EnvironmentProvider>
              </OptionsProvider>
            </ModuleManagerProvider>
          </InternalThemeProvider>
        </FlowMetadataProvider>
      </AppearanceProvider>
    </StyleCacheProvider>
  );
};
