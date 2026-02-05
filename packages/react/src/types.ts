import type {
  BrowserClerkConstructor,
  Clerk,
  InitialState,
  IsomorphicClerkOptions,
  LoadedClerk,
  RedirectUrlProp,
  SignInRedirectOptions,
  SignUpRedirectOptions,
  TasksRedirectOptions,
} from '@clerk/shared/types';
import type { ClerkUiConstructor } from '@clerk/shared/ui';
import type { Appearance, ExtractAppearanceType, Ui } from '@clerk/ui/internal';
import type React from 'react';

/**
 * Runtime brand value to identify valid JS objects
 */
export const JS_BRAND = '__clerkJS' as const;

declare const Tags: unique symbol;
type Tagged<BaseType, Tag extends PropertyKey> = BaseType & { [Tags]: { [K in Tag]: void } };

/**
 * Js type that carries type information via phantom property
 * Tagged to ensure only official js objects from @clerk/clerk-js can be used
 *
 * ClerkJS is optional to support server-safe marker exports (react-server condition).
 * When ClerkJS is absent, the SDK will dynamically import it.
 */
export type Js = Tagged<
  {
    /**
     * Runtime brand to identify valid JS objects
     */
    __brand: typeof JS_BRAND;
    /**
     * ClerkJS constructor. Optional to support server-safe marker exports.
     * When absent (e.g., in React Server Components), the SDK resolves it via dynamic import.
     */
    ClerkJS?: BrowserClerkConstructor;
    /**
     * Version of the JS package (for potential future use)
     */
    version?: string;
  },
  'ClerkJs'
>;

// Re-export types from @clerk/shared that are used by other modules
export type {
  IsomorphicClerkOptions,
  Clerk,
  BrowserClerk,
  BrowserClerkConstructor,
  ClerkProp,
  LoadedClerk,
  HeadlessBrowserClerk,
  HeadlessBrowserClerkConstructor,
} from '@clerk/shared/types';

declare global {
  interface Window {
    __clerk_publishable_key?: string;
    __clerk_proxy_url?: Clerk['proxyUrl'];
    __clerk_domain?: Clerk['domain'];
    __internal_ClerkUICtor?: ClerkUiConstructor;
    __internal_ClerkJSCtor?: BrowserClerkConstructor;
  }
}

/**
 * @interface
 */
export type ClerkProviderProps<TUi extends Ui = Ui, TJs extends Js = Js> = Omit<IsomorphicClerkOptions, 'appearance'> & {
  children: React.ReactNode;
  /**
   * Provide an initial state of the Clerk client during server-side rendering. You don't need to set this value yourself unless you're [developing an SDK](https://clerk.com/docs/guides/development/sdk-development/overview).
   */
  initialState?: InitialState;
  /**
   * Indicates to silently fail the initialization process when the publishable keys is not provided, instead of throwing an error.
   * @default false
   * @internal
   */
  __internal_bypassMissingPublishableKey?: boolean;
  /**
   * Optional object to style your components. Will only affect [Clerk Components](https://clerk.com/docs/reference/components/overview) and not [Account Portal](https://clerk.com/docs/guides/account-portal/overview) pages.
   */
  appearance?: ExtractAppearanceType<TUi, Appearance>;
  /**
   * Optional object to use the bundled Clerk UI instead of loading from CDN.
   * Import `ui` from `@clerk/ui` and pass it here to bundle the UI with your application.
   * When omitted, UI is loaded from Clerk's CDN.
   * Note: When `ui` is used, appearance is automatically typed based on the specific UI version.
   */
  ui?: TUi;
  /**
   * Optional object to use the bundled Clerk JS instead of loading from CDN.
   * Import `js` from `@clerk/clerk-js/bundled` and pass it here to bundle clerk-js with your application.
   * When omitted, clerk-js is loaded from Clerk's CDN.
   */
  js?: TJs;
};

export type WithClerkProp<T = unknown> = T & {
  clerk: LoadedClerk;
  component?: string;
  getContainer?: () => HTMLElement | null;
};

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

export type UserProfilePageProps = PageProps<'account' | 'security' | 'billing' | 'apiKeys'>;

export type UserProfileLinkProps = {
  url: string;
  label: string;
  labelIcon: React.ReactNode;
};

export type OrganizationProfilePageProps = PageProps<'general' | 'members' | 'billing' | 'apiKeys'>;
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
