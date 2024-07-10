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
  'isSatellite' | 'sdkMetadata' | 'telemetry' | 'standardBrowser' | 'selectInitialSession'
> &
  MultiDomainAndOrProxyPrimitives;

type AstroClerkCreateInstanceParams = AstroClerkIntegrationParams & { publishableKey: string };

declare global {
  interface Window {
    __astro_clerk_component_props: Map<string, Map<string, Record<string, unknown>>>;
  }
}

type ProtectComponentDefaultProps =
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
    };

export type {
  AstroClerkUpdateOptions,
  AstroClerkIntegrationParams,
  AstroClerkCreateInstanceParams,
  ProtectComponentDefaultProps,
};
