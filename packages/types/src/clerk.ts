import type { ClerkAPIResponseError } from './api';
import type { APIKeysNamespace } from './apiKeys';
import type {
  APIKeysTheme,
  Appearance,
  CheckoutTheme,
  CreateOrganizationTheme,
  OAuthConsentTheme,
  OrganizationListTheme,
  OrganizationProfileTheme,
  OrganizationSwitcherTheme,
  PlanDetailTheme,
  PricingTableTheme,
  SignInTheme,
  SignUpTheme,
  SubscriptionDetailsTheme,
  TaskSelectOrganizationTheme,
  UserButtonTheme,
  UserProfileTheme,
  UserVerificationTheme,
  WaitlistTheme,
} from './appearance';
import type { ClientResource } from './client';
import type {
  CommerceBillingNamespace,
  CommerceCheckoutResource,
  CommercePlanResource,
  CommerceSubscriptionPlanPeriod,
  ConfirmCheckoutParams,
  ForPayerType,
} from './commerce';
import type { CustomMenuItem } from './customMenuItems';
import type { CustomPage } from './customPages';
import type { InstanceType } from './instance';
import type { DisplayThemeJSON } from './json';
import type { LocalizationResource } from './localization';
import type { OAuthProvider, OAuthScope } from './oauth';
import type { OrganizationResource } from './organization';
import type { OrganizationCustomRoleKey } from './organizationMembership';
import type {
  AfterMultiSessionSingleSignOutUrl,
  AfterSignOutUrl,
  LegacyRedirectProps,
  NewSubscriptionRedirectUrl,
  RedirectOptions,
  RedirectUrlProp,
  SignInFallbackRedirectUrl,
  SignInForceRedirectUrl,
  SignUpFallbackRedirectUrl,
  SignUpForceRedirectUrl,
} from './redirects';
import type { PendingSessionOptions, SessionTask, SignedInSessionResource } from './session';
import type { SessionVerificationLevel } from './sessionVerification';
import type { SignInResource } from './signIn';
import type { SignUpResource } from './signUp';
import type { ClientJSONSnapshot, EnvironmentJSONSnapshot } from './snapshots';
import type { Web3Strategy } from './strategies';
import type { TelemetryCollector } from './telemetry';
import type { UserResource } from './user';
import type { Autocomplete, DeepPartial, DeepSnakeToCamel } from './utils';
import type { WaitlistResource } from './waitlist';

type __experimental_CheckoutStatus = 'needs_initialization' | 'needs_confirmation' | 'completed';

export type __experimental_CheckoutCacheState = Readonly<{
  isStarting: boolean;
  isConfirming: boolean;
  error: ClerkAPIResponseError | null;
  checkout: CommerceCheckoutResource | null;
  fetchStatus: 'idle' | 'fetching' | 'error';
  status: __experimental_CheckoutStatus;
}>;

export type __experimental_CheckoutOptions = {
  for?: ForPayerType;
  planPeriod: CommerceSubscriptionPlanPeriod;
  planId: string;
};

type CheckoutResult =
  | {
      data: CommerceCheckoutResource;
      error: null;
    }
  | {
      data: null;
      error: ClerkAPIResponseError;
    };

export type __experimental_CheckoutInstance = {
  confirm: (params: ConfirmCheckoutParams) => Promise<CheckoutResult>;
  start: () => Promise<CheckoutResult>;
  clear: () => void;
  finalize: (params?: { redirectUrl: string }) => Promise<void>;
  subscribe: (listener: (state: __experimental_CheckoutCacheState) => void) => () => void;
  getState: () => __experimental_CheckoutCacheState;
};

type __experimental_CheckoutFunction = (options: __experimental_CheckoutOptions) => __experimental_CheckoutInstance;

/**
 * @inline
 */
export type SDKMetadata = {
  /**
   * The npm package name of the SDK.
   */
  name: string;
  /**
   * The npm package version of the SDK.
   */
  version: string;
  /**
   * Typically this will be the `NODE_ENV` that the SDK is currently running in.
   */
  environment?: string;
};

export type ListenerCallback = (emission: Resources) => void;
export type UnsubscribeCallback = () => void;
export type BeforeEmitCallback = (session?: SignedInSessionResource | null) => void | Promise<any>;

export type SignOutCallback = () => void | Promise<any>;

export type SignOutOptions = {
  /**
   * Specify a specific session to sign out. Useful for
   * multi-session applications.
   */
  sessionId?: string;
  /**
   * Specify a redirect URL to navigate to after sign out is complete.
   */
  redirectUrl?: string;
};

/**
 * @inline
 */
export interface SignOut {
  (options?: SignOutOptions): Promise<void>;

  (signOutCallback?: SignOutCallback, options?: SignOutOptions): Promise<void>;
}

type ClerkEvent = keyof ClerkEventPayload;
type EventHandler<E extends ClerkEvent> = (payload: ClerkEventPayload[E]) => void;
export type ClerkEventPayload = {
  status: ClerkStatus;
};
type OnEventListener = <E extends ClerkEvent>(event: E, handler: EventHandler<E>, opt?: { notify: boolean }) => void;
type OffEventListener = <E extends ClerkEvent>(event: E, handler: EventHandler<E>) => void;

/**
 * @inline
 */
export type ClerkStatus = 'degraded' | 'error' | 'loading' | 'ready';

/**
 * Main Clerk SDK object.
 */
export interface Clerk {
  /**
   * Clerk SDK version number.
   */
  version: string | undefined;

  /**
   * If present, contains information about the SDK that the host application is using.
   * For example, if Clerk is loaded through `@clerk/nextjs`, this would be `{ name: '@clerk/nextjs', version: '1.0.0' }`
   */
  sdkMetadata: SDKMetadata | undefined;

  /**
   * If true the bootstrapping of Clerk.load() has completed successfully.
   */
  loaded: boolean;

  /**
   * Describes the state the clerk singleton operates in:
   * - `"error"`: Clerk failed to initialize.
   * - `"loading"`: Clerk is still attempting to load.
   * - `"ready"`: Clerk singleton is fully operational.
   * - `"degraded"`: Clerk singleton is partially operational.
   */
  status: ClerkStatus;

  /**
   * @internal
   */
  __internal_getOption<K extends keyof ClerkOptions>(key: K): ClerkOptions[K];

  frontendApi: string;

  /** Clerk Publishable Key string. */
  publishableKey: string;

  /** Clerk Proxy url string. */
  proxyUrl: string | undefined;

  /** Clerk Satellite Frontend API string. */
  domain: string;

  /** Clerk Flag for satellite apps. */
  isSatellite: boolean;

  /** Clerk Instance type is defined from the Publishable key */
  instanceType: InstanceType | undefined;

  /** Clerk flag for loading Clerk in a standard browser setup */
  isStandardBrowser: boolean | undefined;

  /**
   * Indicates whether the current user has a valid signed-in client session
   */
  isSignedIn: boolean;

  /** Client handling most Clerk operations. */
  client: ClientResource | undefined;

  /** Current Session. */
  session: SignedInSessionResource | null | undefined;

  /** Active Organization */
  organization: OrganizationResource | null | undefined;

  /** Current User. */
  user: UserResource | null | undefined;

  /**
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
   * @see https://clerk.com/docs/billing/overview
   *
   * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
   * @example
   * ```tsx
   * <ClerkProvider clerkJsVersion="x.x.x" />
   * ```
   */
  billing: CommerceBillingNamespace;

  telemetry: TelemetryCollector | undefined;

  __internal_country?: string | null;

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
  openSignIn: (props?: SignInModalProps) => void;

  /**
   * Closes the Clerk SignIn modal.
   */
  closeSignIn: () => void;

