import type {
  Appearance,
  CreateOrganizationTheme,
  OrganizationProfileTheme,
  OrganizationSwitcherTheme,
  SignInTheme,
  SignUpTheme,
  UserButtonTheme,
  UserProfileTheme,
} from './appearance';
import type { ClientResource } from './client';
import type { DisplayThemeJSON } from './json';
import type { LocalizationResource } from './localization';
import type { OAuthProvider, OAuthScope } from './oauth';
import type { OrganizationResource } from './organization';
import type { OrganizationInvitationResource } from './organizationInvitation';
import type { MembershipRole, OrganizationMembershipResource } from './organizationMembership';
import type { ActiveSessionResource } from './session';
import type { UserResource } from './user';
import type { DeepPartial, DeepSnakeToCamel } from './utils';

export type InstanceType = 'production' | 'development';

export type ListenerCallback = (emission: Resources) => void;
export type UnsubscribeCallback = () => void;
export type BeforeEmitCallback = (session?: ActiveSessionResource | null) => void | Promise<any>;

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

  loaded: boolean;

  /**
   * Clerk Frontend API string
   * @deprecated Use `publishableKey` instead.
   */
  frontendApi: string;

  /** Clerk Publishable Key string. */
  publishableKey?: string;

  /** Clerk Proxy url string. */
  proxyUrl?: string;

  /** Clerk Satellite Frontend API string. */
  domain: string;

  /** Clerk Flag for satellite apps. */
  isSatellite: boolean;

  instanceType?: InstanceType;

  /** Client handling most Clerk operations. */
  client?: ClientResource;

  /** Active Session. */
  session?: ActiveSessionResource | null;

  /** Active Organization */
  organization?: OrganizationResource | null;

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
   * Opens the Clerk SignIn component in a modal.
   * @param props Optional sign in configuration parameters.
   */
  openSignIn: (props?: SignInProps) => void;

  /**
   * Closes the Clerk SignIn modal.
   */
  closeSignIn: () => void;

  /**
   * Opens the Clerk SignUp component in a modal.
   * @param props Optional props that will be passed to the SignUp component.
   */
  openSignUp: (props?: SignUpProps) => void;

  /**
   * Closes the Clerk SignUp modal.
   */
  closeSignUp: () => void;

  /**
   * Opens the Clerk UserProfile modal.
   * @param props Optional props that will be passed to the UserProfile component.
   */
  openUserProfile: (props?: UserProfileProps) => void;

  /**
   * Closes the Clerk UserProfile modal.
   */
  closeUserProfile: () => void;

  /**
   * Opens the Clerk OrganizationProfile modal.
   * @param props Optional props that will be passed to the OrganizationProfile component.
   */
  openOrganizationProfile: (props?: OrganizationProfileProps) => void;

  /**
   * Closes the Clerk OrganizationProfile modal.
   */
  closeOrganizationProfile: () => void;

  /**
   * Opens the Clerk CreateOrganization modal.
   * @param props Optional props that will be passed to the CreateOrganization component.
   */
  openCreateOrganization: (props?: CreateOrganizationProps) => void;

  /**
   * Closes the Clerk CreateOrganization modal.
   */
  closeCreateOrganization: () => void;

  /**
   * Mounts a sign in flow component at the target element.
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
   * @param signUpProps sign up configuration parameters.
   */
  mountSignUp: (targetNode: HTMLDivElement, signUpProps?: SignUpProps) => void;

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
   * Mount an organization profile component at the target element.
   * @param targetNode Target to mount the UserProfile component.
   * @param props Configuration parameters.
   */
  mountOrganizationProfile: (targetNode: HTMLDivElement, props?: OrganizationProfileProps) => void;

  /**
   * Unmount the organization profile component from the target node.
   * @param targetNode Target node to unmount the UserProfile component from.
   */
  unmountOrganizationProfile: (targetNode: HTMLDivElement) => void;

  /**
   * Mount a CreateOrganization component at the target element.
   * @param targetNode Target to mount the CreateOrganization component.
   * @param props Configuration parameters.
   */
  mountCreateOrganization: (targetNode: HTMLDivElement, props?: CreateOrganizationProps) => void;

  /**
   * Unmount the CreateOrganization component from the target node.
   * @param targetNode Target node to unmount the CreateOrganization component from.
   */
  unmountCreateOrganization: (targetNode: HTMLDivElement) => void;

  /**
   * Mount an organization switcher component at the target element.
   * @param targetNode Target to mount the UserProfile component.
   * @param props Configuration parameters.
   */
  mountOrganizationSwitcher: (targetNode: HTMLDivElement, props?: OrganizationSwitcherProps) => void;

  /**
   * Unmount the organization profile component from the target node.*
   * @param targetNode Target node to unmount the UserProfile component from.
   */
  unmountOrganizationSwitcher: (targetNode: HTMLDivElement) => void;

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
   * Set the active session and organization explicitly.
   *
   * If the session param is `null`, the active session is deleted.
   * In a similar fashion, if the organization param is `null`, the current organization is removed as active.
   */
  setActive: SetActive;

  /**
   * @deprecated This method is deprecated and will be removed in the future. Use {@link Clerk.setActive} instead
   * Set the current session explicitly. Setting the session to `null` unsets the active session and signs out the user.
   * @param session Passed session resource object, session id (string version) or null
   * @param beforeEmit Callback run just before the active session is set to the passed object. Can be used to hook up for pre-navigation actions.
   */
  setSession: SetSession;

  /**
   * Function used to commit a navigation after certain steps in the Clerk processes.
   */
  navigate: CustomNavigation;

  /**
   * Decorates the provided url with the auth token for development instances.
   *
   * @param {string} to
   * @param opts A {@link BuildUrlWithAuthParams} object
   */
  buildUrlWithAuth(to: string, opts?: BuildUrlWithAuthParams): string;

  /**
   * Returns the configured url where <SignIn/> is mounted or a custom sign-in page is rendered.
   *
   * @param opts A {@link RedirectOptions} object
   */
  buildSignInUrl(opts?: RedirectOptions): string;

  /**
   * Returns the configured url where <SignUp/> is mounted or a custom sign-up page is rendered.
   *
   * @param opts A {@link RedirectOptions} object
   */
  buildSignUpUrl(opts?: RedirectOptions): string;

  /**
   * Returns the url where <UserProfile /> is mounted or a custom user-profile page is rendered.
   */
  buildUserProfileUrl(): string;

  /**
   * Returns the configured url where <CreateOrganization /> is mounted or a custom create-organization page is rendered.
   */
  buildCreateOrganizationUrl(): string;

  /**
   * Returns the configured url where <OrganizationProfile /> is mounted or a custom organization-profile page is rendered.
   */
  buildOrganizationProfileUrl(): string;

  /**
   * Returns the configured home URL of the instance.
   */
  buildHomeUrl(): string;

  /**
   *
   * Redirects to the provided url after decorating it with the auth token for development instances.
   *
   * @param {string} to
   */
  redirectWithAuth(to: string): Promise<unknown>;

  /**
   * Redirects to the configured URL where <SignIn/> is mounted.
   *
   * @param opts A {@link RedirectOptions} object
   */
  redirectToSignIn(opts?: RedirectOptions): Promise<unknown>;

  /**
   * Redirects to the configured URL where <SignUp/> is mounted.
   *
   * @param opts A {@link RedirectOptions} object
   */
  redirectToSignUp(opts?: RedirectOptions): Promise<unknown>;

  /**
   * Redirects to the configured URL where <UserProfile/> is mounted.
   */
  redirectToUserProfile: () => void;

  /**
   * Redirects to the configured URL where <OrganizationProfile /> is mounted.
   */
  redirectToOrganizationProfile: () => void;

  /**
   * Redirects to the configured URL where <CreateOrganization /> is mounted.
   */
  redirectToCreateOrganization: () => void;

  /**
   * Redirects to the configured home URL of the instance.
   */
  redirectToHome: () => void;

  /**
   * Completes an OAuth or SAML redirection flow started by
   * {@link Clerk.client.signIn.authenticateWithRedirect} or {@link Clerk.client.signUp.authenticateWithRedirect}
   */
  handleRedirectCallback: (
    params: HandleOAuthCallbackParams | HandleSamlCallbackParams,
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
   * if identifier verification is required.
   */
  firstFactorUrl?: string;

  /**
   * Full URL or path to navigate during sign in,
   * if 2FA is enabled.
   */
  secondFactorUrl?: string;

  /**
   * Full URL or path to navigate after an incomplete sign up.
   */
  continueSignUpUrl?: string | null;

  /**
   * Full URL or path to navigate after requesting email verification.
   */
  verifyEmailAddressUrl?: string | null;

  /**
   * Full URL or path to navigate after requesting phone verification.
   */
  verifyPhoneNumberUrl?: string | null;
};

