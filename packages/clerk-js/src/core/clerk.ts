import type { LocalStorageBroadcastChannel } from '@clerk/shared';
import {
  inClientSide,
  isLegacyFrontendApiKey,
  isValidBrowserOnline,
  isValidProxyUrl,
  noop,
  parsePublishableKey,
  proxyUrlToAbsoluteURL,
  stripScheme,
} from '@clerk/shared';
import type {
  ActiveSessionResource,
  AuthenticateWithMetamaskParams,
  BeforeEmitCallback,
  Clerk as ClerkInterface,
  ClerkOptions,
  ClientResource,
  CreateOrganizationParams,
  CreateOrganizationProps,
  EnvironmentJSON,
  EnvironmentResource,
  HandleMagicLinkVerificationParams,
  HandleOAuthCallbackParams,
  InstanceType,
  ListenerCallback,
  OrganizationInvitationResource,
  OrganizationMembershipResource,
  OrganizationProfileProps,
  OrganizationResource,
  OrganizationSwitcherProps,
  PublishableKey,
  RedirectOptions,
  Resources,
  SetActiveParams,
  SignInProps,
  SignInResource,
  SignOut,
  SignOutCallback,
  SignOutOptions,
  SignUpProps,
  SignUpResource,
  UnsubscribeCallback,
  UserButtonProps,
  UserProfileProps,
  UserResource,
} from '@clerk/types';

import packageJSON from '../../package.json';
import type { ComponentControls, MountComponentRenderer } from '../ui';
import {
  appendAsQueryParams,
  buildURL,
  createBeforeUnloadTracker,
  createCookieHandler,
  createPageLifecycle,
  errorThrower,
  getClerkQueryParam,
  hasExternalAccountSignUpError,
  ignoreEventValue,
  inActiveBrowserTab,
  inBrowser,
  isAccountsHostedPages,
  isDevOrStagingUrl,
  isError,
  noOrganizationExists,
  noUserExists,
  removeClerkQueryParam,
  sessionExistsAndSingleSessionModeEnabled,
  setSearchParameterInHash,
  stripOrigin,
  validateFrontendApi,
  windowNavigate,
} from '../utils';
import { memoizeListenerCallback } from '../utils/memoizeStateListenerCallback';
import { CLERK_SYNCED, DEV_BROWSER_SSO_JWT_PARAMETER, ERROR_CODES } from './constants';
import type { DevBrowserHandler } from './devBrowserHandler';
import createDevBrowserHandler from './devBrowserHandler';
import {
  clerkErrorInitFailed,
  clerkMissingDevBrowserJwt,
  clerkMissingProxyUrlAndDomain,
  clerkOAuthCallbackDidNotCompleteSignInSIgnUp,
} from './errors';
import { eventBus, events } from './events';
import type { FapiClient, FapiRequestCallback } from './fapiClient';
import createFapiClient from './fapiClient';
import {
  BaseResource,
  Client,
  Environment,
  MagicLinkError,
  MagicLinkErrorCode,
  Organization,
  OrganizationMembership,
} from './resources/internal';
import { AuthenticationService } from './services';
import { warnings } from './warnings';

export type ClerkCoreBroadcastChannelEvent = { type: 'signout' };

type ClerkConstructorOptions = Pick<ClerkInterface, 'proxyUrl' | 'domain'>;

declare global {
  interface Window {
    Clerk?: Clerk;
    __clerk_frontend_api?: string;
    __clerk_publishable_key?: string;
    __clerk_proxy_url?: ClerkConstructorOptions['proxyUrl'];
    __clerk_domain?: ClerkConstructorOptions['domain'];
  }
}

const defaultOptions: ClerkOptions = {
  polling: true,
  standardBrowser: true,
  touchSession: true,
  isSatellite: false,
};

export default class Clerk implements ClerkInterface {
  public static mountComponentRenderer?: MountComponentRenderer;
  public static version: string = packageJSON.version;
  public client?: ClientResource;
  public session?: ActiveSessionResource | null;
  public organization?: OrganizationResource | null;
  public user?: UserResource | null;
  public readonly frontendApi: string;
  public readonly publishableKey?: string;
  public readonly proxyUrl?: ClerkConstructorOptions['proxyUrl'];
  public readonly domain?: ClerkConstructorOptions['domain'];