  /**
   * Opens the Clerk Checkout component in a drawer.
   * @param props Optional checkout configuration parameters.
   */
  __internal_openCheckout: (props?: __internal_CheckoutProps) => void;

  /**
   * Closes the Clerk Checkout drawer.
   */
  __internal_closeCheckout: () => void;

  /**
   * Opens the Clerk PlanDetails drawer component in a drawer.
   * @param props `plan` or `planId` parameters are required.
   */
  __internal_openPlanDetails: (props: __internal_PlanDetailsProps) => void;

  /**
   * Closes the Clerk PlanDetails drawer.
   */
  __internal_closePlanDetails: () => void;

  /**
   * Opens the Clerk SubscriptionDetails drawer component in a drawer.
   * @param props Optional configuration parameters.
   */
  __internal_openSubscriptionDetails: (props?: __internal_SubscriptionDetailsProps) => void;

  /**
   * Closes the Clerk SubscriptionDetails drawer.
   */
  __internal_closeSubscriptionDetails: () => void;

  /**
   * Opens the Clerk UserVerification component in a modal.
   * @param props Optional user verification configuration parameters.
   */
  __internal_openReverification: (props?: __internal_UserVerificationModalProps) => void;

  /**
   * Closes the Clerk user verification modal.
   */
  __internal_closeReverification: () => void;

  /**
   * Opens the Google One Tap component.
   * @param props Optional props that will be passed to the GoogleOneTap component.
   */
  openGoogleOneTap: (props?: GoogleOneTapProps) => void;

  /**
   * Opens the Google One Tap component.
   * If the component is not already open, results in a noop.
   */
  closeGoogleOneTap: () => void;

  /**
   * Opens the Clerk SignUp component in a modal.
   * @param props Optional props that will be passed to the SignUp component.
   */
  openSignUp: (props?: SignUpModalProps) => void;

  /**
   * Closes the Clerk SignUp modal.
   */
  closeSignUp: () => void;

  /**
   * Opens the Clerk UserProfile modal.
   * @param props Optional props that will be passed to the UserProfile component.
   */
  openUserProfile: (props?: UserProfileModalProps) => void;

  /**
   * Closes the Clerk UserProfile modal.
   */
  closeUserProfile: () => void;

  /**
   * Opens the Clerk OrganizationProfile modal.
   * @param props Optional props that will be passed to the OrganizationProfile component.
   */
  openOrganizationProfile: (props?: OrganizationProfileModalProps) => void;

  /**
   * Closes the Clerk OrganizationProfile modal.
   */
  closeOrganizationProfile: () => void;

  /**
   * Opens the Clerk CreateOrganization modal.
   * @param props Optional props that will be passed to the CreateOrganization component.
   */
  openCreateOrganization: (props?: CreateOrganizationModalProps) => void;

  /**
   * Closes the Clerk CreateOrganization modal.
   */
  closeCreateOrganization: () => void;

  /**
   * Opens the Clerk Waitlist modal.
   * @param props Optional props that will be passed to the Waitlist component.
   */
  openWaitlist: (props?: WaitlistModalProps) => void;

  /**
   * Closes the Clerk Waitlist modal.
   */
  closeWaitlist: () => void;

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
   * @param targetNode Target to mount the OrganizationProfile component.
   * @param props Configuration parameters.
   */
  mountOrganizationProfile: (targetNode: HTMLDivElement, props?: OrganizationProfileProps) => void;

  /**
   * Unmount the organization profile component from the target node.
   * @param targetNode Target node to unmount the OrganizationProfile component from.
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
   * @param targetNode Target to mount the OrganizationSwitcher component.
   * @param props Configuration parameters.
   */
  mountOrganizationSwitcher: (targetNode: HTMLDivElement, props?: OrganizationSwitcherProps) => void;

  /**
   * Unmount the organization profile component from the target node.*
   * @param targetNode Target node to unmount the OrganizationSwitcher component from.
   */
  unmountOrganizationSwitcher: (targetNode: HTMLDivElement) => void;

  /**
   * Prefetches the data displayed by an organization switcher.
   * It can be used when `mountOrganizationSwitcher({ asStandalone: true})`, to avoid unwanted loading states.
   * This API is still under active development and may change at any moment.
   * @experimental
   * @param props Optional user verification configuration parameters.
   */
  __experimental_prefetchOrganizationSwitcher: () => void;

  /**
   * Mount an organization list component at the target element.
   * @param targetNode Target to mount the OrganizationList component.
   * @param props Configuration parameters.
   */
  mountOrganizationList: (targetNode: HTMLDivElement, props?: OrganizationListProps) => void;

  /**
   * Unmount the organization list component from the target node.*
   * @param targetNode Target node to unmount the OrganizationList component from.
   */
  unmountOrganizationList: (targetNode: HTMLDivElement) => void;

  /**
   * Mount a waitlist at the target element.
   * @param targetNode Target to mount the Waitlist component.
   * @param props Configuration parameters.
   */
  mountWaitlist: (targetNode: HTMLDivElement, props?: WaitlistProps) => void;

  /**
   * Unmount the Waitlist component from the target node.
   * @param targetNode Target node to unmount the Waitlist component from.
   */
  unmountWaitlist: (targetNode: HTMLDivElement) => void;

  /**
   * Mounts a pricing table component at the target element.
   * @param targetNode Target node to mount the PricingTable component.
   * @param props configuration parameters.
   */
  mountPricingTable: (targetNode: HTMLDivElement, props?: PricingTableProps) => void;

  /**
   * Unmount a pricing table component from the target element.
   * If there is no component mounted at the target node, results in a noop.
   *
   * @param targetNode Target node to unmount the PricingTable component from.
   */
  unmountPricingTable: (targetNode: HTMLDivElement) => void;

  /**
   * This API is in early access and may change in future releases.
   *
   * Mount a api keys component at the target element.
   * @experimental
   * @param targetNode Target to mount the APIKeys component.
   * @param props Configuration parameters.
   */
  mountApiKeys: (targetNode: HTMLDivElement, props?: APIKeysProps) => void;

  /**
   * This API is in early access and may change in future releases.
   *
   * Unmount a api keys component from the target element.
   * If there is no component mounted at the target node, results in a noop.
   * @experimental
   * @param targetNode Target node to unmount the ApiKeys component from.
   */
  unmountApiKeys: (targetNode: HTMLDivElement) => void;

  /**
   * Mounts a OAuth consent component at the target element.
   * @param targetNode Target node to mount the OAuth consent component.
   * @param oauthConsentProps OAuth consent configuration parameters.
   */
  __internal_mountOAuthConsent: (targetNode: HTMLDivElement, oauthConsentProps?: __internal_OAuthConsentProps) => void;

  /**
   * Unmounts a OAuth consent component from the target element.
   * @param targetNode Target node to unmount the OAuth consent component from.
   */
  __internal_unmountOAuthConsent: (targetNode: HTMLDivElement) => void;

  /**
   * Mounts a TaskSelectOrganization component at the target element.
   * @param targetNode Target node to mount the TaskSelectOrganization component.
   * @param props configuration parameters.
   */
  mountTaskSelectOrganization: (targetNode: HTMLDivElement, props?: TaskSelectOrganizationProps) => void;

  /**
   * Unmount a TaskSelectOrganization component from the target element.
   * If there is no component mounted at the target node, results in a noop.
   *
   * @param targetNode Target node to unmount the TaskSelectOrganization component from.
   */
  unmountTaskSelectOrganization: (targetNode: HTMLDivElement) => void;

