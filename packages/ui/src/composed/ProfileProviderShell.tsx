import type { ModuleManager } from '@clerk/shared/moduleManager';
import type { EnvironmentResource, LoadedClerk } from '@clerk/shared/types';
import type { PropsWithChildren, ReactNode } from 'react';
import { useMemo } from 'react';

import { AppearanceProvider } from '@/ui/customizables/AppearanceContext';
import { FlowMetadataProvider } from '@/ui/elements/contexts';
import type { Appearance } from '@/ui/internal/appearance';
import { RouteContext } from '@/ui/router/RouteContext';
import { InternalThemeProvider } from '@/ui/styledSystem';
import { StyleCacheProvider } from '@/ui/styledSystem/StyleCacheProvider';

import { EnvironmentProvider } from '../contexts/EnvironmentContext';
import { ModuleManagerProvider } from '../contexts/ModuleManagerContext';
import { OptionsProvider } from '../contexts/OptionsContext';
import { AppearanceOverrides } from '../elements/AppearanceOverrides';
import type { Elements } from '../internal/appearance';
import { createComposedRouter } from './stubRouter';

export const fallbackModuleManager: ModuleManager = {
  import: () => Promise.resolve(undefined) as any,
};

const composedOverrides: Elements = {
  profilePageContent: { padding: 0 },
};

type ProfileProviderShellProps = PropsWithChildren<{
  clerk: LoadedClerk;
  environment: EnvironmentResource;
  moduleManager: ModuleManager;
  appearanceKey: 'userProfile' | 'organizationProfile';
  flow: 'userProfile' | 'organizationProfile';
  globalAppearance: Appearance | undefined;
  appearance?: Appearance;
}>;

export function ProfileProviderShell({
  children,
  clerk,
  environment,
  moduleManager,
  appearanceKey,
  flow,
  globalAppearance,
  appearance,
}: ProfileProviderShellProps): ReactNode {
  const router = useMemo(() => createComposedRouter(clerk.navigate), [clerk]);

  return (
    <StyleCacheProvider
      nonce={(clerk as any).__internal_getOption('nonce')}
      cssLayerName={globalAppearance?.cssLayerName}
    >
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
                    <AppearanceOverrides elements={composedOverrides}>{children}</AppearanceOverrides>
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
