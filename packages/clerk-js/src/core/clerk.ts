import { inBrowser as inClientSide, isValidBrowserOnline } from '@clerk/shared/browser';
import { deprecated } from '@clerk/shared/deprecated';
import { ClerkRuntimeError, EmailLinkErrorCodeStatus, is4xxError, isClerkAPIResponseError } from '@clerk/shared/error';
import { parsePublishableKey } from '@clerk/shared/keys';
import { LocalStorageBroadcastChannel } from '@clerk/shared/localStorageBroadcastChannel';
import { logger } from '@clerk/shared/logger';
import { isHttpOrHttps, isValidProxyUrl, proxyUrlToAbsoluteURL } from '@clerk/shared/proxy';
import { eventPrebuiltComponentMounted, TelemetryCollector } from '@clerk/shared/telemetry';
import { addClerkPrefix, isAbsoluteUrl, stripScheme } from '@clerk/shared/url';
import { handleValueOrFn, noop } from '@clerk/shared/utils';
import type {
  __internal_UserVerificationModalProps,
  AuthenticateWithCoinbaseWalletParams,
  AuthenticateWithGoogleOneTapParams,
  AuthenticateWithMetamaskParams,
  AuthenticateWithOKXWalletParams,
  Clerk as ClerkInterface,
  ClerkAPIError,
  ClerkAuthenticateWithWeb3Params,
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
  PublicKeyCredentialCreationOptionsWithoutExtensions,
  PublicKeyCredentialRequestOptionsWithoutExtensions,
  PublicKeyCredentialWithAuthenticatorAssertionResponse,
  PublicKeyCredentialWithAuthenticatorAttestationResponse,
  RedirectOptions,
  RedirectToTasksUrlOptions,
  Resources,
  SDKMetadata,
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
  UnsubscribeCallback,
  UserButtonProps,
  UserProfileProps,
  UserResource,
  WaitlistProps,
  WaitlistResource,
  Web3Provider,
} from '@clerk/types';

import { sessionTaskRoutePaths } from '../ui/common/tasks';
import type { MountComponentRenderer } from '../ui/Components';
import {
  ALLOWED_PROTOCOLS,
  buildURL,
  completeSignUpFlow,
  createAllowedRedirectOrigins,
  createBeforeUnloadTracker,
  createPageLifecycle,
  disabledOrganizationsFeature,
  errorThrower,
  generateSignatureWithCoinbaseWallet,
  generateSignatureWithMetamask,
  generateSignatureWithOKXWallet,
  getClerkQueryParam,
  getWeb3Identifier,
  hasExternalAccountSignUpError,
  ignoreEventValue,
  inActiveBrowserTab,
  inBrowser,
  isDevAccountPortalOrigin,
  isError,
  isOrganizationId,
  isRedirectForFAPIInitiatedFlow,
  isSignedInAndSingleSessionModeEnabled,
  noOrganizationExists,
  noUserExists,
  removeClerkQueryParam,
  requiresUserInput,
  stripOrigin,
  windowNavigate,
} from '../utils';
import { assertNoLegacyProp } from '../utils/assertNoLegacyProp';
import { memoizeListenerCallback } from '../utils/memoizeStateListenerCallback';
import { createOfflineScheduler } from '../utils/offlineScheduler';
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
import {
  BaseResource,
  Client,
  EmailLinkError,
  Environment,
  isClerkRuntimeError,
  Organization,
  Waitlist,
} from './resources/internal';
import { warnings } from './warnings';

export type ClerkCoreBroadcastChannelEvent = { type: 'signout' };

declare global {
  interface Window {
    Clerk?: Clerk;
    __clerk_publishable_key?: string;
    __clerk_proxy_url?: ClerkInterface['proxyUrl'];
    __clerk_domain?: ClerkInterface['domain'];
  }
}

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
};

export class Clerk implements ClerkInterface {
  public static mountComponentRenderer?: MountComponentRenderer;

  public static version: string = __PKG_VERSION__;
  public static sdkMetadata: SDKMetadata = {
    name: __PKG_NAME__,
    version: __PKG_VERSION__,
    environment: process.env.NODE_ENV || 'production',
  };