  /**
   * @internal
   * Loads Stripe libraries for commerce functionality
   */
  __internal_loadStripeJs: () => Promise<any>;

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
   * Registers an event handler for a specific Clerk event.
   * @param event - The event name to subscribe to
   * @param handler - The callback function to execute when the event is dispatched
   * @param opt - Optional configuration object
   * @param opt.notify - If true and the event was previously dispatched, handler will be called immediately with the latest payload
   */
  on: OnEventListener;

  /**
   * Removes an event handler for a specific Clerk event.
   * @param event - The event name to unsubscribe from
   * @param handler - The callback function to remove
   */
  off: OffEventListener;

  /**
   * Registers an internal listener that triggers a callback each time `Clerk.navigate` is called.
   * Its purpose is to notify modal UI components when a navigation event occurs, allowing them to close if necessary.
   * @internal
   */
  __internal_addNavigationListener: (callback: () => void) => UnsubscribeCallback;

  /**
   * Registers the internal navigation context from UI components in order to
   * be triggered from `Clerk` methods
   * @internal
   */
  __internal_setComponentNavigationContext: (context: __internal_ComponentNavigationContext) => () => void;

  /**
   * Set the active session and organization explicitly.
   *
   * If the session param is `null`, the active session is deleted.
   * In a similar fashion, if the organization param is `null`, the current organization is removed as active.
   */
  setActive: SetActive;

  /**
   * Function used to commit a navigation after certain steps in the Clerk processes.
   */
  navigate: CustomNavigation;

  /**
   * Decorates the provided url with the auth token for development instances.
   *
   * @param {string} to
   */
  buildUrlWithAuth(to: string): string;

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
   * Returns the configured afterSignInUrl of the instance.
   */
  buildAfterSignInUrl({ params }?: { params?: URLSearchParams }): string;

  /**
   * Returns the configured afterSignInUrl of the instance.
   */
  buildAfterSignUpUrl({ params }?: { params?: URLSearchParams }): string;

  /**
   * Returns the configured afterSignOutUrl of the instance.
   */
  buildAfterSignOutUrl(): string;

  /**
   * Returns the configured newSubscriptionRedirectUrl of the instance.
   */
  buildNewSubscriptionRedirectUrl(): string;

  /**
   * Returns the configured afterMultiSessionSingleSignOutUrl of the instance.
   */
  buildAfterMultiSessionSingleSignOutUrl(): string;

  /**
   * Returns the configured url where <Waitlist/> is mounted or a custom waitlist page is rendered.
   */
  buildWaitlistUrl(opts?: { initialValues?: Record<string, string> }): string;

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
  redirectToSignIn(opts?: SignInRedirectOptions): Promise<unknown>;

  /**
   * Redirects to the configured URL where <SignUp/> is mounted.
   *
   * @param opts A {@link RedirectOptions} object
   */
  redirectToSignUp(opts?: SignUpRedirectOptions): Promise<unknown>;

  /**
   * Redirects to the configured URL where <UserProfile/> is mounted.
   */
  redirectToUserProfile: () => Promise<unknown>;

  /**
   * Redirects to the configured URL where <OrganizationProfile /> is mounted.
   */
  redirectToOrganizationProfile: () => Promise<unknown>;

  /**
   * Redirects to the configured URL where <CreateOrganization /> is mounted.
   */
  redirectToCreateOrganization: () => Promise<unknown>;

  /**
   * Redirects to the configured afterSignIn URL.
   */
  redirectToAfterSignIn: () => void;

  /**
   * Redirects to the configured afterSignUp URL.
   */
  redirectToAfterSignUp: () => void;

  /**
   * Redirects to the configured afterSignOut URL.
   */
  redirectToAfterSignOut: () => void;

  /**
   * Redirects to the configured URL where <Waitlist/> is mounted.
   */
  redirectToWaitlist: () => void;

  /**
   * Completes a Google One Tap redirection flow started by
   * {@link Clerk.authenticateWithGoogleOneTap}
   */
  handleGoogleOneTapCallback: (
    signInOrUp: SignInResource | SignUpResource,
    params: HandleOAuthCallbackParams,
    customNavigate?: (to: string) => Promise<unknown>,
  ) => Promise<unknown>;

  /**
   * Completes an OAuth or SAML redirection flow started by
   * {@link Clerk.client.signIn.authenticateWithRedirect} or {@link Clerk.client.signUp.authenticateWithRedirect}
   */
  handleRedirectCallback: (
    params: HandleOAuthCallbackParams | HandleSamlCallbackParams,
    customNavigate?: (to: string) => Promise<unknown>,
  ) => Promise<unknown>;

  /**
   * Completes a Email Link flow  started by {@link Clerk.client.signIn.createEmailLinkFlow} or {@link Clerk.client.signUp.createEmailLinkFlow}
   */
  handleEmailLinkVerification: (
    params: HandleEmailLinkVerificationParams,
    customNavigate?: (to: string) => Promise<unknown>,
  ) => Promise<unknown>;

  /**
   * Authenticates user using their Metamask browser extension
   */
  authenticateWithMetamask: (params?: AuthenticateWithMetamaskParams) => Promise<unknown>;

  /**
   * Authenticates user using their Coinbase Smart Wallet and browser extension
   */
  authenticateWithCoinbaseWallet: (params?: AuthenticateWithCoinbaseWalletParams) => Promise<unknown>;

  /**
   * Authenticates user using their OKX Wallet browser extension
   */
  authenticateWithOKXWallet: (params?: AuthenticateWithOKXWalletParams) => Promise<unknown>;

  /**
   * Authenticates user using their Web3 Wallet browser extension
   */
  authenticateWithWeb3: (params: ClerkAuthenticateWithWeb3Params) => Promise<unknown>;

  /**
   * Authenticates user using a Google token generated from Google identity services.
   */
  authenticateWithGoogleOneTap: (
    params: AuthenticateWithGoogleOneTapParams,
  ) => Promise<SignInResource | SignUpResource>;

  /**
   * Creates an organization, adding the current user as admin.
   */
  createOrganization: (params: CreateOrganizationParams) => Promise<OrganizationResource>;

  /**
   * Retrieves a single organization by id.
   */
  getOrganization: (organizationId: string) => Promise<OrganizationResource>;

  /**
   * Handles a 401 response from Frontend API by refreshing the client and session object accordingly
   */
  handleUnauthenticated: () => Promise<unknown>;

  joinWaitlist: (params: JoinWaitlistParams) => Promise<WaitlistResource>;

  /**
   * Navigates to the current task or redirects to `redirectUrlComplete` once the session is `active`.
   * @internal
   */
  __internal_navigateToTaskIfAvailable: (params?: __internal_NavigateToTaskIfAvailableParams) => Promise<void>;

  /**
   * This is an optional function.
   * This function is used to load cached Client and Environment resources if Clerk fails to load them from the Frontend API.
   * @internal
   */
  __internal_getCachedResources:
    | (() => Promise<{ client: ClientJSONSnapshot | null; environment: EnvironmentJSONSnapshot | null }>)
    | undefined;

  /**
   * This function is used to reload the initial resources (Environment/Client) from the Frontend API.
   * @internal
   */
  __internal_reloadInitialResources: () => Promise<void>;

  /**
   * Internal flag indicating whether a `setActive` call is in progress. Used to prevent navigations from being
   * initiated outside of the Clerk class.
   */
  __internal_setActiveInProgress: boolean;

  /**
   * Internal flag indicating whether after-auth flows are enabled based on instance settings.
   * @internal
   */
  __internal_hasAfterAuthFlows: boolean;

  /**
   * API Keys Object
   * @experimental
   * This API is in early access and may change in future releases.
   */
  apiKeys: APIKeysNamespace;

  /**
   * Checkout API
   * @experimental
   * This API is in early access and may change in future releases.
   */
  __experimental_checkout: __experimental_CheckoutFunction;
}

