import { ClientResource } from './client';
import { DisplayThemeJSON } from './json';
import { OrganizationResource } from './organization';
import { MembershipRole, OrganizationMembershipResource } from './organizationMembership';
import { ActiveSessionResource } from './session';
import { UserResource } from './user';
import { DeepPartial, DeepSnakeToCamel } from './utils';

export type ListenerCallback = (emission: Resources) => void;
export type UnsubscribeCallback = () => void;
export type BeforeEmitCallback = (session: ActiveSessionResource | null) => void | Promise<any>;

export type SignOutCallback = () => void | Promise<any>;

export type SignOutOptions = {
  /**
   * Specify a specific session to sign out. Useful for
   * multi-session applications.
   */
  sessionId?: string;
};

export interface SignOut {
  (options?: SignOutOptions): Promise<void>;
  (signOutCallback?: SignOutCallback, options?: SignOutOptions): Promise<void>;
}

export type SetSession = (
  session: ActiveSessionResource | string | null,
  beforeEmit?: BeforeEmitCallback,
) => Promise<void>;

/**
 * Main Clerk SDK object.
 */
export interface Clerk {
  /**
   * Clerk SDK version number.
   */
  version?: string;

  /** Clerk Frontend API string. */
  frontendApi: string;

  /** Client handling most Clerk operations. */
  client?: ClientResource;

  /** Active Session. */
  session?: ActiveSessionResource | null;

  /** Current User. */
  user?: UserResource | null;

  /**
   * Signs out the current user on single-session instances, or all users on multi-session instances
   * @param signOutCallback - Optional A callback that runs after sign out completes.
   * @param options - Optional Configuration options, see {@link SignOutOptions}
   * @returns A promise that resolves when the sign out process completes.
   */
  signOut: SignOut;

  /**
   * Opens the Clerk sign in modal.
   *
   * @param signInProps Optional sign in configuration parameters.
   */
  openSignIn: (signInProps?: SignInProps) => void;

  /** Closes the Clerk sign in modal. */
  closeSignIn: () => void;

  /**
   * Opens the Clerk sign up modal.
   *
   * @param signUpProps Optional sign up configuration parameters.
   */
  openSignUp: (signUpProps?: SignUpProps) => void;

  /** Closes the Clerk sign up modal. */
  closeSignUp: () => void;

  /**
   * Mounts a sign in flow component at the target element.
   *
   * @param targetNode Target node to mount the SignIn component.
   * @param signInProps sign in configuration parameters.
   */
  mountSignIn: (targetNode: HTMLDivElement, signInProps?: SignInProps) => void;

  /**
   * Unmount a sign in flow component from the target element.
   * If there is no component mounted at the target node, results in a noop.
   *
   * @param targetNode Target node to unmount the SignIn component from.
   */
  unmountSignIn: (targetNode: HTMLDivElement) => void;

  /**
   * Mounts a sign up flow component at the target element.
   *
   * @param targetNode Target node to mount the SignUp component.
   * @param signUnProps sign up configuration parameters.
   */
  mountSignUp: (targetNode: HTMLDivElement, signUnProps?: SignUpProps) => void;

  /**
   * Unmount a sign up flow component from the target element.
   * If there is no component mounted at the target node, results in a noop.
   *
   * @param targetNode Target node to unmount the SignUp component from.
   */
  unmountSignUp: (targetNode: HTMLDivElement) => void;

  /**
   * Mount a user button component at the target element.
   *
   * @param targetNode Target node to mount the UserButton component.
   * @param userButtonProps User button configuration parameters.
   */
  mountUserButton: (targetNode: HTMLDivElement, userButtonProps?: UserButtonProps) => void;

  /**
   * Unmount a user button component at the target element.
   * If there is no component mounted at the target node, results in a noop.
   *
   * @param targetNode Target node to unmount the UserButton component from.
   */
  unmountUserButton: (targetNode: HTMLDivElement) => void;

  /**
   * Mount a user profile component at the target element.
   *
   * @param targetNode Target to mount the UserProfile component.
   * @param userProfileProps User profile configuration parameters.
   */
  mountUserProfile: (targetNode: HTMLDivElement, userProfileProps?: UserProfileProps) => void;

