import type {
  CheckAuthorizationWithCustomPermissions,
  ClerkOptions,
  MultiDomainAndOrProxyPrimitives,
  OrganizationCustomPermissionKey,
  OrganizationCustomRoleKey,
  Without,
} from '@clerk/types';

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

type ProtectProps =
  | {
      condition?: never;
      role: OrganizationCustomRoleKey;
      permission?: never;
    }
  | {
      condition?: never;
      role?: never;
      permission: OrganizationCustomPermissionKey;
    }
  | {
      condition: (has: CheckAuthorizationWithCustomPermissions) => boolean;
      role?: never;
      permission?: never;
    }
  | {
      condition?: never;
      role?: never;
      permission?: never;
    }

export type { AstroClerkUpdateOptions, AstroClerkIntegrationParams, AstroClerkCreateInstanceParams, ProtectProps };
