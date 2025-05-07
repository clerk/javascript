import type {
  CheckAuthorizationWithCustomPermissions,
  Clerk,
  ClerkOptions,
  ClientResource,
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
    };

export type { AstroClerkUpdateOptions, AstroClerkIntegrationParams, AstroClerkCreateInstanceParams, ProtectProps };

export type ButtonProps<Tag> = {
  /**
   * @deprecated The `'as'` prop will be removed in a future version.
   * Use the default slot with the `'asChild'` prop instead.
   * @example
   * <SignInButton asChild>
   *   <button>Sign in</button>
   * </SignInButton>
   */
  as: Tag;
  asChild?: boolean;
};

export type InternalUIComponentId =
  | 'sign-in'
  | 'sign-up'
  | 'create-organization'
  | 'organization-list'
  | 'organization-profile'
  | 'organization-switcher'
  | 'user-button'
  | 'user-profile'
  | 'google-one-tap'
  | 'waitlist'
  | 'pricing-table';
