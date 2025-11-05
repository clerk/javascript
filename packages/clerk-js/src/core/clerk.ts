import { inBrowser as inClientSide, isValidBrowserOnline } from '@clerk/shared/browser';
import { clerkEvents, createClerkEventBus } from '@clerk/shared/clerkEventBus';
import { deprecated } from '@clerk/shared/deprecated';
import {
  ClerkRuntimeError,
  EmailLinkError,
  EmailLinkErrorCodeStatus,
  is4xxError,
  isClerkAPIResponseError,
  isClerkRuntimeError,
} from '@clerk/shared/error';
import { parsePublishableKey } from '@clerk/shared/keys';
import { logger } from '@clerk/shared/logger';
import { CLERK_NETLIFY_CACHE_BUST_PARAM } from '@clerk/shared/netlifyCacheHandler';
import { isHttpOrHttps, isValidProxyUrl, proxyUrlToAbsoluteURL } from '@clerk/shared/proxy';
import {
  eventPrebuiltComponentMounted,
  eventPrebuiltComponentOpened,
  eventThemeUsage,
  TelemetryCollector,
} from '@clerk/shared/telemetry';
import type {
  __experimental_CheckoutInstance,
  __experimental_CheckoutOptions,
  __internal_CheckoutProps,
  __internal_EnableOrganizationsModalProps,
  __internal_OAuthConsentProps,
  __internal_PlanDetailsProps,
  __internal_SubscriptionDetailsProps,
  __internal_UserVerificationModalProps,
  APIKeysNamespace,
  APIKeysProps,
  AuthenticateWithBaseParams,
  AuthenticateWithCoinbaseWalletParams,
  AuthenticateWithGoogleOneTapParams,
  AuthenticateWithMetamaskParams,
  AuthenticateWithOKXWalletParams,
  BillingNamespace,
  ClerkAPIError,
  ClerkAuthenticateWithWeb3Params,
  Clerk as ClerkInterface,
  ClerkOptions,
  ClientJSONSnapshot,
  ClientResource,
  CreateOrganizationParams,
  CreateOrganizationProps,
  CredentialReturn,
  DomainOrProxyUrl,
  EnvironmentJSON,
  EnvironmentJSONSnapshot,
  EnvironmentResource,
  GenerateSignatureParams,
  GoogleOneTapProps,
  HandleEmailLinkVerificationParams,
  HandleOAuthCallbackParams,
  InstanceType,
  JoinWaitlistParams,
  ListenerCallback,
  NavigateOptions,
  OrganizationListProps,
  OrganizationProfileProps,
  OrganizationResource,
  OrganizationSwitcherProps,
  PricingTableProps,
  PublicKeyCredentialCreationOptionsWithoutExtensions,
  PublicKeyCredentialRequestOptionsWithoutExtensions,
  PublicKeyCredentialWithAuthenticatorAssertionResponse,
  PublicKeyCredentialWithAuthenticatorAttestationResponse,
  RedirectOptions,
  Resources,
  SDKMetadata,
  SessionResource,
  SetActiveParams,
  SignedInSessionResource,
  SignInProps,
  SignInRedirectOptions,
  SignInResource,
  SignOut,
  SignOutCallback,
  SignOutOptions,
  SignUpField,
  SignUpProps,
  SignUpRedirectOptions,
  SignUpResource,
  TaskChooseOrganizationProps,
  TasksRedirectOptions,
  UnsubscribeCallback,
  UserAvatarProps,
  UserButtonProps,
  UserProfileProps,
  UserResource,
  WaitlistProps,
  WaitlistResource,
  Web3Provider,
} from '@clerk/shared/types';
import { addClerkPrefix, isAbsoluteUrl, stripScheme } from '@clerk/shared/url';
import { allSettled, handleValueOrFn, noop } from '@clerk/shared/utils';
import type { QueryClient } from '@tanstack/query-core';

import { debugLogger, initDebugLogger } from '@/utils/debug';

import type { MountComponentRenderer } from '../ui/Components';
import {
  ALLOWED_PROTOCOLS,
  buildURL,
  completeSignUpFlow,
  createAllowedRedirectOrigins,
  createBeforeUnloadTracker,
  createPageLifecycle,
  disabledAllAPIKeysFeatures,
  disabledAllBillingFeatures,
  disabledOrganizationAPIKeysFeature,
  disabledOrganizationsFeature,
  disabledUserAPIKeysFeature,
  errorThrower,
  generateSignatureWithBase,
  generateSignatureWithCoinbaseWallet,
  generateSignatureWithMetamask,
  generateSignatureWithOKXWallet,
  getClerkQueryParam,
  getWeb3Identifier,
  hasExternalAccountSignUpError,
  inActiveBrowserTab,
  inBrowser,
  isDevAccountPortalOrigin,
  isError,
  isOrganizationId,
  isRedirectForFAPIInitiatedFlow,
  isSignedInAndSingleSessionModeEnabled,
  noOrganizationExists,
  noUserExists,
  processCssLayerNameExtraction,
  removeClerkQueryParam,
  requiresUserInput,
  stripOrigin,
  windowNavigate,
} from '../utils';
import { assertNoLegacyProp } from '../utils/assertNoLegacyProp';
import { CLERK_ENVIRONMENT_STORAGE_ENTRY, SafeLocalStorage } from '../utils/localStorage';
import { memoizeListenerCallback } from '../utils/memoizeStateListenerCallback';
import { RedirectUrls } from '../utils/redirectUrls';
import { AuthCookieService } from './auth/AuthCookieService';
import { CaptchaHeartbeat } from './auth/CaptchaHeartbeat';
import { CLERK_SATELLITE_URL, CLERK_SUFFIXED_COOKIES, CLERK_SYNCED, ERROR_CODES } from './constants';
import {
  clerkErrorInitFailed,
  clerkInvalidSignInUrlFormat,
  clerkInvalidSignInUrlOrigin,
  clerkMissingProxyUrlAndDomain,
  clerkMissingSignInUrlAsSatellite,
  clerkOAuthCallbackDidNotCompleteSignInSignUp,
  clerkRedirectUrlIsMissingScheme,
  clerkUnsupportedEnvironmentWarning,
} from './errors';
import { eventBus, events } from './events';
import type { FapiClient, FapiRequestCallback } from './fapiClient';
import { createFapiClient } from './fapiClient';
import { createClientFromJwt } from './jwt-client';
import { APIKeys } from './modules/apiKeys';
import { Billing } from './modules/billing';
import { createCheckoutInstance } from './modules/checkout/instance';
import { Protect } from './protect';
import { BaseResource, Client, Environment, Organization, Waitlist } from './resources/internal';
import { getTaskEndpoint, navigateIfTaskExists, warnMissingPendingTaskHandlers } from './sessionTasks';
import { State } from './state';
import { warnings } from './warnings';

type SetActiveHook = (intent?: 'sign-out') => void | Promise<void>;

declare global {
  interface Window {
    Clerk?: Clerk;
    __clerk_publishable_key?: string;
    __clerk_proxy_url?: ClerkInterface['proxyUrl'];
    __clerk_domain?: ClerkInterface['domain'];
  }
}

const CANNOT_RENDER_BILLING_DISABLED_ERROR_CODE = 'cannot_render_billing_disabled';
const CANNOT_RENDER_USER_MISSING_ERROR_CODE = 'cannot_render_user_missing';
const CANNOT_RENDER_ORGANIZATIONS_DISABLED_ERROR_CODE = 'cannot_render_organizations_disabled';
const CANNOT_RENDER_ORGANIZATION_MISSING_ERROR_CODE = 'cannot_render_organization_missing';
const CANNOT_RENDER_SINGLE_SESSION_ENABLED_ERROR_CODE = 'cannot_render_single_session_enabled';
const CANNOT_RENDER_API_KEYS_DISABLED_ERROR_CODE = 'cannot_render_api_keys_disabled';
const CANNOT_RENDER_API_KEYS_USER_DISABLED_ERROR_CODE = 'cannot_render_api_keys_user_disabled';
const CANNOT_RENDER_API_KEYS_ORG_DISABLED_ERROR_CODE = 'cannot_render_api_keys_org_disabled';
const defaultOptions: ClerkOptions = {
  polling: true,
  standardBrowser: true,
  touchSession: true,
  isSatellite: false,
  signInUrl: undefined,
  signUpUrl: undefined,
  afterSignOutUrl: undefined,
  signInFallbackRedirectUrl: undefined,
  signUpFallbackRedirectUrl: undefined,
  signInForceRedirectUrl: undefined,
  signUpForceRedirectUrl: undefined,
  newSubscriptionRedirectUrl: undefined,
};

export class Clerk implements ClerkInterface {
  public static mountComponentRenderer?: MountComponentRenderer;

  public static version: string = __PKG_VERSION__;
  public static sdkMetadata: SDKMetadata = {
    name: __PKG_NAME__,
    version: __PKG_VERSION__,
  };

  private static _billing: BillingNamespace;
  private static _apiKeys: APIKeysNamespace;
  private _checkout: ClerkInterface['__experimental_checkout'] | undefined;

  public client: ClientResource | undefined;
  public session: SignedInSessionResource | null | undefined;
  public organization: OrganizationResource | null | undefined;
  public user: UserResource | null | undefined;
  public __internal_country?: string | null;
  public telemetry: TelemetryCollector | undefined;
  public readonly __internal_state: State = new State();

  protected internal_last_error: ClerkAPIError | null = null;
  // converted to protected environment to support `updateEnvironment` type assertion
  protected environment?: EnvironmentResource | null;

  #queryClient: QueryClient | undefined;
  #publishableKey = '';
  #domain: DomainOrProxyUrl['domain'];
  #proxyUrl: DomainOrProxyUrl['proxyUrl'];
  #authService?: AuthCookieService;
  #protect?: Protect;
  #captchaHeartbeat?: CaptchaHeartbeat;
  #broadcastChannel: BroadcastChannel | null = null;
  #componentControls?: ReturnType<MountComponentRenderer> | null;
  //@ts-expect-error with being undefined even though it's not possible - related to issue with ts and error thrower
  #fapiClient: FapiClient;
  #instanceType?: InstanceType;
  #status: ClerkInterface['status'] = 'loading';
  #listeners: Array<(emission: Resources) => void> = [];
  #navigationListeners: Array<() => void> = [];
  #options: ClerkOptions = {};
  #pageLifecycle: ReturnType<typeof createPageLifecycle> | null = null;
  #touchThrottledUntil = 0;
  #publicEventBus = createClerkEventBus();

  get __internal_queryClient(): { __tag: 'clerk-rq-client'; client: QueryClient } | undefined {
    if (!this.#queryClient) {
      void import('./query-core')
        .then(module => module.QueryClient)
        .then(QueryClient => {
          if (this.#queryClient) {
            return;
          }
          this.#queryClient = new QueryClient();
          // @ts-expect-error - queryClientStatus is not typed
          this.#publicEventBus.emit('queryClientStatus', 'ready');
        });
    }

    return this.#queryClient
      ? {
          __tag: 'clerk-rq-client',
          client: this.#queryClient,
        }
      : undefined;
  }

  public __internal_getCachedResources:
    | (() => Promise<{ client: ClientJSONSnapshot | null; environment: EnvironmentJSONSnapshot | null }>)
    | undefined;

  public __internal_createPublicCredentials:
    | ((
        publicKey: PublicKeyCredentialCreationOptionsWithoutExtensions,
      ) => Promise<CredentialReturn<PublicKeyCredentialWithAuthenticatorAttestationResponse>>)
    | undefined;

  public __internal_getPublicCredentials:
    | (({
        publicKeyOptions,
      }: {
        publicKeyOptions: PublicKeyCredentialRequestOptionsWithoutExtensions;
      }) => Promise<CredentialReturn<PublicKeyCredentialWithAuthenticatorAssertionResponse>>)
    | undefined;

  public __internal_isWebAuthnSupported: (() => boolean) | undefined;
  public __internal_isWebAuthnAutofillSupported: (() => Promise<boolean>) | undefined;
  public __internal_isWebAuthnPlatformAuthenticatorSupported: (() => Promise<boolean>) | undefined;

  public __internal_setActiveInProgress = false;

  get publishableKey(): string {
    return this.#publishableKey;
  }

  get version(): string {
    return Clerk.version;
  }

  set sdkMetadata(metadata: SDKMetadata) {
    Clerk.sdkMetadata = metadata;
  }

  get sdkMetadata(): SDKMetadata {
    return Clerk.sdkMetadata;
  }

  get loaded(): boolean {
    return this.status === 'degraded' || this.status === 'ready';
  }

  get status(): ClerkInterface['status'] {
    return this.#status;
  }