  public client: ClientResource | undefined;
  public session: SignedInSessionResource | null | undefined;
  public organization: OrganizationResource | null | undefined;
  public user: UserResource | null | undefined;
  public __internal_country?: string | null;
  public telemetry: TelemetryCollector | undefined;

  protected internal_last_error: ClerkAPIError | null = null;
  // converted to protected environment to support `updateEnvironment` type assertion
  protected environment?: EnvironmentResource | null;

  #publishableKey = '';
  #domain: DomainOrProxyUrl['domain'];
  #proxyUrl: DomainOrProxyUrl['proxyUrl'];
  #authService?: AuthCookieService;
  #captchaHeartbeat?: CaptchaHeartbeat;
  #broadcastChannel: LocalStorageBroadcastChannel<ClerkCoreBroadcastChannelEvent> | null = null;
  #componentControls?: ReturnType<MountComponentRenderer> | null;
  //@ts-expect-error with being undefined even though it's not possible - related to issue with ts and error thrower
  #fapiClient: FapiClient;
  #instanceType?: InstanceType;
  #loaded = false;

  #listeners: Array<(emission: Resources) => void> = [];
  #navigationListeners: Array<() => void> = [];
  #options: ClerkOptions = {};
  #pageLifecycle: ReturnType<typeof createPageLifecycle> | null = null;
  #touchThrottledUntil = 0;
  #sessionTouchOfflineScheduler = createOfflineScheduler();

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
    return this.#loaded;
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

  public __internal_getOption<K extends keyof ClerkOptions>(key: K): ClerkOptions[K] {
    return this.#options[key];
  }

  get isSignedIn(): boolean {
    return !!this.session;
  }

  public constructor(key: string, options?: DomainOrProxyUrl) {
    key = (key || '').trim();

    this.#domain = options?.domain;
    this.#proxyUrl = options?.proxyUrl;

    if (!key) {
      return errorThrower.throwMissingPublishableKeyError();
    }

    const publishableKey = parsePublishableKey(key);

    if (!publishableKey) {
      return errorThrower.throwInvalidPublishableKeyError({ key });
    }

    this.#publishableKey = key;
    this.#instanceType = publishableKey.instanceType;

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
    // This line is used for the piggy-backing mechanism
    BaseResource.clerk = this;
  }

  public getFapiClient = (): FapiClient => this.#fapiClient;