/**
 * @experimental
 */
export type HandleSamlCallbackParams = HandleOAuthCallbackParams;

export type BuildUrlWithAuthParams = {
  /**
   * Controls if dev browser JWT is added as a query param
   */
  useQueryParam?: boolean | null;
};

// TODO: Make sure Isomorphic Clerk navigate can work with the correct type:
// (to: string) => Promise<unknown>
export type CustomNavigation = (to: string) => Promise<unknown> | void;

export type ClerkThemeOptions = DeepSnakeToCamel<DeepPartial<DisplayThemeJSON>>;

export interface ClerkOptions {
  appearance?: Appearance;
  localization?: LocalizationResource;
  navigate?: (to: string) => Promise<unknown> | unknown;
  polling?: boolean;
  selectInitialSession?: (client: ClientResource) => ActiveSessionResource | null;
  /** Controls if ClerkJS will load with the standard browser setup using Clerk cookies */
  standardBrowser?: boolean;
  /** Optional support email for display in authentication screens */
  supportEmail?: string;
  touchSession?: boolean;
  signInUrl?: string;
  signUpUrl?: string;
  afterSignInUrl?: string;
  afterSignUpUrl?: string;
  allowedRedirectOrigins?: Array<string | RegExp>;

  /**
   * Indicates that clerk.js is will be loaded from interstitial
   * Defaults to false
   */
  isInterstitial?: boolean;

