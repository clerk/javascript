import {
  addClerkPrefix,
  ClerkRuntimeError,
  handleValueOrFn,
  inBrowser as inClientSide,
  is4xxError,
  isClerkAPIResponseError,
  isHttpOrHttps,
  isValidBrowserOnline,
  isValidProxyUrl,
  LocalStorageBroadcastChannel,
  noop,
  parsePublishableKey,
  proxyUrlToAbsoluteURL,
  stripScheme,
} from '@clerk/shared';
import { eventPrebuiltComponentMounted, TelemetryCollector } from '@clerk/shared/telemetry';
import type {
  ActiveSessionResource,
  AuthenticateWithGoogleOneTapParams,
  AuthenticateWithMetamaskParams,
  Clerk as ClerkInterface,
  ClerkAPIError,
  ClerkOptions,
  ClientResource,
  CreateOrganizationParams,
  CreateOrganizationProps,
  DomainOrProxyUrl,
  EnvironmentJSON,
  EnvironmentResource,
  GoogleOneTapProps,
  HandleEmailLinkVerificationParams,
  HandleOAuthCallbackParams,
  InstanceType,
  ListenerCallback,
  NavigateOptions,
  OrganizationListProps,
  OrganizationProfileProps,
  OrganizationResource,
  OrganizationSwitcherProps,
  RedirectOptions,
  Resources,
  SDKMetadata,
  SetActiveParams,
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
} from '@clerk/types';

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
  getClerkQueryParam,
  hasExternalAccountSignUpError,
  ignoreEventValue,
  inActiveBrowserTab,
  inBrowser,
  isDevAccountPortalOrigin,
  isError,
  isRedirectForFAPIInitiatedFlow,
  noOrganizationExists,
  noUserExists,
  removeClerkQueryParam,
  requiresUserInput,
  sessionExistsAndSingleSessionModeEnabled,
  stripOrigin,
  windowNavigate,
} from '../utils';
import { assertNoLegacyProp } from '../utils/assertNoLegacyProp';
import { memoizeListenerCallback } from '../utils/memoizeStateListenerCallback';
import { RedirectUrls } from '../utils/redirectUrls';
import { AuthCookieService } from './auth/AuthCookieService';
import { CLERK_SATELLITE_URL, CLERK_SYNCED, ERROR_CODES } from './constants';
import {
  clerkErrorInitFailed,
  clerkInvalidSignInUrlFormat,
  clerkInvalidSignInUrlOrigin,
  clerkMissingProxyUrlAndDomain,
  clerkMissingSignInUrlAsSatellite,
  clerkOAuthCallbackDidNotCompleteSignInSignUp,
  clerkRedirectUrlIsMissingScheme,
} from './errors';
import { eventBus, events } from './events';
import type { FapiClient, FapiRequestCallback } from './fapiClient';
import { createFapiClient } from './fapiClient';
import {
  BaseResource,
  Client,
  EmailLinkError,
  EmailLinkErrorCode,
  Environment,
  Organization,
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
  public session: ActiveSessionResource | null | undefined;
  public organization: OrganizationResource | null | undefined;
  public user: UserResource | null | undefined;
  public __internal_country?: string | null;
  public telemetry: TelemetryCollector | undefined;

  protected internal_last_error: ClerkAPIError | null = null;
  // converted to protected environment to support `updateEnvironment` type assertion
  protected environment?: EnvironmentResource | null;

  #publishableKey: string = '';
  #domain: DomainOrProxyUrl['domain'];
  #proxyUrl: DomainOrProxyUrl['proxyUrl'];
  #authService?: AuthCookieService;
  #broadcastChannel: LocalStorageBroadcastChannel<ClerkCoreBroadcastChannelEvent> | null = null;
  #componentControls?: ReturnType<MountComponentRenderer> | null;
  //@ts-expect-error with being undefined even though it's not possible - related to issue with ts and error thrower
  #fapiClient: FapiClient;
  #instanceType?: InstanceType;
  #loaded = false;

  #listeners: Array<(emission: Resources) => void> = [];
  #options: ClerkOptions = {};
  #pageLifecycle: ReturnType<typeof createPageLifecycle> | null = null;

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
      return errorThrower.throwInvalidPublishableKeyError({ key: this.publishableKey });
    }

    return publishableKey.frontendApi;
  }

  get instanceType() {
    return this.#instanceType;
  }

  get isStandardBrowser(): boolean {
    return this.#options.standardBrowser || false;
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

    this.#fapiClient = createFapiClient(this);
    // This line is used for the piggy-backing mechanism
    BaseResource.clerk = this;
  }

  public getFapiClient = (): FapiClient => this.#fapiClient;

  public load = async (options?: ClerkOptions): Promise<void> => {
    if (this.loaded) {
      return;
    }

    this.#options = {
      ...defaultOptions,
      ...options,
    };

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

    this.#options.allowedRedirectOrigins = createAllowedRedirectOrigins(
      this.#options.allowedRedirectOrigins,
      this.frontendApi,
    );

    if (this.#options.standardBrowser) {
      this.#loaded = await this.#loadInStandardBrowser();
    } else {
      this.#loaded = await this.#loadInNonStandardBrowser();
    }
  };

  public signOut: SignOut = async (callbackOrOptions?: SignOutCallback | SignOutOptions, options?: SignOutOptions) => {
    if (!this.client || this.client.sessions.length === 0) {
      return;
    }
    const opts = callbackOrOptions && typeof callbackOrOptions === 'object' ? callbackOrOptions : options || {};

    const redirectUrl = opts?.redirectUrl || this.buildAfterSignOutUrl();
    const defaultCb = () => this.navigate(redirectUrl);
    const cb = typeof callbackOrOptions === 'function' ? callbackOrOptions : defaultCb;

    if (!opts.sessionId || this.client.activeSessions.length === 1) {
      await this.client.destroy();
      return this.setActive({
        session: null,
        beforeEmit: ignoreEventValue(cb),
      });
    }

    const session = this.client.activeSessions.find(s => s.id === opts.sessionId);
    const shouldSignOutCurrent = session?.id && this.session?.id === session.id;
    await session?.remove();
    if (shouldSignOutCurrent) {
      return this.setActive({
        session: null,
        beforeEmit: ignoreEventValue(cb),
      });
    }
  };

  public openGoogleOneTap = (props?: GoogleOneTapProps): void => {
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
    if (sessionExistsAndSingleSessionModeEnabled(this, this.environment)) {
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

  public openSignUp = (props?: SignUpProps): void => {
    this.assertComponentsReady(this.#componentControls);
    if (sessionExistsAndSingleSessionModeEnabled(this, this.environment)) {
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
    this.telemetry?.record(eventPrebuiltComponentMounted('SignIn', props));
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

    this.telemetry?.record(eventPrebuiltComponentMounted('UserProfile', props));
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

    this.telemetry?.record(eventPrebuiltComponentMounted('UserButton', props));
  };

  public unmountUserButton = (node: HTMLDivElement): void => {
    this.assertComponentsReady(this.#componentControls);
    void this.#componentControls?.ensureMounted().then(controls => controls.unmountComponent({ node }));
  };

  /**
   * `setActive` can be used to set the active session and/or organization.
   */
  public setActive = async ({ session, organization, beforeEmit }: SetActiveParams): Promise<void> => {
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
      session = (this.client.sessions.find(x => x.id === session) as ActiveSessionResource) || null;
    }

    let newSession = session === undefined ? this.session : session;

    // At this point, the `session` variable should contain either an `ActiveSessionResource`
    // ,`null` or `undefined`.
    // We now want to set the last active organization id on that session (if it exists).
    // However, if the `organization` parameter is not given (i.e. `undefined`), we want
    // to keep the organization id that the session had.
    const shouldSwitchOrganization = organization !== undefined;
    if (newSession && shouldSwitchOrganization) {
      const organizationId = typeof organization === 'string' ? organization : organization?.id;
      newSession.lastActiveOrganizationId = organizationId || null;
    }

    // If this.session exists, then signOut was triggered by the current tab
    // and should emit. Other tabs should not emit the same event again
    const shouldSignOutSession = this.session && newSession === null;
    if (shouldSignOutSession) {
      this.#broadcastSignOutEvent();
      eventBus.dispatch(events.TokenUpdate, { token: null });
    }

    if (session?.lastActiveToken) {
      eventBus.dispatch(events.TokenUpdate, { token: session.lastActiveToken });
    }

    await onBeforeSetActive();

    //1. setLastActiveSession to passed user session (add a param).
    //   Note that this will also update the session's active organization
    //   id.
    if (inActiveBrowserTab() || !this.#options.standardBrowser) {
      await this.#touchLastActiveSession(newSession);
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
      beforeUnloadTracker?.startTracking();
      this.#setTransitiveState();
      await beforeEmit(newSession);
      beforeUnloadTracker?.stopTracking();
    }

    //3. Check if hard reloading (onbeforeunload).  If not, set the user/session and emit
    if (beforeUnloadTracker?.isUnloading()) {
      return;
    }

    this.#setAccessors(newSession);

    this.#emit();
    await onAfterSetActive();
    this.#resetComponentsState();
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

  public navigate = async (to: string | undefined, options?: NavigateOptions): Promise<unknown> => {
    if (!to || !inBrowser()) {
      return;
    }

    let toURL = new URL(to, window.location.href);

    if (!ALLOWED_PROTOCOLS.includes(toURL.protocol)) {
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

    if (toURL.origin !== window.location.origin || !customNavigate) {
      windowNavigate(toURL);
      return;
    }

    const metadata = options?.metadata ? { __internal_metadata: options?.metadata } : undefined;
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

  public buildAfterSignInUrl(): string {
    return this.buildUrlWithAuth(new RedirectUrls(this.#options).getAfterSignInUrl());
  }

  public buildAfterSignUpUrl(): string {
    return this.buildUrlWithAuth(new RedirectUrls(this.#options).getAfterSignUpUrl());
  }

  public buildAfterSignOutUrl(): string {
    if (!this.#options.afterSignOutUrl) {
      return '/';
    }

    return this.buildUrlWithAuth(this.#options.afterSignOutUrl);
  }

  public buildAfterMultiSessionSingleSignOutUrl(): string {
    if (!this.#options.afterMultiSessionSingleSignOutUrl) {
      return this.buildAfterSignOutUrl();
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

  public handleEmailLinkVerification = async (
    params: HandleEmailLinkVerificationParams,
    customNavigate?: (to: string) => Promise<unknown>,
  ): Promise<unknown> => {
    if (!this.client) {
      return;
    }

    const verificationStatus = getClerkQueryParam('__clerk_status');
    if (verificationStatus === 'expired') {
      throw new EmailLinkError(EmailLinkErrorCode.Expired);
    } else if (verificationStatus === 'client_mismatch') {
      throw new EmailLinkError(EmailLinkErrorCode.ClientMismatch);
    } else if (verificationStatus !== 'verified') {
      throw new EmailLinkError(EmailLinkErrorCode.Failed);
    }

    const newSessionId = getClerkQueryParam('__clerk_created_session');
    const { signIn, signUp, sessions } = this.client;

    const shouldCompleteOnThisDevice = sessions.some(s => s.id === newSessionId);
    const shouldContinueOnThisDevice =
      signIn.status === 'needs_second_factor' || signUp.status === 'missing_requirements';

    const navigate = (to: string) =>
      customNavigate && typeof customNavigate === 'function' ? customNavigate(to) : this.navigate(to);

    const redirectComplete = params.redirectUrlComplete ? () => navigate(params.redirectUrlComplete as string) : noop;
    const redirectContinue = params.redirectUrl ? () => navigate(params.redirectUrl as string) : noop;

    if (shouldCompleteOnThisDevice) {
      return this.setActive({
        session: newSessionId,
        beforeEmit: redirectComplete,
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
    const navigateAfterSignIn = makeNavigate(redirectUrls.getAfterSignInUrl());
    const navigateAfterSignUp = makeNavigate(redirectUrls.getAfterSignUpUrl());

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
          buildURL({ base: displayConfig.signUpUrl, hashPath: '/verify-email-address' }, { stringify: true }),
        verifyPhonePath:
          params.verifyPhoneNumberUrl ||
          buildURL({ base: displayConfig.signUpUrl, hashPath: '/verify-phone-number' }, { stringify: true }),
        navigate,
      });
    };

    if (si.status === 'complete') {
      return this.setActive({
        session: si.sessionId,
        beforeEmit: navigateAfterSignIn,
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
            beforeEmit: navigateAfterSignIn,
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

    const userHasUnverifiedEmail = si.status === 'needs_first_factor';

    if (userHasUnverifiedEmail) {
      return navigateToFactorOne();
    }

    const userNeedsNewPassword = si.status === 'needs_new_password';

    if (userNeedsNewPassword) {
      return navigateToResetPassword();
    }

    const userNeedsToBeCreated = si.firstFactorVerificationStatus === 'transferable';

    if (userNeedsToBeCreated) {
      const res = await signUp.create({ transfer: true });
      switch (res.status) {
        case 'complete':
          return this.setActive({
            session: res.createdSessionId,
            beforeEmit: navigateAfterSignUp,
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
        beforeEmit: navigateAfterSignUp,
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
          beforeEmit: navigateAfterSignIn,
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

  public handleUnauthenticated = async (opts = { broadcast: true }): Promise<unknown> => {
    if (!this.client || !this.session) {
      return;
    }
    const newClient = await Client.getInstance().fetch();
    this.updateClient(newClient);
    if (this.session) {
      return;
    }
    if (opts.broadcast) {
      this.#broadcastSignOutEvent();
    }
    return this.setActive({ session: null });
  };

  public authenticateWithGoogleOneTap = async (
    params: AuthenticateWithGoogleOneTapParams,
  ): Promise<SignInResource | SignUpResource> => {
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
          });
        }
        throw err;
      }) as Promise<SignInResource | SignUpResource>;
  };

  public authenticateWithMetamask = async ({
    redirectUrl,
    signUpContinueUrl,
    customNavigate,
    unsafeMetadata,
  }: AuthenticateWithMetamaskParams = {}): Promise<void> => {
    if (!this.client || !this.environment) {
      return;
    }

    const navigate = (to: string) =>
      customNavigate && typeof customNavigate === 'function' ? customNavigate(to) : this.navigate(to);

    let signInOrSignUp: SignInResource | SignUpResource;
    try {
      signInOrSignUp = await this.client.signIn.authenticateWithMetamask();
    } catch (err) {
      if (isError(err, ERROR_CODES.FORM_IDENTIFIER_NOT_FOUND)) {
        signInOrSignUp = await this.client.signUp.authenticateWithMetamask({ unsafeMetadata });

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
        beforeEmit: () => {
          if (redirectUrl) {
            return navigate(redirectUrl);
          }
          return Promise.resolve();
        },
      });
    }
  };

  public createOrganization = async ({ name, slug }: CreateOrganizationParams): Promise<OrganizationResource> => {
    return Organization.create({ name, slug });
  };

  public getOrganization = async (organizationId: string): Promise<OrganizationResource> =>
    Organization.get(organizationId);

  public updateEnvironment(environment: EnvironmentResource): asserts this is { environment: EnvironmentResource } {
    this.environment = environment;
    this.#authService?.setEnvironment(environment);
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
      this.#setAccessors(session);
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

  __unstable__updateProps = (props: any) => {
    // The expect-error directive below is safe since `updateAppearanceProp` is only used
    // in the v4 build. This will be removed when v4 becomes the main stable version
    return this.#componentControls?.ensureMounted().then(controls => controls.updateProps(props));
  };

  __internal_navigateWithError(to: string, err: ClerkAPIError) {
    this.__internal_last_error = err;
    return this.navigate(to);
  }

  #hasJustSynced = () => getClerkQueryParam(CLERK_SYNCED) === 'true';
  #clearJustSynced = () => removeClerkQueryParam(CLERK_SYNCED);

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
    if (this.#hasJustSynced()) {
      this.#clearJustSynced();
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
    this.#authService = await AuthCookieService.create(this, this.#fapiClient);

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
     * 2. Setup dev browser.
     * This is not needed for production instances hence the .clear()
     * At this point we have already attempted to pre-populate devBrowser with a fresh JWT, if Step 2 was successful this will not be overwritten.
     * For multi-domain we want to avoid retrieving a fresh JWT from FAPI, and we need to get the token as a result of multi-domain session syncing.
     */
    if (this.#instanceType === 'production') {
      this.#authService?.setupProduction();
    } else {
      await this.#authService?.setupDevelopment();
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
    this.#setupListeners();

    const isInAccountsHostedPages = isDevAccountPortalOrigin(window?.location.hostname);
    const shouldTouchEnv = this.#instanceType === 'development' && !isInAccountsHostedPages;

    let retries = 0;
    while (retries < 2) {
      retries++;

      try {
        const [environment, client] = await Promise.all([
          Environment.getInstance().fetch({ touch: shouldTouchEnv }),
          Client.getInstance().fetch(),
        ]);

        this.updateClient(client);
        // updateEnvironment should be called after updateClient
        // because authService#setEnvironment depends on clerk.session that is being
        // set in updateClient
        this.updateEnvironment(environment);

        if (await this.#redirectFAPIInitiatedFlow()) {
          return false;
        }

        if (Clerk.mountComponentRenderer) {
          this.#componentControls = Clerk.mountComponentRenderer(this, this.environment as Environment, this.#options);
        }

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

    this.#clearHandshakeFromUrl();

    this.#handleImpersonationFab();
    return true;
  };

  #loadInNonStandardBrowser = async (): Promise<boolean> => {
    const [environment, client] = await Promise.all([
      Environment.getInstance().fetch({ touch: false }),
      Client.getInstance().fetch(),
    ]);

    this.updateClient(client);
    this.updateEnvironment(environment);

    // TODO: Add an auth service also for non standard browsers that will poll for the __session JWT but won't use cookies

    if (Clerk.mountComponentRenderer) {
      this.#componentControls = Clerk.mountComponentRenderer(this, this.environment, this.#options);
    }

    return true;
  };

  #defaultSession = (client: ClientResource): ActiveSessionResource | null => {
    if (client.lastActiveSessionId) {
      const lastActiveSession = client.activeSessions.find(s => s.id === client.lastActiveSessionId);
      if (lastActiveSession) {
        return lastActiveSession;
      }
    }
    const session = client.activeSessions[0];
    return session || null;
  };

  #setupListeners = (): void => {
    if (!inClientSide()) {
      return;
    }

    this.#pageLifecycle?.onPageVisible(() => {
      if (this.session) {
        void this.#touchLastActiveSession(this.session);
      }
    });

    this.#broadcastChannel?.addEventListener('message', ({ data }) => {
      if (data.type === 'signout') {
        void this.handleUnauthenticated();
      }
    });
  };

  // TODO: Be more conservative about touches. Throttle, don't touch when only one user, etc
  #touchLastActiveSession = async (session?: ActiveSessionResource | null): Promise<void> => {
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

  #broadcastSignOutEvent = () => {
    this.#broadcastChannel?.postMessage({ type: 'signout' });
  };

  #resetComponentsState = () => {
    if (Clerk.mountComponentRenderer) {
      this.closeSignUp();
      this.closeSignIn();
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

  #setAccessors = (session?: ActiveSessionResource | null) => {
    this.session = session || null;
    this.organization = this.#getLastActiveOrganizationFromSession();
    this.#aliasUser();
  };

  #getSessionFromClient = (sessionId: string | undefined): ActiveSessionResource | null => {
    return this.client?.activeSessions.find(x => x.id === sessionId) || null;
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

  #buildUrl = (
    key: 'signInUrl' | 'signUpUrl',
    options: RedirectOptions,
    _initValues?: Record<string, string>,
  ): string => {
    if (!key || !this.loaded || !this.environment || !this.environment.displayConfig) {
      return '';
    }
    const signInOrUpUrl = this.#options[key] || this.environment.displayConfig[key];
    const redirectUrls = new RedirectUrls(this.#options, options).toSearchParams();
    const initValues = new URLSearchParams(_initValues || {});
    const url = buildURL({ base: signInOrUpUrl, hashSearchParams: [initValues, redirectUrls] }, { stringify: true });
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

  /**
   * The handshake payload is transported in the URL in development. In cases where FAPI is returning the handshake payload, but Clerk is being used in a client-only application,
   * we remove the handshake associated parameters as they are not necessary.
   */
  #clearHandshakeFromUrl = () => {
    try {
      removeClerkQueryParam('__clerk_handshake');
      removeClerkQueryParam('__clerk_help');
    } catch (_) {
      // ignore
    }
  };
}