  public load = async (options?: ClerkOptions): Promise<void> => {
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

    assertNoLegacyProp(this.#options);

    if (this.#options.sdkMetadata) {
      Clerk.sdkMetadata = this.#options.sdkMetadata;
    }

    if (this.#options.telemetry !== false) {
      this.telemetry = new TelemetryCollector({
        clerkVersion: Clerk.version,
        samplingRate: 1,
        publishableKey: this.publishableKey,
        ...this.#options.telemetry,
      });
    }

    if (this.#options.standardBrowser) {
      this.#loaded = await this.#loadInStandardBrowser();
    } else {
      this.#loaded = await this.#loadInNonStandardBrowser();
    }
  };

  #isCombinedSignInOrUpFlow(): boolean {
    return Boolean(!this.#options.signUpUrl && this.#options.signInUrl && !isAbsoluteUrl(this.#options.signInUrl));
  }

  public signOut: SignOut = async (callbackOrOptions?: SignOutCallback | SignOutOptions, options?: SignOutOptions) => {
    if (!this.client || this.client.sessions.length === 0) {
      return;
    }
    const opts = callbackOrOptions && typeof callbackOrOptions === 'object' ? callbackOrOptions : options || {};

    const redirectUrl = opts?.redirectUrl || this.buildAfterSignOutUrl();

    const handleSetActive = () => {
      const signOutCallback = typeof callbackOrOptions === 'function' ? callbackOrOptions : undefined;

      // Notify other tabs that user is signing out.
      eventBus.dispatch(events.UserSignOut, null);
      if (signOutCallback) {
        return this.setActive({
          session: null,
          beforeEmit: ignoreEventValue(signOutCallback),
        });
      }

      return this.setActive({
        session: null,
        redirectUrl,
      });
    };

    if (!opts.sessionId || this.client.signedInSessions.length === 1) {
      if (this.#options.experimental?.persistClient ?? true) {
        await this.client.removeSessions();
      } else {
        await this.client.destroy();
      }

      return handleSetActive();
    }

    const session = this.client.signedInSessions.find(s => s.id === opts.sessionId);
    const shouldSignOutCurrent = session?.id && this.session?.id === session.id;
    await session?.remove();
    if (shouldSignOutCurrent) {
      return handleSetActive();
    }
  };

  public openGoogleOneTap = (props?: GoogleOneTapProps): void => {
    // TODO: add telemetry
    this.assertComponentsReady(this.#componentControls);
    void this.#componentControls
      .ensureMounted({ preloadHint: 'GoogleOneTap' })
      .then(controls => controls.openModal('googleOneTap', props || {}));
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
          code: 'cannot_render_single_session_enabled',
        });
      }
      return;
    }
    void this.#componentControls
      .ensureMounted({ preloadHint: 'SignIn' })
      .then(controls => controls.openModal('signIn', props || {}));
  };

  public closeSignIn = (): void => {
    this.assertComponentsReady(this.#componentControls);
    void this.#componentControls.ensureMounted().then(controls => controls.closeModal('signIn'));
  };

  public __internal_openReverification = (props?: __internal_UserVerificationModalProps): void => {
    this.assertComponentsReady(this.#componentControls);
    if (noUserExists(this)) {
      if (this.#instanceType === 'development') {
        throw new ClerkRuntimeError(warnings.cannotOpenUserProfile, {
          code: 'cannot_render_user_missing',
        });
      }
      return;
    }
    void this.#componentControls
      .ensureMounted({ preloadHint: 'UserVerification' })
      .then(controls => controls.openModal('userVerification', props || {}));
  };

  public __internal_closeReverification = (): void => {
    this.assertComponentsReady(this.#componentControls);
    void this.#componentControls.ensureMounted().then(controls => controls.closeModal('userVerification'));
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

  public openSignUp = (props?: SignUpProps): void => {
    this.assertComponentsReady(this.#componentControls);
    if (isSignedInAndSingleSessionModeEnabled(this, this.environment)) {
      if (this.#instanceType === 'development') {
        throw new ClerkRuntimeError(warnings.cannotOpenSignInOrSignUp, {
          code: 'cannot_render_single_session_enabled',
        });
      }
      return;
    }
    void this.#componentControls
      .ensureMounted({ preloadHint: 'SignUp' })
      .then(controls => controls.openModal('signUp', props || {}));
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
          code: 'cannot_render_user_missing',
        });
      }
      return;
    }
    void this.#componentControls
      .ensureMounted({ preloadHint: 'UserProfile' })
      .then(controls => controls.openModal('userProfile', props || {}));
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
          code: 'cannot_render_organizations_disabled',
        });
      }
      return;
    }
    if (noOrganizationExists(this)) {
      if (this.#instanceType === 'development') {
        throw new ClerkRuntimeError(warnings.cannotRenderComponentWhenOrgDoesNotExist, {
          code: 'cannot_render_organization_missing',
        });
      }
      return;
    }
    void this.#componentControls
      .ensureMounted({ preloadHint: 'OrganizationProfile' })
      .then(controls => controls.openModal('organizationProfile', props || {}));
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
          code: 'cannot_render_organizations_disabled',
        });
      }
      return;
    }
    void this.#componentControls
      .ensureMounted({ preloadHint: 'CreateOrganization' })
      .then(controls => controls.openModal('createOrganization', props || {}));
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
  };

  public closeWaitlist = (): void => {
    this.assertComponentsReady(this.#componentControls);
    void this.#componentControls.ensureMounted().then(controls => controls.closeModal('waitlist'));
  };

  public mountSignIn = (node: HTMLDivElement, props?: SignInProps): void => {
    this.assertComponentsReady(this.#componentControls);
    void this.#componentControls.ensureMounted({ preloadHint: 'SignIn' }).then(controls =>
      controls.mountComponent({
        name: 'SignIn',
        appearanceKey: 'signIn',
        node,
        props,
      }),
    );
    this.telemetry?.record(
      eventPrebuiltComponentMounted(
        'SignIn',
        {
          ...props,
        },
        {
          withSignUp: props?.withSignUp ?? this.#isCombinedSignInOrUpFlow(),
        },
      ),
    );
  };

  public unmountSignIn = (node: HTMLDivElement): void => {
    this.assertComponentsReady(this.#componentControls);
    void this.#componentControls.ensureMounted().then(controls =>
      controls.unmountComponent({
        node,
      }),
    );
  };

  public mountSignUp = (node: HTMLDivElement, props?: SignUpProps): void => {
    this.assertComponentsReady(this.#componentControls);
    void this.#componentControls.ensureMounted({ preloadHint: 'SignUp' }).then(controls =>
      controls.mountComponent({
        name: 'SignUp',
        appearanceKey: 'signUp',
        node,
        props,
      }),
    );
    this.telemetry?.record(eventPrebuiltComponentMounted('SignUp', props));
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
          code: 'cannot_render_user_missing',
        });
      }
      return;
    }
    void this.#componentControls.ensureMounted({ preloadHint: 'UserProfile' }).then(controls =>
      controls.mountComponent({
        name: 'UserProfile',
        appearanceKey: 'userProfile',
        node,
        props,
      }),
    );

    this.telemetry?.record(
      eventPrebuiltComponentMounted(
        'UserProfile',
        props,
        props?.customPages?.length || 0 > 0
          ? {
              customPages: true,
            }
          : undefined,
      ),
    );
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
          code: 'cannot_render_organizations_disabled',
        });
      }
      return;
    }
    const userExists = !noUserExists(this);
    if (noOrganizationExists(this) && userExists) {
      if (this.#instanceType === 'development') {
        throw new ClerkRuntimeError(warnings.cannotRenderComponentWhenOrgDoesNotExist, {
          code: 'cannot_render_organization_missing',
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
          code: 'cannot_render_organizations_disabled',
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
          code: 'cannot_render_organizations_disabled',
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

    this.telemetry?.record(eventPrebuiltComponentMounted('OrganizationSwitcher', props));
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
          code: 'cannot_render_organizations_disabled',
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

    this.telemetry?.record(eventPrebuiltComponentMounted('OrganizationList', props));
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

    this.telemetry?.record(
      eventPrebuiltComponentMounted('UserButton', props, {
        ...(props?.customMenuItems?.length || 0 > 0
          ? {
              customItems: true,
            }
          : undefined),

        ...(props?.__experimental_asStandalone
          ? {
              standalone: true,
            }
          : undefined),
      }),
    );
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

  /**
   * `setActive` can be used to set the active session and/or organization.
   */
  public setActive = async ({ session, organization, beforeEmit, redirectUrl }: SetActiveParams): Promise<void> => {
    if (!this.client) {
      throw new Error('setActive is being called before the client is loaded. Wait for init.');
    }

    if (session === undefined && !this.session) {
      throw new Error(
        'setActive should either be called with a session param or there should be already an active session.',
      );
    }

    type SetActiveHook = () => void | Promise<void>;
    const onBeforeSetActive: SetActiveHook =
      typeof window !== 'undefined' && typeof window.__unstable__onBeforeSetActive === 'function'
        ? window.__unstable__onBeforeSetActive
        : noop;

    const onAfterSetActive: SetActiveHook =
      typeof window !== 'undefined' && typeof window.__unstable__onAfterSetActive === 'function'
        ? window.__unstable__onAfterSetActive
        : noop;

    if (typeof session === 'string') {
      session = (this.client.sessions.find(x => x.id === session) as SignedInSessionResource) || null;
    }

    let newSession = session === undefined ? this.session : session;

    const isResolvingSessionTasks =
      !!newSession?.currentTask ||
      window.location.href.includes(this.internal__buildTasksUrl({ task: newSession?.currentTask }));

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
        newSession.lastActiveOrganizationId = matchingOrganization?.organization.id || null;
      }
    }

    if (session?.lastActiveToken) {
      eventBus.dispatch(events.TokenUpdate, { token: session.lastActiveToken });
    }

    await onBeforeSetActive();

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
      eventBus.dispatch(events.TokenUpdate, { token: null });
    }

    //2. If there's a beforeEmit, typically we're navigating.  Emit the session as
    //   undefined, then wait for beforeEmit to complete before emitting the new session.
    //   When undefined, neither SignedIn nor SignedOut renders, which avoids flickers or
    //   automatic reloading when reloading shouldn't be happening.
    const beforeUnloadTracker = this.#options.standardBrowser ? createBeforeUnloadTracker() : undefined;
    if (beforeEmit) {
      deprecated(
        'Clerk.setActive({beforeEmit})',
        'Use the `redirectUrl` property instead. Example `Clerk.setActive({redirectUrl:"/"})`',
      );
      beforeUnloadTracker?.startTracking();
      this.#setTransitiveState();
      await beforeEmit(newSession);
      beforeUnloadTracker?.stopTracking();
    }

    if (redirectUrl && !beforeEmit && !isResolvingSessionTasks) {
      beforeUnloadTracker?.startTracking();
      this.#setTransitiveState();

      if (this.client.isEligibleForTouch()) {
        const absoluteRedirectUrl = new URL(redirectUrl, window.location.href);

        await this.navigate(this.buildUrlWithAuth(this.client.buildTouchUrl({ redirectUrl: absoluteRedirectUrl })));
      } else {
        await this.navigate(redirectUrl);
      }

      beforeUnloadTracker?.stopTracking();
    }

    //3. Check if hard reloading (onbeforeunload).  If not, set the user/session and emit
    if (beforeUnloadTracker?.isUnloading()) {
      return;
    }

    this.#setAccessors(newSession);

    this.#emit();
    await onAfterSetActive();
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

    console.log({ to });

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

  public buildWaitlistUrl(options?: { initialValues?: Record<string, string> }): string {
    if (!this.environment || !this.environment.displayConfig) {
      return '';
    }
    const waitlistUrl = this.#options['waitlistUrl'] || this.environment.displayConfig.waitlistUrl;
    const initValues = new URLSearchParams(options?.initialValues || {});
    return buildURL({ base: waitlistUrl, hashSearchParams: [initValues] }, { stringify: true });
  }

  public internal__buildTasksUrl({ task, origin }: RedirectToTasksUrlOptions): string {
    if (!task) {
      return '';
    }

    const signUpUrl = this.#options.signUpUrl || this.environment?.displayConfig.signUpUrl;
    const referrerIsSignUpUrl = signUpUrl && window.location.href.includes(signUpUrl);

    const originWithDefault = origin ?? (referrerIsSignUpUrl ? 'SignUp' : 'SignIn');
    const defaultUrlByOrigin = originWithDefault === 'SignIn' ? this.#options.signInUrl : this.#options.signUpUrl;

    return buildURL({ base: defaultUrlByOrigin, hashPath: sessionTaskRoutePaths[task.key] }, { stringify: true });
  }

  public buildAfterMultiSessionSingleSignOutUrl(): string {
    if (!this.#options.afterMultiSessionSingleSignOutUrl) {
      return this.buildUrlWithAuth(
        buildURL(
          {
            base: this.#options.signInUrl
              ? `${this.#options.signInUrl}/choose`
              : this.environment?.displayConfig.afterSignOutOneUrl,
          },
          { stringify: true },
        ),
      );
    }

    return this.buildUrlWithAuth(this.#options.afterMultiSessionSingleSignOutUrl);
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

  public redirectToTasks = async (options: RedirectToTasksUrlOptions): Promise<unknown> => {
    if (inBrowser()) {
      return this.navigate(this.internal__buildTasksUrl(options));
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

    if (si.status === 'complete') {
      return this.setActive({
        session: si.sessionId,
        redirectUrl: redirectUrls.getAfterSignInUrl(),
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
            redirectUrl: redirectUrls.getAfterSignInUrl(),
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
            redirectUrl: redirectUrls.getAfterSignUpUrl(),
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
        redirectUrl: redirectUrls.getAfterSignUpUrl(),
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
          redirectUrl: redirectUrls.getAfterSignInUrl(),
        });
      }
    }

    if (hasExternalAccountSignUpError(signUp)) {
      return navigateToSignUp();
    }

    if (su.externalAccountStatus === 'verified' && su.status === 'missing_requirements') {
      return navigateToNextStepSignUp({ missingFields: signUp.missingFields });
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
        eventBus.dispatch(events.UserSignOut, null);
      }
      return this.setActive({ session: null });
    } catch (err) {
      // Handle the 403 Forbidden
      if (err.status === 403) {
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
    if (__BUILD_DISABLE_RHC__) {
      clerkUnsupportedEnvironmentWarning('Metamask');
      return;
    }

    await this.authenticateWithWeb3({
      ...props,
      strategy: 'web3_metamask_signature',
    });
  };

  public authenticateWithCoinbaseWallet = async (props: AuthenticateWithCoinbaseWalletParams = {}): Promise<void> => {
    if (__BUILD_DISABLE_RHC__) {
      clerkUnsupportedEnvironmentWarning('Coinbase Wallet');
      return;
    }

    await this.authenticateWithWeb3({
      ...props,
      strategy: 'web3_coinbase_wallet_signature',
    });
  };

  public authenticateWithOKXWallet = async (props: AuthenticateWithOKXWalletParams = {}): Promise<void> => {
    if (__BUILD_DISABLE_RHC__) {
      clerkUnsupportedEnvironmentWarning('OKX Wallet');
      return;
    }

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
  }: ClerkAuthenticateWithWeb3Params): Promise<void> => {
    if (__BUILD_DISABLE_RHC__) {
      clerkUnsupportedEnvironmentWarning('Web3');
      return;
    }

    if (!this.client || !this.environment) {
      return;
    }
    const provider = strategy.replace('web3_', '').replace('_signature', '') as Web3Provider;
    const identifier = await getWeb3Identifier({ provider });
    const generateSignature =
      provider === 'metamask'
        ? generateSignatureWithMetamask
        : provider === 'coinbase_wallet'
          ? generateSignatureWithCoinbaseWallet
          : generateSignatureWithOKXWallet;

    const navigate = (to: string) =>
      customNavigate && typeof customNavigate === 'function' ? customNavigate(to) : this.navigate(to);

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
          await navigate(signUpContinueUrl);
        }
      } else {
        throw err;
      }
    }

    if (signInOrSignUp.createdSessionId) {
      await this.setActive({
        session: signInOrSignUp.createdSessionId,
        redirectUrl,
      });
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

      const hasResolvedPreviousTask = this.session.currentTask != session?.currentTask;

      // Note: this might set this.session to null
      this.#setAccessors(session);

      // A client response contains its associated sessions, along with a fresh token, so we dispatch a token update event.
      eventBus.dispatch(events.TokenUpdate, { token: this.session?.lastActiveToken });

      // Any FAPI call could lead to a task being unsatisfied such as app owners
      // actions therefore the check must be done on client piggybacking
      if (session?.currentTask) {
        eventBus.dispatch(events.NewSessionTask, session);
      } else if (session && hasResolvedPreviousTask) {
        eventBus.dispatch(events.ResolvedSessionTask, session);
      }
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

  #loadInStandardBrowser = async (): Promise<boolean> => {
    /**
     * 0. Init auth service and setup dev browser
     * This is not needed for production instances hence the .clear()
     * At this point we have already attempted to pre-populate devBrowser with a fresh JWT, if Step 2 was successful this will not be overwritten.
     * For multi-domain we want to avoid retrieving a fresh JWT from FAPI, and we need to get the token as a result of multi-domain session syncing.
     */
    this.#authService = await AuthCookieService.create(this, this.#fapiClient, this.#instanceType!);

    /**
     * 1. Multi-domain SSO handling
     * If needed the app will attempt to sync with another app hosted in a different domain in order to acquire a session
     * - for development instances it populates dev browser JWT and `devBrowserHandler.setup()` should not have run.
     */
    this.#validateMultiDomainOptions();
    if (this.#shouldSyncWithPrimary()) {
      await this.#syncWithPrimary();
      // ClerkJS is not considered loaded during the sync/link process with the primary domain
      return false;
    }

    /**
     * 3. If the app is considered a primary domain and is in the middle of the sync/link flow, interact the loading of Clerk and redirect back to the satellite app
     * Initially step 2 and 4 were considered one but for step 2 we need devBrowserHandler.setup() to not have run and step 4 requires a valid dev browser JWT
     */
    if (this.#shouldRedirectToSatellite()) {
      await this.#redirectToSatellite();
      return false;
    }

    /**
     * 4. Continue with clerk-js setup.
     * - Fetch & update environment
     * - Fetch & update client
     * - Mount components
     */
    this.#pageLifecycle = createPageLifecycle();

    this.#broadcastChannel = new LocalStorageBroadcastChannel('clerk');
    this.#setupBrowserListeners();

    const isInAccountsHostedPages = isDevAccountPortalOrigin(window?.location.hostname);
    const shouldTouchEnv = this.#instanceType === 'development' && !isInAccountsHostedPages;

    let retries = 0;
    while (retries < 2) {
      retries++;

      try {
        const initEnvironmentPromise = Environment.getInstance()
          .fetch({ touch: shouldTouchEnv })
          .then(res => {
            this.updateEnvironment(res);
          });

        const initClient = () => {
          return Client.getOrCreateInstance()
            .fetch()
            .then(res => this.updateClient(res));
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

        await Promise.all([initEnvironmentPromise, initClient()]).catch(async e => {
          // limit the changes for this specific error for now
          if (isClerkAPIResponseError(e) && e.errors[0].code === 'requires_captcha') {
            await initEnvironmentPromise;
            initComponents();
            await initClient();
          } else {
            throw e;
          }
        });

        this.#authService?.setClientUatCookieForDevelopmentInstances();

        if (await this.#redirectFAPIInitiatedFlow()) {
          return false;
        }

        initComponents();

        break;
      } catch (err) {
        if (isError(err, 'dev_browser_unauthenticated')) {
          await this.#authService.handleUnauthenticatedDevBrowser();
        } else if (!isValidBrowserOnline()) {
          console.warn(err);
          return false;
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
    return true;
  };

  private shouldFallbackToCachedResources = (): boolean => {
    return !!this.__internal_getCachedResources;
  };

  #loadInNonStandardBrowser = async (): Promise<boolean> => {
    let environment: Environment, client: Client;
    const fetchMaxTries = this.shouldFallbackToCachedResources() ? 1 : undefined;
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

    return true;
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

      const performTouch = () => {
        if (this.#touchThrottledUntil > Date.now()) {
          return;
        }
        this.#touchThrottledUntil = Date.now() + 5_000;

        return this.#touchCurrentSession(this.session);
      };

      this.#sessionTouchOfflineScheduler.schedule(performTouch);
    });

    /**
     * Background tabs get notified of a signout event from active tab.
     */
    this.#broadcastChannel?.addEventListener('message', ({ data }) => {
      if (data.type === 'signout') {
        void this.handleUnauthenticated({ broadcast: false });
      }
    });

    /**
     * Allow resources within the singleton to notify other tabs about a signout event (scoped to a single tab)
     */
    eventBus.on(events.UserSignOut, () => {
      this.#broadcastChannel?.postMessage({ type: 'signout' });
    });

    eventBus.on(events.NewSessionTask, session => {
      console.log('new session task');
      void this.redirectToTasks({ task: session.currentTask });
    });

    eventBus.on(events.ResolvedSessionTask, () => {
      console.log('resolved task');
      void this.redirectToAfterSignIn();
    });
  };

  // TODO: Be more conservative about touches. Throttle, don't touch when only one user, etc
  #touchCurrentSession = async (session?: SignedInSessionResource | null): Promise<void> => {
    if (!session || !this.#options.touchSession) {
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
    this.#aliasUser();
  };

  #getSessionFromClient = (sessionId: string | undefined): SignedInSessionResource | null => {
    return this.client?.signedInSessions.find(x => x.id === sessionId) || null;
  };

  #aliasUser = () => {
    this.user = this.session ? this.session.user : null;
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
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- The isCombinedSignInOrUpFlow() function checks for the existence of signInUrl
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
    return {
      ...defaultOptions,
      ...options,
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
      // @nikos: we're looking into dropping this param completely
      // in the meantime, we're removing it here to keep the URL clean
      removeClerkQueryParam(CLERK_SUFFIXED_COOKIES);
      removeClerkQueryParam('__clerk_handshake');
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
