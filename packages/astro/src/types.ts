import type {
  Clerk,
  ClerkOptions,
  ClientResource,
  MultiDomainAndOrProxyPrimitives,
  ProtectParams,
  ShowProps,
  Without,
} from '@clerk/shared/types';
import type { ClerkUIConstructor } from '@clerk/shared/ui';
import type { Appearance, Ui } from '@clerk/ui/internal';

type AstroClerkUpdateOptions<TUi extends Ui = Ui> = Pick<ClerkOptions, 'localization'> & {
  appearance?: Appearance<TUi>;
};

type AstroClerkIntegrationParams<TUi extends Ui = Ui> = Without<
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
  | 'appearance'
> &
  MultiDomainAndOrProxyPrimitives & {
    appearance?: Appearance<TUi>;
    clerkJSUrl?: string;
    clerkJSVersion?: string;
    /**
     * The URL that `@clerk/ui` should be hot-loaded from.
     */
    clerkUIUrl?: string;
    /**
     * The npm version for `@clerk/ui`.
     */
    clerkUIVersion?: string;
    /**
     * Controls prefetching of the `@clerk/ui` script.
     * - `false` - Skip prefetching the UI (for custom UIs using Control Components)
     * - `undefined` (default) - Prefetch UI normally
     */
    prefetchUI?: boolean;
  };

type AstroClerkCreateInstanceParams<TUi extends Ui = Ui> = AstroClerkIntegrationParams<TUi> & {
  publishableKey: string;
};

/**
 * @internal
 * Internal runtime options injected by the server for keyless mode support.
 */
export type InternalRuntimeOptions = {
  /**
   * Server-injected publishable key from keyless mode or context.locals
   */
  publishableKey?: string;
  /**
   * Keyless claim URL injected by middleware for the client-side banner
   */
  keylessClaimUrl?: string;
  /**
   * Keyless API keys URL injected by middleware for the client-side banner
   */
  keylessApiKeysUrl?: string;
  /**
   * Internal keyless claim URL passed to Clerk.load()
   */
  __internal_keylessClaimUrl?: string;
  /**
   * Internal keyless API keys URL passed to Clerk.load()
   */
  __internal_keylessApiKeysUrl?: string;
};

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
    __internal_ClerkUICtor?: ClerkUIConstructor;
  }
}

export type {
  AstroClerkUpdateOptions,
  AstroClerkIntegrationParams,
  AstroClerkCreateInstanceParams,
  ProtectParams,
  ShowProps,
};

// Backward compatibility alias
export type ProtectProps = ProtectParams;

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
  | 'pricing-table'
  | 'api-keys';