export type HandleOAuthCallbackParams = TransferableOption &
  SignInForceRedirectUrl &
  SignInFallbackRedirectUrl &
  SignUpForceRedirectUrl &
  SignUpFallbackRedirectUrl &
  LegacyRedirectProps & {
    /**
     * Full URL or path where the SignIn component is mounted.
     */
    signInUrl?: string;
    /**
     * Full URL or path where the SignUp component is mounted.
     */
    signUpUrl?: string;
    /**
     * Full URL or path to navigate to during sign in,
     * if identifier verification is required.
     */
    firstFactorUrl?: string;
    /**
     * Full URL or path to navigate to during sign in,
     * if 2FA is enabled.
     */
    secondFactorUrl?: string;
    /**
     * Full URL or path to navigate to during sign in,
     * if the user is required to reset their password.
     */
    resetPasswordUrl?: string;
    /**
     * Full URL or path to navigate to after an incomplete sign up.
     */
    continueSignUpUrl?: string | null;
    /**
     * Full URL or path to navigate to after requesting email verification.
     */
    verifyEmailAddressUrl?: string | null;
    /**
     * Full URL or path to navigate to after requesting phone verification.
     */
    verifyPhoneNumberUrl?: string | null;
    /**
     * The underlying resource to optionally reload before processing an OAuth callback.
     */
    reloadResource?: 'signIn' | 'signUp';
  };

export type HandleSamlCallbackParams = HandleOAuthCallbackParams;

export type CustomNavigation = (to: string, options?: NavigateOptions) => Promise<unknown> | void;

export type ClerkThemeOptions = DeepSnakeToCamel<DeepPartial<DisplayThemeJSON>>;

/**
 * Navigation options used to replace or push history changes.
 * Both `routerPush` & `routerReplace` OR none options should be passed.
 */
type ClerkOptionsNavigation =
  | {
      /**
       * A function which takes the destination path as an argument and performs a "push" navigation.
       */
      routerPush?: never;
      /**
       * A function which takes the destination path as an argument and performs a "replace" navigation.
       */
      routerReplace?: never;
      routerDebug?: boolean;
    }
  | {
      routerPush: RouterFn;
      routerReplace: RouterFn;
      routerDebug?: boolean;
    };

export type ClerkOptions = PendingSessionOptions &
  ClerkOptionsNavigation &
  SignInForceRedirectUrl &
  SignInFallbackRedirectUrl &
  SignUpForceRedirectUrl &
  SignUpFallbackRedirectUrl &
  NewSubscriptionRedirectUrl &
  LegacyRedirectProps &
  AfterSignOutUrl &
  AfterMultiSessionSingleSignOutUrl & {
    /**
     * Optional object to style your components. Will only affect [Clerk Components](https://clerk.com/docs/components/overview) and not [Account Portal](https://clerk.com/docs/account-portal/overview) pages.
     */
    appearance?: Appearance;
    /**
     * Optional object to localize your components. Will only affect [Clerk Components](https://clerk.com/docs/components/overview) and not [Account Portal](https://clerk.com/docs/account-portal/overview) pages.
     */
    localization?: LocalizationResource;
    polling?: boolean;
    /**
     * By default, the last signed-in session is used during client initialization. This option allows you to override that behavior, e.g. by selecting a specific session.
     */
    selectInitialSession?: (client: ClientResource) => SignedInSessionResource | null;
    /**
     * By default, ClerkJS is loaded with the assumption that cookies can be set (browser setup). On native platforms this value must be set to `false`.
     */
    standardBrowser?: boolean;
    /**
     * Optional support email for display in authentication screens. Will only affect [Clerk Components](https://clerk.com/docs/components/overview) and not [Account Portal](https://clerk.com/docs/account-portal/overview) pages.
     */
    supportEmail?: string;
    /**
     * By default, the [Clerk Frontend API `touch` endpoint](https://clerk.com/docs/reference/frontend-api/tag/Sessions#operation/touchSession) is called during page focus to keep the last active session alive. This option allows you to disable this behavior.
     */
    touchSession?: boolean;
    /**
     * This URL will be used for any redirects that might happen and needs to point to your primary application on the client-side. This option is optional for production instances. **It is required to be set for a satellite application in a development instance**. It's recommended to use [the environment variable](https://clerk.com/docs/deployments/clerk-environment-variables#sign-in-and-sign-up-redirects) instead.
     */
    signInUrl?: string;
    /**
     * This URL will be used for any redirects that might happen and needs to point to your primary application on the client-side. This option is optional for production instances but **must be set for a satellite application in a development instance**. It's recommended to use [the environment variable](https://clerk.com/docs/deployments/clerk-environment-variables#sign-in-and-sign-up-redirects) instead.
     */
    signUpUrl?: string;
    /**
     * An optional array of domains to validate user-provided redirect URLs against. If no match is made, the redirect is considered unsafe and the default redirect will be used with a warning logged in the console.
     */
    allowedRedirectOrigins?: Array<string | RegExp>;
    /**
     * An optional array of protocols to validate user-provided redirect URLs against. If no match is made, the redirect is considered unsafe and the default redirect will be used with a warning logged in the console.
     */
    allowedRedirectProtocols?: Array<string>;
    /**
     * This option defines that the application is a satellite application.
     */
    isSatellite?: boolean | ((url: URL) => boolean);
    /**
     * Controls whether or not Clerk will collect [telemetry data](https://clerk.com/docs/telemetry). If set to `debug`, telemetry events are only logged to the console and not sent to Clerk.
     */
    telemetry?:
      | false
      | {
          disabled?: boolean;
          /**
           * Telemetry events are only logged to the console and not sent to Clerk
           */
          debug?: boolean;
        };

    /**
     * Contains information about the SDK that the host application is using. You don't need to set this value yourself unless you're [developing an SDK](https://clerk.com/docs/references/sdk/overview).
     */
    sdkMetadata?: SDKMetadata;
    /**
     * The full URL or path to the waitlist page. If `undefined`, will redirect to the [Account Portal waitlist page](https://clerk.com/docs/account-portal/overview#waitlist).
     */
    waitlistUrl?: string;
    /**
     * Enable experimental flags to gain access to new features. These flags are not guaranteed to be stable and may change drastically in between patch or minor versions.
     */
    experimental?: Autocomplete<
      {
        /**
         * Persist the Clerk client to match the user's device with a client.
         * @default true
         */
        persistClient: boolean;
        /**
         * Clerk will rethrow network errors that occur while the user is offline.
         */
        rethrowOfflineNetworkErrors: boolean;
        commerce: boolean;
      },
      Record<string, any>
    >;

    /**
     * The URL a developer should be redirected to in order to claim an instance created in Keyless mode.
     * @internal
     */
    __internal_keyless_claimKeylessApplicationUrl?: string;

    /**
     * After a developer has claimed their instance created by Keyless mode, they can use this URL to find their instance's keys
     * @internal
     */
    __internal_keyless_copyInstanceKeysUrl?: string;

    /**
     * Pass a function that will trigger the unmounting of the Keyless Prompt.
     * It should cause the values of `__internal_claimKeylessApplicationUrl` and `__internal_copyInstanceKeysUrl` to become undefined.
     * @internal
     */
    __internal_keyless_dismissPrompt?: (() => Promise<void>) | null;

    /**
     * Customize the URL paths users are redirected to after sign-in or sign-up when specific
     * session tasks need to be completed.
     *
     * @default undefined - Uses Clerk's default task flow URLs
     */
    taskUrls?: Record<SessionTask['key'], string>;
  };

export interface NavigateOptions {
  replace?: boolean;
  metadata?: RouterMetadata;
}

export interface Resources {
  client: ClientResource;
  session?: SignedInSessionResource | null;
  user?: UserResource | null;
  organization?: OrganizationResource | null;
}

