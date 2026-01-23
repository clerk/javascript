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
    clerkJSVariant?: 'headless' | '';
    clerkJSVersion?: string;
    /**
     * The URL that `@clerk/ui` should be hot-loaded from.
     */
    clerkUiUrl?: string;
    /**
     * The Clerk UI bundle to use. When provided with a bundled UI via
     * `ui.ctor`, it will be used instead of loading from CDN.
     */
    ui?: TUi;
  };

type AstroClerkCreateInstanceParams<TUi extends Ui = Ui> = AstroClerkIntegrationParams<TUi> & {
  publishableKey: string;
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
    __internal_ClerkUiCtor?: ClerkUIConstructor;
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
