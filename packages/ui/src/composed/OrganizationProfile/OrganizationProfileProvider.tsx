import type { ModuleManager } from '@clerk/shared/moduleManager';
import { useClerk, useOrganization, useUser } from '@clerk/shared/react';
import type { EnvironmentResource, OAuthProvider, OAuthScope } from '@clerk/shared/types';
import React, { useMemo } from 'react';

import { AppearanceProvider } from '@/ui/customizables/AppearanceContext';
import { FlowMetadataProvider } from '@/ui/elements/contexts';
import type { Appearance } from '@/ui/internal/appearance';
import { RouteContext } from '@/ui/router/RouteContext';
import { InternalThemeProvider } from '@/ui/styledSystem';
import { StyleCacheProvider } from '@/ui/styledSystem/StyleCacheProvider';

import { EnvironmentProvider } from '../../contexts/EnvironmentContext';
import { ModuleManagerProvider } from '../../contexts/ModuleManagerContext';
import { OptionsProvider } from '../../contexts/OptionsContext';
import { SubscriberTypeContext } from '../../contexts/components/SubscriberType';
import { OrganizationProfileContext } from '../../contexts/components/OrganizationProfile';
import { ProfileCardPagePaddingProvider } from '../../elements/ProfileCard';
import { getModuleManager } from '../moduleManagerStore';
import { createComposedRouter } from '../stubRouter';

const fallbackModuleManager: ModuleManager = {
  import: () => Promise.resolve(undefined) as any,
};

type OrganizationProfileProviderProps = React.PropsWithChildren<{
  appearance?: Appearance;
  additionalOAuthScopes?: Partial<Record<OAuthProvider, OAuthScope[]>>;
}>;

export const OrganizationProfileProvider = (props: OrganizationProfileProviderProps) => {
  const { children, appearance } = props;
  const clerk = useClerk();
  const { isLoaded, user } = useUser();
  const { organization } = useOrganization();

  const environment = (clerk as any).__internal_environment as EnvironmentResource | null | undefined;
  const moduleManager: ModuleManager = getModuleManager() ?? fallbackModuleManager;
  const router = useMemo(() => createComposedRouter(clerk.navigate), [clerk]);

  if (!isLoaded || !user || !organization || !environment) {
    return null;
  }

  const orgProfileCtxValue = {
    componentName: 'OrganizationProfile' as const,
    mode: 'mounted' as const,
    routing: 'hash' as const,
    path: undefined,
    customPages: [],
  };

  return (
    <StyleCacheProvider>
      <AppearanceProvider
        appearanceKey='organizationProfile'
        appearance={appearance}
      >
        <FlowMetadataProvider flow='organizationProfile'>
          <InternalThemeProvider>
            <ModuleManagerProvider moduleManager={moduleManager}>
              <OptionsProvider value={{}}>
                <EnvironmentProvider value={environment}>
                  <RouteContext.Provider value={router}>
                    <SubscriberTypeContext.Provider value='organization'>
                      <OrganizationProfileContext.Provider value={orgProfileCtxValue}>
                        <ProfileCardPagePaddingProvider value={false}>{children}</ProfileCardPagePaddingProvider>
                      </OrganizationProfileContext.Provider>
                    </SubscriberTypeContext.Provider>
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