  get isSatellite(): boolean {
    if (inBrowser()) {
      return handleValueOrFn(this.#options.isSatellite, new URL(window.location.href), false);
    }
    return false;
  }

  get domain(): string {
    if (inBrowser()) {
      const strippedDomainString = stripScheme(handleValueOrFn(this.#domain, new URL(window.location.href)));
      if (this.#instanceType === 'production') {
        return addClerkPrefix(strippedDomainString);
      }
      return strippedDomainString;
    }
    return '';
  }

  get proxyUrl(): string {
    if (inBrowser()) {
      const _unfilteredProxy = handleValueOrFn(this.#proxyUrl, new URL(window.location.href));
      if (!isValidProxyUrl(_unfilteredProxy)) {
        errorThrower.throwInvalidProxyUrl({ url: _unfilteredProxy });
      }
      return proxyUrlToAbsoluteURL(_unfilteredProxy);
    }
    return '';
  }

  get frontendApi(): string {
    const publishableKey = parsePublishableKey(this.publishableKey);

    if (!publishableKey) {
      return errorThrower.throwInvalidPublishableKeyError({
        key: this.publishableKey,
      });
    }

    return publishableKey.frontendApi;
  }

  get instanceType() {
    return this.#instanceType;
  }

  get isStandardBrowser(): boolean {
    return this.#options.standardBrowser || false;
  }

  get billing(): BillingNamespace {
    if (!Clerk._billing) {
      Clerk._billing = new Billing();
    }
    return Clerk._billing;
  }

  get apiKeys(): APIKeysNamespace {
    if (!Clerk._apiKeys) {
      Clerk._apiKeys = new APIKeys();
    }
    return Clerk._apiKeys;
  }

  __experimental_checkout(options: __experimental_CheckoutOptions): __experimental_CheckoutInstance {
    if (!this._checkout) {
      this._checkout = params => createCheckoutInstance(this, params);
    }
    return this._checkout(options);
  }

  public __internal_getOption<K extends keyof ClerkOptions>(key: K): ClerkOptions[K] {
    return this.#options[key];
  }

  get isSignedIn(): boolean {
    const hasPendingSession = this?.session?.status === 'pending';
    if (hasPendingSession) {
      return false;
    }

    return !!this.session;
  }

  public constructor(key: string, options?: DomainOrProxyUrl) {
    key = (key || '').trim();

    if (!key) {
      return errorThrower.throwMissingPublishableKeyError();
    }

    const publishableKey = parsePublishableKey(key);

    if (!publishableKey) {
      return errorThrower.throwInvalidPublishableKeyError({ key });
    }

    this.#domain = options?.domain;
    this.#proxyUrl = options?.proxyUrl;
    this.environment = Environment.getInstance();
    this.#instanceType = publishableKey.instanceType;
    this.#publishableKey = key;

    this.#fapiClient = createFapiClient({
      domain: this.domain,
      frontendApi: this.frontendApi,
      // this.instanceType is assigned above
      instanceType: this.instanceType as InstanceType,
      isSatellite: this.isSatellite,
      getSessionId: () => {
        return this.session?.id;
      },
      proxyUrl: this.proxyUrl,
    });
    this.#publicEventBus.emit(clerkEvents.Status, 'loading');
    this.#publicEventBus.prioritizedOn(clerkEvents.Status, s => (this.#status = s));

    // This line is used for the piggy-backing mechanism
    BaseResource.clerk = this;
    this.#protect = new Protect();
  }

  public getFapiClient = (): FapiClient => this.#fapiClient;

  public load = async (options?: ClerkOptions): Promise<void> => {
    debugLogger.info('load() start', {}, 'clerk');
    if (this.loaded) {
      return;
    }

    // Log a development mode warning once
    if (this.#instanceType === 'development') {
      logger.warnOnce(
        'Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview',
      );
    }

    this.#options = this.#initOptions(options);

    // In development mode, if custom router options are provided, warn if both routerPush and routerReplace are not provided
    if (
      this.#instanceType === 'development' &&
      (this.#options.routerPush || this.#options.routerReplace) &&
      (!this.#options.routerPush || !this.#options.routerReplace)
    ) {
      // Typing this.#options as ClerkOptions to ensure proper type checking. TypeScript will infer the type as `never`
      // since missing both `routerPush` and `routerReplace` is not a valid ClerkOptions.
      const options = this.#options as ClerkOptions;
      const missingRouter = !options.routerPush ? 'routerPush' : 'routerReplace';
      logger.warnOnce(
        `Clerk: Both \`routerPush\` and \`routerReplace\` need to be defined, but \`${missingRouter}\` is not defined. This may cause issues with navigation in your application.`,
      );
    }

    /**
     * Listen to `Session.getToken` resolving to emit the updated session
     * with the new token to the state listeners.
     */
    eventBus.on(events.SessionTokenResolved, () => {
      this.#setAccessors(this.session);
      this.#emit();
    });

    assertNoLegacyProp(this.#options);

    if (this.#options.sdkMetadata) {
      Clerk.sdkMetadata = this.#options.sdkMetadata;
    }

    if (this.#options.telemetry !== false) {
      this.telemetry = new TelemetryCollector({
        clerkVersion: Clerk.version,
        samplingRate: 1,
        perEventSampling: this.#options.__internal_keyless_claimKeylessApplicationUrl ? false : undefined,
        publishableKey: this.publishableKey,
        ...this.#options.telemetry,
      });

      // Record theme usage telemetry when appearance is provided
      if (this.#options.appearance) {
        this.telemetry.record(eventThemeUsage(this.#options.appearance));
      }
    }

    try {
      if (this.#options.standardBrowser) {
        await this.#loadInStandardBrowser();
      } else {
        await this.#loadInNonStandardBrowser();
      }
      const telemetry = this.#options.telemetry;
      const telemetryEnabled = telemetry !== false && !telemetry?.disabled;

      const isKeyless = Boolean(this.#options.__internal_keyless_claimKeylessApplicationUrl);
      const hasClientDebugMode = Boolean(this.environment?.clientDebugMode);
      const isProd = this.environment?.isProduction?.() ?? false;

      const shouldEnable = hasClientDebugMode || (isKeyless && !isProd);
      const logLevel = isKeyless && !hasClientDebugMode ? 'error' : undefined;

      if (shouldEnable) {
        initDebugLogger({
          enabled: true,
          ...(logLevel ? { logLevel } : {}),
          ...(telemetryEnabled && this.telemetry ? { telemetryCollector: this.telemetry } : {}),
        });
      }
      this.#protect?.load(this.environment as Environment);
      debugLogger.info('load() complete', {}, 'clerk');
    } catch (error) {
      this.#publicEventBus.emit(clerkEvents.Status, 'error');
      debugLogger.error('load() failed', { error }, 'clerk');
      // bubble up the error
      throw error;
    }
  };

  #isCombinedSignInOrUpFlow(): boolean {
    return Boolean(!this.#options.signUpUrl && this.#options.signInUrl && !isAbsoluteUrl(this.#options.signInUrl));
  }

  public signOut: SignOut = async (callbackOrOptions?: SignOutCallback | SignOutOptions, options?: SignOutOptions) => {
    if (!this.client || this.client.sessions.length === 0) {
      return;
    }

    const onBeforeSetActive: SetActiveHook =
      typeof window !== 'undefined' && typeof window.__unstable__onBeforeSetActive === 'function'
        ? window.__unstable__onBeforeSetActive
        : noop;

    const onAfterSetActive: SetActiveHook =
      typeof window !== 'undefined' && typeof window.__unstable__onAfterSetActive === 'function'
        ? window.__unstable__onAfterSetActive
        : noop;

    const opts = callbackOrOptions && typeof callbackOrOptions === 'object' ? callbackOrOptions : options || {};

    const redirectUrl = opts?.redirectUrl || this.buildAfterSignOutUrl();
    debugLogger.debug(
      'signOut() start',
      {
        hasClient: Boolean(this.client),
        multiSessionCount: this.client?.signedInSessions.length ?? 0,
        redirectUrl,
        sessionTarget: opts?.sessionId ?? null,
      },
      'clerk',
    );
    const signOutCallback = typeof callbackOrOptions === 'function' ? callbackOrOptions : undefined;

    const executeSignOut = async () => {
      const tracker = createBeforeUnloadTracker(this.#options.standardBrowser);

      // Notify other tabs that user is signing out and clean up cookies.
      eventBus.emit(events.UserSignOut, null);

      this.#setTransitiveState();

      await tracker.track(async () => {
        if (signOutCallback) {
          await signOutCallback();
        } else {
          await this.navigate(redirectUrl);
        }
      });

      if (tracker.isUnloading()) {
        return;
      }

      this.#setAccessors();
      this.#emit();

      await onAfterSetActive();
    };

    /**
     * Clears the router cache for `@clerk/nextjs` on all routes except the current one.
     * Note: Calling `onBeforeSetActive` before signing out, allows for new RSC prefetch requests to render as signed in.
     * Since we are calling `onBeforeSetActive` before signing out, we should NOT pass `"sign-out"`.
     */
    await onBeforeSetActive();
    if (!opts.sessionId || this.client.signedInSessions.length === 1) {
      if (this.#options.experimental?.persistClient ?? true) {
        await this.client.removeSessions();
      } else {
        await this.client.destroy();
      }

      await executeSignOut();

      debugLogger.info('signOut() complete', { redirectUrl: stripOrigin(redirectUrl) }, 'clerk');
      return;
    }

    // Multi-session handling
    const session = this.client.signedInSessions.find(s => s.id === opts.sessionId);
    const shouldSignOutCurrent = session?.id && this.session?.id === session.id;

    await session?.remove();

    if (shouldSignOutCurrent) {
      await executeSignOut();
      debugLogger.info('signOut() complete', { redirectUrl: stripOrigin(redirectUrl) }, 'clerk');
    }
  };

  public openGoogleOneTap = (props?: GoogleOneTapProps): void => {
    const component = 'GoogleOneTap';
    this.assertComponentsReady(this.#componentControls);
    void this.#componentControls
      .ensureMounted({ preloadHint: component })
      .then(controls => controls.openModal('googleOneTap', props || {}));

    this.telemetry?.record(eventPrebuiltComponentOpened(component, props));
  };

  public closeGoogleOneTap = (): void => {
    this.assertComponentsReady(this.#componentControls);
    void this.#componentControls.ensureMounted().then(controls => controls.closeModal('googleOneTap'));
  };

  public openSignIn = (props?: SignInProps): void => {
    this.assertComponentsReady(this.#componentControls);
    if (isSignedInAndSingleSessionModeEnabled(this, this.environment)) {
      if (this.#instanceType === 'development') {
        throw new ClerkRuntimeError(warnings.cannotOpenSignInOrSignUp, {
          code: CANNOT_RENDER_SINGLE_SESSION_ENABLED_ERROR_CODE,
        });
      }
      return;
    }
    const component = 'SignIn';
    void this.#componentControls
      .ensureMounted({ preloadHint: component })
      .then(controls => controls.openModal('signIn', props || {}));

    const additionalData = { withSignUp: props?.withSignUp ?? this.#isCombinedSignInOrUpFlow() };
    this.telemetry?.record(eventPrebuiltComponentOpened(component, props, additionalData));
  };

  public closeSignIn = (): void => {
    this.assertComponentsReady(this.#componentControls);
    void this.#componentControls.ensureMounted().then(controls => controls.closeModal('signIn'));
  };

  public __internal_openCheckout = (props?: __internal_CheckoutProps): void => {
    this.assertComponentsReady(this.#componentControls);
    if (disabledAllBillingFeatures(this, this.environment)) {
      if (this.#instanceType === 'development') {
        throw new ClerkRuntimeError(warnings.cannotRenderAnyBillingComponent('Checkout'), {
          code: CANNOT_RENDER_BILLING_DISABLED_ERROR_CODE,
        });
      }
      return;
    }
    if (noUserExists(this)) {
      if (this.#instanceType === 'development') {
        throw new ClerkRuntimeError(warnings.cannotOpenCheckout, {
          code: CANNOT_RENDER_USER_MISSING_ERROR_CODE,
        });
      }
      return;
    }

    void this.#componentControls
      .ensureMounted({ preloadHint: 'Checkout' })
      .then(controls => controls.openDrawer('checkout', props || {}));
  };

  public __internal_closeCheckout = (): void => {
    this.assertComponentsReady(this.#componentControls);
    void this.#componentControls.ensureMounted().then(controls => controls.closeDrawer('checkout'));
  };

  public __internal_openPlanDetails = (props: __internal_PlanDetailsProps): void => {
    this.assertComponentsReady(this.#componentControls);
    if (disabledAllBillingFeatures(this, this.environment)) {
      if (this.#instanceType === 'development') {
        throw new ClerkRuntimeError(warnings.cannotRenderAnyBillingComponent('PlanDetails'), {
          code: CANNOT_RENDER_BILLING_DISABLED_ERROR_CODE,
        });
      }
      return;
    }
    const component = 'PlanDetails';
    void this.#componentControls
      .ensureMounted({ preloadHint: component })
      .then(controls => controls.openDrawer('planDetails', props || {}));

    this.telemetry?.record(eventPrebuiltComponentOpened(component, props));
  };

  public __internal_closePlanDetails = (): void => {
    this.assertComponentsReady(this.#componentControls);
    void this.#componentControls.ensureMounted().then(controls => controls.closeDrawer('planDetails'));
  };

  public __internal_openSubscriptionDetails = (props?: __internal_SubscriptionDetailsProps): void => {
    this.assertComponentsReady(this.#componentControls);
    void this.#componentControls
      .ensureMounted({ preloadHint: 'SubscriptionDetails' })
      .then(controls => controls.openDrawer('subscriptionDetails', props || {}));
  };

  public __internal_closeSubscriptionDetails = (): void => {
    this.assertComponentsReady(this.#componentControls);
    void this.#componentControls.ensureMounted().then(controls => controls.closeDrawer('subscriptionDetails'));
  };

  public __internal_openReverification = (props?: __internal_UserVerificationModalProps): void => {
    this.assertComponentsReady(this.#componentControls);
    if (noUserExists(this)) {
      if (this.#instanceType === 'development') {
        throw new ClerkRuntimeError(warnings.cannotOpenUserProfile, {
          code: CANNOT_RENDER_USER_MISSING_ERROR_CODE,
        });
      }
      return;
    }
    void this.#componentControls
      .ensureMounted({ preloadHint: 'UserVerification' })
      .then(controls => controls.openModal('userVerification', props || {}));

    this.telemetry?.record(eventPrebuiltComponentOpened(`UserVerification`, props));
  };

  public __internal_closeReverification = (): void => {
    this.assertComponentsReady(this.#componentControls);
    void this.#componentControls.ensureMounted().then(controls => controls.closeModal('userVerification'));
  };

  public __internal_openEnableOrganizations = (props?: __internal_EnableOrganizationsModalProps): void => {
    this.assertComponentsReady(this.#componentControls);
    void this.#componentControls
      .ensureMounted({ preloadHint: 'EnableOrganizations' })
      .then(controls => controls.openModal('enableOrganizations', props || {}));
  };

  public __internal_closeEnableOrganizations = (): void => {
    this.assertComponentsReady(this.#componentControls);
    void this.#componentControls.ensureMounted().then(controls => controls.closeModal('enableOrganizations'));
  };

  public __internal_openBlankCaptchaModal = (): Promise<unknown> => {
    this.assertComponentsReady(this.#componentControls);
    return this.#componentControls
      .ensureMounted({ preloadHint: 'BlankCaptchaModal' })
      .then(controls => controls.openModal('blankCaptcha', {}));
  };

  public __internal_closeBlankCaptchaModal = (): Promise<unknown> => {
    this.assertComponentsReady(this.#componentControls);
    return this.#componentControls
      .ensureMounted({ preloadHint: 'BlankCaptchaModal' })
      .then(controls => controls.closeModal('blankCaptcha'));
  };

  public __internal_loadStripeJs = async () => {
    if (__BUILD_DISABLE_RHC__) {
      clerkUnsupportedEnvironmentWarning('Stripe');
      return { loadStripe: () => Promise.resolve(null) };
    }

    const { loadStripe } = await import('@stripe/stripe-js');
    return loadStripe;
  };

  public openSignUp = (props?: SignUpProps): void => {
    this.assertComponentsReady(this.#componentControls);
    if (isSignedInAndSingleSessionModeEnabled(this, this.environment)) {
      if (this.#instanceType === 'development') {
        throw new ClerkRuntimeError(warnings.cannotOpenSignInOrSignUp, {
          code: CANNOT_RENDER_SINGLE_SESSION_ENABLED_ERROR_CODE,
        });
      }
      return;
    }
    void this.#componentControls
      .ensureMounted({ preloadHint: 'SignUp' })
      .then(controls => controls.openModal('signUp', props || {}));

    this.telemetry?.record(eventPrebuiltComponentOpened('SignUp', props));
  };

  public closeSignUp = (): void => {
    this.assertComponentsReady(this.#componentControls);
    void this.#componentControls.ensureMounted().then(controls => controls.closeModal('signUp'));
  };

  public openUserProfile = (props?: UserProfileProps): void => {
    this.assertComponentsReady(this.#componentControls);
    if (noUserExists(this)) {
      if (this.#instanceType === 'development') {
        throw new ClerkRuntimeError(warnings.cannotOpenUserProfile, {
          code: CANNOT_RENDER_USER_MISSING_ERROR_CODE,
        });
      }
      return;
    }
    void this.#componentControls
      .ensureMounted({ preloadHint: 'UserProfile' })
      .then(controls => controls.openModal('userProfile', props || {}));

    const additionalData = (props?.customPages?.length || 0) > 0 ? { customPages: true } : undefined;
    this.telemetry?.record(eventPrebuiltComponentOpened('UserProfile', props, additionalData));
  };

  public closeUserProfile = (): void => {
    this.assertComponentsReady(this.#componentControls);
    void this.#componentControls.ensureMounted().then(controls => controls.closeModal('userProfile'));
  };

  public openOrganizationProfile = (props?: OrganizationProfileProps): void => {
    this.assertComponentsReady(this.#componentControls);
    if (disabledOrganizationsFeature(this, this.environment)) {
      if (this.#instanceType === 'development') {
        throw new ClerkRuntimeError(warnings.cannotRenderAnyOrganizationComponent('OrganizationProfile'), {
          code: CANNOT_RENDER_ORGANIZATIONS_DISABLED_ERROR_CODE,
        });
      }
      return;
    }
    if (noOrganizationExists(this)) {
      if (this.#instanceType === 'development') {
        throw new ClerkRuntimeError(warnings.cannotRenderComponentWhenOrgDoesNotExist, {
          code: CANNOT_RENDER_ORGANIZATION_MISSING_ERROR_CODE,
        });
      }
      return;
    }
    void this.#componentControls
      .ensureMounted({ preloadHint: 'OrganizationProfile' })
      .then(controls => controls.openModal('organizationProfile', props || {}));

    this.telemetry?.record(eventPrebuiltComponentOpened('OrganizationProfile', props));
  };

  public closeOrganizationProfile = (): void => {
    this.assertComponentsReady(this.#componentControls);
    void this.#componentControls.ensureMounted().then(controls => controls.closeModal('organizationProfile'));
  };

  public openCreateOrganization = (props?: CreateOrganizationProps): void => {
    this.assertComponentsReady(this.#componentControls);
    if (disabledOrganizationsFeature(this, this.environment)) {
      if (this.#instanceType === 'development') {
        throw new ClerkRuntimeError(warnings.cannotRenderAnyOrganizationComponent('CreateOrganization'), {
          code: CANNOT_RENDER_ORGANIZATIONS_DISABLED_ERROR_CODE,
        });
      }
      return;
    }
    void this.#componentControls
      .ensureMounted({ preloadHint: 'CreateOrganization' })
      .then(controls => controls.openModal('createOrganization', props || {}));

    this.telemetry?.record(eventPrebuiltComponentOpened('CreateOrganization', props));
  };

  public closeCreateOrganization = (): void => {
    this.assertComponentsReady(this.#componentControls);
    void this.#componentControls.ensureMounted().then(controls => controls.closeModal('createOrganization'));
  };

  public openWaitlist = (props?: WaitlistProps): void => {
    this.assertComponentsReady(this.#componentControls);
    void this.#componentControls
      .ensureMounted({ preloadHint: 'Waitlist' })
      .then(controls => controls.openModal('waitlist', props || {}));

    this.telemetry?.record(eventPrebuiltComponentOpened('Waitlist', props));
  };

  public closeWaitlist = (): void => {
    this.assertComponentsReady(this.#componentControls);
    void this.#componentControls.ensureMounted().then(controls => controls.closeModal('waitlist'));
  };

  public mountSignIn = (node: HTMLDivElement, props?: SignInProps): void => {
    this.assertComponentsReady(this.#componentControls);
    const component = 'SignIn';
    void this.#componentControls.ensureMounted({ preloadHint: component }).then(controls =>
      controls.mountComponent({
        name: component,
        appearanceKey: 'signIn',
        node,
        props,
      }),
    );

    const additionalData = { withSignUp: props?.withSignUp ?? this.#isCombinedSignInOrUpFlow() };
    this.telemetry?.record(eventPrebuiltComponentMounted(component, props, additionalData));
  };

  public unmountSignIn = (node: HTMLDivElement): void => {
    this.assertComponentsReady(this.#componentControls);
    void this.#componentControls.ensureMounted().then(controls =>
      controls.unmountComponent({
        node,
      }),
    );
  };

  public mountUserAvatar = (node: HTMLDivElement, props?: UserAvatarProps): void => {
    this.assertComponentsReady(this.#componentControls);
    const component = 'UserAvatar';
    void this.#componentControls.ensureMounted({ preloadHint: component }).then(controls =>
      controls.mountComponent({
        name: component,
        appearanceKey: 'userAvatar',
        node,
        props,
      }),
    );

    this.telemetry?.record(eventPrebuiltComponentMounted(component, props));
  };

  public unmountUserAvatar = (node: HTMLDivElement): void => {
    this.assertComponentsReady(this.#componentControls);
    void this.#componentControls.ensureMounted().then(controls =>
      controls.unmountComponent({
        node,
      }),
    );
  };

  public mountSignUp = (node: HTMLDivElement, props?: SignUpProps): void => {
    this.assertComponentsReady(this.#componentControls);
    const component = 'SignUp';
    void this.#componentControls.ensureMounted({ preloadHint: component }).then(controls =>
      controls.mountComponent({
        name: component,
        appearanceKey: 'signUp',
        node,
        props,
      }),
    );

    this.telemetry?.record(eventPrebuiltComponentMounted(component, props));
  };

  public unmountSignUp = (node: HTMLDivElement): void => {
    this.assertComponentsReady(this.#componentControls);
    void this.#componentControls.ensureMounted().then(controls =>
      controls.unmountComponent({
        node,
      }),
    );
  };

  public mountUserProfile = (node: HTMLDivElement, props?: UserProfileProps): void => {
    this.assertComponentsReady(this.#componentControls);
    if (noUserExists(this)) {
      if (this.#instanceType === 'development') {
        throw new ClerkRuntimeError(warnings.cannotRenderComponentWhenUserDoesNotExist, {
          code: CANNOT_RENDER_USER_MISSING_ERROR_CODE,
        });
      }
      return;
    }
    const component = 'UserProfile';
    void this.#componentControls.ensureMounted({ preloadHint: component }).then(controls =>
      controls.mountComponent({
        name: component,
        appearanceKey: 'userProfile',
        node,
        props,
      }),
    );

    const additionalData = (props?.customPages?.length || 0) > 0 ? { customPages: true } : undefined;
    this.telemetry?.record(eventPrebuiltComponentMounted(component, props, additionalData));
  };

  public unmountUserProfile = (node: HTMLDivElement): void => {
    this.assertComponentsReady(this.#componentControls);
    void this.#componentControls.ensureMounted().then(controls =>
      controls.unmountComponent({
        node,
      }),
    );
  };

  public mountOrganizationProfile = (node: HTMLDivElement, props?: OrganizationProfileProps) => {
    this.assertComponentsReady(this.#componentControls);
    if (disabledOrganizationsFeature(this, this.environment)) {
      if (this.#instanceType === 'development') {
        throw new ClerkRuntimeError(warnings.cannotRenderAnyOrganizationComponent('OrganizationProfile'), {
          code: CANNOT_RENDER_ORGANIZATIONS_DISABLED_ERROR_CODE,
        });
      }
      return;
    }
    const userExists = !noUserExists(this);
    if (noOrganizationExists(this) && userExists) {
      if (this.#instanceType === 'development') {
        throw new ClerkRuntimeError(warnings.cannotRenderComponentWhenOrgDoesNotExist, {
          code: CANNOT_RENDER_ORGANIZATION_MISSING_ERROR_CODE,
        });
      }
      return;
    }
    void this.#componentControls.ensureMounted({ preloadHint: 'OrganizationProfile' }).then(controls =>
      controls.mountComponent({
        name: 'OrganizationProfile',
        appearanceKey: 'userProfile',
        node,
        props,
      }),
    );

    this.telemetry?.record(eventPrebuiltComponentMounted('OrganizationProfile', props));
  };

  public unmountOrganizationProfile = (node: HTMLDivElement) => {
    this.assertComponentsReady(this.#componentControls);
    void this.#componentControls.ensureMounted().then(controls =>
      controls.unmountComponent({
        node,
      }),
    );
  };

  public mountCreateOrganization = (node: HTMLDivElement, props?: CreateOrganizationProps) => {
    this.assertComponentsReady(this.#componentControls);
    if (disabledOrganizationsFeature(this, this.environment)) {
      if (this.#instanceType === 'development') {
        throw new ClerkRuntimeError(warnings.cannotRenderAnyOrganizationComponent('CreateOrganization'), {
          code: CANNOT_RENDER_ORGANIZATIONS_DISABLED_ERROR_CODE,
        });
      }
      return;
    }
    void this.#componentControls?.ensureMounted({ preloadHint: 'CreateOrganization' }).then(controls =>
      controls.mountComponent({
        name: 'CreateOrganization',
        appearanceKey: 'createOrganization',
        node,
        props,
      }),
    );

    this.telemetry?.record(eventPrebuiltComponentMounted('CreateOrganization', props));
  };

  public unmountCreateOrganization = (node: HTMLDivElement) => {
    this.assertComponentsReady(this.#componentControls);
    void this.#componentControls?.ensureMounted().then(controls =>
      controls.unmountComponent({
        node,
      }),
    );
  };

  public mountOrganizationSwitcher = (node: HTMLDivElement, props?: OrganizationSwitcherProps) => {
    this.assertComponentsReady(this.#componentControls);
    if (disabledOrganizationsFeature(this, this.environment)) {
      if (this.#instanceType === 'development') {
        throw new ClerkRuntimeError(warnings.cannotRenderAnyOrganizationComponent('OrganizationSwitcher'), {
          code: CANNOT_RENDER_ORGANIZATIONS_DISABLED_ERROR_CODE,
        });
      }
      return;
    }
    void this.#componentControls?.ensureMounted({ preloadHint: 'OrganizationSwitcher' }).then(controls =>
      controls.mountComponent({
        name: 'OrganizationSwitcher',
        appearanceKey: 'organizationSwitcher',
        node,
        props,
      }),
    );

    this.telemetry?.record(
      eventPrebuiltComponentMounted('OrganizationSwitcher', {
        ...props,
        forceOrganizationSelection: this.environment?.organizationSettings.forceOrganizationSelection,
      }),
    );
  };

  public unmountOrganizationSwitcher = (node: HTMLDivElement): void => {
    this.assertComponentsReady(this.#componentControls);
    void this.#componentControls?.ensureMounted().then(controls => controls.unmountComponent({ node }));
  };

  public __experimental_prefetchOrganizationSwitcher = () => {
    this.assertComponentsReady(this.#componentControls);
    void this.#componentControls
      ?.ensureMounted({ preloadHint: 'OrganizationSwitcher' })
      .then(controls => controls.prefetch('organizationSwitcher'));
  };

  public mountOrganizationList = (node: HTMLDivElement, props?: OrganizationListProps) => {
    this.assertComponentsReady(this.#componentControls);
    if (disabledOrganizationsFeature(this, this.environment)) {
      if (this.#instanceType === 'development') {
        throw new ClerkRuntimeError(warnings.cannotRenderAnyOrganizationComponent('OrganizationList'), {
          code: CANNOT_RENDER_ORGANIZATIONS_DISABLED_ERROR_CODE,
        });
      }
      return;
    }
    void this.#componentControls?.ensureMounted({ preloadHint: 'OrganizationList' }).then(controls =>
      controls.mountComponent({
        name: 'OrganizationList',
        appearanceKey: 'organizationList',
        node,
        props,
      }),
    );

    this.telemetry?.record(
      eventPrebuiltComponentMounted('OrganizationList', {
        ...props,
        forceOrganizationSelection: this.environment?.organizationSettings.forceOrganizationSelection,
      }),
    );
  };

  public unmountOrganizationList = (node: HTMLDivElement): void => {
    this.assertComponentsReady(this.#componentControls);
    void this.#componentControls?.ensureMounted().then(controls => controls.unmountComponent({ node }));
  };

  public mountUserButton = (node: HTMLDivElement, props?: UserButtonProps) => {
    this.assertComponentsReady(this.#componentControls);
    void this.#componentControls?.ensureMounted({ preloadHint: 'UserButton' }).then(controls =>
      controls.mountComponent({
        name: 'UserButton',
        appearanceKey: 'userButton',
        node,
        props,
      }),
    );

    const additionalData = {
      ...(props?.customMenuItems?.length || 0 > 0 ? { customItems: true } : undefined),
      ...(props?.__experimental_asStandalone ? { standalone: true } : undefined),
    };

    this.telemetry?.record(eventPrebuiltComponentMounted('UserButton', props, additionalData));
  };

  public unmountUserButton = (node: HTMLDivElement): void => {
    this.assertComponentsReady(this.#componentControls);
    void this.#componentControls?.ensureMounted().then(controls => controls.unmountComponent({ node }));
  };

  public mountWaitlist = (node: HTMLDivElement, props?: WaitlistProps) => {
    this.assertComponentsReady(this.#componentControls);
    void this.#componentControls?.ensureMounted({ preloadHint: 'Waitlist' }).then(controls =>
      controls.mountComponent({
        name: 'Waitlist',
        appearanceKey: 'waitlist',
        node,
        props,
      }),
    );

    this.telemetry?.record(eventPrebuiltComponentMounted('Waitlist', props));
  };

  public unmountWaitlist = (node: HTMLDivElement): void => {
    this.assertComponentsReady(this.#componentControls);
    void this.#componentControls?.ensureMounted().then(controls => controls.unmountComponent({ node }));
  };

  public mountPricingTable = (node: HTMLDivElement, props?: PricingTableProps): void => {
    this.assertComponentsReady(this.#componentControls);
    if (disabledAllBillingFeatures(this, this.environment)) {
      if (this.#instanceType === 'development') {
        throw new ClerkRuntimeError(warnings.cannotRenderAnyBillingComponent('PricingTable'), {
          code: CANNOT_RENDER_BILLING_DISABLED_ERROR_CODE,
        });
      }
      return;
    }
    // Temporary backward compatibility for legacy prop: `forOrganizations`. Will be removed in the coming minor release.
    const nextProps = { ...(props as any) } as PricingTableProps & { forOrganizations?: boolean };
    if (typeof (props as any)?.forOrganizations !== 'undefined') {
      logger.warnOnce(
        'Clerk: [IMPORTANT] <PricingTable /> prop `forOrganizations` is deprecated and will be removed in the coming minors. Use `for="organization"` instead.',
      );
    }

    void this.#componentControls.ensureMounted({ preloadHint: 'PricingTable' }).then(controls =>
      controls.mountComponent({
        name: 'PricingTable',
        appearanceKey: 'pricingTable',
        node,
        props: nextProps,
      }),
    );

    this.telemetry?.record(eventPrebuiltComponentMounted('PricingTable', nextProps));
  };

  public unmountPricingTable = (node: HTMLDivElement): void => {
    this.assertComponentsReady(this.#componentControls);
    void this.#componentControls.ensureMounted().then(controls =>
      controls.unmountComponent({
        node,
      }),
    );
  };

  public __internal_mountOAuthConsent = (node: HTMLDivElement, props?: __internal_OAuthConsentProps) => {
    this.assertComponentsReady(this.#componentControls);
    void this.#componentControls.ensureMounted({ preloadHint: 'OAuthConsent' }).then(controls =>
      controls.mountComponent({
        name: 'OAuthConsent',
        appearanceKey: '__internal_oauthConsent',
        node,
        props,
      }),
    );
  };

  public __internal_unmountOAuthConsent = (node: HTMLDivElement) => {
    this.assertComponentsReady(this.#componentControls);
    void this.#componentControls.ensureMounted().then(controls => controls.unmountComponent({ node }));
  };

  /**
   * @experimental This API is in early access and may change in future releases.
   *
   * Mount a API keys component at the target element.
   * @param targetNode Target to mount the APIKeys component.
   * @param props Configuration parameters.
   */
  public mountAPIKeys = (node: HTMLDivElement, props?: APIKeysProps) => {
    this.assertComponentsReady(this.#componentControls);

    logger.warnOnce('Clerk: <APIKeys /> component is in early access and not yet recommended for production use.');

    if (disabledAllAPIKeysFeatures(this, this.environment)) {
      if (this.#instanceType === 'development') {
        throw new ClerkRuntimeError(warnings.cannotRenderAPIKeysComponent, {
          code: CANNOT_RENDER_API_KEYS_DISABLED_ERROR_CODE,
        });
      }
      return;
    }

    if (this.organization && disabledOrganizationAPIKeysFeature(this, this.environment)) {
      if (this.#instanceType === 'development') {
        throw new ClerkRuntimeError(warnings.cannotRenderAPIKeysComponentForOrgWhenDisabled, {
          code: CANNOT_RENDER_API_KEYS_ORG_DISABLED_ERROR_CODE,
        });
      }
      return;
    }

    if (disabledUserAPIKeysFeature(this, this.environment)) {
      if (this.#instanceType === 'development') {
        throw new ClerkRuntimeError(warnings.cannotRenderAPIKeysComponentForUserWhenDisabled, {
          code: CANNOT_RENDER_API_KEYS_USER_DISABLED_ERROR_CODE,
        });
      }
      return;
    }

    void this.#componentControls.ensureMounted({ preloadHint: 'APIKeys' }).then(controls =>
      controls.mountComponent({
        name: 'APIKeys',
        appearanceKey: 'apiKeys',
        node,
        props,
      }),
    );

    this.telemetry?.record(eventPrebuiltComponentMounted('APIKeys', props));
  };

  /**
   * @experimental This API is in early access and may change in future releases.
   *
   * Unmount a API keys component from the target element.
   * If there is no component mounted at the target node, results in a noop.
   *
   * @param targetNode Target node to unmount the APIKeys component from.
   */
  public unmountAPIKeys = (node: HTMLDivElement) => {
    this.assertComponentsReady(this.#componentControls);
    void this.#componentControls.ensureMounted().then(controls => controls.unmountComponent({ node }));
  };

  public mountTaskChooseOrganization = (node: HTMLDivElement, props?: TaskChooseOrganizationProps) => {
    this.assertComponentsReady(this.#componentControls);

    if (disabledOrganizationsFeature(this, this.environment)) {
      if (this.#instanceType === 'development') {
        throw new ClerkRuntimeError(warnings.cannotRenderAnyOrganizationComponent('TaskChooseOrganization'), {
          code: CANNOT_RENDER_ORGANIZATIONS_DISABLED_ERROR_CODE,
        });
      }
      return;
    }

    void this.#componentControls.ensureMounted({ preloadHint: 'TaskChooseOrganization' }).then(controls =>
      controls.mountComponent({
        name: 'TaskChooseOrganization',
        appearanceKey: 'taskChooseOrganization',
        node,
        props,
      }),
    );

    this.telemetry?.record(eventPrebuiltComponentMounted('TaskChooseOrganization', props));
  };

  public unmountTaskChooseOrganization = (node: HTMLDivElement) => {
    this.assertComponentsReady(this.#componentControls);
    void this.#componentControls.ensureMounted().then(controls => controls.unmountComponent({ node }));
  };

  /**
   * `setActive` can be used to set the active session and/or organization.
   */
  public setActive = async (params: SetActiveParams): Promise<void> => {
    const { organization, beforeEmit, redirectUrl, navigate: setActiveNavigate } = params;
    let { session } = params;
    this.__internal_setActiveInProgress = true;
    debugLogger.debug(
      'setActive() start',
      {
        hasClient: Boolean(this.client),
        sessionTarget: typeof session === 'string' ? session : (session?.id ?? session ?? null),
        organizationTarget:
          typeof organization === 'string' ? organization : (organization?.id ?? organization ?? null),
        redirectUrl: redirectUrl ?? null,
      },
      'clerk',
    );
    try {
      if (!this.client) {
        debugLogger.warn('Clerk setActive called before client is loaded', {}, 'clerk');
        throw new Error('setActive is being called before the client is loaded. Wait for init.');
      }

      if (session === undefined && !this.session) {
        debugLogger.warn('Clerk setActive precondition not met: no target session and no active session', {}, 'clerk');
        throw new Error(
          'setActive should either be called with a session param or there should be already an active session.',
        );
      }

      if (typeof session === 'string') {
        session = (this.client.sessions.find(x => x.id === session) as SignedInSessionResource) || null;
      }

      const onBeforeSetActive: SetActiveHook =
        typeof window !== 'undefined' && typeof window.__unstable__onBeforeSetActive === 'function'
          ? window.__unstable__onBeforeSetActive
          : noop;

      const onAfterSetActive: SetActiveHook =
        typeof window !== 'undefined' && typeof window.__unstable__onAfterSetActive === 'function'
          ? window.__unstable__onAfterSetActive
          : noop;

      let newSession = session === undefined ? this.session : session;
      if (newSession?.status === 'pending') {
        warnMissingPendingTaskHandlers({ ...this.#options, ...params });
      }

      // At this point, the `session` variable should contain either an `SignedInSessionResource`
      // ,`null` or `undefined`.
      // We now want to set the last active organization id on that session (if it exists).
      // However, if the `organization` parameter is not given (i.e. `undefined`), we want
      // to keep the organization id that the session had.
      const shouldSwitchOrganization = organization !== undefined;

      if (newSession && shouldSwitchOrganization) {
        const organizationIdOrSlug = typeof organization === 'string' ? organization : organization?.id;

        if (isOrganizationId(organizationIdOrSlug)) {
          newSession.lastActiveOrganizationId = organizationIdOrSlug || null;
        } else {
          const matchingOrganization = newSession.user.organizationMemberships.find(
            mem => mem.organization.slug === organizationIdOrSlug,
          );

          const newLastActiveOrganizationId = matchingOrganization?.organization.id || null;
          const isPersonalWorkspace = newLastActiveOrganizationId === null;

          // Do not update in-memory to personal workspace if force organization selection is enabled
          if (this.environment?.organizationSettings?.forceOrganizationSelection && isPersonalWorkspace) {
            return;
          }

          newSession.lastActiveOrganizationId = newLastActiveOrganizationId;
        }
      }

      // Do not revalidate server cache for pending sessions to avoid unmount of `SignIn/SignUp` AIOs when navigating to task
      if (newSession?.status !== 'pending') {
        /**
         * Hint to each framework, that the user will be signed out when `{session: null}` is provided.
         */
        await onBeforeSetActive(newSession === null ? 'sign-out' : undefined);
      }

      //1. setLastActiveSession to passed user session (add a param).
      //   Note that this will also update the session's active organization
      //   id.
      if (inActiveBrowserTab() || !this.#options.standardBrowser) {
        await this.#touchCurrentSession(newSession);
        // reload session from updated client
        newSession = this.#getSessionFromClient(newSession?.id);
      }

      // getToken syncs __session and __client_uat to cookies using events.TokenUpdate dispatched event.
      const token = await newSession?.getToken();
      if (!token) {
        if (!isValidBrowserOnline()) {
          debugLogger.warn(
            'Token is null when setting active session (offline)',
            { sessionId: newSession?.id },
            'clerk',
          );
        }
        eventBus.emit(events.TokenUpdate, { token: null });
      }

      //2. If there's a beforeEmit, typically we're navigating.  Emit the session as
      //   undefined, then wait for beforeEmit to complete before emitting the new session.
      //   When undefined, neither SignedIn nor SignedOut renders, which avoids flickers or
      //   automatic reloading when reloading shouldn't be happening.
      const tracker = createBeforeUnloadTracker(this.#options.standardBrowser);

      if (beforeEmit) {
        deprecated(
          'Clerk.setActive({beforeEmit})',
          'Use the `redirectUrl` property instead. Example `Clerk.setActive({redirectUrl:"/"})`',
        );
        await tracker.track(async () => {
          this.#setTransitiveState();
          await beforeEmit(newSession);
        });
      }

      const taskUrl =
        newSession?.status === 'pending' &&
        newSession?.currentTask &&
        this.#options.taskUrls?.[newSession?.currentTask.key];

      if (!beforeEmit && (redirectUrl || taskUrl || setActiveNavigate)) {
        await tracker.track(async () => {
          if (!this.client) {
            // Typescript is not happy because since thinks this.client might have changed to undefined because the function is asynchronous.
            return;
          }

          if (newSession?.status !== 'pending') {
            this.#setTransitiveState();
          }

          if (taskUrl) {
            const taskUrlWithRedirect = redirectUrl
              ? buildURL({ base: taskUrl, hashSearchParams: { redirectUrl } }, { stringify: true })
              : taskUrl;
            await this.navigate(taskUrlWithRedirect);
          } else if (setActiveNavigate && newSession) {
            await setActiveNavigate({ session: newSession });
          } else if (redirectUrl) {
            if (this.client.isEligibleForTouch()) {
              const absoluteRedirectUrl = new URL(redirectUrl, window.location.href);
              const redirectUrlWithAuth = this.buildUrlWithAuth(
                this.client.buildTouchUrl({ redirectUrl: absoluteRedirectUrl }),
              );
              await this.navigate(redirectUrlWithAuth);
            }
            await this.navigate(redirectUrl);
          }
        });
      }

      //3. Check if hard reloading (onbeforeunload). If not, set the user/session and emit
      if (tracker.isUnloading()) {
        return;
      }

      this.#setAccessors(newSession);
      this.#emit();

      // Do not revalidate server cache for pending sessions to avoid unmount of `SignIn/SignUp` AIOs when navigating to task
      // newSession can be mutated by the time we get here (org change session touch)
      if (newSession?.status !== 'pending') {
        await onAfterSetActive();
      }
    } finally {
      this.__internal_setActiveInProgress = false;
    }
  };

  public addListener = (listener: ListenerCallback): UnsubscribeCallback => {
    listener = memoizeListenerCallback(listener);
    this.#listeners.push(listener);
    // emit right away
    if (this.client) {
      listener({
        client: this.client,
        session: this.session,
        user: this.user,
        organization: this.organization,
      });
    }

    const unsubscribe = () => {
      this.#listeners = this.#listeners.filter(l => l !== listener);
    };
    return unsubscribe;
  };
  public on: ClerkInterface['on'] = (...args) => {
    this.#publicEventBus.on(...args);
  };

  public off: ClerkInterface['off'] = (...args) => {
    this.#publicEventBus.off(...args);
  };

  public __internal_addNavigationListener = (listener: () => void): UnsubscribeCallback => {
    this.#navigationListeners.push(listener);
    const unsubscribe = () => {
      this.#navigationListeners = this.#navigationListeners.filter(l => l !== listener);
    };
    return unsubscribe;
  };

  public navigate = async (to: string | undefined, options?: NavigateOptions): Promise<unknown> => {
    if (!to || !inBrowser()) {
      return;
    }

    /**
     * Trigger all navigation listeners. In order for modal UI components to close.
     */
    setTimeout(() => {
      this.#emitNavigationListeners();
    }, 0);

    let toURL = new URL(to, window.location.href);

    if (!this.#allowedRedirectProtocols.includes(toURL.protocol)) {
      console.warn(
        `Clerk: "${toURL.protocol}" is not a valid protocol. Redirecting to "/" instead. If you think this is a mistake, please open an issue.`,
      );
      toURL = new URL('/', window.location.href);
    }

    const customNavigate =
      options?.replace && this.#options.routerReplace ? this.#options.routerReplace : this.#options.routerPush;

    debugLogger.info(`Clerk is navigating to: ${toURL}`);
    if (this.#options.routerDebug) {
      console.log(`Clerk is navigating to: ${toURL}`);
    }

    // Custom protocol URLs have an origin value of 'null'. In many cases, this indicates deep-linking and we want to ensure the customNavigate function is used if available.
    if ((toURL.origin !== 'null' && toURL.origin !== window.location.origin) || !customNavigate) {
      windowNavigate(toURL);
      return;
    }

    const metadata = {
      ...(options?.metadata ? { __internal_metadata: options?.metadata } : {}),
      windowNavigate,
    };
    // React router only wants the path, search or hash portion.
    return await customNavigate(stripOrigin(toURL), metadata);
  };

  public buildUrlWithAuth(to: string): string {
    if (this.#instanceType === 'production') {
      return to;
    }

    const toURL = new URL(to, window.location.origin);

    if (toURL.origin === window.location.origin) {
      return toURL.href;
    }

    if (!this.#authService) {
      return toURL.href;
    }

    return this.#authService.decorateUrlWithDevBrowserToken(toURL).href;
  }

  public buildSignInUrl(options?: SignInRedirectOptions): string {
    return this.#buildUrl(
      'signInUrl',
      { ...options, redirectUrl: options?.redirectUrl || window.location.href },
      options?.initialValues,
    );
  }

  public buildSignUpUrl(options?: SignUpRedirectOptions): string {
    return this.#buildUrl(
      'signUpUrl',
      { ...options, redirectUrl: options?.redirectUrl || window.location.href },
      options?.initialValues,
    );
  }

  public buildUserProfileUrl(): string {
    if (!this.environment || !this.environment.displayConfig) {
      return '';
    }
    return this.buildUrlWithAuth(this.environment.displayConfig.userProfileUrl);
  }

  public buildHomeUrl(): string {
    if (!this.environment || !this.environment.displayConfig) {
      return '';
    }
    return this.buildUrlWithAuth(this.environment.displayConfig.homeUrl);
  }

  public buildAfterSignInUrl({ params }: { params?: URLSearchParams } = {}): string {
    return this.buildUrlWithAuth(new RedirectUrls(this.#options, {}, params).getAfterSignInUrl());
  }

  public buildAfterSignUpUrl({ params }: { params?: URLSearchParams } = {}): string {
    return this.buildUrlWithAuth(new RedirectUrls(this.#options, {}, params).getAfterSignUpUrl());
  }

  public buildAfterSignOutUrl(): string {
    if (!this.#options.afterSignOutUrl) {
      return '/';
    }

    return this.buildUrlWithAuth(this.#options.afterSignOutUrl);
  }

  public buildNewSubscriptionRedirectUrl(): string {
    if (!this.#options.newSubscriptionRedirectUrl) {
      return this.buildAfterSignInUrl();
    }

    return this.#options.newSubscriptionRedirectUrl;
  }

  public buildWaitlistUrl(options?: { initialValues?: Record<string, string> }): string {
    if (!this.environment || !this.environment.displayConfig) {
      return '';
    }
    const waitlistUrl = this.#options['waitlistUrl'] || this.environment.displayConfig.waitlistUrl;
    const initValues = new URLSearchParams(options?.initialValues || {});
    return buildURL({ base: waitlistUrl, hashSearchParams: [initValues] }, { stringify: true });
  }

  public buildAfterMultiSessionSingleSignOutUrl(): string {
    if (!this.environment) {
      return '';
    }

    if (this.#options.afterMultiSessionSingleSignOutUrl) {
      return this.buildUrlWithAuth(this.#options.afterMultiSessionSingleSignOutUrl);
    }

    if (this.#options.signInUrl) {
      return this.buildUrlWithAuth(
        buildURL(
          {
            base: this.#options.signInUrl,
            hashPath: 'choose',
          },
          { stringify: true },
        ),
      );
    }

    return this.buildUrlWithAuth(this.environment.displayConfig.afterSignOutOneUrl);
  }

  public buildCreateOrganizationUrl(): string {
    if (!this.environment || !this.environment.displayConfig) {
      return '';
    }
    return this.buildUrlWithAuth(this.environment.displayConfig.createOrganizationUrl);
  }

  public buildOrganizationProfileUrl(): string {
    if (!this.environment || !this.environment.displayConfig) {
      return '';
    }
    return this.buildUrlWithAuth(this.environment.displayConfig.organizationProfileUrl);
  }

  public buildTasksUrl(options?: TasksRedirectOptions): string {
    const currentTask = this.session?.currentTask;
    if (!currentTask) {
      return '';
    }

    const customTaskUrl = this.#options.taskUrls?.[currentTask.key];
    if (customTaskUrl) {
      return customTaskUrl;
    }

    return buildURL(
      {
        base: this.buildSignInUrl(options),
        hashPath: getTaskEndpoint(currentTask),
      },
      {
        stringify: true,
      },
    );
  }

  #redirectToSatellite = async (): Promise<unknown> => {
    if (!inBrowser()) {
      return;
    }
    const searchParams = new URLSearchParams({
      [CLERK_SYNCED]: 'true',
    });

    const satelliteUrl = getClerkQueryParam(CLERK_SATELLITE_URL);
    if (!satelliteUrl || !isHttpOrHttps(satelliteUrl)) {
      clerkRedirectUrlIsMissingScheme();
    }

    const backToSatelliteUrl = buildURL(
      { base: getClerkQueryParam(CLERK_SATELLITE_URL) as string, searchParams },
      { stringify: true },
    );
    return this.navigate(this.buildUrlWithAuth(backToSatelliteUrl));
  };

  public redirectWithAuth = async (to: string): Promise<unknown> => {
    if (inBrowser()) {
      return this.navigate(this.buildUrlWithAuth(to));
    }
    return;
  };

  public redirectToSignIn = async (options?: SignInRedirectOptions): Promise<unknown> => {
    if (inBrowser()) {
      return this.navigate(this.buildSignInUrl(options));
    }
    return;
  };

  public redirectToSignUp = async (options?: SignUpRedirectOptions): Promise<unknown> => {
    if (inBrowser()) {
      return this.navigate(this.buildSignUpUrl(options));
    }
    return;
  };

  public redirectToUserProfile = async (): Promise<unknown> => {
    if (inBrowser()) {
      return this.navigate(this.buildUserProfileUrl());
    }
    return;
  };

  public redirectToCreateOrganization = async (): Promise<unknown> => {
    if (inBrowser()) {
      return this.navigate(this.buildCreateOrganizationUrl());
    }
    return;
  };

  public redirectToOrganizationProfile = async (): Promise<unknown> => {
    if (inBrowser()) {
      return this.navigate(this.buildOrganizationProfileUrl());
    }
    return;
  };

  public redirectToAfterSignIn = async (): Promise<unknown> => {
    if (inBrowser()) {
      return this.navigate(this.buildAfterSignInUrl());
    }
    return;
  };

  public redirectToAfterSignUp = async (): Promise<unknown> => {
    if (inBrowser()) {
      return this.navigate(this.buildAfterSignUpUrl());
    }
    return;
  };

  public redirectToAfterSignOut = async (): Promise<unknown> => {
    if (inBrowser()) {
      return this.navigate(this.buildAfterSignOutUrl());
    }
    return;
  };

  public redirectToWaitlist = async (): Promise<unknown> => {
    if (inBrowser()) {
      return this.navigate(this.buildWaitlistUrl());
    }
    return;
  };

  public redirectToTasks = async (options?: TasksRedirectOptions): Promise<unknown> => {
    if (inBrowser()) {
      return this.navigate(this.buildTasksUrl(options));
    }
    return;
  };

  public handleEmailLinkVerification = async (
    params: HandleEmailLinkVerificationParams,
    customNavigate?: (to: string) => Promise<unknown>,
  ): Promise<unknown> => {
    if (!this.client) {
      return;
    }

    const verificationStatus = getClerkQueryParam('__clerk_status');
    if (verificationStatus === 'expired') {
      throw new EmailLinkError(EmailLinkErrorCodeStatus.Expired);
    } else if (verificationStatus === 'client_mismatch') {
      throw new EmailLinkError(EmailLinkErrorCodeStatus.ClientMismatch);
    } else if (verificationStatus !== 'verified') {
      throw new EmailLinkError(EmailLinkErrorCodeStatus.Failed);
    }

    const newSessionId = getClerkQueryParam('__clerk_created_session');
    const { signIn, signUp, sessions } = this.client;

    const shouldCompleteOnThisDevice = sessions.some(s => s.id === newSessionId);
    const shouldContinueOnThisDevice =
      signIn.status === 'needs_second_factor' || signUp.status === 'missing_requirements';

    const navigate = (to: string) =>
      customNavigate && typeof customNavigate === 'function' ? customNavigate(to) : this.navigate(to);

    const redirectContinue = params.redirectUrl ? () => navigate(params.redirectUrl as string) : noop;

    if (shouldCompleteOnThisDevice) {
      return this.setActive({
        session: newSessionId,
        redirectUrl: params.redirectUrlComplete,
      });
    } else if (shouldContinueOnThisDevice) {
      return redirectContinue();
    }

    if (typeof params.onVerifiedOnOtherDevice === 'function') {
      params.onVerifiedOnOtherDevice();
    }
    return null;
  };

  public handleGoogleOneTapCallback = async (
    signInOrUp: SignInResource | SignUpResource,
    params: HandleOAuthCallbackParams,
    customNavigate?: (to: string) => Promise<unknown>,
  ): Promise<unknown> => {
    if (!this.loaded || !this.environment || !this.client) {
      return;
    }
    const { signIn: _signIn, signUp: _signUp } = this.client;

    const signIn = 'identifier' in (signInOrUp || {}) ? (signInOrUp as SignInResource) : _signIn;
    const signUp = 'missingFields' in (signInOrUp || {}) ? (signInOrUp as SignUpResource) : _signUp;

    const navigate = (to: string) =>
      customNavigate && typeof customNavigate === 'function'
        ? customNavigate(this.buildUrlWithAuth(to))
        : this.navigate(this.buildUrlWithAuth(to));

    return this._handleRedirectCallback(params, {
      signUp,
      signIn,
      navigate,
    });
  };

  private _handleRedirectCallback = async (
    params: HandleOAuthCallbackParams,
    {
      signIn,
      signUp,
      navigate,
    }: {
      signIn: SignInResource;
      signUp: SignUpResource;
      navigate: (to: string) => Promise<unknown>;
    },
  ): Promise<unknown> => {
    if (!this.loaded || !this.environment || !this.client) {
      return;
    }

    // If `handleRedirectCallback` is called on a window without an opener property (such as when the OAuth flow popup
    // directs the opening page to navigate to the /sso-callback route), we need to reload the signIn and signUp resources
    // to ensure that we have the latest state. This operation can fail when we try reloading a resource that doesn't
    // exist (such as when reloading a signIn resource during a signUp attempt), but this can be safely ignored.
    if (!window.opener && params.reloadResource) {
      try {
        if (params.reloadResource === 'signIn') {
          await signIn.reload();
        } else if (params.reloadResource === 'signUp') {
          await signUp.reload();
        }
      } catch {
        // This catch intentionally left blank.
      }
    }

    const { displayConfig } = this.environment;
    const { firstFactorVerification } = signIn;
    const { externalAccount } = signUp.verifications;
    const su = {
      status: signUp.status,
      missingFields: signUp.missingFields,
      externalAccountStatus: externalAccount.status,
      externalAccountErrorCode: externalAccount.error?.code,
      externalAccountSessionId: externalAccount.error?.meta?.sessionId,
      sessionId: signUp.createdSessionId,
    };

    const si = {
      status: signIn.status,
      firstFactorVerificationStatus: firstFactorVerification.status,
      firstFactorVerificationErrorCode: firstFactorVerification.error?.code,
      firstFactorVerificationSessionId: firstFactorVerification.error?.meta?.sessionId,
      sessionId: signIn.createdSessionId,
    };

    const makeNavigate = (to: string) => () => navigate(to);

    const navigateToSignIn = makeNavigate(params.signInUrl || displayConfig.signInUrl);

    const navigateToSignUp = makeNavigate(params.signUpUrl || displayConfig.signUpUrl);

    const navigateToFactorOne = makeNavigate(
      params.firstFactorUrl ||
        buildURL({ base: displayConfig.signInUrl, hashPath: '/factor-one' }, { stringify: true }),
    );

    const navigateToFactorTwo = makeNavigate(
      params.secondFactorUrl ||
        buildURL({ base: displayConfig.signInUrl, hashPath: '/factor-two' }, { stringify: true }),
    );

    const navigateToResetPassword = makeNavigate(
      params.resetPasswordUrl ||
        buildURL({ base: displayConfig.signInUrl, hashPath: '/reset-password' }, { stringify: true }),
    );

    const redirectUrls = new RedirectUrls(this.#options, params);

    const navigateToContinueSignUp = makeNavigate(
      params.continueSignUpUrl ||
        buildURL(
          {
            base: displayConfig.signUpUrl,
            hashPath: '/continue',
          },
          { stringify: true },
        ),
    );

    const navigateToNextStepSignUp = ({ missingFields }: { missingFields: SignUpField[] }) => {
      if (missingFields.length) {
        return navigateToContinueSignUp();
      }

      return completeSignUpFlow({
        signUp,
        verifyEmailPath:
          params.verifyEmailAddressUrl ||
          buildURL(
            {
              base: displayConfig.signUpUrl,
              hashPath: '/verify-email-address',
            },
            { stringify: true },
          ),
        verifyPhonePath:
          params.verifyPhoneNumberUrl ||
          buildURL({ base: displayConfig.signUpUrl, hashPath: '/verify-phone-number' }, { stringify: true }),
        navigate,
      });
    };

    const signInUrl = params.signInUrl || displayConfig.signInUrl;
    const signUpUrl = params.signUpUrl || displayConfig.signUpUrl;

    const setActiveNavigate = async ({
      session,
      baseUrl,
      redirectUrl,
    }: {
      session: SessionResource;
      baseUrl: string;
      redirectUrl: string;
    }) => {
      if (!session.currentTask) {
        await this.navigate(redirectUrl);
        return;
      }

      await navigateIfTaskExists(session, {
        baseUrl,
        navigate: this.navigate,
      });
    };

    if (si.status === 'complete') {
      return this.setActive({
        session: si.sessionId,
        navigate: async ({ session }) => {
          await setActiveNavigate({ session, baseUrl: signInUrl, redirectUrl: redirectUrls.getAfterSignInUrl() });
        },
      });
    }

    const userExistsButNeedsToSignIn =
      su.externalAccountStatus === 'transferable' && su.externalAccountErrorCode === 'external_account_exists';

    if (userExistsButNeedsToSignIn) {
      const res = await signIn.create({ transfer: true });
      switch (res.status) {
        case 'complete':
          return this.setActive({
            session: res.createdSessionId,
            navigate: async ({ session }) => {
              await setActiveNavigate({ session, baseUrl: signUpUrl, redirectUrl: redirectUrls.getAfterSignInUrl() });
            },
          });
        case 'needs_first_factor':
          return navigateToFactorOne();
        case 'needs_second_factor':
          return navigateToFactorTwo();
        case 'needs_new_password':
          return navigateToResetPassword();
        default:
          clerkOAuthCallbackDidNotCompleteSignInSignUp('sign in');
      }
    }

    const userLockedFromSignUp = su.externalAccountErrorCode === 'user_locked';
    const userLockedFromSignIn = si.firstFactorVerificationErrorCode === 'user_locked';

    if (userLockedFromSignUp) {
      return navigateToSignUp();
    }

    if (userLockedFromSignIn) {
      return navigateToSignIn();
    }

    const userHasUnverifiedEmail =
      si.status === 'needs_first_factor' && !signIn.supportedFirstFactors?.every(f => f.strategy === 'enterprise_sso');

    if (userHasUnverifiedEmail) {
      return navigateToFactorOne();
    }

    const userNeedsNewPassword = si.status === 'needs_new_password';

    if (userNeedsNewPassword) {
      return navigateToResetPassword();
    }

    const userNeedsToBeCreated = si.firstFactorVerificationStatus === 'transferable';

    if (userNeedsToBeCreated) {
      if (params.transferable === false) {
        return navigateToSignIn();
      }

      const res = await signUp.create({ transfer: true });
      switch (res.status) {
        case 'complete':
          return this.setActive({
            session: res.createdSessionId,
            navigate: async ({ session }) => {
              await setActiveNavigate({ session, baseUrl: signUpUrl, redirectUrl: redirectUrls.getAfterSignUpUrl() });
            },
          });
        case 'missing_requirements':
          return navigateToNextStepSignUp({ missingFields: res.missingFields });
        default:
          clerkOAuthCallbackDidNotCompleteSignInSignUp('sign in');
      }
    }

    if (su.status === 'complete') {
      return this.setActive({
        session: su.sessionId,
        navigate: async ({ session }) => {
          await setActiveNavigate({ session, baseUrl: signUpUrl, redirectUrl: redirectUrls.getAfterSignUpUrl() });
        },
      });
    }

    if (si.status === 'needs_second_factor') {
      return navigateToFactorTwo();
    }

    const suUserAlreadySignedIn =
      (su.externalAccountStatus === 'failed' || su.externalAccountStatus === 'unverified') &&
      su.externalAccountErrorCode === 'identifier_already_signed_in' &&
      su.externalAccountSessionId;

    const siUserAlreadySignedIn =
      si.firstFactorVerificationStatus === 'failed' &&
      si.firstFactorVerificationErrorCode === 'identifier_already_signed_in' &&
      si.firstFactorVerificationSessionId;

    const userAlreadySignedIn = suUserAlreadySignedIn || siUserAlreadySignedIn;
    if (userAlreadySignedIn) {
      const sessionId = si.firstFactorVerificationSessionId || su.externalAccountSessionId;
      if (sessionId) {
        return this.setActive({
          session: sessionId,
          navigate: async ({ session }) => {
            await setActiveNavigate({
              session,
              baseUrl: suUserAlreadySignedIn ? signUpUrl : signInUrl,
              redirectUrl: redirectUrls.getAfterSignInUrl(),
            });
          },
        });
      }
    }

    if (hasExternalAccountSignUpError(signUp)) {
      return navigateToSignUp();
    }

    if (su.externalAccountStatus === 'verified' && su.status === 'missing_requirements') {
      return navigateToNextStepSignUp({ missingFields: signUp.missingFields });
    }

    if (this.session?.currentTask) {
      await this.redirectToTasks({
        redirectUrl: this.buildAfterSignInUrl(),
      });
      return;
    }

    return navigateToSignIn();
  };

  public handleRedirectCallback = async (
    params: HandleOAuthCallbackParams = {},
    customNavigate?: (to: string) => Promise<unknown>,
  ): Promise<unknown> => {
    if (!this.loaded || !this.environment || !this.client) {
      return;
    }
    const { signIn, signUp } = this.client;

    const navigate = (to: string) =>
      customNavigate && typeof customNavigate === 'function' ? customNavigate(to) : this.navigate(to);

    return this._handleRedirectCallback(params, {
      signUp,
      signIn,
      navigate,
    });
  };

  // TODO: Deprecate this one, and mark it as internal. Is there actual benefit for external developers to use this ? Should they ever reach for it ?
  public handleUnauthenticated = async (opts = { broadcast: true }): Promise<unknown> => {
    if (!this.client || !this.session) {
      return;
    }
    try {
      const newClient = await Client.getOrCreateInstance().fetch();
      this.updateClient(newClient);
      if (this.session) {
        return;
      }
      if (opts.broadcast) {
        eventBus.emit(events.UserSignOut, null);
      }
      return this.setActive({ session: null });
    } catch (err) {
      // `/client` can fail with either a 401, a 403, 500 or network errors.
      // 401 is already handled internally in our fetcher.
      // 403 means that the client is blocked, signing out the user is the only option.
      // 500 means that the client is not working, signing out the user is the only option, since the intention was to sign out the user.
      if (isClerkAPIResponseError(err) && [403, 500].includes(err.status)) {
        return this.setActive({ session: null });
      } else {
        throw err;
      }
    }
  };

  public authenticateWithGoogleOneTap = async (
    params: AuthenticateWithGoogleOneTapParams,
  ): Promise<SignInResource | SignUpResource> => {
    if (__BUILD_DISABLE_RHC__) {
      clerkUnsupportedEnvironmentWarning('Google One Tap');
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this.client!.signIn; // TODO: Remove not null assertion
    }

    return this.client?.signIn
      .create({
        strategy: 'google_one_tap',
        token: params.token,
      })
      .catch(err => {
        if (isClerkAPIResponseError(err) && err.errors[0].code === 'external_account_not_found') {
          return this.client?.signUp.create({
            strategy: 'google_one_tap',
            token: params.token,
            legalAccepted: params.legalAccepted,
          });
        }
        throw err;
      }) as Promise<SignInResource | SignUpResource>;
  };

  public authenticateWithMetamask = async (props: AuthenticateWithMetamaskParams = {}): Promise<void> => {
    await this.authenticateWithWeb3({
      ...props,
      strategy: 'web3_metamask_signature',
    });
  };

  public authenticateWithCoinbaseWallet = async (props: AuthenticateWithCoinbaseWalletParams = {}): Promise<void> => {
    await this.authenticateWithWeb3({
      ...props,
      strategy: 'web3_coinbase_wallet_signature',
    });
  };

  public authenticateWithBase = async (props: AuthenticateWithBaseParams = {}): Promise<void> => {
    await this.authenticateWithWeb3({
      ...props,
      strategy: 'web3_base_signature',
    });
  };

  public authenticateWithOKXWallet = async (props: AuthenticateWithOKXWalletParams = {}): Promise<void> => {
    await this.authenticateWithWeb3({
      ...props,
      strategy: 'web3_okx_wallet_signature',
    });
  };

  public authenticateWithWeb3 = async ({
    redirectUrl,
    signUpContinueUrl,
    customNavigate,
    unsafeMetadata,
    strategy,
    legalAccepted,
    secondFactorUrl,
  }: ClerkAuthenticateWithWeb3Params): Promise<void> => {
    if (!this.client || !this.environment) {
      return;
    }

    const { displayConfig } = this.environment;

    const provider = strategy.replace('web3_', '').replace('_signature', '') as Web3Provider;
    const identifier = await getWeb3Identifier({ provider });
    let generateSignature: (params: GenerateSignatureParams) => Promise<string>;
    switch (provider) {
      case 'metamask':
        generateSignature = generateSignatureWithMetamask;
        break;
      case 'base':
        generateSignature = generateSignatureWithBase;
        break;
      case 'coinbase_wallet':
        generateSignature = generateSignatureWithCoinbaseWallet;
        break;
      default:
        generateSignature = generateSignatureWithOKXWallet;
        break;
    }

    const makeNavigate = (to: string) => () =>
      customNavigate && typeof customNavigate === 'function' ? customNavigate(to) : this.navigate(to);

    const navigateToFactorTwo = makeNavigate(
      secondFactorUrl || buildURL({ base: displayConfig.signInUrl, hashPath: '/factor-two' }, { stringify: true }),
    );

    const navigateToContinueSignUp = makeNavigate(
      signUpContinueUrl ||
        buildURL(
          {
            base: displayConfig.signUpUrl,
            hashPath: '/continue',
          },
          { stringify: true },
        ),
    );

    let signInOrSignUp: SignInResource | SignUpResource;
    try {
      signInOrSignUp = await this.client.signIn.authenticateWithWeb3({
        identifier,
        generateSignature,
        strategy,
      });
    } catch (err) {
      if (isError(err, ERROR_CODES.FORM_IDENTIFIER_NOT_FOUND)) {
        signInOrSignUp = await this.client.signUp.authenticateWithWeb3({
          identifier,
          generateSignature,
          unsafeMetadata,
          strategy,
          legalAccepted,
        });

        if (
          signUpContinueUrl &&
          signInOrSignUp.status === 'missing_requirements' &&
          signInOrSignUp.verifications.web3Wallet.status === 'verified'
        ) {
          await navigateToContinueSignUp();
        }
      } else {
        throw err;
      }
    }

    const setActiveNavigate = async ({ session, redirectUrl }: { session: SessionResource; redirectUrl: string }) => {
      if (!session.currentTask) {
        await this.navigate(redirectUrl);
        return;
      }

      await navigateIfTaskExists(session, {
        baseUrl: displayConfig.signInUrl,
        navigate: this.navigate,
      });
    };

    switch (signInOrSignUp.status) {
      case 'needs_second_factor':
        await navigateToFactorTwo();
        break;
      case 'complete':
        if (signInOrSignUp.createdSessionId) {
          await this.setActive({
            session: signInOrSignUp.createdSessionId,
            navigate: async ({ session }) => {
              await setActiveNavigate({ session, redirectUrl: redirectUrl ?? this.buildAfterSignInUrl() });
            },
          });
        }
        break;
      default:
        return;
    }
  };

  public createOrganization = async ({ name, slug }: CreateOrganizationParams): Promise<OrganizationResource> => {
    return Organization.create({ name, slug });
  };

  public getOrganization = async (organizationId: string): Promise<OrganizationResource> =>
    Organization.get(organizationId);

  public joinWaitlist = async ({ emailAddress }: JoinWaitlistParams): Promise<WaitlistResource> =>
    Waitlist.join({ emailAddress });

  public updateEnvironment(environment: EnvironmentResource): asserts this is { environment: EnvironmentResource } {
    this.environment = environment;
  }

  __internal_setCountry = (country: string | null) => {
    if (!this.__internal_country) {
      this.__internal_country = country;
    }
  };

  get __internal_last_error(): ClerkAPIError | null {
    const value = this.internal_last_error;
    this.internal_last_error = null;
    return value;
  }

  set __internal_last_error(value: ClerkAPIError | null) {
    this.internal_last_error = value;
  }

  updateClient = (newClient: ClientResource): void => {
    if (!this.client) {
      // This is the first time client is being
      // set, so we also need to set session
      const session = this.#options.selectInitialSession
        ? this.#options.selectInitialSession(newClient)
        : this.#defaultSession(newClient);
      this.#setAccessors(session);
    }
    this.client = newClient;

    if (this.session) {
      const session = this.#getSessionFromClient(this.session.id);

      const hasTransitionedToPendingStatus = this.session.status === 'active' && session?.status === 'pending';
      if (hasTransitionedToPendingStatus) {
        const onAfterSetActive: SetActiveHook =
          typeof window !== 'undefined' && typeof window.__unstable__onAfterSetActive === 'function'
            ? window.__unstable__onAfterSetActive
            : noop;

        // Execute hooks to update server authentication context and trigger
        // page protections in clerkMiddleware or server components
        void onAfterSetActive();
      }

      // Note: this might set this.session to null
      this.#setAccessors(session);

      // A client response contains its associated sessions, along with a fresh token, so we dispatch a token update event.
      if (!this.session?.lastActiveToken && !isValidBrowserOnline()) {
        debugLogger.warn(
          'No last active token when updating client (offline)',
          { sessionId: this.session?.id },
          'clerk',
        );
      }
      eventBus.emit(events.TokenUpdate, { token: this.session?.lastActiveToken });
    }

    this.#emit();
  };

  get __unstable__environment(): EnvironmentResource | null | undefined {
    return this.environment;
  }

  // TODO: Fix this properly
  // eslint-disable-next-line @typescript-eslint/require-await
  __unstable__setEnvironment = async (env: EnvironmentJSON) => {
    this.environment = new Environment(env);

    if (Clerk.mountComponentRenderer) {
      this.#componentControls = Clerk.mountComponentRenderer(this, this.environment, this.#options);
    }
  };

  __unstable__onBeforeRequest = (callback: FapiRequestCallback<any>): void => {
    this.#fapiClient.onBeforeRequest(callback);
  };

  __unstable__onAfterResponse = (callback: FapiRequestCallback<any>): void => {
    this.#fapiClient.onAfterResponse(callback);
  };

  // TODO @userland-errors:
  __unstable__updateProps = (_props: any) => {
    // We need to re-init the options here in order to keep the options passed to ClerkProvider
    // in sync with the state of clerk-js. If we don't init the options here again, the following scenario is possible:
    // 1. User renders <ClerkProvider propA={undefined} propB={1} />
    // 2. clerk-js initializes propA with a default value
    // 3. The customer update propB independently of propA and window.Clerk.updateProps is called
    // 4. If we don't merge the new props with the current options, propA will be reset to undefined
    const props = {
      ..._props,
      options: this.#initOptions({ ...this.#options, ..._props.options }),
    };

    return this.#componentControls?.ensureMounted().then(controls => controls.updateProps(props));
  };

  __internal_navigateWithError(to: string, err: ClerkAPIError) {
    this.__internal_last_error = err;
    return this.navigate(to);
  }

  #buildSyncUrlForDevelopmentInstances = (): string => {
    const searchParams = new URLSearchParams({
      [CLERK_SATELLITE_URL]: window.location.href,
    });
    return buildURL({ base: this.#options.signInUrl, searchParams }, { stringify: true });
  };

  #buildSyncUrlForProductionInstances = (): string => {
    let primarySyncUrl;

    if (this.proxyUrl) {
      const proxy = new URL(this.proxyUrl);
      primarySyncUrl = new URL(`${proxy.pathname}/v1/client/sync`, proxy.origin);
    } else if (this.domain) {
      primarySyncUrl = new URL(`/v1/client/sync`, `https://${this.domain}`);
    }

    primarySyncUrl?.searchParams.append('redirect_url', window.location.href);

    return primarySyncUrl?.toString() || '';
  };

  #shouldSyncWithPrimary = (): boolean => {
    if (getClerkQueryParam(CLERK_SYNCED) === 'true') {
      return false;
    }

    if (!this.isSatellite) {
      return false;
    }

    return !!this.#authService?.isSignedOut();
  };

  #shouldRedirectToSatellite = (): boolean => {
    if (this.#instanceType === 'production') {
      return false;
    }

    if (this.isSatellite) {
      return false;
    }

    const satelliteUrl = getClerkQueryParam(CLERK_SATELLITE_URL);
    return !!satelliteUrl;
  };

  #syncWithPrimary = async () => {
    if (this.instanceType === 'development') {
      await this.navigate(this.#buildSyncUrlForDevelopmentInstances());
    } else if (this.instanceType === 'production') {
      await this.navigate(this.#buildSyncUrlForProductionInstances());
    }
  };

  #assertSignInFormatAndOrigin = (_signInUrl: string, origin: string) => {
    let signInUrl: URL;
    try {
      signInUrl = new URL(_signInUrl);
    } catch {
      clerkInvalidSignInUrlFormat();
    }

    if (signInUrl.origin === origin) {
      clerkInvalidSignInUrlOrigin();
    }
  };

  #validateMultiDomainOptions = () => {
    if (!this.isSatellite) {
      return;
    }

    if (this.#instanceType === 'development' && !this.#options.signInUrl) {
      clerkMissingSignInUrlAsSatellite();
    }

    if (!this.proxyUrl && !this.domain) {
      clerkMissingProxyUrlAndDomain();
    }

    if (this.#options.signInUrl) {
      this.#assertSignInFormatAndOrigin(this.#options.signInUrl, window.location.origin);
    }
  };

  #loadInStandardBrowser = async (): Promise<void> => {
    /**
     * 0. Init auth service and setup dev browser
     * This is not needed for production instances hence the .clear()
     * At this point we have already attempted to pre-populate devBrowser with a fresh JWT, if Step 2 was successful this will not be overwritten.
     * For multi-domain we want to avoid retrieving a fresh JWT from FAPI, and we need to get the token as a result of multi-domain session syncing.
     */
    this.#authService = await AuthCookieService.create(
      this,
      this.#fapiClient,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.#instanceType!,
      this.#publicEventBus,
    );

    /**
     * 1. Multi-domain SSO handling
     * If needed the app will attempt to sync with another app hosted in a different domain in order to acquire a session
     * - for development instances it populates dev browser JWT and `devBrowserHandler.setup()` should not have run.
     */
    this.#validateMultiDomainOptions();
    if (this.#shouldSyncWithPrimary()) {
      await this.#syncWithPrimary();
      // ClerkJS is not considered loaded during the sync/link process with the primary domain, return early
      return;
    }

    /**
     * 3. If the app is considered a primary domain and is in the middle of the sync/link flow, interact the loading of Clerk and redirect back to the satellite app
     * Initially step 2 and 4 were considered one but for step 2 we need devBrowserHandler.setup() to not have run and step 4 requires a valid dev browser JWT
     */
    if (this.#shouldRedirectToSatellite()) {
      await this.#redirectToSatellite();
      return;
    }

    /**
     * 4. Continue with clerk-js setup.
     * - Fetch & update environment
     * - Fetch & update client
     * - Mount components
     */
    this.#pageLifecycle = createPageLifecycle();

    if (typeof BroadcastChannel !== 'undefined') {
      this.#broadcastChannel = new BroadcastChannel('clerk');
    }

    this.#setupBrowserListeners();

    const isInAccountsHostedPages = isDevAccountPortalOrigin(window?.location.hostname);
    const shouldTouchEnv = this.#instanceType === 'development' && !isInAccountsHostedPages;

    let initializationDegradedCounter = 0;

    let retries = 0;
    while (retries < 2) {
      retries++;

      try {
        const initEnvironmentPromise = Environment.getInstance()
          .fetch({ touch: shouldTouchEnv })
          .then(res => this.updateEnvironment(res))
          .catch(() => {
            ++initializationDegradedCounter;
            const environmentSnapshot = SafeLocalStorage.getItem<EnvironmentJSONSnapshot | null>(
              CLERK_ENVIRONMENT_STORAGE_ENTRY,
              null,
            );

            if (environmentSnapshot) {
              this.updateEnvironment(new Environment(environmentSnapshot));
            }
          });

        const initClient = async () => {
          return Client.getOrCreateInstance()
            .fetch()
            .then(res => this.updateClient(res))
            .catch(async e => {
              /**
               * Only handle non 4xx errors, like 5xx errors and network errors.
               */
              if (is4xxError(e)) {
                // bubble it up
                throw e;
              }

              ++initializationDegradedCounter;

              const jwtInCookie = this.#authService?.getSessionCookie();
              const localClient = createClientFromJwt(jwtInCookie);

              this.updateClient(localClient);

              /**
               * In most scenarios we want the poller to stop while we are fetching a fresh token during an outage.
               * We want to avoid having the below `getToken()` retrying at the same time as the poller.
               */
              this.#authService?.stopPollingForToken();

              // Attempt to grab a fresh token
              await this.session
                ?.getToken({ skipCache: true })
                // If the token fetch fails, let Clerk be marked as loaded and leave it up to the poller.
                .catch(() => null)
                .finally(() => {
                  this.#authService?.startPollingForToken();
                });

              // Allows for Clerk to be marked as loaded with the client and session created from the JWT.
              return null;
            });
        };

        const initComponents = () => {
          if (Clerk.mountComponentRenderer && !this.#componentControls) {
            this.#componentControls = Clerk.mountComponentRenderer(
              this,
              this.environment as Environment,
              this.#options,
            );
          }
        };

        const [, clientResult] = await allSettled([initEnvironmentPromise, initClient()]);

        if (clientResult.status === 'rejected') {
          const e = clientResult.reason;

          if (isError(e, 'requires_captcha')) {
            initComponents();
            await initClient();
          } else {
            throw e;
          }
        }

        this.#authService?.setClientUatCookieForDevelopmentInstances();

        if (await this.#redirectFAPIInitiatedFlow()) {
          return;
        }

        initComponents();

        break;
      } catch (err) {
        if (isError(err, 'dev_browser_unauthenticated')) {
          await this.#authService.handleUnauthenticatedDevBrowser();
        } else if (!isValidBrowserOnline()) {
          console.warn(err);
          return;
        } else {
          throw err;
        }
      }

      if (retries >= 2) {
        clerkErrorInitFailed();
      }
    }

    this.#captchaHeartbeat = new CaptchaHeartbeat(this);
    void this.#captchaHeartbeat.start();
    this.#clearClerkQueryParams();
    this.#handleImpersonationFab();
    this.#handleKeylessPrompt();

    this.#publicEventBus.emit(clerkEvents.Status, initializationDegradedCounter > 0 ? 'degraded' : 'ready');
  };

  private shouldFallbackToCachedResources = (): boolean => {
    return !!this.__internal_getCachedResources;
  };

  #loadInNonStandardBrowser = async (): Promise<void> => {
    let environment: Environment, client: Client;
    const fetchMaxTries = this.shouldFallbackToCachedResources() ? 1 : undefined;
    let initializationDegradedCounter = 0;
    try {
      [environment, client] = await Promise.all([
        Environment.getInstance().fetch({ touch: false, fetchMaxTries }),
        Client.getOrCreateInstance().fetch({ fetchMaxTries }),
      ]);
    } catch (err) {
      if (isClerkRuntimeError(err) && err.code === 'network_error' && this.shouldFallbackToCachedResources()) {
        const cachedResources = await this.__internal_getCachedResources?.();
        environment = new Environment(cachedResources?.environment);
        Client.clearInstance();
        client = Client.getOrCreateInstance(cachedResources?.client);
        ++initializationDegradedCounter;
      } else {
        throw err;
      }
    }

    this.updateClient(client);
    this.updateEnvironment(environment);

    // TODO: Add an auth service also for non standard browsers that will poll for the __session JWT but won't use cookies

    if (Clerk.mountComponentRenderer) {
      this.#componentControls = Clerk.mountComponentRenderer(this, this.environment, this.#options);
    }

    this.#publicEventBus.emit(clerkEvents.Status, initializationDegradedCounter > 0 ? 'degraded' : 'ready');
  };

  // This is used by @clerk/clerk-expo
  __internal_reloadInitialResources = async (): Promise<void> => {
    const [environment, client] = await Promise.all([
      Environment.getInstance().fetch({ touch: false, fetchMaxTries: 1 }),
      Client.getOrCreateInstance().fetch({ fetchMaxTries: 1 }),
    ]);

    this.updateClient(client);
    this.updateEnvironment(environment);

    this.#emit();
  };

  #defaultSession = (client: ClientResource): SignedInSessionResource | null => {
    if (client.lastActiveSessionId) {
      const currentSession = client.signedInSessions.find(s => s.id === client.lastActiveSessionId);
      if (currentSession) {
        return currentSession;
      }
    }
    const session = client.signedInSessions[0];
    return session || null;
  };

  #setupBrowserListeners = (): void => {
    if (!inClientSide()) {
      return;
    }

    this.#pageLifecycle?.onPageFocus(() => {
      if (!this.session) {
        return;
      }

      // In multi-session apps, it's possible that different tabs will have different active sessions. It's critical that the tab's active session is touched in this case so the session is properly updated on the backend, and so we avoid any throttling when multi-session mode is enabled.
      const multisessionMode = this.environment && !this.environment.authConfig.singleSessionMode;
      if (!multisessionMode && this.#touchThrottledUntil > Date.now()) {
        return;
      }
      this.#touchThrottledUntil = Date.now() + 5_000;

      if (this.#options.touchSession) {
        void this.#touchCurrentSession(this.session);
      }
    });

    /**
     * Background tabs get notified of cross-tab signout events.
     */
    this.#broadcastChannel?.addEventListener('message', (event: MessageEvent) => {
      if (event.data?.type === 'signout') {
        void this.handleUnauthenticated({ broadcast: false });
      }
    });

    /**
     * Allow resources within the singleton to notify other tabs about a signout event (scoped to a single tab)
     */
    eventBus.on(events.UserSignOut, () => {
      this.#broadcastChannel?.postMessage({ type: 'signout' });
    });

    eventBus.on(events.EnvironmentUpdate, () => {
      // Cache the environment snapshot for 24 hours
      SafeLocalStorage.setItem(
        CLERK_ENVIRONMENT_STORAGE_ENTRY,
        this.environment?.__internal_toSnapshot(),
        24 * 60 * 60 * 1_000,
      );
    });
  };

  // TODO: Be more conservative about touches. Throttle, don't touch when only one user, etc
  #touchCurrentSession = async (session?: SignedInSessionResource | null): Promise<void> => {
    if (!session) {
      return Promise.resolve();
    }

    await session.touch().catch(e => {
      if (is4xxError(e)) {
        void this.handleUnauthenticated();
      }
    });
  };

  #emit = (): void => {
    if (this.client) {
      for (const listener of this.#listeners) {
        listener({
          client: this.client,
          session: this.session,
          user: this.user,
          organization: this.organization,
        });
      }
    }
  };

  #emitNavigationListeners = (): void => {
    for (const listener of this.#navigationListeners) {
      listener();
    }
  };

  /**
   * Temporarily clears the accessors before emitting changes to React context state.
   * This is used during transitions like sign-out or session changes to prevent UI flickers
   * such as unexpected unmount of control components
   */
  #setTransitiveState = () => {
    this.session = undefined;
    this.organization = undefined;
    this.user = undefined;
    this.#emit();
  };

  #getLastActiveOrganizationFromSession = () => {
    const orgMemberships = this.session?.user.organizationMemberships || [];
    return (
      orgMemberships.map(om => om.organization).find(org => org.id === this.session?.lastActiveOrganizationId) || null
    );
  };

  #setAccessors = (session?: SignedInSessionResource | null) => {
    this.session = session || null;
    this.organization = this.#getLastActiveOrganizationFromSession();
    this.user = this.session ? this.session.user : null;
  };

  #getSessionFromClient = (sessionId: string | undefined): SignedInSessionResource | null => {
    return this.client?.signedInSessions.find(x => x.id === sessionId) || null;
  };

  #handleImpersonationFab = () => {
    this.addListener(({ session }) => {
      const isImpersonating = !!session?.actor;
      if (isImpersonating) {
        void this.#componentControls?.ensureMounted().then(controls => controls.mountImpersonationFab());
      }
    });
  };

  #handleKeylessPrompt = () => {
    if (this.#options.__internal_keyless_claimKeylessApplicationUrl) {
      void this.#componentControls?.ensureMounted().then(controls => {
        // TODO(@pantelis): Investigate if this resets existing props
        controls.updateProps({
          options: {
            __internal_keyless_claimKeylessApplicationUrl: this.#options.__internal_keyless_claimKeylessApplicationUrl,
            __internal_keyless_copyInstanceKeysUrl: this.#options.__internal_keyless_copyInstanceKeysUrl,
            __internal_keyless_dismissPrompt: this.#options.__internal_keyless_dismissPrompt,
          },
        });
      });
    }
  };

  #buildUrl = (
    key: 'signInUrl' | 'signUpUrl',
    options: RedirectOptions,
    _initValues?: Record<string, string>,
  ): string => {
    if (!key || !this.loaded || !this.environment || !this.environment.displayConfig) {
      return '';
    }

    let signInOrUpUrl = this.#options[key] || this.environment.displayConfig[key];
    if (this.#isCombinedSignInOrUpFlow()) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      signInOrUpUrl = this.#options.signInUrl!;
    }
    const redirectUrls = new RedirectUrls(this.#options, options).toSearchParams();
    const initValues = new URLSearchParams(_initValues || {});
    const url = buildURL(
      {
        base: signInOrUpUrl,
        hashPath: this.#isCombinedSignInOrUpFlow() && key === 'signUpUrl' ? '/create' : '',
        hashSearchParams: [initValues, redirectUrls],
      },
      { stringify: true },
    );
    return this.buildUrlWithAuth(url);
  };

  assertComponentsReady(controls: unknown): asserts controls is ReturnType<MountComponentRenderer> {
    if (!Clerk.mountComponentRenderer) {
      throw new Error('ClerkJS was loaded without UI components.');
    }
    if (!controls) {
      throw new Error('ClerkJS components are not ready yet.');
    }
  }

  #redirectFAPIInitiatedFlow = async (): Promise<boolean> => {
    const redirectUrl = new URLSearchParams(window.location.search).get('redirect_url');
    const isProdInstance = this.instanceType === 'production';
    const shouldRedirect = redirectUrl !== null && isRedirectForFAPIInitiatedFlow(this.frontendApi, redirectUrl);

    if (isProdInstance || !shouldRedirect) {
      return false;
    }

    const userSignedIn = this.session;
    const signInUrl = this.#options.signInUrl || this.environment?.displayConfig.signInUrl;
    const referrerIsSignInUrl = signInUrl && window.location.href.startsWith(signInUrl);
    const signUpUrl = this.#options.signUpUrl || this.environment?.displayConfig.signUpUrl;
    const referrerIsSignUpUrl = signUpUrl && window.location.href.startsWith(signUpUrl);

    // don't redirect if user is not signed in and referrer is sign in/up url
    if (requiresUserInput(redirectUrl) && !userSignedIn && (referrerIsSignInUrl || referrerIsSignUpUrl)) {
      return false;
    }

    await this.navigate(this.buildUrlWithAuth(redirectUrl));
    return true;
  };

  #initOptions = (options?: ClerkOptions): ClerkOptions => {
    const processedOptions = options ? { ...options } : {};

    // Extract cssLayerName from baseTheme if present and move it to appearance level
    if (processedOptions.appearance) {
      processedOptions.appearance = processCssLayerNameExtraction(processedOptions.appearance);
    }

    return {
      ...defaultOptions,
      ...processedOptions,
      allowedRedirectOrigins: createAllowedRedirectOrigins(
        options?.allowedRedirectOrigins,
        this.frontendApi,
        this.instanceType,
      ),
    };
  };

  /**
   * The handshake payload is transported in the URL in development. In cases where FAPI is returning the handshake payload, but Clerk is being used in a client-only application,
   * we remove the handshake associated parameters as they are not necessary.
   */
  #clearClerkQueryParams = () => {
    try {
      removeClerkQueryParam(CLERK_SYNCED);
      removeClerkQueryParam(CLERK_NETLIFY_CACHE_BUST_PARAM);
      // @nikos: we're looking into dropping this param completely
      // in the meantime, we're removing it here to keep the URL clean
      removeClerkQueryParam(CLERK_SUFFIXED_COOKIES);
      removeClerkQueryParam('__clerk_handshake');
      removeClerkQueryParam('__clerk_handshake_nonce');
      removeClerkQueryParam('__clerk_help');
    } catch {
      // ignore
    }
  };

  get #allowedRedirectProtocols() {
    let allowedProtocols = ALLOWED_PROTOCOLS;

    if (this.#options.allowedRedirectProtocols) {
      allowedProtocols = allowedProtocols.concat(this.#options.allowedRedirectProtocols);
    }

    return allowedProtocols;
  }
}