export type RoutingStrategy = 'path' | 'hash' | 'virtual';

/**
 * Internal is a navigation type that affects the component
 *
 */
type NavigationType =
  /**
   * Internal navigations affect the components and alter the
   * part of the URL that comes after the `path` passed to the component.
   * eg  <SignIn path='sign-in'>
   * going from /sign-in to /sign-in/factor-one is an internal navigation
   */
  | 'internal'
  /**
   * Internal navigations affect the components and alter the
   * part of the URL that comes before the `path` passed to the component.
   * eg  <SignIn path='sign-in'>
   * going from /sign-in to / is an external navigation
   */
  | 'external'
  /**
   * Window navigations are navigations towards a different origin
   * and are not handled by the Clerk component or the host app router.
   */
  | 'window';

type RouterMetadata = { routing?: RoutingStrategy; navigationType?: NavigationType };

/**
 * @inline
 */
type RouterFn = (
  /**
   * The destination path
   */
  to: string,
  /**
   * Optional metadata
   */
  metadata?: {
    /**
     * @internal
     */
    __internal_metadata?: RouterMetadata;
    /**
     * Provide a function to be used for navigation.
     */
    windowNavigate: (to: URL | string) => void;
  },
) => Promise<unknown> | unknown;

export type WithoutRouting<T> = Omit<T, 'path' | 'routing'>;

export type SignInInitialValues = {
  emailAddress?: string;
  phoneNumber?: string;
  username?: string;
};

export type SignUpInitialValues = {
  emailAddress?: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
};

export type SignInRedirectOptions = RedirectOptions &
  RedirectUrlProp & {
    /**
     * Initial values that are used to prefill the sign in form.
     */
    initialValues?: SignInInitialValues;
  };

export type SignUpRedirectOptions = RedirectOptions &
  RedirectUrlProp & {
    /**
     * Initial values that are used to prefill the sign up form.
     */
    initialValues?: SignUpInitialValues;
  };

/**
 * The parameters for the `setActive()` method.
 * @interface
 */
export type SetActiveParams = {
  /**
   * The session resource or session ID (string version) to be set as active. If `null`, the current session is deleted.
   */
  session?: SignedInSessionResource | string | null;

  /**
   * The organization resource or organization ID/slug (string version) to be set as active in the current session. If `null`, the currently active organization is removed as active.
   */
  organization?: OrganizationResource | string | null;

  /**
   * @deprecated Use `redirectUrl` instead.
   *
   * Callback run just before the active session and/or organization is set to the passed object. Can be used to set up for pre-navigation actions.
   */
  beforeEmit?: BeforeEmitCallback;

  /**
   * The full URL or path to redirect to just before the active session and/or organization is set.
   */
  redirectUrl?: string;
};

/**
 * @inline
 */
export type SetActive = (setActiveParams: SetActiveParams) => Promise<void>;

export type RoutingOptions =
  | { path: string | undefined; routing?: Extract<RoutingStrategy, 'path'> }
  | { path?: never; routing?: Extract<RoutingStrategy, 'hash' | 'virtual'> };

export type SignInProps = RoutingOptions & {
  /**
   * Full URL or path to navigate to after successful sign in.
   * This value has precedence over other redirect props, environment variables or search params.
   * Use this prop to override the redirect URL when needed.
   * @default undefined
   */
  forceRedirectUrl?: string | null;
  /**
   * Full URL or path to navigate to after successful sign in.
   * This value is used when no other redirect props, environment variables or search params are present.
   * @default undefined
   */
  fallbackRedirectUrl?: string | null;
  /**
   * Full URL or path to for the sign in process.
   * Used to fill the "Sign in" link in the SignUp component.
   */
  signInUrl?: string;
  /**
   * Full URL or path to for the sign up process.
   * Used to fill the "Sign up" link in the SignUp component.
   */
  signUpUrl?: string;
  /**
   * Customisation options to fully match the Clerk components to your own brand.
   * These options serve as overrides and will be merged with the global `appearance`
   * prop of ClerkProvider (if one is provided)
   */
  appearance?: SignInTheme;
  /**
   * Initial values that are used to prefill the sign in or up forms.
   */
  initialValues?: SignInInitialValues & SignUpInitialValues;
  /**
   * Enable experimental flags to gain access to new features. These flags are not guaranteed to be stable and may change drastically in between patch or minor versions.
   */
  __experimental?: Record<string, any> & { newComponents?: boolean };
  /**
   * Full URL or path to for the waitlist process.
   * Used to fill the "Join waitlist" link in the SignUp component.
   */
  waitlistUrl?: string;
  /**
   * Additional arbitrary metadata to be stored alongside the User object
   */
  unsafeMetadata?: SignUpUnsafeMetadata;
  /**
   * Enable sign-in-or-up flow for `<SignIn />` component instance.
   */
  withSignUp?: boolean;
  /**
   * Control whether OAuth flows use redirects or popups.
   */
  oauthFlow?: 'auto' | 'redirect' | 'popup';
  /**
   * Optional for `oauth_<provider>` or `enterprise_sso` strategies. The value to pass to the [OIDC prompt parameter](https://openid.net/specs/openid-connect-core-1_0.html#:~:text=prompt,reauthentication%20and%20consent.) in the generated OAuth redirect URL.
   */
  oidcPrompt?: string;
} & TransferableOption &
  SignUpForceRedirectUrl &
  SignUpFallbackRedirectUrl &
  LegacyRedirectProps &
  AfterSignOutUrl;

export interface TransferableOption {
  /**
   * Indicates whether or not sign in attempts are transferable to the sign up flow.
   * When set to false, prevents opaque sign ups when a user attempts to sign in via OAuth with an email that doesn't exist.
   * @default true
   */
  transferable?: boolean;
}

export type SignInModalProps = WithoutRouting<SignInProps>;

export type __internal_UserVerificationProps = RoutingOptions & {
  /**
   * Non-awaitable callback for when verification is completed successfully
   */
  afterVerification?: () => void;

  /**
   * Non-awaitable callback for when verification is cancelled, (i.e modal is closed)
   */
  afterVerificationCancelled?: () => void;

  /**
   * Defines the steps of the verification flow.
   * When `multiFactor` is used, the user will be prompt for a first factor flow followed by a second factor flow.
   * @default `'secondFactor'`
   */
  level?: SessionVerificationLevel;

  /**
   * Customisation options to fully match the Clerk components to your own brand.
   * These options serve as overrides and will be merged with the global `appearance`
   * prop of ClerkProvider (if one is provided)
   */
  appearance?: UserVerificationTheme;
};

export type __internal_UserVerificationModalProps = WithoutRouting<__internal_UserVerificationProps>;

export type __internal_ComponentNavigationContext = {
  /**
   * The `navigate` reference within the component router context
   */
  navigate: (
    to: string,
    options?: {
      searchParams?: URLSearchParams;
    },
  ) => Promise<unknown>;
  /**
   * This path represents the root route for a specific component type and is used
   * for internal routing and navigation.
   *
   * @example
   * indexPath: '/sign-in'  // When <SignIn path='/sign-in' />
   * indexPath: '/sign-up'  // When <SignUp path='/sign-up' />
   */
  indexPath: string;
};

type GoogleOneTapRedirectUrlProps = SignInForceRedirectUrl & SignUpForceRedirectUrl;

