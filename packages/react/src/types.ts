import type {
  Clerk,
  ClerkOptions,
  ClientResource,
  DomainOrProxyUrl,
  InitialState,
  LoadedClerk,
  MultiDomainAndOrProxy,
  SDKMetadata,
  SignInRedirectOptions,
  SignUpRedirectOptions,
  Without,
} from '@clerk/types';
import type React from 'react';

declare global {
  interface Window {
    __clerk_frontend_api?: string;
    __clerk_publishable_key?: string;
    __clerk_proxy_url?: Clerk['proxyUrl'];
    __clerk_domain?: Clerk['domain'];
  }
}

export type IsomorphicClerkOptions = Without<ClerkOptions, 'isSatellite'> & {
  Clerk?: ClerkProp;
  clerkJSUrl?: string;
  clerkJSVariant?: 'headless' | '';
  clerkJSVersion?: string;
  sdkMetadata?: SDKMetadata;
  publishableKey: string;
} & MultiDomainAndOrProxy;

export type ClerkProviderProps = IsomorphicClerkOptions & {
  children: React.ReactNode;
  initialState?: InitialState;
};

export interface BrowserClerkConstructor {
  new (publishableKey: string, options?: DomainOrProxyUrl): BrowserClerk;
}

export interface HeadlessBrowserClerkConstructor {
  new (publishableKey: string, options?: DomainOrProxyUrl): HeadlessBrowserClerk;
}

export type WithClerkProp<T = unknown> = T & { clerk: LoadedClerk };

// Clerk object
export interface MountProps {
  mount: (node: HTMLDivElement, props: any) => void;
  unmount: (node: HTMLDivElement) => void;
  updateProps: (props: any) => void;
  props?: any;
  customPagesPortals?: any[];
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

type ButtonProps = {
  afterSignInUrl?: string;
  afterSignUpUrl?: string;
  redirectUrl?: string;
  mode?: 'redirect' | 'modal';
  children?: React.ReactNode;
};

export type SignInButtonProps = ButtonProps;

export interface SignUpButtonProps extends ButtonProps {
  unsafeMetadata?: SignUpUnsafeMetadata;
}

export type SignInWithMetamaskButtonProps = Pick<ButtonProps, 'redirectUrl' | 'children'>;

export type RedirectToSignInProps = SignInRedirectOptions;
export type RedirectToSignUpProps = SignUpRedirectOptions;

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
