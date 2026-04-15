import type { ClerkGlobalHookError } from '@/errors/globalHookError';

import type { ClerkUIConstructor } from '../ui/types';
import type { APIKeysNamespace } from './apiKeys';
import type {
  BillingCheckoutResource,
  BillingNamespace,
  BillingPlanResource,
  BillingSubscriptionPlanPeriod,
  CheckoutFlowResource,
  ForPayerType,
} from './billing';
import type { ClientResource } from './client';
import type { CustomMenuItem } from './customMenuItems';
import type { CustomPage } from './customPages';
import type { ClerkAPIResponseError } from './errors';
import type { InstanceType } from './instance';
import type { DisplayThemeJSON } from './json';
import type { LocalizationResource } from './localization';
import type { DomainOrProxyUrl, MultiDomainAndOrProxy } from './multiDomain';
import type { OAuthProvider, OAuthScope } from './oauth';
import type { OrganizationResource } from './organization';
import type { OrganizationCustomRoleKey } from './organizationMembership';
import type { ClerkPaginationParams } from './pagination';
import type {
  AfterMultiSessionSingleSignOutUrl,
  AfterSignOutUrl,
  NewSubscriptionRedirectUrl,
  RedirectOptions,
  RedirectUrlProp,
  SignInFallbackRedirectUrl,
  SignInForceRedirectUrl,
  SignUpFallbackRedirectUrl,
  SignUpForceRedirectUrl,
} from './redirects';
import type { SessionResource, SessionTask, SignedInSessionResource } from './session';
import type { SessionVerificationLevel } from './sessionVerification';
import type { SignInResource } from './signIn';
import type { SignUpResource } from './signUp';
import type { ClientJSONSnapshot, EnvironmentJSONSnapshot } from './snapshots';
import type { State } from './state';
import type { Web3Strategy } from './strategies';
import type { TelemetryCollector } from './telemetry';
import type { UserResource } from './user';
import type { Autocomplete, DeepPartial, DeepSnakeToCamel, Without } from './utils';
import type { JoinWaitlistParams, WaitlistResource } from './waitlist';

/**
 * Global appearance type registry that can be augmented by packages that depend on `@clerk/ui`.
 * Framework packages (like `@clerk/react`, `@clerk/nextjs`) should augment this interface
 * to provide proper appearance types without creating circular dependencies.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface ClerkAppearanceRegistry {}
}

/**
 * Appearance theme type that gets overridden by framework packages.
 * Defaults to `any` in @clerk/shared.
 * Becomes fully typed when a framework package augments ClerkAppearanceRegistry with Theme.
 */
// @ts-expect-error - this is a global interface augmentation
export type ClerkAppearanceTheme = ClerkAppearanceRegistry['theme'];

type __experimental_CheckoutStatus = 'needs_initialization' | 'needs_confirmation' | 'completed';

export type __experimental_CheckoutCacheState = Readonly<{
  isStarting: boolean;
  isConfirming: boolean;
  error: ClerkAPIResponseError | null;
  checkout: BillingCheckoutResource | null;
  fetchStatus: 'idle' | 'fetching' | 'error';
  status: __experimental_CheckoutStatus;
}>;

export type __experimental_CheckoutOptions = {
  for?: ForPayerType;
  planPeriod: BillingSubscriptionPlanPeriod;
  planId: string;
};

export type CheckoutErrors = {
  /**
   * The raw, unparsed errors from the Clerk API.
   */
  raw: unknown[] | null;
  /**
   * Parsed errors that are not related to any specific field.
   * Does not include any errors that could be parsed as a field error
   */
  global: ClerkGlobalHookError[] | null;
};

/**
 * @interface
 */
export interface CheckoutSignalValue {
  /**
   * Represents the errors that occurred during the last fetch of the parent resource.
   */
  errors: CheckoutErrors;
  /**
   * The fetch status of the underlying `Checkout` resource.
   */
  fetchStatus: 'idle' | 'fetching';
  /**
   * An instance representing the currently active `Checkout`.
   */
  checkout: CheckoutFlowResource;
}

export interface CheckoutSignal {
  (): CheckoutSignalValue;
}

type __experimental_CheckoutFunction = (options: __experimental_CheckoutOptions) => CheckoutSignalValue;

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

/**
 * A callback function that is called when Clerk resources change.
 * @inline
 */
export type ListenerCallback = (emission: Resources) => void;
/**
 * Optional configuration for the `addListener()` method.
 * @param skipInitialEmit - If `true`, the callback will not be called immediately after registration. Defaults to `false`.
 * @inline
 */
export type ListenerOptions = { skipInitialEmit?: boolean };
export type UnsubscribeCallback = () => void;

/**
 * A function to decorate URLs for Safari ITP workaround.
 *
 * Safari's Intelligent Tracking Prevention (ITP) caps cookies set via fetch/XHR requests to 7 days.
 * This function returns a URL that goes through the `/v1/client/touch` endpoint when the ITP fix is needed,
 * allowing the cookie to be refreshed via a full page navigation.
 *
 * @param url - The destination URL to potentially decorate
 * @returns The decorated URL if ITP fix is needed, otherwise the original URL unchanged
 *
 * @example
 * ```typescript
 * const url = decorateUrl('/dashboard');
 * // When ITP fix is needed: 'https://clerk.example.com/v1/client/touch?redirect_url=https://app.example.com/dashboard'
 * // When not needed: '/dashboard'
 *
 * // decorateUrl may return an external URL when Safari ITP fix is needed
 * if (url.startsWith('https')) {
 *   window.location.href = url;  // External redirect
 * } else {
 *   router.push(url);  // Client-side navigation
 * }
 * ```
 */
export type DecorateUrl = (url: string) => string;

export type SetActiveNavigate = (params: {
  session: SessionResource;
  /**
   * Decorate the destination URL to enable Safari ITP cookie refresh when needed.
   * @see {@link DecorateUrl}
   */
  decorateUrl: DecorateUrl;
}) => void | Promise<unknown>;

/**
 * A callback that runs after sign out completes.
 * @inline */
export type SignOutCallback = () => void | Promise<any>;

/**
 * Configuration options.
 */
