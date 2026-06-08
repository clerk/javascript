// Composed UserProfile / OrganizationProfile mount outside the clerk-js portal
// tree, so this shell rebuilds the providers normally split between
// `LazyProviders` and `LazyComponentRenderer` / `LazyModalRenderer` in
// `packages/ui/src/lazyModules/providers.tsx`. `ClerkContextProvider` is
// intentionally omitted — the consumer's `<ClerkProvider>` supplies `clerk` via
// `useClerk()`. The emotion cache is keyed per clerk instance in
// `styleCacheStore` so sibling composed roots don't duplicate style insertions.
// eslint-disable-next-line no-restricted-imports
import createCache from '@emotion/cache';
// eslint-disable-next-line no-restricted-imports
import { CacheProvider, type SerializedStyles } from '@emotion/react';
import type { ModuleManager } from '@clerk/shared/moduleManager';
import type { EnvironmentResource, LoadedClerk } from '@clerk/shared/types';
import type { PropsWithChildren, ReactNode } from 'react';
import { useMemo, useSyncExternalStore } from 'react';

import { AppearanceProvider } from '@/ui/customizables/AppearanceContext';
import { FlowMetadataProvider } from '@/ui/elements/contexts';
import type { Appearance } from '@/ui/internal/appearance';
import { getStyleCache, setStyleCache } from '@/ui/internal/styleCacheStore';
import { RouteContext } from '@/ui/router/RouteContext';
import { InternalThemeProvider } from '@/ui/styledSystem';
import { extractCssLayerNameFromAppearance } from '@/ui/utils/extractCssLayerNameFromAppearance';

import { EnvironmentProvider } from '../contexts/EnvironmentContext';
import { ModuleManagerProvider } from '../contexts/ModuleManagerContext';
import { OptionsProvider } from '../contexts/OptionsContext';
import { AppearanceOverrides } from '../elements/AppearanceOverrides';
import type { Elements } from '../internal/appearance';
import { createComposedRouter } from './stubRouter';

export const fallbackModuleManager: ModuleManager = {
  import: () => Promise.resolve(undefined) as any,
};

function subscribeToPopstate(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('popstate', callback);
  return () => window.removeEventListener('popstate', callback);
}

function getPathname(): string {
  return typeof window !== 'undefined' ? window.location.pathname : '';
}

function getSSRPathname(): string {
  return '';
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
function SharedStyleCacheProvider({ clerk, nonce, cssLayerName, children }: SharedStyleCacheProviderProps): ReactNode {
  const cache = useMemo(() => {
    const existing = getStyleCache(clerk);
    if (existing) {
      return existing;
    }
    const el = typeof document !== 'undefined' ? document.querySelector('style#cl-style-insertion-point') : null;
    const next = createCache({
      key: 'cl-internal',
      prepend: cssLayerName ? false : !el,
      insertionPoint: el ? (el as HTMLElement) : undefined,
      nonce,
    });
    if (cssLayerName) {
      const prevInsert = next.insert.bind(next);
      next.insert = (selector: string, serialized: SerializedStyles, sheet: any, shouldCache: boolean) => {
        if (serialized && typeof serialized.styles === 'string' && !serialized.styles.startsWith('@layer')) {
          const wrapped = { ...serialized, styles: `@layer ${cssLayerName} {${serialized.styles}}` };
          return prevInsert(selector, wrapped, sheet, shouldCache);
        }
        return prevInsert(selector, serialized, sheet, shouldCache);
      };
    }
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
  // Tracks the consumer app's URL so router.currentPath changes drive effects in
  // CardStateProvider (errors) and ProfileCardContent (scroll restore). popstate
  // catches back/forward; pushState navigations propagate through the consumer's
  // own re-renders, which re-read the snapshot.
  const currentPath = useSyncExternalStore(subscribeToPopstate, getPathname, getSSRPathname);
  const router = useMemo(() => createComposedRouter(clerk.navigate, currentPath), [clerk, currentPath]);
  // Match the portal path's normalization (Components.tsx:209) so a cssLayerName
  // nested inside appearance.theme gets hoisted to top-level for @layer wrapping.
  const normalizedGlobalAppearance = useMemo(
    () => extractCssLayerNameFromAppearance(globalAppearance),
    [globalAppearance],
  );
  const options = useMemo(
    () => ({
      localization: (clerk as any).__internal_getOption('localization'),
      supportEmail: (clerk as any).__internal_getOption('supportEmail'),
    }),
    [clerk],
  );

  return (
    <SharedStyleCacheProvider
      clerk={clerk}
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
