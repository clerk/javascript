import type {
  Clerk,
  ClerkOptions,
  ClientResource,
  LoadedClerk,
  RedirectOptions,
  SignOutCallback,
  UserResource,
} from '@clerk/types';

export interface IsomorphicClerkOptions extends ClerkOptions {
  scriptUrl?: string;
}

export interface BrowserClerkConstructor {
  new (frontendApi: string): BrowserClerk;
}

export type WithClerkProp<T> = T & { clerk: LoadedClerk };

export type WithUserProp<T> = T & { user: UserResource };

// Clerk object
export interface MountProps {
  mount: (node: HTMLDivElement, props: any) => void;
  unmount: (node: HTMLDivElement) => void;
  props?: any;
}

export interface BrowserClerk extends Clerk {
  load: (opts?: ClerkOptions) => Promise<void>;
  updateClient: (client: ClientResource) => void;
  onComponentsReady: Promise<void>;
  components: any;
}

export type ClerkProp =
  | BrowserClerkConstructor
  | BrowserClerk
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

export type SignInWithMetamaskButtonProps = Pick<
  ButtonProps,
  'redirectUrl' | 'children'
>;

export type SignOutButtonProps = {
  signOutCallback?: SignOutCallback;
  children?: React.ReactNode;
};

export type RedirectToProps = {
  /**
   * @deprecated The returnBack prop has been deprecated and will be removed soon.  Use `redirectUrl` instead.
   */
  returnBack?: boolean;
} & RedirectOptions;
