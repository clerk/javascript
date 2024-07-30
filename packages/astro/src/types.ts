import type { ClerkOptions, MultiDomainAndOrProxyPrimitives, Without } from '@clerk/types';

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

declare global {
  interface Window {
    __astro_clerk_component_props: Map<string, Map<string, Record<string, unknown>>>;
    __astro_clerk_function_props: Map<string, Map<string, Record<string, unknown>>>;
  }
}

export type { AstroClerkUpdateOptions, AstroClerkIntegrationParams, AstroClerkCreateInstanceParams };
