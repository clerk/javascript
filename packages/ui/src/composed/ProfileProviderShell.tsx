'use client';

// Composed UserProfile / OrganizationProfile mount outside the clerk-js portal
// tree, so this shell rebuilds the providers normally split between
// `LazyProviders` and `LazyComponentRenderer` / `LazyModalRenderer` in
// `packages/ui/src/lazyModules/providers.tsx`. `ClerkContextProvider` is
// intentionally omitted — the consumer's `<ClerkProvider>` supplies `clerk` via
// `useClerk()`. The emotion cache is keyed per clerk instance in
// `styleCacheStore` so sibling composed roots don't duplicate style insertions.

import { ClerkRuntimeError } from '@clerk/shared/error';
import { logger } from '@clerk/shared/logger';
import type { ModuleManager } from '@clerk/shared/moduleManager';
import type { EnvironmentResource, LoadedClerk } from '@clerk/shared/types';
// eslint-disable-next-line no-restricted-imports
import { CacheProvider } from '@emotion/react';
import type { PropsWithChildren, ReactNode } from 'react';
import { useMemo } from 'react';

import { AppearanceProvider } from '@/ui/customizables/AppearanceContext';
import { FlowMetadataProvider } from '@/ui/elements/contexts';
import type { Appearance, Elements } from '@/ui/internal/appearance';
import { getStyleCacheEntry, setStyleCache } from '@/ui/internal/styleCacheStore';
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

type ClerkWithInternalEnvironment = {
  __internal_environment?: EnvironmentResource | null;
};

/**
 * Resolves the clerk-js runtime state (environment + module manager) that the
 * composed profile shell needs. Composed UI is bundled into the consumer app but
 * clerk-js is hotloaded separately, so an app can bundle composed components that
 * are newer than the loaded clerk-js. `moduleManager` falls back to a loud stub;
 * `environment` can only be absent, so once clerk has finished loading a missing
 * runtime is a real version mismatch and gets a one-time warning instead of a
 * silent blank render.
 */
export function resolveComposedClerkRuntime(
  clerk: LoadedClerk,
  clerkLoaded: boolean,
): { environment: EnvironmentResource | null | undefined; moduleManager: ModuleManager } {
  // SAFETY: __internal_environment is a real clerk-js getter absent from the shared LoadedClerk type; narrowing (not `any`) keeps it typed.
  const environment = (clerk as LoadedClerk & ClerkWithInternalEnvironment).__internal_environment;
  const moduleManager = clerk.__internal_moduleManager ?? fallbackModuleManager;

  if (clerkLoaded && (!environment || clerk.__internal_moduleManager === undefined)) {
    logger.warnOnce(
      'Clerk: Composed profile components could not read the runtime state (environment/module manager) from the loaded @clerk/clerk-js, so nothing will render. This usually means the loaded clerk-js is older than the composed components bundled in your app. Upgrade @clerk/clerk-js (or your framework SDK) to a version that supports composed profiles.',
    );
  }

  return { environment, moduleManager };
}

type ClerkWithNonceOption = { __internal_getOption(key: string): string | undefined };

function readNonceOption(clerk: LoadedClerk): string | undefined {
  // SAFETY: nonce is a runtime clerk-js option whose key is absent from the typed ClerkOptions; narrowing (not `any`) keeps the return typed. Called as a method to preserve `this`.
  return (clerk as unknown as ClerkWithNonceOption).__internal_getOption('nonce');
}

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
// Reuse the stored cache only when it was built from the same nonce/cssLayerName;
// a change to either rebuilds it (mirroring the AIO StyleCacheProvider) instead of
// pinning whatever the first-mounted sibling saw.
function SharedStyleCacheProvider({ clerk, nonce, cssLayerName, children }: SharedStyleCacheProviderProps): ReactNode {
  const cache = useMemo(() => {
    const existing = getStyleCacheEntry(clerk);
    if (existing && existing.nonce === nonce && existing.cssLayerName === cssLayerName) {
      return existing.cache;
    }
    const next = createEmotionCache({ nonce, cssLayerName });
    setStyleCache(clerk, { cache: next, nonce, cssLayerName });
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
  // Match the portal path's appearance normalization so a cssLayerName nested inside
  // appearance.theme gets hoisted to top-level for @layer wrapping.
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
      nonce={readNonceOption(clerk)}
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
