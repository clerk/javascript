'use client';

// Composed UserProfile / OrganizationProfile mount outside the clerk-js portal
// tree, so this shell rebuilds the providers normally split between
// `LazyProviders` and `LazyComponentRenderer` / `LazyModalRenderer` in
// `packages/ui/src/lazyModules/providers.tsx`. `ClerkContextProvider` is
// intentionally omitted — the consumer's `<ClerkProvider>` supplies `clerk` via
// `useClerk()`. The emotion cache is keyed per clerk instance in
// `styleCacheStore` so sibling composed roots don't duplicate style insertions.

import { ClerkRuntimeError } from '@clerk/shared/error';
import type { ModuleManager } from '@clerk/shared/moduleManager';
import type { EnvironmentResource, LoadedClerk } from '@clerk/shared/types';
// eslint-disable-next-line no-restricted-imports
import { CacheProvider } from '@emotion/react';
import type { PropsWithChildren, ReactNode } from 'react';
import { useMemo } from 'react';

import { AppearanceProvider } from '@/ui/customizables/AppearanceContext';
import { FlowMetadataProvider } from '@/ui/elements/contexts';
import type { Appearance, Elements } from '@/ui/internal/appearance';
import { getStyleCache, setStyleCache } from '@/ui/internal/styleCacheStore';
import { RouteContext } from '@/ui/router/RouteContext';
import { InternalThemeProvider } from '@/ui/styledSystem';
import { createEmotionCache } from '@/ui/styledSystem/createEmotionCache';
import { extractCssLayerNameFromAppearance } from '@/ui/utils/extractCssLayerNameFromAppearance';

import { EnvironmentProvider } from '../contexts/EnvironmentContext';
import { ModuleManagerProvider } from '../contexts/ModuleManagerContext';
import { OptionsProvider } from '../contexts/OptionsContext';
import { AppearanceOverrides } from '../elements/AppearanceOverrides';
import { createComposedRouter } from './stubRouter';

// Used when `clerk.__internal_moduleManager` is `undefined`. In a correctly wired app clerk-js
// exposes its ModuleManager through that getter, so reaching this means the loaded clerk-js is too
// old to expose it (an older clerk-js also predates composed profiles entirely). Fail loudly on the
// first dynamic import (Web3, billing, password strength) instead of silently resolving `undefined`
// and surfacing later as an opaque access on the missing module.
export const fallbackModuleManager: ModuleManager = {
  import: () =>
    Promise.reject(
      new ClerkRuntimeError(
        'Composed profile components could not resolve a Clerk module manager: this Clerk instance does not expose one. This usually means the loaded @clerk/clerk-js is too old to support composed profiles.',
        { code: 'composed_module_manager_unavailable' },
      ),
    ),
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

type SharedStyleCacheProviderProps = PropsWithChildren<{
  clerk: LoadedClerk;
  nonce?: string;
  cssLayerName?: string;
}>;

// One emotion cache per clerk instance, so sibling composed roots share inserts.
function SharedStyleCacheProvider({ clerk, nonce, cssLayerName, children }: SharedStyleCacheProviderProps): ReactNode {
  const cache = useMemo(() => {
    const existing = getStyleCache(clerk);
    if (existing) {
      return existing;
    }
    const next = createEmotionCache({ nonce, cssLayerName });
    setStyleCache(clerk, next);
    return next;
  }, [clerk, nonce, cssLayerName]);

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}

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
  // currentPath is left empty: composed has no Clerk-internal navigation. Each
  // section owns its own CardStateProvider, so errors clear on section unmount
  // (single-section mounting). Side-by-side sections keep independent error
  // state — a consumer URL change wouldn't be a meaningful signal to clear
  // either, so observing it would only cause spurious clears.
  const router = useMemo(() => createComposedRouter(clerk.navigate), [clerk]);
  // Match the portal path's normalization (Components.tsx:209) so a cssLayerName
  // nested inside appearance.theme gets hoisted to top-level for @layer wrapping.
  const normalizedGlobalAppearance = useMemo(
    () => extractCssLayerNameFromAppearance(globalAppearance),
    [globalAppearance],
  );
  const options = useMemo(
    () => ({
      localization: clerk.__internal_getOption('localization'),
      supportEmail: clerk.__internal_getOption('supportEmail'),
    }),
    [clerk],
  );

  return (
    <SharedStyleCacheProvider
      clerk={clerk}
      // nonce lives on IsomorphicClerkOptions, not ClerkOptions, so the typed K-constraint rejects it
      nonce={(clerk as any).__internal_getOption('nonce')}
      cssLayerName={normalizedGlobalAppearance?.cssLayerName}
    >
      {/* parsed appearance for cl-* styled components */}
      <AppearanceProvider
        appearanceKey={appearanceKey}
        globalAppearance={normalizedGlobalAppearance}
        appearance={appearance}
      >
        {/* flow= for Flow.Root/Part data-clerk-* selectors */}
        <FlowMetadataProvider flow={flow}>
          {/* Emotion ThemeProvider over parsed theme */}
          <InternalThemeProvider>
            {/* dynamic-import bridge (Web3) */}
            <ModuleManagerProvider moduleManager={moduleManager}>
              {/* threads localization + supportEmail from the consumer's <ClerkProvider> */}
              <OptionsProvider value={options}>
                {/* read by useEnvironment() across MFA/account sections */}
                <EnvironmentProvider value={environment}>
                  {/* router stub: navigate→clerk.navigate, matches/refresh no-op */}
                  <RouteContext.Provider value={router}>
                    {/* zero out profilePageContent padding when embedded */}
                    <AppearanceOverrides elements={composedOverrides}>{children}</AppearanceOverrides>
                  </RouteContext.Provider>
                </EnvironmentProvider>
              </OptionsProvider>
            </ModuleManagerProvider>
          </InternalThemeProvider>
        </FlowMetadataProvider>
      </AppearanceProvider>
    </SharedStyleCacheProvider>
  );
}