  /**
   * Unmount a user profile component at the target element.
   * If there is no component mounted at the target node, results in a noop.
   *
   * @param targetNode Target node to unmount the UserProfile component from.
   */
  unmountUserProfile: (targetNode: HTMLDivElement) => void;

  /**
   * Register a listener that triggers a callback each time important Clerk resources are changed.
   * Allows to hook up at different steps in the sign up, sign in processes.
   *
   * Some important checkpoints:
   *    When there is an active session, user === session.user.
   *    When there is no active session, user and session will both be null.
   *    When a session is loading, user and session will be undefined.
   *
   * @param callback Callback function receiving the most updated Clerk resources after a change.
   * @returns - Unsubscribe callback
   */
  addListener: (callback: ListenerCallback) => UnsubscribeCallback;

  /**
   * Set the current session explicitly.
   *
   * Setting the session to `null` deletes the active session.
   *
   * @param session Passed session resource object, session id (string version) or null
   * @param beforeEmit Callback run just before the active session is set to the passed object. Can be used to hook up for pre-navigation actions.
   */
  setSession: SetSession;

  /**
   * Function used to commit a navigation after certain steps in the Clerk processes.
   *
   */
  navigate: CustomNavigation;

  /**
   * Redirects to the configured sign in URL. Retrieved from {@link environment}.
   *
   * @param opts A {@link RedirectOptions} object
   */
  redirectToSignIn(opts?: RedirectOptions): Promise<unknown>;

  /**
   * Redirects to the configured sign up URL. Retrieved from {@link environment}.
   *
   * @param opts A {@link RedirectOptions} object
   */
  redirectToSignUp(opts?: RedirectOptions): Promise<unknown>;

  /**
   * Redirects to the configured user profile URL. Retrieved from {@link environment}.
   */
  redirectToUserProfile: () => void;

  /**
   * Completes an OAuth flow started by {@link Clerk.client.signIn.authenticateWithRedirect} or {@link Clerk.client.signUp.authenticateWithRedirect}
   */
  handleRedirectCallback: (
    params: HandleOAuthCallbackParams,
    customNavigate?: (to: string) => Promise<unknown>,
  ) => Promise<unknown>;

  /**
   * Completes a Magic Link flow  started by {@link Clerk.client.signIn.createMagicLinkFlow} or {@link Clerk.client.signUp.createMagicLinkFlow}
   */
  handleMagicLinkVerification: (
    params: HandleMagicLinkVerificationParams,
    customNavigate?: (to: string) => Promise<unknown>,
  ) => Promise<unknown>;

  /**
   * Authenticates user using their Metamask browser extension
   */
  authenticateWithMetamask: (params?: AuthenticateWithMetamaskParams) => Promise<unknown>;

  /**
   * Creates an organization, adding the current user as admin.
   */
  createOrganization: (params: CreateOrganizationParams) => Promise<OrganizationResource>;

  /**
   * Retrieves all the organizations the current user is a member of.
   */
  getOrganizationMemberships: () => Promise<OrganizationMembershipResource[]>;

  /**
   * Retrieves a single organization by id.
   */
  getOrganization: (organizationId: string) => Promise<OrganizationResource | undefined>;

  /**
   * Handles a 401 response from Frontend API by refreshing the client and session object accordingly
   */
  handleUnauthenticated: () => Promise<unknown>;

  /**
   * Returns true if bootstrapping with Clerk.load has completed successfully. Otherwise, returns false.
   */
  isReady: () => boolean;
}

export type HandleOAuthCallbackParams = {
  /**
   * Full URL or path to navigate after successful sign up.
   */
  afterSignUpUrl?: string | null;

  /**
   * Full URL or path to navigate after successful sign in.
   */
  afterSignInUrl?: string | null;

  /**
   * Full URL or path to navigate after successful sign in
   * or sign up.
   *
   * The same as setting afterSignInUrl and afterSignUpUrl
   * to the same value.
   */
  redirectUrl?: string | null;

  /**
   * Full URL or path to navigate during sign in,
   * if 2FA is enabled.
   */
  secondFactorUrl?: string;
};