export type GoogleOneTapProps = GoogleOneTapRedirectUrlProps & {
  /**
   * Whether to cancel the Google One Tap request if a user clicks outside the prompt.
   * @default true
   */
  cancelOnTapOutside?: boolean;
  /**
   * Enables upgraded One Tap UX on ITP browsers.
   * Turning this options off, would hide any One Tap UI in such browsers.
   * @default true
   */
  itpSupport?: boolean;
  /**
   * FedCM enables more private sign-in flows without requiring the use of third-party cookies.
   * The browser controls user settings, displays user prompts, and only contacts an Identity Provider such as Google after explicit user consent is given.
   * Backwards compatible with browsers that still support third-party cookies.
   * @default true
   */
  fedCmSupport?: boolean;
  appearance?: SignInTheme;
};

export type SignUpProps = RoutingOptions & {
  /**
   * Full URL or path to navigate to after successful sign up.
   * This value has precedence over other redirect props, environment variables or search params.
   * Use this prop to override the redirect URL when needed.
   * @default undefined
   */
  forceRedirectUrl?: string | null;
  /**
   * Full URL or path to navigate to after successful sign up.
   * This value is used when no other redirect props, environment variables or search params are present.
   * @default undefined
   */
  fallbackRedirectUrl?: string | null;
  /**
   * Full URL or path to for the sign in process.
   * Used to fill the "Sign in" link in the SignUp component.
   */
  signInUrl?: string;
  /**
   * Customisation options to fully match the Clerk components to your own brand.
   * These options serve as overrides and will be merged with the global `appearance`
   * prop of ClerkProvider (if one is provided)
   */
  appearance?: SignUpTheme;

  /**
   * Additional arbitrary metadata to be stored alongside the User object
   */
  unsafeMetadata?: SignUpUnsafeMetadata;
  /**
   * Initial values that are used to prefill the sign up form.
   */
  initialValues?: SignUpInitialValues;
  /**
   * Enable experimental flags to gain access to new features. These flags are not guaranteed to be stable and may change drastically in between patch or minor versions.
   */
  __experimental?: Record<string, any> & { newComponents?: boolean };
  /**
   * Full URL or path to for the waitlist process.
   * Used to fill the "Join waitlist" link in the SignUp component.
   */
  waitlistUrl?: string;
  /**
   * Control whether OAuth flows use redirects or popups.
   */
  oauthFlow?: 'auto' | 'redirect' | 'popup';
  /**
   * Optional for `oauth_<provider>` or `enterprise_sso` strategies. The value to pass to the [OIDC prompt parameter](https://openid.net/specs/openid-connect-core-1_0.html#:~:text=prompt,reauthentication%20and%20consent.) in the generated OAuth redirect URL.
   */
  oidcPrompt?: string;
} & SignInFallbackRedirectUrl &
  SignInForceRedirectUrl &
  LegacyRedirectProps &
  AfterSignOutUrl;

export type SignUpModalProps = WithoutRouting<SignUpProps>;

export type UserProfileProps = RoutingOptions & {
  /**
   * Customisation options to fully match the Clerk components to your own brand.
   * These options serve as overrides and will be merged with the global `appearance`
   * prop of ClerkProvider (if one is provided)
   */
  appearance?: UserProfileTheme;
  /*
   * Specify additional scopes per OAuth provider that your users would like to provide if not already approved.
   * e.g. <UserProfile additionalOAuthScopes={{google: ['foo', 'bar'], github: ['qux']}} />
   */
  additionalOAuthScopes?: Partial<Record<OAuthProvider, OAuthScope[]>>;
  /*
   * Provide custom pages and links to be rendered inside the UserProfile.
   */
  customPages?: CustomPage[];
  /**
   * Specify on which page the user profile modal will open.
   * @experimental
   **/
  __experimental_startPath?: string;
  /**
   * Specify options for the underlying <APIKeys /> component.
   * e.g. <UserProfile apiKeysProps={{ showDescription: true }} />
   * @experimental
   **/
  apiKeysProps?: APIKeysProps;
};

export type UserProfileModalProps = WithoutRouting<UserProfileProps>;

export type OrganizationProfileProps = RoutingOptions & {
  /**
   * Full URL or path to navigate to after the user leaves the currently active organization.
   * @default undefined
   */
  afterLeaveOrganizationUrl?: string;
  /**
   * Customisation options to fully match the Clerk components to your own brand.
   * These options serve as overrides and will be merged with the global `appearance`
   * prop of ClerkProvider (if one is provided)
   */
  appearance?: OrganizationProfileTheme;
  /*
   * Provide custom pages and links to be rendered inside the OrganizationProfile.
   */
  customPages?: CustomPage[];
  /**
   * Specify on which page the organization profile modal will open.
   * @experimental
   **/
  __experimental_startPath?: string;
  /**
   * Specify options for the underlying <APIKeys /> component.
   * e.g. <OrganizationProfile apiKeysProps={{ showDescription: true }} />
   * @experimental
   **/
  apiKeysProps?: APIKeysProps;
};

export type OrganizationProfileModalProps = WithoutRouting<OrganizationProfileProps>;

export type CreateOrganizationProps = RoutingOptions & {
  /**
   * Full URL or path to navigate to after creating a new organization.
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
   * prop of ClerkProvider (if one is provided)
   */
  appearance?: CreateOrganizationTheme;
  /**
   * Hides the optional "slug" field in the organization creation screen.
   * @default false
   */
  hideSlug?: boolean;
};

export type CreateOrganizationModalProps = WithoutRouting<CreateOrganizationProps>;

type UserProfileMode = 'modal' | 'navigation';
type UserButtonProfileMode =
  | {
      userProfileUrl?: never;
      userProfileMode?: Extract<UserProfileMode, 'modal'>;
    }
  | {
      userProfileUrl: string;
      userProfileMode?: Extract<UserProfileMode, 'navigation'>;
    };

export type UserButtonProps = UserButtonProfileMode & {
  /**
   * Controls if the username is displayed next to the trigger button
   */
  showName?: boolean;
  /**
   * Controls the default state of the UserButton
   */
  defaultOpen?: boolean;

  /**
   * If true the `<UserButton />` will only render the popover.
   * Enables developers to implement a custom dialog.
   * This API is experimental and may change at any moment.
   * @experimental
   * @default undefined
   */
  __experimental_asStandalone?: boolean | ((opened: boolean) => void);

  /**
   * Full URL or path to navigate to after sign out is complete
   * @deprecated Configure `afterSignOutUrl` as a global configuration, either in `<ClerkProvider/>` or in `await Clerk.load()`.
   */
  afterSignOutUrl?: string;
  /**
   * Full URL or path to navigate to after signing out the current user is complete.
   * This option applies to multi-session applications.
   * @deprecated Configure `afterMultiSessionSingleSignOutUrl` as a global configuration, either in `<ClerkProvider/>` or in `await Clerk.load()`.
   */
  afterMultiSessionSingleSignOutUrl?: string;
  /**
   * Full URL or path to navigate to on "Add another account" action.
   * Multi-session mode only.
   */
  signInUrl?: string;
  /**
   * Full URL or path to navigate to after successful account change.
   * Multi-session mode only.
   */
  afterSwitchSessionUrl?: string;
  /**
   * Customisation options to fully match the Clerk components to your own brand.
   * These options serve as overrides and will be merged with the global `appearance`
   * prop of ClerkProvider (if one is provided)
   */
  appearance?: UserButtonTheme;

  /*
   * Specify options for the underlying <UserProfile /> component.
   * e.g. <UserButton userProfileProps={{additionalOAuthScopes: {google: ['foo', 'bar'], github: ['qux']}}} />
   */
  userProfileProps?: Pick<UserProfileProps, 'additionalOAuthScopes' | 'appearance' | 'customPages'>;

  /*
   * Provide custom menu actions and links to be rendered inside the UserButton.
   */
  customMenuItems?: CustomMenuItem[];
};

type PrimitiveKeys<T> = {
  [K in keyof T]: T[K] extends string | boolean | number | null ? K : never;
}[keyof T];