  /**
   * @experimental
   */
  isSatellite?: boolean | ((url: URL) => boolean);
}

export interface Resources {
  client: ClientResource;
  session?: ActiveSessionResource | null;
  user?: UserResource | null;
  organization?: OrganizationResource | null;
  lastOrganizationInvitation?: OrganizationInvitationResource | null;
  lastOrganizationMember?: OrganizationMembershipResource | null;
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

export type SetActiveParams = {
  /**
   * The session resource or session id (string version) to be set as active.
   * If `null`, the current session is deleted.
   */
  session?: ActiveSessionResource | string | null;

  /**
   * The organization resource or organization id (string version) to be set as active in the current session.
   * If `null`, the currently active organization is removed as active.
   */
  organization?: OrganizationResource | string | null;

  /**
   * Callback run just before the active session and/or organization is set to the passed object.
   * Can be used to hook up for pre-navigation actions.
   */
  beforeEmit?: BeforeEmitCallback;
};

export type SetActive = (params: SetActiveParams) => Promise<void>;

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
  /**
   * Customisation options to fully match the Clerk components to your own brand.
   * These options serve as overrides and will be merged with the global `appearance`
   * prop of ClerkProvided (if one is provided)
   */
  appearance?: SignInTheme;
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
  /**
   * Customisation options to fully match the Clerk components to your own brand.
   * These options serve as overrides and will be merged with the global `appearance`
   * prop of ClerkProvided (if one is provided)
   */
  appearance?: SignUpTheme;

  /**
   * Additional arbitrary metadata to be stored alongside the User object
   */
  unsafeMetadata?: SignUpUnsafeMetadata;
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
  /**
   * Customisation options to fully match the Clerk components to your own brand.
   * These options serve as overrides and will be merged with the global `appearance`
   * prop of ClerkProvided (if one is provided)
   */
  appearance?: UserProfileTheme;
  /*
   * Specify additional scopes per OAuth provider that your users would like to provide if not already approved.
   * e.g. <UserProfile additionalOAuthScopes={{google: ['foo', 'bar'], github: ['qux']}} />
   */
  additionalOAuthScopes?: Partial<Record<OAuthProvider, OAuthScope[]>>;
};

export type OrganizationProfileProps = {
  /*
   * Page routing strategy
   */
  routing?: RoutingStrategy;
  /*
   * Root URL where the component is mounted on, eg: '/user'
   */
  path?: string;
  /**
   * Full URL or path to navigate to after the user leaves the currently active organization.
   * @default undefined
   */
  afterLeaveOrganizationUrl?: string;
  /**
   * Customisation options to fully match the Clerk components to your own brand.
   * These options serve as overrides and will be merged with the global `appearance`
   * prop of ClerkProvided (if one is provided)
   */
  appearance?: OrganizationProfileTheme;
};

export type CreateOrganizationProps = {
  /*
   * Page routing strategy
   */
  routing?: RoutingStrategy;
  /*
   * Root URL where the component is mounted on, eg: '/user'
   */
  path?: string;
  /**
   * Full URL or path to navigate after creating a new organization.
   * @default undefined
   */
  afterCreateOrganizationUrl?:
    | ((organization: OrganizationResource) => string)
    | LooseExtractedParams<PrimitiveKeys<OrganizationResource>>;
  /**
   * Hides the screen for sending invitations after an organization is created.
   * @default undefined When left undefined Clerk will automatically hide the screen if
   * the number of max allowed members is equal to 1
   */
  skipInvitationScreen?: boolean;
  /**
   * Customisation options to fully match the Clerk components to your own brand.
   * These options serve as overrides and will be merged with the global `appearance`
   * prop of ClerkProvided (if one is provided)
   */
  appearance?: CreateOrganizationTheme;
};