  #authService: AuthenticationService | null = null;
  #broadcastChannel: LocalStorageBroadcastChannel<ClerkCoreBroadcastChannelEvent> | null = null;
  #componentControls?: ComponentControls | null;
  #devBrowserHandler: DevBrowserHandler | null = null;
  #environment?: EnvironmentResource | null;
  #fapiClient: FapiClient;
  #instanceType: InstanceType;
  #isReady = false;
  #lastOrganizationInvitation: OrganizationInvitationResource | null = null;
  #lastOrganizationMember: OrganizationMembershipResource | null = null;
  #listeners: Array<(emission: Resources) => void> = [];
  #options: ClerkOptions = {};
  #pageLifecycle: ReturnType<typeof createPageLifecycle> | null = null;

  get version(): string {
    return Clerk.version;
  }

  get loaded(): boolean {
    return this.#isReady;
  }

  get isSatellite(): boolean {
    if (typeof this.#options.isSatellite === 'function') {
      return this.#options.isSatellite(new URL(window.location.href));
    }
    return this.#options.isSatellite || false;
  }

  public constructor(key: string, options?: unknown) {
    key = (key || '').trim();

    const _unfilteredProxy = (options as ClerkConstructorOptions | undefined)?.proxyUrl;

    if (!isValidProxyUrl(_unfilteredProxy)) {
      errorThrower.throwInvalidProxyUrl({ url: _unfilteredProxy });
    }
    this.proxyUrl = proxyUrlToAbsoluteURL(_unfilteredProxy);

    this.domain = (options as ClerkConstructorOptions | undefined)?.domain;

    if (isLegacyFrontendApiKey(key)) {
      if (!validateFrontendApi(key)) {
        errorThrower.throwInvalidFrontendApiError({ key });
      }

      this.frontendApi = key;
      this.#instanceType = isDevOrStagingUrl(this.frontendApi) ? 'development' : 'production';
    } else {
      const publishableKey = parsePublishableKey(key);

      if (!publishableKey) {
        errorThrower.throwInvalidPublishableKeyError({ key });
      }

      const { frontendApi, instanceType } = publishableKey as PublishableKey;

      this.frontendApi = frontendApi;
      this.#instanceType = instanceType;
    }
    this.#fapiClient = createFapiClient(this);
    BaseResource.clerk = this;
  }

  public getFapiClient = (): FapiClient => this.#fapiClient;

  public isReady = (): boolean => this.#isReady;

  public load = async (options?: Omit<ClerkOptions, 'isSatellite'>): Promise<void> => {
    if (this.#isReady) {
      return;
    }

    this.#options = {
      ...defaultOptions,
      ...options,
    };