type LooseExtractedParams<T extends string> = Autocomplete<`:${T}`>;

type OrganizationProfileMode =
  | { organizationProfileUrl: string; organizationProfileMode?: 'navigation' }
  | { organizationProfileUrl?: never; organizationProfileMode?: 'modal' };

type CreateOrganizationMode =
  | { createOrganizationUrl: string; createOrganizationMode?: 'navigation' }
  | { createOrganizationUrl?: never; createOrganizationMode?: 'modal' };

export type OrganizationSwitcherProps = CreateOrganizationMode &
  OrganizationProfileMode & {
    /**
     * Controls the default state of the OrganizationSwitcher
     */
    defaultOpen?: boolean;

    /**
     * If true, `<OrganizationSwitcher />` will only render the popover.
     * Enables developers to implement a custom dialog.
     * This API is experimental and may change at any moment.
     * @experimental
     * @default undefined
     */
    __experimental_asStandalone?: boolean | ((opened: boolean) => void);

    /**
     * By default, users can switch between organization and their personal account.
     * This option controls whether OrganizationSwitcher will include the user's personal account
     * in the organization list. Setting this to `false` will hide the personal account entry,
     * and users will only be able to switch between organizations.
     * @default true
     */
    hidePersonal?: boolean;
    /**
     * Full URL or path to navigate to after a successful organization switch.
     * @default undefined
     * @deprecated Use `afterSelectOrganizationUrl` or `afterSelectPersonalUrl`.
     */
    afterSwitchOrganizationUrl?: string;
    /**
     * Full URL or path to navigate to after creating a new organization.
     * @default undefined
     */
    afterCreateOrganizationUrl?:
      | ((organization: OrganizationResource) => string)
      | LooseExtractedParams<PrimitiveKeys<OrganizationResource>>;
    /**
     * Full URL or path to navigate to after a successful organization selection.
     * Accepts a function that returns URL or path
     * @default undefined`
     */
    afterSelectOrganizationUrl?:
      | ((organization: OrganizationResource) => string)
      | LooseExtractedParams<PrimitiveKeys<OrganizationResource>>;
    /**
     * Full URL or path to navigate to after a successful selection of personal workspace.
     * Accepts a function that returns URL or path
     * @default undefined
     */
    afterSelectPersonalUrl?: ((user: UserResource) => string) | LooseExtractedParams<PrimitiveKeys<UserResource>>;
    /**
     * Full URL or path to navigate to after the user leaves the currently active organization.
     * @default undefined
     */
    afterLeaveOrganizationUrl?: string;
    /**
     * Hides the screen for sending invitations after an organization is created.
     * @default undefined When left undefined Clerk will automatically hide the screen if
     * the number of max allowed members is equal to 1
     */
    skipInvitationScreen?: boolean;
    /**
     * Hides the optional "slug" field in the organization creation screen.
     * @default false
     */
    hideSlug?: boolean;
    /**
     * Customisation options to fully match the Clerk components to your own brand.
     * These options serve as overrides and will be merged with the global `appearance`
     * prop of ClerkProvider(if one is provided)
     */
    appearance?: OrganizationSwitcherTheme;
    /*
     * Specify options for the underlying <OrganizationProfile /> component.
     * e.g. <UserButton userProfileProps={{appearance: {...}}} />
     */
    organizationProfileProps?: Pick<OrganizationProfileProps, 'appearance' | 'customPages'>;
  };

export type OrganizationListProps = {
  /**
   * Full URL or path to navigate to after creating a new organization.
   * @default undefined
   */
  afterCreateOrganizationUrl?:
    | ((organization: OrganizationResource) => string)
    | LooseExtractedParams<PrimitiveKeys<OrganizationResource>>;
  /**
   * Full URL or path to navigate to after a successful organization selection.
   * Accepts a function that returns URL or path
   * @default undefined`
   */
  afterSelectOrganizationUrl?:
    | ((organization: OrganizationResource) => string)
    | LooseExtractedParams<PrimitiveKeys<OrganizationResource>>;
  /**
   * Customisation options to fully match the Clerk components to your own brand.
   * These options serve as overrides and will be merged with the global `appearance`
   * prop of ClerkProvider (if one is provided)
   */
  appearance?: OrganizationListTheme;
  /**
   * Hides the screen for sending invitations after an organization is created.
   * @default undefined When left undefined Clerk will automatically hide the screen if
   * the number of max allowed members is equal to 1
   */
  skipInvitationScreen?: boolean;
  /**
   * By default, users can switch between organization and their personal account.
   * This option controls whether OrganizationList will include the user's personal account
   * in the organization list. Setting this to `false` will hide the personal account entry,
   * and users will only be able to switch between organizations.
   * @default true
   */
  hidePersonal?: boolean;
  /**
   * Full URL or path to navigate to after a successful selection of personal workspace.
   * Accepts a function that returns URL or path
   * @default undefined`
   */
  afterSelectPersonalUrl?: ((user: UserResource) => string) | LooseExtractedParams<PrimitiveKeys<UserResource>>;
  /**
   * Hides the optional "slug" field in the organization creation screen.
   * @default false
   */
  hideSlug?: boolean;
};

export type WaitlistProps = {
  /**
   * Full URL or path to navigate to after join waitlist.
   */
  afterJoinWaitlistUrl?: string;
  /**
   * Customisation options to fully match the Clerk components to your own brand.
   * These options serve as overrides and will be merged with the global `appearance`
   * prop of ClerkProvided (if one is provided)
   */
  appearance?: WaitlistTheme;
  /**
   * Full URL or path where the SignIn component is mounted.
   */
  signInUrl?: string;
};

export type WaitlistModalProps = WaitlistProps;

type PricingTableDefaultProps = {
  /**
   * The position of the CTA button.
   * @default 'bottom'
   */
  ctaPosition?: 'top' | 'bottom';
  /**
   * Whether to collapse features on the pricing table.
   * @default false
   */
  collapseFeatures?: boolean;
  /**
   * Full URL or path to navigate to after checkout is complete and the user clicks the "Continue" button.
   * @default undefined
   */
  newSubscriptionRedirectUrl?: string;
};

type PricingTableBaseProps = {
  /**
   * Whether to show pricing table for organizations.
   * @default false
   */
  forOrganizations?: boolean;
  /**
   * Customisation options to fully match the Clerk components to your own brand.
   * These options serve as overrides and will be merged with the global `appearance`
   * prop of ClerkProvider (if one is provided)
   */
  appearance?: PricingTableTheme;
  /*
   * Specify options for the underlying <Checkout /> component.
   * e.g. <PricingTable checkoutProps={{appearance: {variables: {colorText: 'blue'}}}} />
   */
  checkoutProps?: Pick<__internal_CheckoutProps, 'appearance'>;
};

type PortalRoot = HTMLElement | null | undefined;

export type PricingTableProps = PricingTableBaseProps & PricingTableDefaultProps;

export type APIKeysProps = {
  /**
   * The type of API key to filter by.
   * Currently, only 'api_key' is supported.
   * @default 'api_key'
   */
  type?: 'api_key';
  /**
   * The number of API keys to show per page.
   * @default 5
   */
  perPage?: number;
  /**
   * Customisation options to fully match the Clerk components to your own brand.
   * These options serve as overrides and will be merged with the global `appearance`
   * prop of ClerkProvider (if one is provided)
   */
  appearance?: APIKeysTheme;
  /**
   * Whether to show the description field in the API key creation form.
   * @default false
   */
  showDescription?: boolean;
};

export type GetAPIKeysParams = {
  subject?: string;
};

export type CreateAPIKeyParams = {
  type?: 'api_key';
  name: string;
  subject?: string;
  secondsUntilExpiration?: number;
  description?: string;
};