export type UserButtonProps = {
  /**
   * Controls if the username is displayed next to the trigger button
   */
  showName?: boolean;
  /**
   Controls the default state of the UserButton
   */
  defaultOpen?: boolean;
  /**
   * Full URL or path to navigate after sign out is complete
   */
  afterSignOutUrl?: string;
  /**
   * Full URL or path to navigate after signing out the current user is complete.
   * This option applies to multi-session applications.
   */
  afterMultiSessionSingleSignOutUrl?: string;
  /**
   *  Full URL or path leading to the
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
  /**
   * Controls whether clicking the "Manage your account" button will cause
   * the UserProfile component to open as a modal, or if the browser will navigate
   * to the `userProfileUrl` where UserProfile is mounted as a page.
   * @default 'modal'
   */
  userProfileMode?: 'modal' | 'navigation';
  /**
   * Customisation options to fully match the Clerk components to your own brand.
   * These options serve as overrides and will be merged with the global `appearance`
   * prop of ClerkProvided (if one is provided)
   */
  appearance?: UserButtonTheme & { userProfile?: UserProfileTheme };

  /*
   * Specify options for the underlying <UserProfile /> component.
   * e.g. <UserButton userProfileProps={{additionalOAuthScopes: {google: ['foo', 'bar'], github: ['qux']}}} />
   */
  userProfileProps?: Pick<UserProfileProps, 'additionalOAuthScopes'>;
};

type PrimitiveKeys<T> = {
  [K in keyof T]: T[K] extends string | boolean | number | null ? K : never;
}[keyof T];

type LooseExtractedParams<T extends string> = `:${T}` | (string & NonNullable<unknown>);

export type OrganizationSwitcherProps = {
  /**
   Controls the default state of the OrganizationSwitcher
   */
  defaultOpen?: boolean;
  /**
   * By default, users can switch between organization and their personal account.
   * This option controls whether OrganizationSwitcher will include the user's personal account
   * in the organization list. Setting this to `false` will hide the personal account entry,
   * and users will only be able to switch between organizations.
   * @default true
   */
  hidePersonal?: boolean;
  /**
   * Full URL or path to navigate after a successful organization switch.
   * @default undefined
   * @deprecated use `afterSelectOrganizationUrl` or `afterSelectPersonalUrl`
   */
  afterSwitchOrganizationUrl?: string;
  /**
   * Full URL or path to navigate after creating a new organization.
   * @default undefined
   */
  afterCreateOrganizationUrl?:
    | ((organization: OrganizationResource) => string)
    | LooseExtractedParams<PrimitiveKeys<OrganizationResource>>;
  /**
   * Full URL or path to navigate after a successful organization selection.
   * Accepts a function that returns URL or path
   * @default undefined`
   */
  afterSelectOrganizationUrl?:
    | ((organization: OrganizationResource) => string)
    | LooseExtractedParams<PrimitiveKeys<OrganizationResource>>;

  /**
   * Full URL or path to navigate after a successful selection of personal workspace.
   * Accepts a function that returns URL or path
   * @default undefined`
   */
  afterSelectPersonalUrl?: ((user: UserResource) => string) | LooseExtractedParams<PrimitiveKeys<UserResource>>;
  /**
   * Full URL or path to navigate to after the user leaves the currently active organization.
   * @default undefined
   */
  afterLeaveOrganizationUrl?: string;
  /**
   * Controls whether clicking the "Manage organization" button will cause
   * the OrganizationProfile component to open as a modal, or if the browser will navigate
   * to the `organizationProfileUrl` where OrganizationProfile is mounted as a page.
   * @default modal
   */
  organizationProfileMode?: 'modal' | 'navigation';
  /**
   * Controls whether clicking the "Create organization" button will cause
   * the CreateOrganization component to open as a modal, or if the browser will navigate
   * to the `createOrganizationUrl` where CreateOrganization is mounted as a page.
   * @default modal
   */
  createOrganizationMode?: 'modal' | 'navigation';
  /**
   * Full URL or path where the <OrganizationProfile /> component is mounted.
   * @default undefined
   */
  organizationProfileUrl?: string;
  /**
   * Full URL or path where the <CreateOrganization /> component is mounted.
   * @default undefined
   */
  createOrganizationUrl?: string;
  /**
   * Customisation options to fully match the Clerk components to your own brand.
   * These options serve as overrides and will be merged with the global `appearance`
   * prop of ClerkProvided (if one is provided)
   */
  appearance?: OrganizationSwitcherTheme;
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
};

export type CreateBulkOrganizationInvitationParams = {
  emailAddresses: string[];
  role: MembershipRole;
};

export interface CreateOrganizationParams {
  name: string;
  slug?: string;
}

export interface AuthenticateWithMetamaskParams {
  customNavigate?: (to: string) => Promise<unknown>;
  redirectUrl?: string;
  signUpContinueUrl?: string;
  unsafeMetadata?: SignUpUnsafeMetadata;
}

export interface LoadedClerk extends Clerk {
  client: ClientResource;
}