    if (this.#options.standardBrowser) {
      this.#isReady = await this.#loadInStandardBrowser();
    } else {
      this.#isReady = await this.#loadInNonStandardBrowser();
    }
  };

  public signOut: SignOut = async (callbackOrOptions?: SignOutCallback | SignOutOptions, options?: SignOutOptions) => {
    if (!this.client || this.client.sessions.length === 0) {
      return;
    }
    const cb = typeof callbackOrOptions === 'function' ? callbackOrOptions : undefined;
    const opts = callbackOrOptions && typeof callbackOrOptions === 'object' ? callbackOrOptions : options || {};

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

  public openSignIn = (props?: SignInProps): void => {
    this.assertComponentsReady(this.#componentControls);
    if (sessionExistsAndSingleSessionModeEnabled(this, this.#environment) && this.#instanceType === 'development') {
      return console.info(warnings.cannotOpenSignUpOrSignUp);
    }
    this.#componentControls?.openModal('signIn', props || {});
  };

  public closeSignIn = (): void => {
    this.assertComponentsReady(this.#componentControls);
    this.#componentControls?.closeModal('signIn');
  };

  public openSignUp = (props?: SignInProps): void => {
    this.assertComponentsReady(this.#componentControls);
    if (sessionExistsAndSingleSessionModeEnabled(this, this.#environment) && this.#instanceType === 'development') {
      return console.info(warnings.cannotOpenSignUpOrSignUp);
    }
    this.#componentControls?.openModal('signUp', props || {});
  };

  public closeSignUp = (): void => {
    this.assertComponentsReady(this.#componentControls);
    this.#componentControls?.closeModal('signUp');
  };

  public openUserProfile = (props?: UserProfileProps): void => {
    this.assertComponentsReady(this.#componentControls);
    if (noUserExists(this) && this.#instanceType === 'development') {
      return console.info(warnings.cannotOpenUserProfile);
    }
    this.#componentControls?.openModal('userProfile', props || {});
  };

  public closeUserProfile = (): void => {
    this.assertComponentsReady(this.#componentControls);
    this.#componentControls?.closeModal('userProfile');
  };

  public openOrganizationProfile = (props?: OrganizationProfileProps): void => {
    this.assertComponentsReady(this.#componentControls);
    if (noOrganizationExists(this) && this.#instanceType === 'development') {
      return console.info(warnings.cannotOpenOrgProfile);
    }
    this.#componentControls?.openModal('organizationProfile', props || {});
  };

  public closeOrganizationProfile = (): void => {
    this.assertComponentsReady(this.#componentControls);
    this.#componentControls?.closeModal('organizationProfile');
  };

  public openCreateOrganization = (props?: CreateOrganizationProps): void => {
    this.assertComponentsReady(this.#componentControls);
    this.#componentControls?.openModal('createOrganization', props || {});
  };

  public closeCreateOrganization = (): void => {
    this.assertComponentsReady(this.#componentControls);
    this.#componentControls?.closeModal('createOrganization');
  };

  public mountSignIn = (node: HTMLDivElement, props?: SignInProps): void => {
    this.assertComponentsReady(this.#componentControls);
    this.#componentControls.mountComponent({
      name: 'SignIn',
      appearanceKey: 'signIn',
      node,
      props,
    });
  };

  public unmountSignIn = (node: HTMLDivElement): void => {
    this.assertComponentsReady(this.#componentControls);
    this.#componentControls.unmountComponent({
      node,
    });
  };

  public mountSignUp = (node: HTMLDivElement, props?: SignUpProps): void => {
    this.assertComponentsReady(this.#componentControls);
    this.#componentControls.mountComponent({
      name: 'SignUp',
      appearanceKey: 'signUp',
      node,
      props,
    });
  };

  public unmountSignUp = (node: HTMLDivElement): void => {
    this.assertComponentsReady(this.#componentControls);
    this.#componentControls.unmountComponent({
      node,
    });
  };

  public mountUserProfile = (node: HTMLDivElement, props?: UserProfileProps): void => {
    this.assertComponentsReady(this.#componentControls);
    this.#componentControls.mountComponent({
      name: 'UserProfile',
      appearanceKey: 'userProfile',
      node,
      props,
    });
  };

  public unmountUserProfile = (node: HTMLDivElement): void => {
    this.assertComponentsReady(this.#componentControls);
    this.#componentControls.unmountComponent({
      node,
    });
  };

  public mountOrganizationProfile = (node: HTMLDivElement, props?: OrganizationProfileProps): void => {
    this.assertComponentsReady(this.#componentControls);
    this.#componentControls.mountComponent({
      name: 'OrganizationProfile',
      appearanceKey: 'userProfile',
      node,
      props,
    });
  };

  public unmountOrganizationProfile = (node: HTMLDivElement): void => {
    this.assertComponentsReady(this.#componentControls);
    this.#componentControls.unmountComponent({
      node,
    });
  };

  public mountCreateOrganization = (node: HTMLDivElement, props?: CreateOrganizationProps): void => {
    this.assertComponentsReady(this.#componentControls);
    this.#componentControls.mountComponent({
      name: 'CreateOrganization',
      appearanceKey: 'createOrganization',
      node,
      props,
    });
  };

  public unmountCreateOrganization = (node: HTMLDivElement): void => {
    this.assertComponentsReady(this.#componentControls);
    this.#componentControls.unmountComponent({
      node,
    });
  };

  public mountOrganizationSwitcher = (node: HTMLDivElement, props?: OrganizationSwitcherProps): void => {
    this.assertComponentsReady(this.#componentControls);
    this.#componentControls.mountComponent({
      name: 'OrganizationSwitcher',
      appearanceKey: 'organizationSwitcher',
      node,
      props,
    });
  };

  public unmountOrganizationSwitcher = (node: HTMLDivElement): void => {
    this.assertComponentsReady(this.#componentControls);
    this.#componentControls.unmountComponent({
      node,
    });
  };

  public mountUserButton = (node: HTMLDivElement, props?: UserButtonProps): void => {
    this.assertComponentsReady(this.#componentControls);
    this.#componentControls.mountComponent({
      name: 'UserButton',
      appearanceKey: 'userButton',
      node,
      props,
    });
  };

  public unmountUserButton = (node: HTMLDivElement): void => {
    this.assertComponentsReady(this.#componentControls);
    this.#componentControls.unmountComponent({
      node,
    });
  };

  /**
   * `setActive` can be used to set the active session and/or organization.
   * It will eventually replace `setSession`.
   *
   * @experimental
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

    type SetActiveHook = () => void;
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
    // or `null`.
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
    }

    onBeforeSetActive();

    //1. setLastActiveSession to passed user session (add a param).
    //   Note that this will also update the session's active organization
    //   id.
    if (inActiveBrowserTab()) {
      await this.#touchLastActiveSession(newSession);
      // reload session from updated client
      newSession = this.#getSessionFromClient(newSession?.id);
    }

    this.#authService?.setAuthCookiesFromSession(newSession);

    //2. If there's a beforeEmit, typically we're navigating.  Emit the session as
    //   undefined, then wait for beforeEmit to complete before emitting the new session.
    //   When undefined, neither SignedIn nor SignedOut renders, which avoids flickers or
    //   automatic reloading when reloading shouldn't be happening.
    const beforeUnloadTracker = createBeforeUnloadTracker();
    if (beforeEmit) {
      beforeUnloadTracker.startTracking();
      this.#setTransitiveState();
      await beforeEmit(newSession);
      beforeUnloadTracker.stopTracking();
    }

    //3. Check if hard reloading (onbeforeunload).  If not, set the user/session and emit
    if (beforeUnloadTracker.isUnloading()) {
      return;
    }

    this.#setAccessors(newSession);
    this.#emit();
    onAfterSetActive();
    this.#resetComponentsState();
  };

  public setSession = async (
    session: ActiveSessionResource | string | null,
    beforeEmit?: BeforeEmitCallback,
  ): Promise<void> => {
    return this.setActive({ session, beforeEmit });
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
        lastOrganizationInvitation: this.#lastOrganizationInvitation,
        lastOrganizationMember: this.#lastOrganizationMember,
      });
    }

    const unsubscribe = () => {
      this.#listeners = this.#listeners.filter(l => l !== listener);
    };
    return unsubscribe;
  };

  public navigate = async (to: string | undefined): Promise<unknown> => {
    if (!to) {
      return;
    }

    const toURL = new URL(to, window.location.href);
    const customNavigate = this.#options.navigate;

    if (toURL.origin !== window.location.origin || !customNavigate) {
      windowNavigate(toURL);
      return;
    }

    // React router only wants the path, search or hash portion.
    return await customNavigate(stripOrigin(toURL));
  };

  public buildUrlWithAuth(to: string): string {
    if (this.#instanceType === 'production' || !this.#devBrowserHandler?.usesUrlBasedSessionSync()) {
      return to;
    }

    const toURL = new URL(to, window.location.href);

    if (toURL.origin !== window.location.origin) {
      const devBrowserJwt = this.#devBrowserHandler?.getDevBrowserJWT();
      if (!devBrowserJwt) {
        return clerkMissingDevBrowserJwt();
      }

      toURL.hash = setSearchParameterInHash({
        hash: toURL.hash,
        paramName: DEV_BROWSER_SSO_JWT_PARAMETER,
        paramValue: devBrowserJwt,
      });
    }

    return toURL.href;
  }

  public buildSignInUrl(options?: RedirectOptions): string {
    const opts: RedirectOptions = {
      ...options,
      redirectUrl: options?.redirectUrl || window.location.href,
    };
    if (!this.#environment || !this.#environment.displayConfig) {
      return '';
    }
    const { signInUrl } = this.#environment.displayConfig;
    return this.buildUrlWithAuth(appendAsQueryParams(signInUrl, opts));
  }

  public buildSignUpUrl(options?: RedirectOptions): string {
    const opts: RedirectOptions = {
      ...options,
      redirectUrl: options?.redirectUrl || window.location.href,
    };
    if (!this.#environment || !this.#environment.displayConfig) {
      return '';
    }
    const { signUpUrl } = this.#environment.displayConfig;
    return this.buildUrlWithAuth(appendAsQueryParams(signUpUrl, opts));
  }

  public buildUserProfileUrl(): string {
    if (!this.#environment || !this.#environment.displayConfig) {
      return '';
    }
    return this.buildUrlWithAuth(this.#environment.displayConfig.userProfileUrl);
  }

  public buildHomeUrl(): string {
    if (!this.#environment || !this.#environment.displayConfig) {
      return '';
    }
    return this.buildUrlWithAuth(this.#environment.displayConfig.homeUrl);
  }

  public buildCreateOrganizationUrl(): string {
    if (!this.#environment || !this.#environment.displayConfig) {
      return '';
    }
    return this.buildUrlWithAuth(this.#environment.displayConfig.createOrganizationUrl);
  }

  public buildOrganizationProfileUrl(): string {
    if (!this.#environment || !this.#environment.displayConfig) {
      return '';
    }
    return this.buildUrlWithAuth(this.#environment.displayConfig.organizationProfileUrl);
  }

  public redirectWithAuth = async (to: string): Promise<unknown> => {
    if (inBrowser()) {
      return this.navigate(this.buildUrlWithAuth(to));
    }
  };

  public redirectToSignIn = async (options?: RedirectOptions): Promise<unknown> => {
    if (inBrowser()) {
      return this.navigate(this.buildSignInUrl(options));
    }
  };

  public redirectToSignUp = async (options?: RedirectOptions): Promise<unknown> => {
    if (inBrowser()) {
      return this.navigate(this.buildSignUpUrl(options));
    }
  };

  public redirectToUserProfile = async (): Promise<unknown> => {
    if (inBrowser()) {
      return this.navigate(this.buildUserProfileUrl());
    }
  };

  public redirectToCreateOrganization = async (): Promise<unknown> => {
    if (inBrowser()) {
      return this.navigate(this.buildCreateOrganizationUrl());
    }
  };

  public redirectToOrganizationProfile = async (): Promise<unknown> => {
    if (inBrowser()) {
      return this.navigate(this.buildOrganizationProfileUrl());
    }
  };

  public redirectToHome = async (): Promise<unknown> => {
    if (inBrowser()) {
      return this.navigate(this.buildHomeUrl());
    }
  };

  public handleMagicLinkVerification = async (
    params: HandleMagicLinkVerificationParams,
    customNavigate?: (to: string) => Promise<unknown>,
  ): Promise<unknown> => {
    if (!this.client) {
      return;
    }

    const verificationStatus = getClerkQueryParam('__clerk_status');
    if (verificationStatus === 'expired') {
      throw new MagicLinkError(MagicLinkErrorCode.Expired);
    } else if (verificationStatus !== 'verified') {
      throw new MagicLinkError(MagicLinkErrorCode.Failed);
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

  public handleRedirectCallback = async (
    params: HandleOAuthCallbackParams = {},
    customNavigate?: (to: string) => Promise<unknown>,
  ): Promise<unknown> => {
    if (!this.isReady || !this.#environment || !this.client) {
      return;
    }
    const { signIn, signUp } = this.client;
    const { displayConfig } = this.#environment;
    const { firstFactorVerification } = signIn;
    const { externalAccount } = signUp.verifications;
    const su = {
      status: signUp.status,
      externalAccountStatus: externalAccount.status,
      externalAccountErrorCode: externalAccount.error?.code,
      externalAccountSessionId: externalAccount.error?.meta?.sessionId,
    };

    const si = {
      status: signIn.status,
      firstFactorVerificationStatus: firstFactorVerification.status,
      firstFactorVerificationErrorCode: firstFactorVerification.error?.code,
      firstFactorVerificationSessionId: firstFactorVerification.error?.meta?.sessionId,
    };

    const navigate = (to: string) =>
      customNavigate && typeof customNavigate === 'function' ? customNavigate(to) : this.navigate(to);

    const makeNavigate = (to: string) => () => navigate(to);

    const navigateToSignIn = makeNavigate(displayConfig.signInUrl);

    const navigateToSignUp = makeNavigate(displayConfig.signUpUrl);

    const navigateToFactorTwo = makeNavigate(
      params.secondFactorUrl ||
        buildURL({ base: displayConfig.signInUrl, hashPath: '/factor-two' }, { stringify: true }),
    );

    const navigateAfterSignIn = makeNavigate(
      params.afterSignInUrl || params.redirectUrl || displayConfig.afterSignInUrl,
    );

    const navigateAfterSignUp = makeNavigate(
      params.afterSignUpUrl || params.redirectUrl || displayConfig.afterSignUpUrl,
    );

    const navigateToContinueSignUp = makeNavigate(
      params.continueSignUpUrl ||
        buildURL({ base: displayConfig.signUpUrl, hashPath: '/continue' }, { stringify: true }),
    );

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
        case 'needs_second_factor':
          return navigateToFactorTwo();
        default:
          clerkOAuthCallbackDidNotCompleteSignInSIgnUp('sign in');
      }
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
          return navigateToContinueSignUp();
        default:
          clerkOAuthCallbackDidNotCompleteSignInSIgnUp('sign in');
      }
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
      return navigateToContinueSignUp();
    }

    return navigateToSignIn();
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

  public authenticateWithMetamask = async ({
    redirectUrl,
    signUpContinueUrl,
    customNavigate,
  }: AuthenticateWithMetamaskParams = {}): Promise<void> => {
    if (!this.client || !this.#environment) {
      return;
    }

    const navigate = (to: string) =>
      customNavigate && typeof customNavigate === 'function' ? customNavigate(to) : this.navigate(to);

    let signInOrSignUp: SignInResource | SignUpResource;
    try {
      signInOrSignUp = await this.client.signIn.authenticateWithMetamask();
    } catch (err) {
      if (isError(err, ERROR_CODES.FORM_IDENTIFIER_NOT_FOUND)) {
        signInOrSignUp = await this.client.signUp.authenticateWithMetamask();

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

  public getOrganizationMemberships = async (): Promise<OrganizationMembership[]> => {
    return await OrganizationMembership.retrieve();
  };

  public getOrganization = async (organizationId: string): Promise<Organization | undefined> => {
    return (await OrganizationMembership.retrieve()).find(orgMem => orgMem.organization.id === organizationId)
      ?.organization;
  };

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

  __unstable__invitationUpdate(invitation: OrganizationInvitationResource) {
    this.#lastOrganizationInvitation = invitation;
    this.#emit();
  }

  __unstable__membershipUpdate(membership: OrganizationMembershipResource) {
    this.#lastOrganizationMember = membership;
    this.#emit();
  }

  get __unstable__environment(): EnvironmentResource | null | undefined {
    return this.#environment;
  }

  __unstable__setEnvironment = async (env: EnvironmentJSON) => {
    this.#environment = new Environment(env);

    if (Clerk.mountComponentRenderer) {
      this.#componentControls = await Clerk.mountComponentRenderer(this, this.#environment, this.#options);
    }
  };

  __unstable__onBeforeRequest = (callback: FapiRequestCallback<any>): void => {
    this.#fapiClient.onBeforeRequest(callback);
  };

  __unstable__onAfterResponse = (callback: FapiRequestCallback<any>): void => {
    this.#fapiClient.onAfterResponse(callback);
  };

  __unstable__updateProps = (props: any): void => {
    // The expect-error directive below is safe since `updateAppearanceProp` is only used
    // in the v4 build. This will be removed when v4 becomes the main stable version
    this.#componentControls?.updateProps(props);
  };

  #hasJustSynced = () => getClerkQueryParam(CLERK_SYNCED) === 'true';

  #clearJustSynced = () => removeClerkQueryParam(CLERK_SYNCED);

  #buildPrimarySyncUrl = (): string => {
    let primarySyncUrl;

    if (this.proxyUrl) {
      const proxy = new URL(this.proxyUrl);
      primarySyncUrl = new URL(`${proxy.pathname}/v1/client/sync`, proxy.origin);
    } else if (this.domain) {
      primarySyncUrl = new URL(`/v1/client/sync`, `https://${stripScheme(this.domain)}`);
    } else {
      clerkMissingProxyUrlAndDomain();
    }

    primarySyncUrl?.searchParams.append('redirect_url', window.location.href);

    return primarySyncUrl?.toString() || '';
  };

  #shouldSyncWithPrimary = (): boolean => {
    if (!this.isSatellite) {
      return false;
    }

    if (this.#hasJustSynced()) {
      this.#clearJustSynced();
      return false;
    }

    const cookieHandler = createCookieHandler();
    return cookieHandler.getClientUatCookie() <= 0;
  };

  #syncWithPrimary = async () => {
    await this.navigate(this.#buildPrimarySyncUrl());
  };

  #loadInStandardBrowser = async (): Promise<boolean> => {
    if (this.#shouldSyncWithPrimary()) {
      await this.#syncWithPrimary();
      // ClerkJS is not considered loaded during the sync/link process with the primary domain
      return false;
    }

    this.#authService = new AuthenticationService(this);
    this.#pageLifecycle = createPageLifecycle();

    this.#devBrowserHandler = createDevBrowserHandler({
      frontendApi: this.frontendApi,
      fapiClient: this.#fapiClient,
    });

    this.#pageLifecycle = createPageLifecycle();

    const isInAccountsHostedPages = isAccountsHostedPages(window?.location.hostname);

    if (this.#instanceType === 'production') {
      await this.#devBrowserHandler.clear();
    } else {
      await this.#devBrowserHandler.setup();
    }

    this.#setupListeners();

    let retries = 0;
    while (retries < 2) {
      retries++;

      try {
        const shouldTouchEnv = this.#instanceType === 'development' && !isInAccountsHostedPages;

        const [environment, client] = await Promise.all([
          Environment.getInstance().fetch({ touch: shouldTouchEnv }),
          Client.getInstance().fetch(),
        ]);

        this.#environment = environment;
        this.updateClient(client);

        this.#authService.initAuth({
          enablePolling: this.#options.polling,
          environment: this.#environment,
        });

        if (Clerk.mountComponentRenderer) {
          this.#componentControls = await Clerk.mountComponentRenderer(this, this.#environment, this.#options);
        }

        break;
      } catch (err) {
        if (isError(err, 'dev_browser_unauthenticated')) {
          // Purge and try setup again
          await this.#devBrowserHandler.clear();
          await this.#devBrowserHandler.setup();
        } else if (!isValidBrowserOnline()) {
          console.warn(err);
          break;
        } else {
          throw err;
        }
      }

      if (retries >= 2) {
        clerkErrorInitFailed();
      }
    }

    return true;
  };

  #loadInNonStandardBrowser = async (): Promise<boolean> => {
    const [environment, client] = await Promise.all([
      Environment.getInstance().fetch({ touch: false }),
      Client.getInstance().fetch(),
    ]);

    this.#environment = environment;
    this.updateClient(client);

    // TODO: Add an auth service also for non standard browsers that will poll for the __session JWT but won't use cookies

    if (Clerk.mountComponentRenderer) {
      this.#componentControls = await Clerk.mountComponentRenderer(this, this.#environment, this.#options);
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
        void this.handleUnauthenticated({ broadcast: false });
      }
    });

    // set cookie on token update
    eventBus.on(events.TokenUpdate, ({ token }) => {
      this.#authService?.setAuthCookiesFromToken(token?.getRawString());
    });
  };

  // TODO: Be more conservative about touches. Throttle, don't touch when only one user, etc
  #touchLastActiveSession = async (session: ActiveSessionResource | null): Promise<void> => {
    if (!session || !this.#options.touchSession) {
      return Promise.resolve();
    }
    await session.touch().catch(noop);
  };

  #emit = (): void => {
    if (this.client) {
      for (const listener of this.#listeners) {
        listener({
          client: this.client,
          session: this.session,
          user: this.user,
          organization: this.organization,
          lastOrganizationInvitation: this.#lastOrganizationInvitation,
          lastOrganizationMember: this.#lastOrganizationMember,
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

  assertComponentsReady(components: ComponentControls | null | undefined): asserts components is ComponentControls {
    if (!Clerk.mountComponentRenderer) {
      throw new Error('ClerkJS was loaded without UI components.');
    }
    if (!components) {
      throw new Error('ClerkJS components are not ready yet.');
    }
  }
}
