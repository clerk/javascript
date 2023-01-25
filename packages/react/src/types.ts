import type {
  Clerk,
  ClerkOptions,
  ClientResource,
  LoadedClerk,
  PublishableKeyOrFrontendApi,
  RedirectOptions,
  SessionResource,
  UserResource,
} from '@clerk/types';

declare global {
  interface Window {
    __clerk_frontend_api?: string;
    __clerk_publishable_key?: string;
    __clerk_proxy_url?: ClerkConstructorOptions['proxyUrl'];
    __clerk_domain?: ClerkConstructorOptions['domain'];
    __clerk_is_satellite?: ClerkConstructorOptions['isSatellite'];
  }
}

export type ClerkConstructorOptions = Pick<Clerk, 'proxyUrl' | 'domain' | 'isSatellite'>;

export type IsomorphicClerkOptions = ClerkOptions & {
  Clerk?: ClerkProp;
  clerkJSUrl?: string;
  clerkJSVariant?: 'headless' | '';
} & PublishableKeyOrFrontendApi;

export interface BrowserClerkConstructor {
  new (publishableKey: string, options?: ClerkConstructorOptions): BrowserClerk;
}

export interface HeadlessBrowserClerkConstrutor {
  new (publishableKey: string, options?: ClerkConstructorOptions): HeadlessBrowserClerk;
}

export type WithClerkProp<T = unknown> = T & { clerk: LoadedClerk };

export type WithUserProp<T = unknown> = T & { user: UserResource };

export type WithSessionProp<T = unknown> = T & { session: SessionResource };

// Clerk object
export interface MountProps {
  mount: (node: HTMLDivElement, props: any) => void;
  unmount: (node: HTMLDivElement) => void;
  updateProps: (props: any) => void;
  props?: any;
}

export interface HeadlessBrowserClerk extends Clerk {
  load: (opts?: ClerkOptions) => Promise<void>;
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
  | HeadlessBrowserClerkConstrutor
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
export type SignUpButtonProps = ButtonProps;

export type SignInWithMetamaskButtonProps = Pick<ButtonProps, 'redirectUrl' | 'children'>;

export type RedirectToProps = RedirectOptions;
