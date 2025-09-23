import type {
  Clerk,
  ClerkOptions,
  ClientResource,
  DomainOrProxyUrl,
  InitialState,
  LoadedClerk,
  MultiDomainAndOrProxy,
  RedirectUrlProp,
  SignInRedirectOptions,
  SignUpRedirectOptions,
  TasksRedirectOptions,
  Without,
} from '@clerk/types';
import type React from 'react';

declare global {
  interface Window {
    __clerk_publishable_key?: string;
    __clerk_proxy_url?: Clerk['proxyUrl'];
    __clerk_domain?: Clerk['domain'];
  }
}

export type IsomorphicClerkOptions = Without<ClerkOptions, 'isSatellite'> & {
  Clerk?: ClerkProp;
  /**
   * The URL that `@clerk/clerk-js` should be hot-loaded from.
   */
  clerkJSUrl?: string;
  /**
   * If your web application only uses [Control Components](https://clerk.com/docs/components/overview#control-components), you can set this value to `'headless'` and load a minimal ClerkJS bundle for optimal page performance.
   */
  clerkJSVariant?: 'headless' | '';
  /**
   * The npm version for `@clerk/clerk-js`.
   */
  clerkJSVersion?: string;
  /**
   * The Clerk Publishable Key for your instance. This can be found on the [API keys](https://dashboard.clerk.com/last-active?path=api-keys) page in the Clerk Dashboard.
   */
  publishableKey: string;
  /**
   * This nonce value will be passed through to the `@clerk/clerk-js` script tag. Use it to implement a [strict-dynamic CSP](https://clerk.com/docs/security/clerk-csp#implementing-a-strict-dynamic-csp). Requires the `dynamic` prop to also be set.
   */
  nonce?: string;
} & MultiDomainAndOrProxy;

/**
 * @interface
 */
export type ClerkProviderProps = IsomorphicClerkOptions & {
  children: React.ReactNode;
  /**
   * Provide an initial state of the Clerk client during server-side rendering. You don't need to set this value yourself unless you're [developing an SDK](https://clerk.com/docs/references/sdk/overview).
   */
  initialState?: InitialState;
  /**
   * Indicates to silently fail the initialization process when the publishable keys is not provided, instead of throwing an error.
   * @default false
   * @internal
   */
  __internal_bypassMissingPublishableKey?: boolean;
};

export interface BrowserClerkConstructor {
  new (publishableKey: string, options?: DomainOrProxyUrl): BrowserClerk;
}

export interface HeadlessBrowserClerkConstructor {
  new (publishableKey: string, options?: DomainOrProxyUrl): HeadlessBrowserClerk;
}

export type WithClerkProp<T = unknown> = T & { clerk: LoadedClerk; component?: string };

export interface CustomPortalsRendererProps {
  customPagesPortals?: any[];
  customMenuItemsPortals?: any[];
}

// Clerk object
export interface MountProps {
  mount: (node: HTMLDivElement, props: any) => void;
  unmount: (node: HTMLDivElement) => void;
  updateProps: (props: any) => void;
  props?: any;
}

export interface OpenProps {
  open: (props: any) => void;
  close: () => void;
  props?: any;
}

export interface HeadlessBrowserClerk extends Clerk {
  load: (opts?: Without<ClerkOptions, 'isSatellite'>) => Promise<void>;
  updateClient: (client: ClientResource) => void;
}

export interface BrowserClerk extends HeadlessBrowserClerk {
  onComponentsReady: Promise<void>;
  components: any;
}

export type ClerkProp =
  | BrowserClerkConstructor
  | BrowserClerk
  | HeadlessBrowserClerk
  | HeadlessBrowserClerkConstructor
  | undefined
  | null;

export type SignInWithMetamaskButtonProps = {
  mode?: 'redirect' | 'modal';
  children?: React.ReactNode;
} & RedirectUrlProp;

export type RedirectToSignInProps = SignInRedirectOptions;
export type RedirectToSignUpProps = SignUpRedirectOptions;
export type RedirectToTasksProps = TasksRedirectOptions;

type PageProps<T extends string> =
  | {
      label: string;
      url: string;
      labelIcon: React.ReactNode;
    }
  | {
      label: T;
      url?: never;
      labelIcon?: never;
    };

export type UserProfilePageProps = PageProps<'account' | 'security'>;

export type UserProfileLinkProps = {
  url: string;
  label: string;
  labelIcon: React.ReactNode;
};

export type OrganizationProfilePageProps = PageProps<'general' | 'members'>;
export type OrganizationProfileLinkProps = UserProfileLinkProps;

type ButtonActionProps<T extends string> =
  | {
      label: string;
      labelIcon: React.ReactNode;
      onClick: () => void;
      open?: never;
    }
  | {
      label: T;
      labelIcon?: never;
      onClick?: never;
      open?: never;
    }
  | {
      label: string;
      labelIcon: React.ReactNode;
      onClick?: never;
      open: string;
    };

export type UserButtonActionProps = ButtonActionProps<'manageAccount' | 'signOut'>;

export type UserButtonLinkProps = {
  href: string;
  label: string;
  labelIcon: React.ReactNode;
};