export type SignOutOptions = {
  /**
   * Specify a specific session to sign out. Useful for multi-session applications.
   */
  sessionId?: string;
  /**
   * Specify a redirect URL to navigate to after sign-out is complete.
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

/**
 * Registers an event listener for a specific Clerk event.
 *
 * @param event - The event name to subscribe to.
 * @param handler - The callback function to execute when the event is dispatched.
 * @param opt - Optional configuration.
 * @param opt.notify - If true and the event was previously dispatched, handler will be called immediately with the latest payload.
 */
export type OnEventListener = <E extends ClerkEvent>(
  event: E,
  handler: EventHandler<E>,
  opt?: { notify: boolean },
) => void;

/**
 * Unregisters an event listener for a specific Clerk event.
 *
 * @param event - The event name to unsubscribe from.
 * @param handler - The callback function to remove.
 */
export type OffEventListener = <E extends ClerkEvent>(event: E, handler: EventHandler<E>) => void;

/**
 * @inline
 * @property {ClerkStatus} degraded - Set when Clerk is partially operational.
 * @property {ClerkStatus} error - Set when hotloading `clerk-js` or `Clerk.load()` failed.
 * @property {ClerkStatus} loading - Set during initialization.
 * @property {ClerkStatus} ready - Set when Clerk is fully operational.
 */
export type ClerkStatus = 'degraded' | 'error' | 'loading' | 'ready';

/**
 * The `Clerk` class serves as the central interface for working with Clerk's authentication and user management functionality in your application. As a top-level class in the Clerk SDK, it provides access to key methods and properties for managing users, sessions, API keys, billing, organizations, and more.
 */
export interface Clerk {
  /**
   * The Clerk SDK version number.
   */
  version: string | undefined;

  /**
   * If present, contains information about the SDK that the host application is using.
   * For example, if Clerk is loaded through `@clerk/nextjs`, this would be `{ name: '@clerk/nextjs', version: '1.0.0' }`. You don't need to set this value yourself unless you're [developing an SDK](https://clerk.com/docs/guides/development/sdk-development/overview).
   */
  sdkMetadata: SDKMetadata | undefined;

  /**
   * Indicates if the `Clerk` object is ready for use. Set to `false` when the `status` is `"loading"`. Set to `true` when the `status` is `"ready"` or `"degraded"`.
   */
  loaded: boolean;

  /**
   * The status of the `Clerk` instance. Possible values are:
   * <ul>
   *  <li>`"error"`: Set when hotloading `clerk-js` or `Clerk.load()` failed.</li>
   *  <li>`"loading"`: Set during initialization.</li>
   *  <li>`"ready"`: Set when Clerk is fully operational.</li>
   *  <li>`"degraded"`: Set when Clerk is partially operational.</li>
   * </ul>
   */
  status: ClerkStatus;

  /**
   * @internal
   */
  __internal_getOption<K extends keyof ClerkOptions>(key: K): ClerkOptions[K];

  frontendApi: string;

  /** Your Clerk [Publishable Key](!publishable-key). */
  publishableKey: string;

  /** **Required for applications that run behind a reverse proxy**. Your Clerk app's proxy URL. Can be either a relative path (`/__clerk`) or a full URL (`https://<your-domain>/__clerk`). */
  proxyUrl: string | undefined;

  /** The current Clerk app's domain. Prefixed with `clerk.` on production if not already prefixed. Returns `""` when ran on the server. */
  domain: string;

  /** Indicates if the instance is a satellite app. */
  isSatellite: boolean;

  /** Indicates if the Clerk instance is running in a production or development environment. */
  instanceType: InstanceType | undefined;

  /**
   * Indicates if the instance is being loaded in a standard browser environment. Set to `false` on native platforms where cookies cannot be set. When `undefined`, Clerk assumes a standard browser.
   * @inline
   */
  isStandardBrowser: boolean | undefined;

  /**
   * Indicates whether the current user has a valid signed-in client session.
   */
  isSignedIn: boolean;

  /** The `Client` object for the current window. */
  client: ClientResource | undefined;

  /** The currently active `Session`, which is guaranteed to be one of the sessions in `Client.sessions`. If there is no active session, this field will be `null`. If the session is loading, this field will be `undefined`. */
  session: SignedInSessionResource | null | undefined;

  /** A shortcut to the last active `Session.user.organizationMemberships` which holds an instance of a `Organization` object. If the session is `null` or `undefined`, the user field will match. */
  organization: OrganizationResource | null | undefined;

  /** A shortcut to `Session.user` which holds the currently active `User` object. If the session is `null` or `undefined`, the user field will match. */
  user: UserResource | null | undefined;

  /**
   * Last emitted resources, maintains a stable reference to the resources between emits.
   *
   * @internal
   */
  __internal_lastEmittedResources: Resources | undefined;

  /**
   * Entrypoint for Clerk's Signal API containing resource signals along with accessible versions of `computed()` and
   * `effect()` that can be used to subscribe to changes from Signals.
   *
   * @internal
   * @experimental This experimental API is subject to change.
   */
  __internal_state: State;

  /**
   * The `Billing` object used for managing billing.
   *
   * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
   */
  billing: BillingNamespace;

  /**
   * [Telemetry](https://clerk.com/docs/guides/how-clerk-works/security/clerk-telemetry) configuration.
   */
  telemetry: TelemetryCollector | undefined;

  /**
   * @internal
   */
  __internal_country?: string | null;

  /**
   * Signs out the current user on single-session instances, or all users on multi-session instances.
   */
  signOut: SignOut;

  /**
   * Opens the Clerk SignIn component in a modal.
   *
   * @param props - Optional sign in configuration parameters.
   */
  openSignIn: (props?: SignInModalProps) => void;

  /**
   * Closes the Clerk SignIn modal.
   */
  closeSignIn: () => void;

  /**
   * Opens the Clerk Checkout component in a drawer.
   *
   * @param props - Optional checkout configuration parameters.
   * @internal
   */
  __internal_openCheckout: (props?: __internal_CheckoutProps) => void;

  /**
   * Closes the Clerk Checkout drawer.
   * @internal
   */
  __internal_closeCheckout: () => void;

  /**
   * Opens the Clerk PlanDetails drawer component in a drawer.
   *
   * @param props - `plan` or `planId` parameters are required.
   * @internal
   */
  __internal_openPlanDetails: (props: __internal_PlanDetailsProps) => void;

  /**
   * Closes the Clerk PlanDetails drawer.
   * @internal
   */
  __internal_closePlanDetails: () => void;

  /**
   * Opens the Clerk SubscriptionDetails drawer component in a drawer.
   *
   * @param props - Optional configuration parameters.
   * @internal
   */
  __internal_openSubscriptionDetails: (props?: __internal_SubscriptionDetailsProps) => void;

  /**
   * Closes the Clerk SubscriptionDetails drawer.
   * @internal
   */
  __internal_closeSubscriptionDetails: () => void;

  /**
   * Opens the Clerk UserVerification component in a modal.
   *
   * @param props - Optional user verification configuration parameters.
   * @internal
   */
  __internal_openReverification: (props?: __internal_UserVerificationModalProps) => void;

  /**
   * Closes the Clerk user verification modal.
   * @internal
   */
  __internal_closeReverification: () => void;

  /**
   * Attempts to enable a environment setting from a development instance, prompting if disabled.
   * @internal
   */
  __internal_attemptToEnableEnvironmentSetting: (
    options: __internal_AttemptToEnableEnvironmentSettingParams,
  ) => __internal_AttemptToEnableEnvironmentSettingResult;

  /**
   * Opens the Clerk Enable Organizations prompt for development instance
   * @internal
   */
  __internal_openEnableOrganizationsPrompt: (props: __internal_EnableOrganizationsPromptProps) => void;

  /**
   * Closes the Clerk Enable Organizations modal.
   * @internal
   */
  __internal_closeEnableOrganizationsPrompt: () => void;

  /**
   * Opens the Google One Tap component.
   *
   * @param props - Optional props that will be passed to the GoogleOneTap component.
   */
  openGoogleOneTap: (props?: GoogleOneTapProps) => void;

  /**
   * Opens the Google One Tap component.
   * If the component is not already open, results in a noop.
   */
  closeGoogleOneTap: () => void;

  /**
   * Opens the Clerk SignUp component in a modal.
   *
   * @param props - Optional props that will be passed to the SignUp component.
   */
  openSignUp: (props?: SignUpModalProps) => void;

  /**
   * Closes the Clerk SignUp modal.
   */
  closeSignUp: () => void;

  /**
   * Opens the Clerk UserProfile modal.
   *
   * @param props - Optional props that will be passed to the UserProfile component.
   */
  openUserProfile: (props?: UserProfileModalProps) => void;

  /**
   * Closes the Clerk UserProfile modal.
   */
  closeUserProfile: () => void;

  /**
   * Opens the Clerk OrganizationProfile modal.
   *
   * @param props - Optional props that will be passed to the OrganizationProfile component.
   */
  openOrganizationProfile: (props?: OrganizationProfileModalProps) => void;

  /**
   * Closes the Clerk OrganizationProfile modal.
   */
  closeOrganizationProfile: () => void;

  /**
   * Opens the Clerk CreateOrganization modal.
   *
   * @param props - Optional props that will be passed to the CreateOrganization component.
   */
  openCreateOrganization: (props?: CreateOrganizationModalProps) => void;

  /**
   * Closes the Clerk CreateOrganization modal.
   */
  closeCreateOrganization: () => void;

  /**
   * Opens the Clerk Waitlist modal.
   *
   * @param props - Optional props that will be passed to the Waitlist component.
   */
  openWaitlist: (props?: WaitlistModalProps) => void;

  /**
   * Closes the Clerk Waitlist modal.
   */
  closeWaitlist: () => void;

  /**
   * Mounts a sign in flow component at the target element.
   *
   * @param targetNode - Target node to mount the SignIn component.
   * @param signInProps - sign in configuration parameters.
   */
  mountSignIn: (targetNode: HTMLDivElement, signInProps?: SignInProps) => void;

  /**
   * Unmount a sign in flow component from the target element.
   * If there is no component mounted at the target node, results in a noop.
   *
   * @param targetNode - Target node to unmount the SignIn component from.
   */
  unmountSignIn: (targetNode: HTMLDivElement) => void;

  /**
   * Mounts a sign up flow component at the target element.
   *
   * @param targetNode - Target node to mount the SignUp component.
   * @param signUpProps - sign up configuration parameters.
   */
  mountSignUp: (targetNode: HTMLDivElement, signUpProps?: SignUpProps) => void;

  /**
   * Unmount a sign up flow component from the target element.
   * If there is no component mounted at the target node, results in a noop.
   *
   * @param targetNode - Target node to unmount the SignUp component from.
   */
  unmountSignUp: (targetNode: HTMLDivElement) => void;

  /**
   * Mount a user avatar component at the target element.
   *
   * @param targetNode - Target node to mount the UserAvatar component.
   */
  mountUserAvatar: (targetNode: HTMLDivElement, userAvatarProps?: UserAvatarProps) => void;

  /**
   * Unmount a user avatar component at the target element.
   * If there is no component mounted at the target node, results in a noop.
   *
   * @param targetNode - Target node to unmount the UserAvatar component from.
   */
  unmountUserAvatar: (targetNode: HTMLDivElement) => void;

  /**
   * Mount a user button component at the target element.
   *
   * @param targetNode - Target node to mount the UserButton component.
   * @param userButtonProps - User button configuration parameters.
   */
  mountUserButton: (targetNode: HTMLDivElement, userButtonProps?: UserButtonProps) => void;

  /**
   * Unmount a user button component at the target element.
   * If there is no component mounted at the target node, results in a noop.
   *
   * @param targetNode - Target node to unmount the UserButton component from.
   */
  unmountUserButton: (targetNode: HTMLDivElement) => void;

  /**
   * Mount a user profile component at the target element.
   *
   * @param targetNode - Target to mount the UserProfile component.
   * @param userProfileProps - User profile configuration parameters.
   */
  mountUserProfile: (targetNode: HTMLDivElement, userProfileProps?: UserProfileProps) => void;

  /**
   * Unmount a user profile component at the target element.
   * If there is no component mounted at the target node, results in a noop.
   *
   * @param targetNode - Target node to unmount the UserProfile component from.
   */
  unmountUserProfile: (targetNode: HTMLDivElement) => void;

  /**
   * Mount an Organization profile component at the target element.
   *
   * @param targetNode - Target to mount the OrganizationProfile component.
   * @param props - Configuration parameters.
   */
  mountOrganizationProfile: (targetNode: HTMLDivElement, props?: OrganizationProfileProps) => void;

  /**
   * Unmount the Organization profile component from the target node.
   *
   * @param targetNode - Target node to unmount the OrganizationProfile component from.
   */
  unmountOrganizationProfile: (targetNode: HTMLDivElement) => void;

  /**
   * Mount a CreateOrganization component at the target element.
   *
   * @param targetNode - Target to mount the CreateOrganization component.
   * @param props - Configuration parameters.
   */
  mountCreateOrganization: (targetNode: HTMLDivElement, props?: CreateOrganizationProps) => void;

  /**
   * Unmount the CreateOrganization component from the target node.
   *
   * @param targetNode - Target node to unmount the CreateOrganization component from.
   */
  unmountCreateOrganization: (targetNode: HTMLDivElement) => void;

  /**
   * Mount an Organization switcher component at the target element.
   *
   * @param targetNode - Target to mount the OrganizationSwitcher component.
   * @param props - Configuration parameters.
   */
  mountOrganizationSwitcher: (targetNode: HTMLDivElement, props?: OrganizationSwitcherProps) => void;

  /**
   * Unmount the Organization switcher component from the target node.*
   *
   * @param targetNode - Target node to unmount the OrganizationSwitcher component from.
   */
  unmountOrganizationSwitcher: (targetNode: HTMLDivElement) => void;

  /**
   * Prefetches the data displayed by an Organization switcher.
   * It can be used when `mountOrganizationSwitcher({ asStandalone: true})`, to avoid unwanted loading states.
   *
   * @experimental This experimental API is subject to change.
   *
   * @param props - Optional user verification configuration parameters.
   */
  __experimental_prefetchOrganizationSwitcher: () => void;

  /**
   * Mount an Organization list component at the target element.
   *
   * @param targetNode - Target to mount the OrganizationList component.
   * @param props - Configuration parameters.
   */
  mountOrganizationList: (targetNode: HTMLDivElement, props?: OrganizationListProps) => void;

  /**
   * Unmount the Organization list component from the target node.*
   *
   * @param targetNode - Target node to unmount the OrganizationList component from.
   */
  unmountOrganizationList: (targetNode: HTMLDivElement) => void;

  /**
   * Mount a waitlist at the target element.
   *
   * @param targetNode - Target to mount the Waitlist component.
   * @param props - Configuration parameters.
   */
  mountWaitlist: (targetNode: HTMLDivElement, props?: WaitlistProps) => void;

  /**
   * Unmount the Waitlist component from the target node.
   *
   * @param targetNode - Target node to unmount the Waitlist component from.
   */
  unmountWaitlist: (targetNode: HTMLDivElement) => void;

  /**
   * Mounts a pricing table component at the target element.
   *
   * @param targetNode - Target node to mount the PricingTable component.
   * @param props - configuration parameters.
   */
  mountPricingTable: (targetNode: HTMLDivElement, props?: PricingTableProps) => void;

  /**
   * Unmount a pricing table component from the target element.
   * If there is no component mounted at the target node, results in a noop.
   *
   * @param targetNode - Target node to unmount the PricingTable component from.
   */
  unmountPricingTable: (targetNode: HTMLDivElement) => void;

  /**
   * Mount an API keys component at the target element.
   *
   * @param targetNode - Target to mount the APIKeys component.
   * @param props - Configuration parameters.
   */
  mountAPIKeys: (targetNode: HTMLDivElement, props?: APIKeysProps) => void;

  /**
   * Unmount an API keys component from the target element.
   * If there is no component mounted at the target node, results in a noop.
   *
   * @param targetNode - Target node to unmount the APIKeys component from.
   */
  unmountAPIKeys: (targetNode: HTMLDivElement) => void;

  /**
   * Mounts a OAuth consent component at the target element.
   *
   * @param targetNode - Target node to mount the OAuth consent component.
   * @param oauthConsentProps - OAuth consent configuration parameters.
   * @internal
   */
  __internal_mountOAuthConsent: (targetNode: HTMLDivElement, oauthConsentProps?: __internal_OAuthConsentProps) => void;

  /**
   * Unmounts a OAuth consent component from the target element.
   *
   * @param targetNode - Target node to unmount the OAuth consent component from.
   * @internal
   */
  __internal_unmountOAuthConsent: (targetNode: HTMLDivElement) => void;

  /**
   * Mounts a TaskChooseOrganization component at the target element.
   *
   * @param targetNode - Target node to mount the TaskChooseOrganization component.
   * @param props - configuration parameters.
   */
  mountTaskChooseOrganization: (targetNode: HTMLDivElement, props?: TaskChooseOrganizationProps) => void;

  /**
   * Unmount a TaskChooseOrganization component from the target element.
   * If there is no component mounted at the target node, results in a noop.
   *
   * @param targetNode - Target node to unmount the TaskChooseOrganization component from.
   */
  unmountTaskChooseOrganization: (targetNode: HTMLDivElement) => void;

  /**
   * Mounts a TaskResetPassword component at the target element.
   *
   * @param targetNode - Target node to mount the TaskResetPassword component.
   * @param props - configuration parameters.
   */
  mountTaskResetPassword: (targetNode: HTMLDivElement, props?: TaskResetPasswordProps) => void;

  /**
   * Unmount a TaskResetPassword component from the target element.
   * If there is no component mounted at the target node, results in a noop.
   *
   * @param targetNode - Target node to unmount the TaskResetPassword component from.
   */
  unmountTaskResetPassword: (targetNode: HTMLDivElement) => void;

  /**
   * Mounts a TaskSetupMFA component at the target element.
   * This component allows users to set up multi-factor authentication.
   *
   * @param targetNode - Target node to mount the TaskSetupMFA component.
   * @param props - configuration parameters.
   */
  mountTaskSetupMFA: (targetNode: HTMLDivElement, props?: TaskSetupMFAProps) => void;

  /**
   * Unmount a TaskSetupMFA component from the target element.
   * If there is no component mounted at the target node, results in a noop.
   *
   * @param targetNode - Target node to unmount the TaskSetupMFA component from.
   */
  unmountTaskSetupMFA: (targetNode: HTMLDivElement) => void;

  /**
   * @internal
   * Loads Stripe libraries for commerce functionality
   */
  __internal_loadStripeJs: () => Promise<any>;

  /**
   * Register a listener that triggers a callback whenever a change in the [`Client`](https://clerk.com/docs/reference/objects/client), [`Session`](https://clerk.com/docs/reference/objects/session), [`User`](https://clerk.com/docs/reference/objects/user), or [`Organization`](https://clerk.com/docs/reference/objects/organization) resources occurs. This method is primarily used to build frontend SDKs like [`@clerk/react`](https://www.npmjs.com/package/@clerk/react).
   *
   * Allows hooking up at different steps in the sign up, sign in processes.
   *
   * Some important checkpoints:
   * - When there is an active session, `user === session.user`.
   * - When there is no active session, user and session will both be `null`.
   * - When a session is loading, user and session will be `undefined`.
   *
   * @param callback - The function to call when Clerk resources change.
   * @param options - Optional configuration.
   * @param options.skipInitialEmit - If `true`, the callback will not be called immediately after registration. Defaults to `false`.
   * @returns - An `UnsubscribeCallback` function that can be used to remove the listener from the `Clerk` object.
   */
  addListener: (callback: ListenerCallback, options?: ListenerOptions) => UnsubscribeCallback;

  /**
   * Registers an event handler for a specific Clerk event.
   *
   * @param event - The event name to subscribe to.
   * @param handler - The callback function to execute when the event is triggered.
   * @param opt - An optional object to control the behavior of the event handler. If true, and the event was previously dispatched, handler will be called immediately with the latest payload.
   * @param opt.notify - If `true` and the event was previously dispatched, the handler will be called immediately with the latest payload.
   */
  on: OnEventListener;

  /**
   * Removes an event handler for a specific Clerk event.
   *
   * @param event - The event name to unsubscribe from
   * @param handler - The callback function to remove.
   */
  off: OffEventListener;

  /**
   * Registers an internal listener that triggers a callback each time `Clerk.navigate` is called.
   * Its purpose is to notify modal UI components when a navigation event occurs, allowing them to close if necessary.
   *
   * @internal
   */
  __internal_addNavigationListener: (callback: () => void) => UnsubscribeCallback;

  /**
   * A method used to set the current session and/or Organization for the client. Accepts a [`SetActiveParams`](https://clerk.com/docs/reference/types/set-active-params) object.
   *
   * If the session param is `null`, the active session is deleted.
   * In a similar fashion, if the organization param is `null`, the current organization is removed as active.
   */
  setActive: SetActive;

  /**
   * Helper method which will use the custom push navigation function of your application to navigate to the provided URL or relative path.
   *
   * Returns a promise that can be `await`ed in order to listen for the navigation to finish. The inner value should not be relied on, as it can change based on the framework it's used within.
   */
  navigate: CustomNavigation;

  /**
   * Decorates the provided URL with the auth token for development instances.
   *
   * @param to - The route to create a URL towards.
   */
  buildUrlWithAuth(to: string): string;

  /**
   * Returns the configured URL where [`<SignIn/>`](https://clerk.com/docs/reference/components/authentication/sign-in) is mounted or a custom sign-in page is rendered.
   *
   * @param opts - Options used to control the redirect in the constructed URL.
   */
  buildSignInUrl(opts?: RedirectOptions): string;

  /**
   * Returns the configured URL where [`<SignUp/>`](https://clerk.com/docs/reference/components/authentication/sign-up) is mounted or a custom sign-up page is rendered.
   *
   * @param opts - Options used to control the redirect in the constructed URL.
   */
  buildSignUpUrl(opts?: RedirectOptions): string;

  /**
   * Returns the configured URL where [`<UserProfile />`](https://clerk.com/docs/reference/components/user/user-profile) is mounted or a custom user-profile page is rendered.
   */
  buildUserProfileUrl(): string;

  /**
   * Returns the configured URL where [`<CreateOrganization />`](https://clerk.com/docs/reference/components/organization/create-organization) is mounted or a custom create-organization page is rendered.
   */
  buildCreateOrganizationUrl(): string;

  /**
   * Returns the configured URL where [`<OrganizationProfile />`](https://clerk.com/docs/reference/components/organization/organization-profile) is mounted or a custom organization-profile page is rendered.
   */
  buildOrganizationProfileUrl(): string;

  /**
   * Returns the configured URL where [session tasks](https://clerk.com/docs/guides/configure/session-tasks) are mounted.
   */
  buildTasksUrl(): string;

  /**
   * Returns the configured `afterSignInUrl` of the instance.
   * @param params - Optional configuration.
   * @param params.params - Optional query parameters to append to the URL.
   */
  buildAfterSignInUrl({ params }?: { params?: URLSearchParams }): string;

  /**
   * Returns the configured `afterSignInUrl` of the instance.
   * @param params - Optional configuration.
   * @param params.params - Optional query parameters to append to the URL.
   */
  buildAfterSignUpUrl({ params }?: { params?: URLSearchParams }): string;

  /**
   * Returns the configured `afterSignOutUrl` of the instance.
   */
  buildAfterSignOutUrl(): string;

  /**
   * Returns the configured `newSubscriptionRedirectUrl` of the instance.
   */
  buildNewSubscriptionRedirectUrl(): string;

  /**
   * Returns the configured `afterMultiSessionSingleSignOutUrl` of the instance.
   */
  buildAfterMultiSessionSingleSignOutUrl(): string;

  /**
   * Returns the configured URL where [`<Waitlist />`](https://clerk.com/docs/reference/components/authentication/waitlist) is mounted or a custom waitlist page is rendered.
   *
   * @param opts - Options to control the waitlist URL.
   * @param opts.initialValues - Initial values to prefill the waitlist form.
   */
  buildWaitlistUrl(opts?: { initialValues?: Record<string, string> }): string;

  /**
   *
   * Redirects to the provided URL after appending authentication credentials. For development instances, this method decorates the URL with an auth token to maintain authentication state. For production instances, the standard session cookie is used.
   *
   * Returns a promise that can be `await`ed in order to listen for the navigation to finish. The inner value should not be relied on, as it can change based on the framework it's used within.
   *
   * @param to - The URL to redirect to.
   */
  redirectWithAuth(to: string): Promise<unknown>;

  /**
   * Redirects to the sign-in URL, as configured in your application's instance settings. This method uses the [`navigate()`](https://clerk.com/docs/reference/objects/clerk#navigate) method under the hood.
   *
   * Returns a promise that can be `await`ed in order to listen for the navigation to finish. The inner value should not be relied on, as it can change based on the framework it's used within.
   *
   * @param opts - Options to control the redirect.
   */
  redirectToSignIn(opts?: SignInRedirectOptions): Promise<unknown>;

  /**
   * Redirects to the sign-up URL, as configured in your application's instance settings. This method uses the [`navigate()`](https://clerk.com/docs/reference/objects/clerk#navigate) method under the hood.
   *
   * Returns a promise that can be `await`ed in order to listen for the navigation to finish. The inner value should not be relied on, as it can change based on the framework it's used within.
   *
   * @param opts - Options to control the redirect.
   */
  redirectToSignUp(opts?: SignUpRedirectOptions): Promise<unknown>;

  /**
   * Redirects to the configured URL where [`<UserProfile />`](https://clerk.com/docs/reference/components/user/user-profile) is mounted.
   *
   * Returns a promise that can be `await`ed in order to listen for the navigation to finish. The inner value should not be relied on, as it can change based on the framework it's used within.
   */
  redirectToUserProfile: () => Promise<unknown>;

  /**
   * Redirects to the configured URL where [`<OrganizationProfile />`](https://clerk.com/docs/reference/components/organization/organization-profile) is mounted. This method uses the [`navigate()`](https://clerk.com/docs/reference/objects/clerk#navigate) method under the hood.
   *
   * Returns a promise that can be `await`ed in order to listen for the navigation to finish. The inner value should not be relied on, as it can change based on the framework it's used within.
   */
  redirectToOrganizationProfile: () => Promise<unknown>;

  /**
   * Redirects to the configured URL where [`<CreateOrganization />`](https://clerk.com/docs/reference/components/organization/create-organization) is mounted. This method uses the [`navigate()`](https://clerk.com/docs/reference/objects/clerk#navigate) method under the hood.
   *
   * Returns a promise that can be `await`ed in order to listen for the navigation to finish. The inner value should not be relied on, as it can change based on the framework it's used within.
   */
  redirectToCreateOrganization: () => Promise<unknown>;

  /**
   * Redirects to the configured `afterSignIn` URL.
   */
  redirectToAfterSignIn: () => void;

  /**
   * Redirects to the configured `afterSignUp` URL.
   */
  redirectToAfterSignUp: () => void;

  /**
   * Redirects to the configured `afterSignOut` URL.
   */
  redirectToAfterSignOut: () => void;

  /**
   * Redirects to the configured URL where [`<Waitlist />`](https://clerk.com/docs/reference/components/authentication/waitlist) is mounted.
   */
  redirectToWaitlist: () => void;

  /**
   * Redirects to the configured URL where [session tasks](https://clerk.com/docs/reference/objects/session) are mounted.
   *
   * @param opts - Options to control the redirect (e.g. redirect URL after tasks are complete).
   */
  redirectToTasks(opts?: TasksRedirectOptions): Promise<unknown>;

  /**
   * Completes a Google One Tap redirection flow started by [`authenticateWithGoogleOneTap()`](#authenticate-with-google-one-tap). This method should be called after the user is redirected back from visiting the Google One Tap prompt.
   *
   * @param signInOrUp - The resource returned from the initial `authenticateWithGoogleOneTap()` call (before redirect).
   * @param params - Additional props that define where the user will be redirected to at the end of a successful Google One Tap flow.
   * @param customNavigate - A function that overrides Clerk's default navigation behavior, allowing custom handling of navigation during sign-up and sign-in flows.
   */
  handleGoogleOneTapCallback: (
    signInOrUp: SignInResource | SignUpResource,
    params: HandleOAuthCallbackParams,
    customNavigate?: (to: string) => Promise<unknown>,
  ) => Promise<unknown>;

  /**
   * Completes a custom OAuth or SAML redirect flow that was started by calling [`SignIn.authenticateWithRedirect(params)`](https://clerk.com/docs/reference/objects/sign-in) or [`SignUp.authenticateWithRedirect(params)`](https://clerk.com/docs/reference/objects/sign-up).
   *
   * @param params - Additional props that define where the user will be redirected to at the end of a successful OAuth or SAML flow.
   * @param customNavigate - A function that overrides Clerk's default navigation behavior, allowing custom handling of navigation during sign-up and sign-in flows.
   */
  handleRedirectCallback: (
    params: HandleOAuthCallbackParams | HandleSamlCallbackParams,
    customNavigate?: (to: string) => Promise<unknown>,
  ) => Promise<unknown>;

  /**
   * Completes an email link verification flow started by `Clerk.client.signIn.createEmailLinkFlow` or `Clerk.client.signUp.createEmailLinkFlow`, by processing the verification results from the redirect URL query parameters. This method should be called after the user is redirected back from visiting the verification link in their email.
   * @param params - Allows you to define the URLs where the user should be redirected to on successful verification or pending/completed sign-up or sign-in attempts. If the email link is successfully verified on another device, there's a callback function parameter that allows custom code execution.
   * @param customNavigate - A function that overrides Clerk's default navigation behavior, allowing custom handling of navigation during sign-up and sign-in flows.
   */
  handleEmailLinkVerification: (
    params: HandleEmailLinkVerificationParams,
    customNavigate?: (to: string) => Promise<unknown>,
  ) => Promise<unknown>;

  /**
   * Starts a sign-in flow that uses MetaMask to authenticate the user using their Metamask wallet address.
   */
  authenticateWithMetamask: (params?: AuthenticateWithMetamaskParams) => Promise<unknown>;

  /**
   * Starts a sign-in flow that uses Coinbase Smart Wallet to authenticate the user using their Coinbase wallet address.
   */
  authenticateWithCoinbaseWallet: (params?: AuthenticateWithCoinbaseWalletParams) => Promise<unknown>;

  /**
   * Starts a sign-in flow that uses OKX Wallet to authenticate the user using their OKX wallet address.
   */
  authenticateWithOKXWallet: (params?: AuthenticateWithOKXWalletParams) => Promise<unknown>;

  /**
   * Starts a sign-in flow that uses Base to authenticate the user using their Web3 wallet address.
   */
  authenticateWithBase: (params?: AuthenticateWithBaseParams) => Promise<unknown>;

  /**
   * Starts a sign-in flow that uses Solana to authenticate the user using their Solana wallet address.
   */
  authenticateWithSolana: (params: AuthenticateWithSolanaParams) => Promise<unknown>;

  /**
   * Starts a sign-in flow that uses a Web3 Wallet browser extension to authenticate the user using their Ethereum wallet address.
   */
  authenticateWithWeb3: (params: ClerkAuthenticateWithWeb3Params) => Promise<unknown>;

  /**
   * Authenticates user using a Google token generated from Google identity services.
   */
  authenticateWithGoogleOneTap: (
    params: AuthenticateWithGoogleOneTapParams,
  ) => Promise<SignInResource | SignUpResource>;

  /**
   * Creates an Organization programmatically, adding the current user as admin. Returns an [`Organization`](https://clerk.com/docs/reference/objects/organization) object.
   *
   * > [!NOTE]
   * > For React-based apps, consider using the [`<CreateOrganization />`](https://clerk.com/docs/reference/components/organization/create-organization) component.
   */
  createOrganization: (params: CreateOrganizationParams) => Promise<OrganizationResource>;

  /**
   * Retrieves a single [Organization](https://clerk.com/docs/reference/objects/organization) by ID.
   *
   * @param organizationId - The ID of the Organization to retrieve.
   */
  getOrganization: (organizationId: string) => Promise<OrganizationResource>;

  /**
   * Handles a 401 response from the Frontend API by refreshing the [`Client`](https://clerk.com/docs/reference/objects/client) and [`Session`](https://clerk.com/docs/reference/objects/session) object accordingly.
   */
  handleUnauthenticated: () => Promise<unknown>;

  /**
   * Create a new waitlist entry programmatically. Requires that you set your app's sign-up mode to [**Waitlist**](https://clerk.com/docs/guides/secure/restricting-access#waitlist) in the Clerk Dashboard.
   */
  joinWaitlist: (params: JoinWaitlistParams) => Promise<WaitlistResource>;

  /**
   * This is an optional function.
   * This function is used to load cached Client and Environment resources if Clerk fails to load them from the Frontend API.
   *
   * @internal
   */
  __internal_getCachedResources:
    | (() => Promise<{ client: ClientJSONSnapshot | null; environment: EnvironmentJSONSnapshot | null }>)
    | undefined;

  /**
   * This function is used to reload the initial resources (Environment/Client) from the Frontend API.
   *
   * @internal
   */
  __internal_reloadInitialResources: () => Promise<void>;

  /**
   * Internal flag indicating whether a `setActive` call is in progress. Used to prevent navigations from being
   * initiated outside of the Clerk class.
   *
   * @internal
   */
  __internal_setActiveInProgress: boolean;

  /**
   * The `APIKeys` object used for managing API keys.
   */
  apiKeys: APIKeysNamespace;

  /**
   * Checkout API
   *
   * @experimental
   * This API is in early access and may change in future releases.
   */
  __experimental_checkout: __experimental_CheckoutFunction;
}

/** @document */
export type HandleOAuthCallbackParams = TransferableOption &
  SignInForceRedirectUrl &
  SignInFallbackRedirectUrl &
  SignUpForceRedirectUrl &
  SignUpFallbackRedirectUrl & {
    /**
     * The full URL or path where the [`<SignIn />`](https://clerk.com/docs/reference/components/authentication/sign-in) component is mounted.
     */
    signInUrl?: string;
    /**
     * The full URL or path where the [`<SignUp />`](https://clerk.com/docs/reference/components/authentication/sign-up) component is mounted.
     */
    signUpUrl?: string;
    /**
     * The full URL or path to navigate to during sign in, if [first factor verification](!first-factor-verification) is required.
     */
    firstFactorUrl?: string;
    /**
     * The full URL or path to navigate to during sign in, if [multi-factor authentication](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#multi-factor-authentication) is enabled.
     */
    secondFactorUrl?: string;
    /**
     * The full URL or path to navigate to during sign in, if the user is required to reset their password.
     */
    resetPasswordUrl?: string;
    /**
     * The full URL or path to navigate to if the sign up requires additional information.
     */
    continueSignUpUrl?: string | null;
    /**
     * The full URL or path to navigate to after requesting email verification.
     */
    verifyEmailAddressUrl?: string | null;
    /**
     * The full URL or path to navigate to after requesting phone verification.
     */
    verifyPhoneNumberUrl?: string | null;
    /**
     * The underlying resource to optionally reload before processing an OAuth callback.
     */
    reloadResource?: 'signIn' | 'signUp';
    /**
     * Metadata that can be read and set from the frontend. Once the sign-up is complete, the value of this field will be automatically copied to the newly created user's unsafe metadata. One common use case for this attribute is to use it to implement custom fields that can be collected during sign-up and will automatically be attached to the created `User` object.
     */
    unsafeMetadata?: SignUpUnsafeMetadata;
  };

export type HandleSamlCallbackParams = HandleOAuthCallbackParams;

/**
 * A function used to navigate to a given URL after certain steps in the Clerk processes.
 *
 * @param to - The URL or relative path to navigate to.
 * @param options - Optional configuration.
 * @param options.replace? - If `true`, replace the current history entry instead of pushing a new one.
 * @param options.metadata? - Optional router metadata.
 */
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

/** @document */
type ClerkUnsafeOptions = {
  /**
   * Disables the console warning that is logged when Clerk is initialized with development keys.
   *
   * [WARNING] The development mode warning is intended to ensure that you don't go to production with a non-production
   * Clerk instance. If you're disabling it, please make sure you don't ship with a non-production Clerk instance!
   *
   * More information: https://clerk.com/docs/guides/development/deployment/production
   */
  unsafe_disableDevelopmentModeConsoleWarning?: boolean;
};

/** @document */
export type ClerkOptions = ClerkOptionsNavigation &
  SignInForceRedirectUrl &
  SignInFallbackRedirectUrl &
  SignUpForceRedirectUrl &
  SignUpFallbackRedirectUrl &
  NewSubscriptionRedirectUrl &
  AfterSignOutUrl &
  AfterMultiSessionSingleSignOutUrl &
  ClerkUnsafeOptions & {
    /**
     * Clerk UI module. Pass the `ui` export from `@clerk/ui` to bundle the UI
     * with your application instead of loading it from the CDN.
     */
    ui?: { ClerkUI?: ClerkUIConstructor | Promise<ClerkUIConstructor> };
    /**
     * Optional object to style your components. Will only affect [Clerk Components](https://clerk.com/docs/reference/components/overview) and not [Account Portal](https://clerk.com/docs/guides/account-portal/overview) pages.
     */
    // TODO @nikos
    appearance?: any;
    /**
     * Optional object to localize your components. Will only affect [Clerk Components](https://clerk.com/docs/reference/components/overview) and not [Account Portal](https://clerk.com/docs/guides/account-portal/overview) pages.
     */
    localization?: LocalizationResource;
    /**
     * Indicates whether Clerk should poll against Clerk's backend every 5 minutes.
     * @default true
     */
    polling?: boolean;
    /**
     * By default, the last signed-in session is used during client initialization. This option allows you to override that behavior, e.g. by selecting a specific session.
     */
    selectInitialSession?: (client: ClientResource) => SignedInSessionResource | null;
    /**
     * Indicates whether ClerkJS is loaded with the assumption that cookies can be set (browser setup). On native platforms this value must be set to `false`.
     */
    standardBrowser?: boolean;
    /**
     * Optional support email for display in authentication screens. Will only affect [Clerk Components](https://clerk.com/docs/reference/components/overview) and not [Account Portal](https://clerk.com/docs/guides/account-portal/overview) pages.
     */
    supportEmail?: string;
    /**
     * By default, the [Clerk Frontend API `touch` endpoint](https://clerk.com/docs/reference/frontend-api/tag/Sessions#operation/touchSession) is called during page focus to keep the last active session alive. This option allows you to disable this behavior.
     */
    touchSession?: boolean;
    /**
     * This URL will be used for any redirects that might happen and needs to point to your primary application on the client-side. This option is optional for production instances. **It is required to be set for a satellite application in a development instance**. It's recommended to use [the environment variable](https://clerk.com/docs/guides/development/clerk-environment-variables#sign-in-and-sign-up-redirects) instead.
     */
    signInUrl?: string;
    /**
     * This URL will be used for any redirects that might happen and needs to point to your primary application on the client-side. This option is optional for production instances. **It is required to be set for a satellite application in a development instance**. It's recommended to use [the environment variable](https://clerk.com/docs/guides/development/clerk-environment-variables#sign-in-and-sign-up-redirects) instead.
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
     * Indicates whether the application is a satellite application.
     */
    isSatellite?: boolean | ((url: URL) => boolean);
    /**
     * Controls whether satellite apps automatically sync with the primary domain on initial page load.
     *
     * When `false` (default), satellite apps will skip the automatic handshake if no session cookies exist,
     * and only trigger the handshake after an explicit sign-in action. This provides the best performance
     * by showing the satellite app immediately without attempting to sync state first.
     *
     * When `true`, satellite apps will automatically trigger a handshake redirect to sync authentication
     * state with the primary domain on first load, even if no session cookies exist. Use this if you want
     * users who are already signed in on the primary domain to be automatically recognized on the satellite.
     *
     * @default false
     */
    satelliteAutoSync?: boolean;
    /**
     * Controls whether or not Clerk will collect [telemetry data](https://clerk.com/docs/guides/how-clerk-works/security/clerk-telemetry). If set to `debug`, telemetry events are only logged to the console and not sent to Clerk.
     */
    telemetry?:
      | false
      | {
          /**
           * If `true`, telemetry will not be collected.
           */
          disabled?: boolean;
          /**
           * If `true`, telemetry events are only logged to the console and not sent to Clerk
           */
          debug?: boolean;
          /**
           * If false, the sampling rates provided per telemetry event will be ignored and all events will be sent.
           *
           * @default true
           */
          perEventSampling?: boolean;
        };

    /**
     * Contains information about the SDK that the host application is using. You don't need to set this value yourself unless you're [developing an SDK](https://clerk.com/docs/guides/development/sdk-development/overview).
     */
    sdkMetadata?: SDKMetadata;
    /**
     * The full URL or path to the waitlist page. If `undefined`, will redirect to the [Account Portal waitlist page](https://clerk.com/docs/guides/account-portal/overview#waitlist).
     */
    waitlistUrl?: string;
    /**
     * Enable experimental flags to gain access to new features. These flags are not guaranteed to be stable and may change drastically in between patch or minor versions.
     */
    experimental?: Autocomplete<
      {
        /**
         * Persist the Clerk client to match the user's device with a client.
         *
         * @default true
         */
        persistClient: boolean;
        /**
         * Clerk will rethrow network errors that occur while the user is offline.
         */
        rethrowOfflineNetworkErrors: boolean;
        commerce: boolean;
        /**
         * When set to `'headless'`, Clerk will skip script/chunk loading and initialize
         * directly with the provided Clerk instance. Used by React Native / Expo.
         */
        runtimeEnvironment: 'headless';
      },
      Record<string, any>
    >;

    /**
     * The URL a developer should be redirected to in order to claim an instance created in Keyless mode.
     *
     * @internal
     */
    __internal_keyless_claimKeylessApplicationUrl?: string;

    /**
     * After a developer has claimed their instance created by Keyless mode, they can use this URL to find their instance's keys
     *
     * @internal
     */
    __internal_keyless_copyInstanceKeysUrl?: string;

    /**
     * Pass a function that will trigger the unmounting of the Keyless Prompt.
     * It should cause the values of `__internal_claimKeylessApplicationUrl` and `__internal_copyInstanceKeysUrl` to become undefined.
     *
     * @internal
     */
    __internal_keyless_dismissPrompt?: (() => Promise<void>) | null;

    /**
     * Customize the URL paths users are redirected to after sign-in or sign-up when specific
     * session tasks need to be completed.
     *
     * When `undefined`, it uses Clerk's default task flow URLs.
     *
     * @default undefined
     */
    taskUrls?: Partial<Record<SessionTask['key'], string>>;
  };

/** @inline */
export interface NavigateOptions {
  /**
   * If `true`, replace the current history entry instead of pushing a new one.
   */
  replace?: boolean;
  /**
   * Optional router metadata.
   */
  metadata?: RouterMetadata;
}

/**
 * @inline
 */
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

export type TasksRedirectOptions = RedirectOptions & RedirectUrlProp;

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
 *
 * @interface
 */
export type SetActiveParams = {
  /**
   * The session resource or session ID (string version) to be set as active. If `null`, the current session is deleted.
   */
  session?: SignedInSessionResource | string | null;

  /**
   * The Organization resource or Organization ID/slug (string version) to be set as active in the current session. If `null`, the currently Active Organization is removed as active.
   */
  organization?: OrganizationResource | string | null;

  /**
   * The full URL or path to redirect to just before the session and/or organization is set.
   */
  redirectUrl?: string;

  /**
   * A custom navigation function to be called just before the session and/or Organization is set. When provided, it takes precedence over the `redirectUrl` parameter for navigation.
   *
   * The callback receives a `decorateUrl` function that should be used to wrap destination URLs. This enables Safari ITP cookie refresh when needed. The decorated URL may be an external URL (starting with `https://`) that requires `window.location.href` instead of client-side navigation. See the [section on using the `navigate()` parameter](https://clerk.com/docs/reference/objects/clerk#using-the-navigate-parameter) for more details.
   *
   * @example
   * ```typescript
   * await clerk.setActive({
   *   session,
   *   navigate: async ({ session, decorateUrl }) => {
   *     const destination = session.currentTask
   *       ? `/onboarding/${session.currentTask.key}`
   *       : '/dashboard';
   *
   *     const url = decorateUrl(destination);
   *
   *     // decorateUrl may return an external URL when Safari ITP fix is needed
   *     if (url.startsWith('https')) {
   *       window.location.href = url;
   *     } else {
   *       router.push(url);
   *     }
   *   }
   * });
   * ```
   */
  navigate?: SetActiveNavigate;
};

/**
 * @inline
 */
export type SetActive = (setActiveParams: SetActiveParams) => Promise<void>;

export type RoutingOptions =
  | { path: string | undefined; routing?: Extract<RoutingStrategy, 'path'> }
  | { path?: never; routing?: Extract<RoutingStrategy, 'hash'> };

/** @document */
export type SignInProps = RoutingOptions & {
  /**
   * Full URL or path to navigate to after successful sign in.
   * This value has precedence over other redirect props, environment variables or search params.
   * Use this prop to override the redirect URL when needed.
   *
   * @default undefined
   */
  forceRedirectUrl?: string | null;
  /**
   * Full URL or path to navigate to after successful sign in.
   * This value is used when no other redirect props, environment variables or search params are present.
   *
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
   * Customization options to fully match the Clerk components to your own brand.
   * These options serve as overrides and will be merged with the global `appearance`
   * prop of ClerkProvider (if one is provided)
   */
  appearance?: ClerkAppearanceTheme;
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
  AfterSignOutUrl;

/**
 * @interface
 */
export interface TransferableOption {
  /**
   * Indicates whether or not sign-in attempts are transferable to the sign-up flow. Defaults to `true`. When set to `false`, prevents [opaque sign-ups](!opaque-sign-up) when a user attempts to sign in via OAuth with an email that doesn't exist.
   *
   * @default true
   */
  transferable?: boolean;
}

export type SignInModalProps = WithoutRouting<SignInProps> & {
  /**
   * Function that returns the container element where portals should be rendered.
   * This allows Clerk components to render inside external dialogs/popovers
   * (e.g., Radix Dialog, React Aria Components) instead of document.body.
   */
  getContainer?: () => HTMLElement | null;
};

export type __internal_UserVerificationProps = RoutingOptions & {
  /**
   * Function that returns the container element where portals should be rendered.
   * This allows Clerk components to render inside external dialogs/popovers
   * (e.g., Radix Dialog, React Aria Components) instead of document.body.
   */
  getContainer?: () => HTMLElement | null;
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
   *
   * @default `'secondFactor'`
   */
  level?: SessionVerificationLevel;

  /**
   * Customization options to fully match the Clerk components to your own brand.
   * These options serve as overrides and will be merged with the global `appearance`
   * prop of ClerkProvider (if one is provided)
   */
  appearance?: ClerkAppearanceTheme;
};

export type __internal_UserVerificationModalProps = WithoutRouting<__internal_UserVerificationProps>;

export type __internal_EnableOrganizationsPromptProps = {
  onSuccess?: () => void;
  onClose?: () => void;
} & {
  caller:
    | 'OrganizationSwitcher'
    | 'OrganizationProfile'
    | 'OrganizationList'
    | 'useOrganizationList'
    | 'useOrganization';
};

export type __internal_AttemptToEnableEnvironmentSettingParams = {
  for: 'organizations';
  caller:
    | 'OrganizationSwitcher'
    | 'OrganizationProfile'
    | 'OrganizationList'
    | 'CreateOrganization'
    | 'TaskChooseOrganization'
    | 'useOrganizationList'
    | 'useOrganization';
  onClose?: () => void;
};

export type __internal_AttemptToEnableEnvironmentSettingResult = {
  isEnabled: boolean;
};

type GoogleOneTapRedirectUrlProps = SignInForceRedirectUrl & SignUpForceRedirectUrl;

/** @document */
export type GoogleOneTapProps = GoogleOneTapRedirectUrlProps & {
  /**
   * Whether to cancel the Google One Tap request if a user clicks outside the prompt.
   *
   * @default true
   */
  cancelOnTapOutside?: boolean;
  /**
   * Enables upgraded One Tap UX on ITP browsers.
   * Turning this options off, would hide any One Tap UI in such browsers.
   *
   * @default true
   */
  itpSupport?: boolean;
  /**
   * FedCM enables more private sign-in flows without requiring the use of third-party cookies.
   * The browser controls user settings, displays user prompts, and only contacts an Identity Provider such as Google after explicit user consent is given.
   * Backwards compatible with browsers that still support third-party cookies.
   *
   * @default true
   */
  fedCmSupport?: boolean;
  appearance?: ClerkAppearanceTheme;
};

/** @document */
export type SignUpProps = RoutingOptions & {
  /**
   * Full URL or path to navigate to after successful sign up.
   * This value has precedence over other redirect props, environment variables or search params.
   * Use this prop to override the redirect URL when needed.
   *
   * @default undefined
   */
  forceRedirectUrl?: string | null;
  /**
   * Full URL or path to navigate to after successful sign up.
   * This value is used when no other redirect props, environment variables or search params are present.
   *
   * @default undefined
   */
  fallbackRedirectUrl?: string | null;
  /**
   * Full URL or path to for the sign in process.
   * Used to fill the "Sign in" link in the SignUp component.
   */
  signInUrl?: string;
  /**
   * Customization options to fully match the Clerk components to your own brand.
   * These options serve as overrides and will be merged with the global `appearance`
   * prop of ClerkProvider (if one is provided)
   */
  appearance?: ClerkAppearanceTheme;

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
  AfterSignOutUrl;

export type SignUpModalProps = WithoutRouting<SignUpProps> & {
  /**
   * Function that returns the container element where portals should be rendered.
   * This allows Clerk components to render inside external dialogs/popovers
   * (e.g., Radix Dialog, React Aria Components) instead of document.body.
   */
  getContainer?: () => HTMLElement | null;
};

/** @document */
export type UserProfileProps = RoutingOptions & {
  /**
   * Customization options to fully match the Clerk components to your own brand.
   * These options serve as overrides and will be merged with the global `appearance`
   * prop of ClerkProvider (if one is provided)
   */
  appearance?: ClerkAppearanceTheme;
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
   *
   * @example __experimental_startPath: '/members'
   *
   * @experimental
   */
  __experimental_startPath?: string;
  /**
   * Specify options for the underlying <APIKeys /> component.
   * e.g. <UserProfile apiKeysProps={{ showDescription: true }} />
   *
   * @experimental
   */
  apiKeysProps?: APIKeysProps & {
    /**
     * Whether to hide the API Keys page. When true, the API Keys page will not be displayed even if API keys are enabled.
     *
     * @default false
     */
    hide?: boolean;
  };
};

export type UserProfileModalProps = WithoutRouting<UserProfileProps> & {
  /**
   * Function that returns the container element where portals should be rendered.
   * This allows Clerk components to render inside external dialogs/popovers
   * (e.g., Radix Dialog, React Aria Components) instead of document.body.
   */
  getContainer?: () => HTMLElement | null;
};

/** @document */
export type OrganizationProfileProps = RoutingOptions & {
  /**
   * Full URL or path to navigate to after the user leaves the currently Active Organization.
   *
   * @default undefined
   */
  afterLeaveOrganizationUrl?: string;
  /**
   * Customization options to fully match the Clerk components to your own brand.
   * These options serve as overrides and will be merged with the global `appearance`
   * prop of ClerkProvider (if one is provided)
   */
  appearance?: ClerkAppearanceTheme;
  /*
   * Provide custom pages and links to be rendered inside the OrganizationProfile.
   */
  customPages?: CustomPage[];
  /**
   * Specify on which page the Organization profile modal will open.
   *
   * @example __experimental_startPath: '/organization-members'
   *
   * @experimental
   */
  __experimental_startPath?: string;
  /**
   * Specify options for the underlying <APIKeys /> component.
   * e.g. <OrganizationProfile apiKeysProps={{ showDescription: true }} />
   *
   * @experimental
   */
  apiKeysProps?: APIKeysProps & {
    /**
     * Whether to hide the API Keys page. When true, the API Keys page will not be displayed even if API keys are enabled.
     *
     * @default false
     */
    hide?: boolean;
  };
};

export type OrganizationProfileModalProps = WithoutRouting<OrganizationProfileProps> & {
  /**
   * Function that returns the container element where portals should be rendered.
   * This allows Clerk components to render inside external dialogs/popovers
   * (e.g., Radix Dialog, React Aria Components) instead of document.body.
   */
  getContainer?: () => HTMLElement | null;
};

/** @document */
export type CreateOrganizationProps = RoutingOptions & {
  /**
   * Full URL or path to navigate to after creating a new Organization.
   *
   * @default undefined
   */
  afterCreateOrganizationUrl?:
    | ((organization: OrganizationResource) => string)
    | LooseExtractedParams<PrimitiveKeys<OrganizationResource>>;
  /**
   * Hides the screen for sending invitations after an Organization is created.
   *
   * @default undefined When left undefined Clerk will automatically hide the screen if
   * the number of max allowed members is equal to 1
   */
  skipInvitationScreen?: boolean;
  /**
   * Customization options to fully match the Clerk components to your own brand.
   * These options serve as overrides and will be merged with the global `appearance`
   * prop of ClerkProvider (if one is provided)
   */
  appearance?: ClerkAppearanceTheme;
};

/** @document */
export type CreateOrganizationModalProps = WithoutRouting<CreateOrganizationProps> & {
  /**
   * Function that returns the container element where portals should be rendered.
   * This allows Clerk components to render inside external dialogs/popovers
   * (e.g., Radix Dialog, React Aria Components) instead of document.body.
   */
  getContainer?: () => HTMLElement | null;
};

/** @inline */
type UserProfileMode = 'modal' | 'navigation';

/** @document */
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
   *
   * @default undefined
   *
   * @experimental This API is experimental and may change at any moment.
   */
  __experimental_asStandalone?: boolean | ((opened: boolean) => void);

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
   * Customization options to fully match the Clerk components to your own brand.
   * These options serve as overrides and will be merged with the global `appearance`
   * prop of ClerkProvider (if one is provided)
   */
  appearance?: ClerkAppearanceTheme;

  /**
   * Specify options for the underlying <UserProfile /> component.
   * e.g. <UserButton userProfileProps={{additionalOAuthScopes: {google: ['foo', 'bar'], github: ['qux']}}} />
   */
  userProfileProps?: Pick<UserProfileProps, 'additionalOAuthScopes' | 'appearance' | 'customPages' | 'apiKeysProps'>;

  /*
   * Provide custom menu actions and links to be rendered inside the UserButton.
   */
  customMenuItems?: CustomMenuItem[];
};

export type UserAvatarProps = {
  appearance?: ClerkAppearanceTheme;
  rounded?: boolean;
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

/** @document */
export type OrganizationSwitcherProps = CreateOrganizationMode &
  OrganizationProfileMode & {
    /**
     * Controls the default state of the OrganizationSwitcher
     */
    defaultOpen?: boolean;

    /**
     * If true, `<OrganizationSwitcher />` will only render the popover.
     * Enables developers to implement a custom dialog.
     *
     * @default undefined
     *
     * @experimental This API is experimental and may change at any moment.
     */
    __experimental_asStandalone?: boolean | ((opened: boolean) => void);

    /**
     * By default, users can switch between Organization and their personal account.
     * This option controls whether OrganizationSwitcher will include the user's personal account
     * in the Organization list. Setting this to `false` will hide the personal account entry,
     * and users will only be able to switch between Organizations.
     *
     * @default true
     */
    hidePersonal?: boolean;
    /**
     * Full URL or path to navigate to after creating a new organization.
     *
     * @default undefined
     */
    afterCreateOrganizationUrl?:
      | ((organization: OrganizationResource) => string)
      | LooseExtractedParams<PrimitiveKeys<OrganizationResource>>;
    /**
     * Full URL or path to navigate to after a successful Organization selection.
     * Accepts a function that returns URL or path
     *
     * @default undefined`
     */
    afterSelectOrganizationUrl?:
      | ((organization: OrganizationResource) => string)
      | LooseExtractedParams<PrimitiveKeys<OrganizationResource>>;
    /**
     * Full URL or path to navigate to after a successful selection of personal workspace.
     * Accepts a function that returns URL or path
     *
     * @default undefined
     */
    afterSelectPersonalUrl?: ((user: UserResource) => string) | LooseExtractedParams<PrimitiveKeys<UserResource>>;
    /**
     * Full URL or path to navigate to after the user leaves the currently Active Organization.
     *
     * @default undefined
     */
    afterLeaveOrganizationUrl?: string;
    /**
     * Hides the screen for sending invitations after an Organization is created.
     *
     * @default undefined When left undefined Clerk will automatically hide the screen if
     * the number of max allowed members is equal to 1
     */
    skipInvitationScreen?: boolean;
    /**
     * Customization options to fully match the Clerk components to your own brand.
     * These options serve as overrides and will be merged with the global `appearance`
     * prop of ClerkProvider(if one is provided)
     */
    appearance?: ClerkAppearanceTheme;
    /*
     * Specify options for the underlying <OrganizationProfile /> component.
     * e.g. <UserButton userProfileProps={{appearance: {...}}} />
     */
    organizationProfileProps?: Pick<OrganizationProfileProps, 'appearance' | 'customPages'>;
  };

/** @document */
export type OrganizationListProps = {
  /**
   * Full URL or path to navigate to after creating a new Organization.
   *
   * @default undefined
   */
  afterCreateOrganizationUrl?:
    | ((organization: OrganizationResource) => string)
    | LooseExtractedParams<PrimitiveKeys<OrganizationResource>>;
  /**
   * Full URL or path to navigate to after a successful Organization selection.
   * Accepts a function that returns URL or path
   *
   * @default undefined`
   */
  afterSelectOrganizationUrl?:
    | ((organization: OrganizationResource) => string)
    | LooseExtractedParams<PrimitiveKeys<OrganizationResource>>;
  /**
   * Customization options to fully match the Clerk components to your own brand.
   * These options serve as overrides and will be merged with the global `appearance`
   * prop of ClerkProvider (if one is provided)
   */
  appearance?: ClerkAppearanceTheme;
  /**
   * Hides the screen for sending invitations after an Organization is created.
   *
   * @default undefined When left undefined Clerk will automatically hide the screen if
   * the number of max allowed members is equal to 1
   */
  skipInvitationScreen?: boolean;
  /**
   * By default, users can switch between Organization and their personal account.
   * This option controls whether OrganizationList will include the user's personal account
   * in the Organization list. Setting this to `false` will hide the personal account entry,
   * and users will only be able to switch between Organizations.
   *
   * @default true
   */
  hidePersonal?: boolean;
  /**
   * Full URL or path to navigate to after a successful selection of personal workspace.
   * Accepts a function that returns URL or path
   *
   * @default undefined`
   */
  afterSelectPersonalUrl?: ((user: UserResource) => string) | LooseExtractedParams<PrimitiveKeys<UserResource>>;
};

/** @document */
export type WaitlistProps = {
  /**
   * Full URL or path to navigate to after join waitlist.
   */
  afterJoinWaitlistUrl?: string;
  /**
   * Customization options to fully match the Clerk components to your own brand.
   * These options serve as overrides and will be merged with the global `appearance`
   * prop of ClerkProvided (if one is provided)
   */
  appearance?: ClerkAppearanceTheme;
  /**
   * Full URL or path where the SignIn component is mounted.
   */
  signInUrl?: string;
};

/** @document */
export type WaitlistModalProps = WaitlistProps & {
  /**
   * Function that returns the container element where portals should be rendered.
   * This allows Clerk components to render inside external dialogs/popovers
   * (e.g., Radix Dialog, React Aria Components) instead of document.body.
   */
  getContainer?: () => HTMLElement | null;
};

/** @document */
type PricingTableDefaultProps = {
  /**
   * The position of the CTA button.
   *
   * @default 'bottom'
   */
  ctaPosition?: 'top' | 'bottom';
  /**
   * Whether to collapse Features on the pricing table.
   *
   * @default false
   */
  collapseFeatures?: boolean;
  /**
   * Full URL or path to navigate to after checkout is complete and the user clicks the "Continue" button.
   *
   * @default undefined
   */
  newSubscriptionRedirectUrl?: string;
};

/** @document */
type PricingTableBaseProps = {
  /**
   * The subscriber type to display plans for.
   * If `organization`, show Plans for the Active Organization; otherwise for the user.
   *
   * @default 'user'
   */
  for?: ForPayerType;
  /**
   * Customization options to fully match the Clerk components to your own brand.
   * These options serve as overrides and will be merged with the global `appearance`
   * prop of ClerkProvider (if one is provided)
   */
  appearance?: ClerkAppearanceTheme;
  /*
   * Specify options for the underlying <Checkout /> component.
   * e.g. <PricingTable checkoutProps={{appearance: {variables: {colorText: 'blue'}}}} />
   */
  checkoutProps?: Pick<__internal_CheckoutProps, 'appearance'>;
};

type PortalRoot = HTMLElement | null | undefined;

/** @document */
export type PricingTableProps = PricingTableBaseProps & PricingTableDefaultProps;

/** @document */
export type APIKeysProps = {
  /**
   * The number of API keys to show per page.
   *
   * @default 10
   */
  perPage?: number;
  /**
   * Customization options to fully match the Clerk components to your own brand.
   * These options serve as overrides and will be merged with the global `appearance`
   * prop of ClerkProvider (if one is provided)
   */
  appearance?: ClerkAppearanceTheme;
  /**
   * Whether to show the description field in the API key creation form.
   *
   * @default false
   */
  showDescription?: boolean;
};

/** @document */
export type GetAPIKeysParams = ClerkPaginationParams<{
  /**
   * The user or organization ID to query API keys by. If not provided, defaults to the [Active Organization](!active-organization), then the current User.
   */
  subject?: string;
  /**
   * A search query to filter API keys by name.
   */
  query?: string;
}>;

/** @document */
export type CreateAPIKeyParams = {
  /**
   * The name of the API key.
   */
  name: string;
  /**
   * The user or organization ID to associate the API key with. If not provided, defaults to the [Active Organization](!active-organization), then the current User.
   */
  subject?: string;
  /**
   * The number of seconds until the API key expires. Set to `null` or omit to create a key that never expires.
   */
  secondsUntilExpiration?: number;
  /**
   * The description of the API key.
   */
  description?: string;
};

/** @document */
export type RevokeAPIKeyParams = {
  /**
   * The ID of the API key to revoke.
   */
  apiKeyID: string;
  /**
   * The reason for revoking the API key.
   */
  revocationReason?: string;
};

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type __internal_CheckoutProps = {
  appearance?: ClerkAppearanceTheme;
  planId?: string;
  planPeriod?: BillingSubscriptionPlanPeriod;
  for?: ForPayerType;
  onSubscriptionComplete?: () => void;
  portalId?: string;
  portalRoot?: PortalRoot;
  /**
   * Full URL or path to navigate to after checkout is complete and the user clicks the "Continue" button.
   *
   * @default undefined
   */
  newSubscriptionRedirectUrl?: string;
  onClose?: () => void;
};

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type __experimental_CheckoutButtonProps = {
  planId: string;
  planPeriod?: BillingSubscriptionPlanPeriod;
  for?: ForPayerType;
  onSubscriptionComplete?: () => void;
  checkoutProps?: {
    appearance?: ClerkAppearanceTheme;
    portalId?: string;
    portalRoot?: HTMLElement | null | undefined;
    onClose?: () => void;
  };
  /**
   * Full URL or path to navigate to after checkout is complete and the user clicks the "Continue" button.
   *
   * @default undefined
   */
  newSubscriptionRedirectUrl?: string;
};

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type __internal_PlanDetailsProps = (
  | {
      planId: string;
      plan?: never;
    }
  | {
      /**
       * The Plan object will be used as initial data until the Plan is fetched from the server.
       */
      plan: BillingPlanResource;
      planId?: never;
    }
) & {
  appearance?: ClerkAppearanceTheme;
  initialPlanPeriod?: BillingSubscriptionPlanPeriod;
  portalId?: string;
  portalRoot?: PortalRoot;
};

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type __experimental_PlanDetailsButtonProps = (
  | {
      planId: string;
      plan?: never;
    }
  | {
      /**
       * The Plan object will be used as initial data until the Plan is fetched from the server.
       */
      plan: BillingPlanResource;
      planId?: never;
    }
) & {
  initialPlanPeriod?: BillingSubscriptionPlanPeriod;
  planDetailsProps?: {
    appearance?: ClerkAppearanceTheme;
    portalId?: string;
    portalRoot?: PortalRoot;
  };
};

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type __internal_SubscriptionDetailsProps = {
  /**
   * The subscriber type to display the subscription details for.
   * If `organization` is provided, the subscription details will be displayed for the Active Organization.
   *
   * @default 'user'
   */
  for?: ForPayerType;
  appearance?: ClerkAppearanceTheme;
  onSubscriptionCancel?: () => void;
  portalId?: string;
  portalRoot?: PortalRoot;
};

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export type __experimental_SubscriptionDetailsButtonProps = {
  /**
   * The subscriber type to display the subscription details for.
   * If `organization` is provided, the subscription details will be displayed for the Active Organization.
   *
   * @default 'user'
   */
  for?: ForPayerType;
  onSubscriptionCancel?: () => void;
  subscriptionDetailsProps?: {
    appearance?: ClerkAppearanceTheme;
    portalId?: string;
    portalRoot?: PortalRoot;
  };
};

export type __internal_OAuthConsentProps = {
  appearance?: ClerkAppearanceTheme;
  /**
   * Name of the OAuth application.
   */
  oAuthApplicationName: string;
  /**
   * Logo URL of the OAuth application.
   */
  oAuthApplicationLogoUrl?: string;
  /**
   * URL of the OAuth application.
   */
  oAuthApplicationUrl?: string;
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

/** @document */
export interface HandleEmailLinkVerificationParams {
  /**
   * The full URL to navigate to after successful email link verification on completed sign-up or sign-in on the same device.
   */
  redirectUrlComplete?: string;
  /**
   * The full URL to navigate to after successful email link verification on the same device, but without completing sign-in or sign-up.
   */
  redirectUrl?: string;
  /**
   * Callback function to be executed after successful email link verification on another device.
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

/** @document */
export type TaskChooseOrganizationProps = {
  /**
   * Full URL or path to navigate to after successfully resolving all tasks
   */
  redirectUrlComplete: string;
  /**
   * Customization options to fully match the Clerk components to your own brand.
   */
  appearance?: ClerkAppearanceTheme;
};

/** @document */
export type TaskResetPasswordProps = {
  /**
   * Full URL or path to navigate to after successfully resolving all tasks
   */
  redirectUrlComplete: string;
  /**
   * Customization options to fully match the Clerk components to your own brand.
   */
  appearance?: ClerkAppearanceTheme;
};

/** @document */
export type TaskSetupMFAProps = {
  /**
   * Full URL or path to navigate to after successfully resolving all tasks
   */
  redirectUrlComplete: string;
  /**
   * Customization options to fully match the Clerk components to your own brand.
   */
  appearance?: ClerkAppearanceTheme;
};

/** @document */
export type CreateOrganizationInvitationParams = {
  /**
   * The email address of the user to invite.
   */
  emailAddress: string;
  /**
   * The role of the user to invite.
   */
  role: OrganizationCustomRoleKey;
};

/** @document */
export type CreateBulkOrganizationInvitationParams = {
  /**
   * The email addresses of the users to invite.
   */
  emailAddresses: string[];
  /**
   * The role of the users to invite.
   */
  role: OrganizationCustomRoleKey;
};

/**
 * @interface
 */
export interface CreateOrganizationParams {
  /**
   * The name of the Organization.
   */
  name: string;
  /**
   * The slug of the Organization.
   */
  slug?: string;
}

/** @document */
export interface ClerkAuthenticateWithWeb3Params {
  /**
   * A function that overrides Clerk's default navigation behavior, allowing custom handling of navigation during sign-up and sign-in flows.
   */
  customNavigate?: (to: string) => Promise<unknown>;
  /**
   * The full URL or path to navigate to after a successful sign-in or sign-up.
   */
  redirectUrl?: string;
  /**
   * The URL to navigate to if the sign-up process is missing user information.
   */
  signUpContinueUrl?: string;
  /**
   * Metadata that can be read and set from the frontend. Once the sign-up is complete, the value of this field will be automatically copied to the newly created user's unsafe metadata. One common use case for this attribute is to use it to implement custom fields that can be collected during sign-up and will automatically be attached to the created `User` object.
   */
  unsafeMetadata?: SignUpUnsafeMetadata;
  /**
   * The strategy to use for the sign-in flow.
   */
  strategy: Web3Strategy;
  /**
   * A boolean indicating whether the user has agreed to the [legal compliance](https://clerk.com/docs/guides/secure/legal-compliance) documents.
   */
  legalAccepted?: boolean;
  /**
   * The URL to navigate to if [second factor](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#multi-factor-authentication) is required.
   */
  secondFactorUrl?: string;
  /**
   * The name of the wallet to use for authentication.
   */
  walletName?: string;
}

/** @document */
export interface AuthenticateWithMetamaskParams {
  /**
   * A function that overrides Clerk's default navigation behavior, allowing custom handling of navigation during sign-up and sign-in flows.
   */
  customNavigate?: (to: string) => Promise<unknown>;
  /**
   * The full URL or path to navigate to after a successful sign-in or sign-up.
   */
  redirectUrl?: string;
  /**
   * The URL to navigate to if the sign-up process is missing user information.
   */
  signUpContinueUrl?: string;
  /**
   * Metadata that can be read and set from the frontend. Once the sign-up is complete, the value of this field will be automatically copied to the newly created user's unsafe metadata. One common use case for this attribute is to use it to implement custom fields that can be collected during sign-up and will automatically be attached to the created `User` object.
   */
  unsafeMetadata?: SignUpUnsafeMetadata;
  /**
   * A boolean indicating whether the user has agreed to the [legal compliance](https://clerk.com/docs/guides/secure/legal-compliance) documents.
   */
  legalAccepted?: boolean;
}

/** @document */
export interface AuthenticateWithCoinbaseWalletParams {
  /**
   * A function that overrides Clerk's default navigation behavior, allowing custom handling of navigation during sign-up and sign-in flows.
   */
  customNavigate?: (to: string) => Promise<unknown>;
  /**
   * The full URL or path to navigate to after a successful sign-in or sign-up.
   */
  redirectUrl?: string;
  /**
   * The URL to navigate to if the sign-up process is missing user information.
   */
  signUpContinueUrl?: string;
  /**
   * Metadata that can be read and set from the frontend. Once the sign-up is complete, the value of this field will be automatically copied to the newly created user's unsafe metadata. One common use case for this attribute is to use it to implement custom fields that can be collected during sign-up and will automatically be attached to the created `User` object.
   */
  unsafeMetadata?: SignUpUnsafeMetadata;
  /**
   * A boolean indicating whether the user has agreed to the [legal compliance](https://clerk.com/docs/guides/secure/legal-compliance) documents.
   */
  legalAccepted?: boolean;
}

/** @document */
export interface AuthenticateWithOKXWalletParams {
  /**
   * A function that overrides Clerk's default navigation behavior, allowing custom handling of navigation during sign-up and sign-in flows.
   */
  customNavigate?: (to: string) => Promise<unknown>;
  /**
   * The full URL or path to navigate to after a successful sign-in or sign-up.
   */
  redirectUrl?: string;
  /**
   * The URL to navigate to if the sign-up process is missing user information.
   */
  signUpContinueUrl?: string;
  /**
   * Metadata that can be read and set from the frontend. Once the sign-up is complete, the value of this field will be automatically copied to the newly created user's unsafe metadata. One common use case for this attribute is to use it to implement custom fields that can be collected during sign-up and will automatically be attached to the created `User` object.
   */
  unsafeMetadata?: SignUpUnsafeMetadata;
  /**
   * A boolean indicating whether the user has agreed to the [legal compliance](https://clerk.com/docs/guides/secure/legal-compliance) documents.
   */
  legalAccepted?: boolean;
}

/** @document */
export interface AuthenticateWithGoogleOneTapParams {
  /**
   * The Google credential token from the Google Identity Services response.
   */
  token: string;
  /**
   * A boolean indicating whether the user has agreed to the [legal compliance](https://clerk.com/docs/guides/secure/legal-compliance) documents.
   */
  legalAccepted?: boolean;
}

/** @document */
export interface AuthenticateWithBaseParams {
  /**
   * A function that overrides Clerk's default navigation behavior, allowing custom handling of navigation during sign-up and sign-in flows.
   */
  customNavigate?: (to: string) => Promise<unknown>;
  /**
   * The full URL or path to navigate to after a successful sign-in or sign-up.
   */
  redirectUrl?: string;
  /**
   * The URL to navigate to if the sign-up process is missing user information.
   */
  signUpContinueUrl?: string;
  /**
   * Metadata that can be read and set from the frontend. Once the sign-up is complete, the value of this field will be automatically copied to the newly created user's unsafe metadata. One common use case for this attribute is to use it to implement custom fields that can be collected during sign-up and will automatically be attached to the created `User` object.
   */
  unsafeMetadata?: SignUpUnsafeMetadata;
  /**
   * A boolean indicating whether the user has agreed to the [legal compliance](https://clerk.com/docs/guides/secure/legal-compliance) documents.
   */
  legalAccepted?: boolean;
}

/** @document */
export interface AuthenticateWithSolanaParams {
  /**
   * A function that overrides Clerk's default navigation behavior, allowing custom handling of navigation during sign-up and sign-in flows.
   */
  customNavigate?: (to: string) => Promise<unknown>;
  /**
   * The full URL or path to navigate to after a successful sign-in or sign-up.
   */
  redirectUrl?: string;
  /**
   * The URL to navigate to if the sign-up process is missing user information.
   */
  signUpContinueUrl?: string;
  /**
   * Metadata that can be read and set from the frontend. Once the sign-up is complete, the value of this field will be automatically copied to the newly created user's unsafe metadata. One common use case for this attribute is to use it to implement custom fields that can be collected during sign-up and will automatically be attached to the created `User` object.
   */
  unsafeMetadata?: SignUpUnsafeMetadata;
  /**
   * A boolean indicating whether the user has agreed to the [legal compliance](https://clerk.com/docs/guides/secure/legal-compliance) documents.
   */
  legalAccepted?: boolean;
  /**
   * The name of the Solana wallet to use for authentication.
   */
  walletName: string;
}

export interface HeadlessBrowserClerkConstructor {
  new (publishableKey: string, options?: DomainOrProxyUrl): HeadlessBrowserClerk;
}

export interface BrowserClerkConstructor {
  new (publishableKey: string, options?: DomainOrProxyUrl): BrowserClerk;
}

/**
 * Browser `Clerk` instance after `@clerk/clerk-js` loads. Extends [`Clerk`](https://clerk.com/docs/reference/objects/clerk) with `load()` and related browser-only APIs.
 */
export interface HeadlessBrowserClerk extends Clerk {
  /**
   * Initializes the `Clerk` object and loads all necessary environment configuration and instance settings from the [Frontend API](https://clerk.com/docs/reference/frontend-api){{ target: '_blank' }}.
   *
   * When using the JavaScript SDK, you must call the `load()` method before using the `Clerk` object in your code. Refer to the [quickstart guide](https://clerk.com/docs/js-frontend/getting-started/quickstart) for more information.
   */
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

/**
 * Internal props used by framework SDKs to configure script URLs and versions.
 * These are omitted from consumer-facing types like ClerkProviderProps.
 */
export type InternalClerkScriptProps = {
  __internal_clerkJSUrl?: string;
  __internal_clerkJSVersion?: string;
  __internal_clerkUIUrl?: string;
  __internal_clerkUIVersion?: string;
};

export type IsomorphicClerkOptions = Without<ClerkOptions, 'isSatellite'> & {
  Clerk?: ClerkProp;
  /**
   * The URL that `@clerk/clerk-js` should be hot-loaded from.
   * @internal
   */
  __internal_clerkJSUrl?: string;
  /**
   * The npm version for `@clerk/clerk-js`.
   * @internal
   */
  __internal_clerkJSVersion?: string;
  /**
   * The URL that `@clerk/ui` should be hot-loaded from.
   * @internal
   */
  __internal_clerkUIUrl?: string;
  /**
   * The npm version for `@clerk/ui`.
   * @internal
   */
  __internal_clerkUIVersion?: string;
  /**
   * The Clerk Publishable Key for your instance. This can be found on the [API keys](https://dashboard.clerk.com/last-active?path=api-keys) page in the Clerk Dashboard.
   */
  publishableKey: string;
  /**
   * This nonce value will be passed through to the `@clerk/clerk-js` script tag. Use it to implement a [strict-dynamic CSP](https://clerk.com/docs/guides/secure/best-practices/csp-headers#implementing-a-strict-dynamic-csp). Requires the `dynamic` prop to also be set.
   */
  nonce?: string;
  /**
   * Controls prefetching of the `@clerk/ui` script.
   * - `false` - Skip prefetching the UI (for custom UIs using Control Components)
   * - `undefined` (default) - Prefetch UI normally
   */
  prefetchUI?: boolean;
} & MultiDomainAndOrProxy;

export interface LoadedClerk extends Clerk {
  client: ClientResource;
}
