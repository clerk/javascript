import type { Clerk, ClerkOptions, ClientResource, MultiDomainAndOrProxyPrimitives, Without } from '@clerk/types';

type AstroClerkUpdateOptions = Pick<ClerkOptions, 'appearance' | 'localization'>;

type AstroClerkIntegrationParams = Without<
  ClerkOptions,
  | 'isSatellite'
  | 'sdkMetadata'
  | 'standardBrowser'
  | 'selectInitialSession'
  | 'routerReplace'
  | 'routerDebug'
  | 'routerPush'
  | 'polling'
  | 'touchSession'
> &
  MultiDomainAndOrProxyPrimitives;

type AstroClerkCreateInstanceParams = AstroClerkIntegrationParams & { publishableKey: string };

// Copied from `@clerk/clerk-react`
export interface HeadlessBrowserClerk extends Clerk {
  load: (opts?: Without<ClerkOptions, 'isSatellite'>) => Promise<void>;
  updateClient: (client: ClientResource) => void;
}

// Copied from `@clerk/clerk-react`
export interface BrowserClerk extends HeadlessBrowserClerk {
  onComponentsReady: Promise<void>;
  components: any;
}

declare global {
  interface Window {
    __astro_clerk_component_props: Map<string, Map<string, Record<string, unknown>>>;
    __astro_clerk_function_props: Map<string, Map<string, Record<string, unknown>>>;
    Clerk: BrowserClerk;
  }
}

export type { AstroClerkUpdateOptions, AstroClerkIntegrationParams, AstroClerkCreateInstanceParams };
