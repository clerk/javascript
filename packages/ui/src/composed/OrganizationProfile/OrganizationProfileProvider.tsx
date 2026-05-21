import type { ModuleManager } from '@clerk/shared/moduleManager';
import { useClerk, useOrganization, useUser } from '@clerk/shared/react';
import type { EnvironmentResource, OAuthProvider, OAuthScope } from '@clerk/shared/types';
import React from 'react';

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
import { stubRouter } from '../stubRouter';

const stubModuleManager: ModuleManager = {
  import: () => Promise.resolve(undefined),
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
            <ModuleManagerProvider moduleManager={stubModuleManager}>
              <OptionsProvider value={{}}>
                <EnvironmentProvider value={environment}>
                  <RouteContext.Provider value={stubRouter}>
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
