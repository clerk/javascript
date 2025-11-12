import type {
  Clerk,
  ClerkOptions,
  ClientResource,
  MultiDomainAndOrProxyPrimitives,
  ProtectProps,
  Without,
} from '@clerk/shared/types';
import type { ClerkUiConstructor } from '@clerk/shared/ui';

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
  | 'clerkUiCtor'
> &
  MultiDomainAndOrProxyPrimitives & {
    clerkJSUrl?: string;
    clerkJSVariant?: 'headless' | '';
    clerkJSVersion?: string;
    /**
     * The URL that `@clerk/ui` should be hot-loaded from.
     */
    clerkUiUrl?: string;
  };

type AstroClerkCreateInstanceParams = AstroClerkIntegrationParams & { publishableKey: string };

// Copied from `@clerk/react`
export interface HeadlessBrowserClerk extends Clerk {
  load: (opts?: Without<ClerkOptions, 'isSatellite'>) => Promise<void>;
  updateClient: (client: ClientResource) => void;
}

// Copied from `@clerk/react`
export interface BrowserClerk extends HeadlessBrowserClerk {
  onComponentsReady: Promise<void>;
  components: any;
}

declare global {
  interface Window {
    __astro_clerk_component_props: Map<string, Map<string, Record<string, unknown>>>;
    __astro_clerk_function_props: Map<string, Map<string, Record<string, unknown>>>;
    Clerk: BrowserClerk;
    __unstable_ClerkUiCtor?: ClerkUiConstructor;
  }
}

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
  | 'user-avatar'
  | 'user-button'
  | 'user-profile'
  | 'google-one-tap'
  | 'waitlist'
  | 'pricing-table';