// TODO: Make sure Isomorphic Clerk navigate can work with the correct type:
// (to: string) => Promise<unknown>
export type CustomNavigation = (to: string) => Promise<unknown> | void;

export type ClerkThemeOptions = DeepSnakeToCamel<DeepPartial<DisplayThemeJSON>>;

export interface ClerkOptions {
  navigate?: (to: string) => Promise<unknown> | unknown;
  polling?: boolean;
  selectInitialSession?: (client: ClientResource) => ActiveSessionResource | null;
  theme?: ClerkThemeOptions;
}

export interface Resources {
  client: ClientResource;
  session?: ActiveSessionResource | null;
  user?: UserResource | null;
}

export type RoutingStrategy = 'path' | 'hash' | 'virtual';

export type RedirectOptions = {
  /**
   * Full URL or path to navigate after successful sign in.
   */
  afterSignInUrl?: string | null;

  /**
   * Full URL or path to navigate after successful sign up.
   * Sets the afterSignUpUrl if the "Sign up" link is clicked.
   */
  afterSignUpUrl?: string | null;

  /**
   * Full URL or path to navigate after successful sign in,
   * or sign up.
   *
   * The same as setting afterSignInUrl and afterSignUpUrl
   * to the same value.
   */
  redirectUrl?: string | null;
};

export type SignInProps = {
  /*
   * Page routing strategy
   */
  routing?: RoutingStrategy;

  /*
   * Root URL where the component is mounted on, eg: '/sign in'
   */
  path?: string;

  /**
   * Full URL or path to for the sign up process.
   * Used to fill the "Sign up" link in the SignUp component.
   */
  signUpUrl?: string;
} & RedirectOptions;

export type SignUpProps = {
  /*
   * Page routing strategy
   */
  routing?: RoutingStrategy;

  /*
   * Root URL where the component is mounted on, eg: '/sign up'
   */
  path?: string;

  /**
   * Full URL or path to for the sign in process.
   * Used to fill the "Sign in" link in the SignUp component.
   */
  signInUrl?: string;
} & RedirectOptions;

export type UserProfileProps = {
  /*
   * Page routing strategy
   */
  routing?: RoutingStrategy;

  /*
   * Root URL where the component is mounted on, eg: '/user'
   */
  path?: string;

  /*
   * Hides the default navigation bar
   */
  hideNavigation?: boolean;

  /*
   * Renders only a specific view of the component eg: 'security'
   */
  only?: 'account' | 'security';
};

export type UserButtonProps = {
  /**
   * Controls if the user name is displayed next to the trigger button
   */
  showName?: boolean;

  /**
   * Full URL or path to navigate after sign out is complete
   */
  afterSignOutUrl?: string;

  /**
   * Full URL or path to navigate after signing out the current user is complete.
   * This option applies to multi-session applications.
   */
  afterMultiSessionSingleSignOutUrl?: string;

  /*
   * Full URL or path leading to the
   * account management interface.
   */
  userProfileUrl?: string;

  /**
   * Full URL or path to navigate on "Add another account" action.
   * Multi-session mode only.
   */
  signInUrl?: string;

  /**
   * Full URL or path to navigate after successful account change.
   * Multi-session mode only.
   */
  afterSwitchSessionUrl?: string;
};

export interface HandleMagicLinkVerificationParams {
  /**
   * Full URL or path to navigate after successful magic link verification
   * on completed sign up or sign in on the same device.
   */
  redirectUrlComplete?: string;
  /**
   * Full URL or path to navigate after successful magic link verification
   * on the same device, but not completed sign in or sign up.
   */
  redirectUrl?: string;
  /**
   * Callback function to be executed after successful magic link
   * verification on another device.
   */
  onVerifiedOnOtherDevice?: () => void;
}

export type CreateOrganizationInvitationParams = {
  emailAddress: string;
  role: MembershipRole;
  redirectUrl?: string;
};

export interface CreateOrganizationParams {
  name: string;
  slug?: string;
}

export interface AuthenticateWithMetamaskParams {
  redirectUrl?: string;
}

export interface LoadedClerk extends Clerk {
  client: ClientResource;
}