export type RevokeAPIKeyParams = {
  apiKeyID: string;
  revocationReason?: string;
};

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * @see https://clerk.com/docs/billing/overview
 *
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export type __internal_CheckoutProps = {
  appearance?: CheckoutTheme;
  planId?: string;
  planPeriod?: CommerceSubscriptionPlanPeriod;
  for?: ForPayerType;
  onSubscriptionComplete?: () => void;
  portalId?: string;
  portalRoot?: PortalRoot;
  /**
   * Full URL or path to navigate to after checkout is complete and the user clicks the "Continue" button.
   * @default undefined
   */
  newSubscriptionRedirectUrl?: string;
  onClose?: () => void;
};

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * @see https://clerk.com/docs/billing/overview
 *
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export type __experimental_CheckoutButtonProps = {
  planId: string;
  planPeriod?: CommerceSubscriptionPlanPeriod;
  for?: ForPayerType;
  onSubscriptionComplete?: () => void;
  checkoutProps?: {
    appearance?: CheckoutTheme;
    portalId?: string;
    portalRoot?: HTMLElement | null | undefined;
    onClose?: () => void;
  };
  /**
   * Full URL or path to navigate to after checkout is complete and the user clicks the "Continue" button.
   * @default undefined
   */
  newSubscriptionRedirectUrl?: string;
};

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * @see https://clerk.com/docs/billing/overview
 *
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export type __internal_PlanDetailsProps = {
  appearance?: PlanDetailTheme;
  plan?: CommercePlanResource;
  planId?: string;
  initialPlanPeriod?: CommerceSubscriptionPlanPeriod;
  portalId?: string;
  portalRoot?: PortalRoot;
};

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * @see https://clerk.com/docs/billing/overview
 *
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export type __experimental_PlanDetailsButtonProps = {
  plan?: CommercePlanResource;
  planId?: string;
  initialPlanPeriod?: CommerceSubscriptionPlanPeriod;
  planDetailsProps?: {
    appearance?: PlanDetailTheme;
    portalId?: string;
    portalRoot?: PortalRoot;
  };
};

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * @see https://clerk.com/docs/billing/overview
 *
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export type __internal_SubscriptionDetailsProps = {
  /**
   * The subscriber type to display the subscription details for.
   * If `organization` is provided, the subscription details will be displayed for the active organization.
   * @default 'user'
   */
  for?: ForPayerType;
  appearance?: SubscriptionDetailsTheme;
  onSubscriptionCancel?: () => void;
  portalId?: string;
  portalRoot?: PortalRoot;
};

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * @see https://clerk.com/docs/billing/overview
 *
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export type __experimental_SubscriptionDetailsButtonProps = {
  /**
   * The subscriber type to display the subscription details for.
   * If `organization` is provided, the subscription details will be displayed for the active organization.
   * @default 'user'
   */
  for?: ForPayerType;
  onSubscriptionCancel?: () => void;
  subscriptionDetailsProps?: {
    appearance?: SubscriptionDetailsTheme;
    portalId?: string;
    portalRoot?: PortalRoot;
  };
};

export type __internal_OAuthConsentProps = {
  appearance?: OAuthConsentTheme;
  /**
   * Name of the OAuth application.
   */
  oAuthApplicationName: string;
  /**
   * Logo URL of the OAuth application.
   */
  oAuthApplicationLogoUrl?: string;
  /**
   * Scopes requested by the OAuth application.
   */
  scopes: {
    scope: string;
    description: string | null;
    requires_consent: boolean;
  }[];
  /**
   * Full URL or path to navigate to after the user allows access.
   */
  redirectUrl: string;
  /**
   * Called when user allows access.
   */
  onAllow: () => void;
  /**
   * Called when user denies access.
   */
  onDeny: () => void;
};

export interface HandleEmailLinkVerificationParams {
  /**
   * Full URL or path to navigate to after successful magic link verification
   * on completed sign up or sign in on the same device.
   */
  redirectUrlComplete?: string;
  /**
   * Full URL or path to navigate to after successful magic link verification
   * on the same device, but not completed sign in or sign up.
   */
  redirectUrl?: string;
  /**
   * Callback function to be executed after successful magic link
   * verification on another device.
   */
  onVerifiedOnOtherDevice?: () => void;
}

type SignInButtonPropsModal = {
  mode: 'modal';
  appearance?: SignInProps['appearance'];
};

type SignUpButtonPropsModal = {
  mode: 'modal';
  appearance?: SignUpProps['appearance'];
  unsafeMetadata?: SignUpUnsafeMetadata;
};

type ButtonPropsRedirect = {
  mode?: 'redirect';
};

export type SignInButtonProps = (SignInButtonPropsModal | ButtonPropsRedirect) &
  Pick<
    SignInProps,
    | 'fallbackRedirectUrl'
    | 'forceRedirectUrl'
    | 'signUpForceRedirectUrl'
    | 'signUpFallbackRedirectUrl'
    | 'initialValues'
    | 'withSignUp'
    | 'oauthFlow'
  >;

export type SignUpButtonProps = (SignUpButtonPropsModal | ButtonPropsRedirect) &
  Pick<
    SignUpProps,
    | 'fallbackRedirectUrl'
    | 'forceRedirectUrl'
    | 'signInForceRedirectUrl'
    | 'signInFallbackRedirectUrl'
    | 'initialValues'
    | 'oauthFlow'
  >;

export type TaskSelectOrganizationProps = {
  /**
   * Full URL or path to navigate to after successfully resolving all tasks
   */
  redirectUrlComplete: string;
  appearance?: TaskSelectOrganizationTheme;
};

export type CreateOrganizationInvitationParams = {
  emailAddress: string;
  role: OrganizationCustomRoleKey;
};

export type CreateBulkOrganizationInvitationParams = {
  emailAddresses: string[];
  role: OrganizationCustomRoleKey;
};

/**
 * @interface
 */
export interface CreateOrganizationParams {
  /**
   * The name of the organization.
   */
  name: string;
  /**
   * The slug of the organization.
   */
  slug?: string;
}

export interface ClerkAuthenticateWithWeb3Params {
  customNavigate?: (to: string) => Promise<unknown>;
  redirectUrl?: string;
  signUpContinueUrl?: string;
  unsafeMetadata?: SignUpUnsafeMetadata;
  strategy: Web3Strategy;
  legalAccepted?: boolean;
  secondFactorUrl?: string;
}

export type JoinWaitlistParams = {
  emailAddress: string;
};

export interface AuthenticateWithMetamaskParams {
  customNavigate?: (to: string) => Promise<unknown>;
  redirectUrl?: string;
  signUpContinueUrl?: string;
  unsafeMetadata?: SignUpUnsafeMetadata;
  legalAccepted?: boolean;
}

export interface AuthenticateWithCoinbaseWalletParams {
  customNavigate?: (to: string) => Promise<unknown>;
  redirectUrl?: string;
  signUpContinueUrl?: string;
  unsafeMetadata?: SignUpUnsafeMetadata;
  legalAccepted?: boolean;
}

export interface AuthenticateWithOKXWalletParams {
  customNavigate?: (to: string) => Promise<unknown>;
  redirectUrl?: string;
  signUpContinueUrl?: string;
  unsafeMetadata?: SignUpUnsafeMetadata;
  legalAccepted?: boolean;
}

export interface AuthenticateWithGoogleOneTapParams {
  token: string;
  legalAccepted?: boolean;
}

export interface __internal_NavigateToTaskIfAvailableParams {
  /**
   * Full URL or path to navigate to after successfully resolving all tasks
   * @default undefined
   */
  redirectUrlComplete?: string;
}

export interface LoadedClerk extends Clerk {
  client: ClientResource;
}
