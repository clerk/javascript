import type { ModuleManager } from '@clerk/shared/moduleManager';
import type { EnvironmentResource } from '@clerk/shared/types';
import type { PropsWithChildren, ReactNode } from 'react';

import { AppearanceProvider } from '@/ui/customizables/AppearanceContext';
import { FlowMetadataProvider } from '@/ui/elements/contexts';
import type { Appearance } from '@/ui/internal/appearance';
import { RouteContext, type RouteContextValue } from '@/ui/router/RouteContext';
import { InternalThemeProvider } from '@/ui/styledSystem';
import { StyleCacheProvider } from '@/ui/styledSystem/StyleCacheProvider';

import { EnvironmentProvider } from '../../contexts/EnvironmentContext';
import { ModuleManagerProvider } from '../../contexts/ModuleManagerContext';
import { OptionsProvider } from '../../contexts/OptionsContext';
import { AppearanceOverrides } from '../../elements/AppearanceOverrides';
import type { Elements } from '../../internal/appearance';

const profileCompositionOverrides: Elements = {
  profilePageContent: { padding: 0 },
};

type ProfileRuntimeProviderProps = PropsWithChildren<{
  environment: EnvironmentResource;
  moduleManager: ModuleManager;
  router: RouteContextValue;
  appearanceKey: 'userProfile' | 'organizationProfile';
  flow: 'userProfile' | 'organizationProfile';
  globalAppearance: Appearance | undefined;
  appearance?: Appearance;
}>;

export function ProfileRuntimeProvider({
  children,
  environment,
  moduleManager,
  router,
  appearanceKey,
  flow,
  globalAppearance,
  appearance,
}: ProfileRuntimeProviderProps): ReactNode {
  return (
    <StyleCacheProvider>
      <AppearanceProvider
        appearanceKey={appearanceKey}
        globalAppearance={globalAppearance}
        appearance={appearance}
      >
        <FlowMetadataProvider flow={flow}>
          <InternalThemeProvider>
            <ModuleManagerProvider moduleManager={moduleManager}>
              <OptionsProvider value={{}}>
                <EnvironmentProvider value={environment}>
                  <RouteContext.Provider value={router}>
                    <AppearanceOverrides elements={profileCompositionOverrides}>{children}</AppearanceOverrides>
                  </RouteContext.Provider>
                </EnvironmentProvider>
              </OptionsProvider>
            </ModuleManagerProvider>
          </InternalThemeProvider>
        </FlowMetadataProvider>
      </AppearanceProvider>
    </StyleCacheProvider>
  );
}
