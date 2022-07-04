import { LocalStorageBroadcastChannel } from '@clerk/shared/utils/localStorageBroadcastChannel';
import { noop } from '@clerk/shared/utils/noop';
import { inClientSide } from '@clerk/shared/utils/ssr';
import type {
  ActiveSessionResource,
  AuthenticateWithMetamaskParams,
  BeforeEmitCallback,
  Clerk as ClerkInterface,
  ClerkOptions,
  ClientResource,
  CreateOrganizationParams,
  EnvironmentResource,
  HandleMagicLinkVerificationParams,
  HandleOAuthCallbackParams,
  ListenerCallback,
  OrganizationInvitationResource,
  OrganizationMembershipResource,
  OrganizationResource,
  RedirectOptions,
  Resources,
  SignInProps,
  SignInResource,
  SignOut,
  SignOutCallback,
  SignUpProps,
  SignUpResource,
  UnsubscribeCallback,
  UserButtonProps,
  UserProfileProps,
  UserResource,
} from '@clerk/types';
import { SetActiveParams, SignOutOptions } from '@clerk/types/src';

import packageJSON from '../../package.json';
import {
  appendAsQueryParams,
  buildURL,
  createBeforeUnloadTracker,
  createPageLifecycle,
  getClerkQueryParam,
  hasExternalAccountSignUpError,
  ignoreEventValue,
  isAccountsHostedPages,
  isDevOrStagingUrl,
  isError,
  isReactNative,
  stripOrigin,
  validateFrontendApi,
  windowNavigate,
} from '../utils';
import { memoizeListenerCallback } from '../utils/memoizeStateListenerCallback';
import type { ComponentControls, MountComponentRenderer } from '../v4';
import { ERROR_CODES } from './constants';
import createDevBrowserHandler, { DevBrowserHandler } from './devBrowserHandler';
import {
  clerkErrorInitFailed,
  clerkErrorInvalidFrontendApi,
  clerkErrorNoFrontendApi,
  clerkOAuthCallbackDidNotCompleteSignInSIgnUp,
} from './errors';
import createFapiClient, { FapiClient, FapiRequestCallback } from './fapiClient';
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

export type ClerkCoreBroadcastChannelEvent = { type: 'signout' };

declare global {
  interface Window {
    Clerk?: Clerk;
  }
}

const defaultOptions: ClerkOptions & { polling: boolean } = { polling: true };

export default class Clerk implements ClerkInterface {
  public static mountComponentRenderer?: MountComponentRenderer;
  public static version: string = packageJSON.version;
  public client?: ClientResource;
  public session?: ActiveSessionResource | null;
  public organization?: OrganizationResource | null;
  public user?: UserResource | null;
  public frontendApi: string;

  #environment?: EnvironmentResource | null;
  #componentControls?: ComponentControls | null;
  #listeners: Array<(emission: Resources) => void> = [];
  #options: ClerkOptions = {};
  #isReady = false;
  #broadcastChannel: LocalStorageBroadcastChannel<ClerkCoreBroadcastChannelEvent> | null = null;
  #fapiClient: FapiClient;
  #authService: AuthenticationService | null = null;
  #devBrowserHandler: DevBrowserHandler | null = null;
  #pageLifecycle: ReturnType<typeof createPageLifecycle> | null = null;
  #lastOrganizationInvitation: OrganizationInvitationResource | null = null;
  #lastOrganizationMember: OrganizationMembershipResource | null = null;

  /**
   * @inheritDoc {ClerkInterface.version}
   */
  get version(): string {
    return Clerk.version;
  }

  public constructor(frontendApi: string) {
    if (!frontendApi) {
      clerkErrorNoFrontendApi();
    }
    if (!validateFrontendApi(frontendApi)) {
      clerkErrorInvalidFrontendApi();
    }

    this.frontendApi = frontendApi;
    this.#fapiClient = createFapiClient(this);

    BaseResource.clerk = this;
  }

  public getFapiClient = (): FapiClient => this.#fapiClient;

  public isReady = (): boolean => this.#isReady;

  public load = async (options?: ClerkOptions): Promise<void> => {
    if (this.#isReady) {
      return;
    }

    this.#options = {
      ...defaultOptions,
      ...options,
    };

    if (isReactNative()) {
      await this.#loadInReactNative();
    } else {
      await this.#loadInBrowser();
    }

    this.#isReady = true;
  };

  public signOut: SignOut = async (callbackOrOptions?: SignOutCallback | SignOutOptions, options?: SignOutOptions) => {
    if (!this.client || !this.session) {
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
    const shouldSignOutCurrent = this.session.id === session?.id;
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
    this.#componentControls?.openModal('signIn', props || {});
  };

  public closeSignIn = (): void => {
    this.assertComponentsReady(this.#componentControls);
    this.#componentControls?.closeModal('signIn');
  };

  public openSignUp = (props?: SignInProps): void => {
    this.assertComponentsReady(this.#componentControls);
    this.#componentControls?.openModal('signUp', props || {});
  };

  public closeSignUp = (): void => {
    this.assertComponentsReady(this.#componentControls);
    this.#componentControls?.closeModal('signUp');
  };

  public openUserProfile = (props?: UserProfileProps): void => {
    this.assertComponentsReady(this.#componentControls);
    this.#componentControls?.openModal('userProfile', props || {});
  };

  public closeUserProfile = (): void => {
    this.assertComponentsReady(this.#componentControls);
    this.#componentControls?.closeModal('userProfile');
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

    if (session === undefined) {
      if (!this.session) {
        throw new Error(
          'setActive should either be called with a session param or there should be already an active session.',
        );
      }
      session = this.session;
    }

    if (typeof session === 'string') {
      session = (this.client.sessions.find(x => x.id === session) as ActiveSessionResource) || null;
    }

    // At this point, the `session` variable should contain either an `ActiveSessionResource`
    // or `null`.
    // We now want to set the last active organization id on that session (if it exists).
    // However, if the `organization` parameter is not given (i.e. `undefined`), we want
    // to keep the organization id that the session had.
    if (session && organization !== undefined) {
      if (organization === null) {
        session.lastActiveOrganizationId = null;
      } else if (typeof organization === 'string') {
        session.lastActiveOrganizationId = organization;
      } else {
        session.lastActiveOrganizationId = organization.id;
      }
    }

    this.#authService?.setAuthCookiesFromSession(session);

    // If this.session exists, then signout was triggered by the current tab
    // and should emit. Other tabs should not emit the same event again
    if (this.session && session === null) {
      this.#broadcastSignOutEvent();
    }

    //1. setLastActiveSession to passed usersession (add a param).
    //   Note that this will also update the session's active organization
    //   id.
    if (typeof document != 'undefined' && document.hasFocus()) {
      await this.#touchLastActiveSession(session);
    }

    //2. If there's a beforeEmit, typically we're navigating.  Emit the session as
    //   undefined, then wait for beforeEmit to complete before emitting the new session.
    //   When undefined, neither SignedIn nor SignedOut renders, which avoids flickers or
    //   automatic reloading when reloading shouldn't be happening.
    const beforeUnloadTracker = createBeforeUnloadTracker();
    if (beforeEmit) {
      beforeUnloadTracker.startTracking();
      this.session = undefined;
      this.organization = undefined;
      this.user = undefined;
      this.#emit();
      await beforeEmit(session);
      beforeUnloadTracker.stopTracking();
    }

    //3. Check if hard reloading (onbeforeunload).  If not, set the user/session and emit
    if (beforeUnloadTracker.isUnloading()) {
      return;
    }

    this.session = session;
    this.organization =
      organization === null
        ? null
        : (this.session?.user.organizationMemberships || [])
            .map(om => om.organization)
            .find(org => org.id === this.session?.lastActiveOrganizationId);
    this.user = this.session ? this.session.user : null;

    this.#emit();
    this.#resetComponentsState();
  };

  public setSession = async (
    session: ActiveSessionResource | string | null,
    beforeEmit?: BeforeEmitCallback,
  ): Promise<void> => {
    if (!this.client) {
      throw new Error('setSession is being called before the client is loaded. Wait for init.');
    }

    if (typeof session === 'string') {
      session = (this.client.sessions.find(x => x.id === session) as ActiveSessionResource) || null;
    }

    this.#authService?.setAuthCookiesFromSession(session);

    // If this.session exists, then signout was triggered by the current tab
    // and should emit. Other tabs should not emit the same event again
    if (this.session && session === null) {
      this.#broadcastSignOutEvent();
    }

    //1. setLastActiveSession to passed usersession (add a param)
    if (typeof document != 'undefined' && document.hasFocus()) {
      await this.#touchLastActiveSession(session);
    }

    //2. If there's a beforeEmit, typically we're navigating.  Emit the session as
    //   undefined, then wait for beforeEmit to complete before emitting the new session.
    //   When undefined, neither SignedIn nor SignedOut renders, which avoids flickers or
    //   automatic reloading when reloading shouldn't be happening.
    const beforeUnloadTracker = createBeforeUnloadTracker();
    if (beforeEmit) {
      beforeUnloadTracker.startTracking();
      this.session = undefined;
      this.organization = undefined;
      this.user = undefined;
      this.#emit();
      await beforeEmit(session);
      beforeUnloadTracker.stopTracking();
    }

    //3. Check if hard reloading (onbeforeunload).  If not, set the user/session and emit
    if (beforeUnloadTracker.isUnloading()) {
      return;
    }

    this.session = session;
    this.organization = (this.session?.user.organizationMemberships || [])
      .map(om => om.organization)
      .find(org => org.id === this.session?.lastActiveOrganizationId);
    this.user = this.session ? this.session.user : null;

    this.#emit();
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

  public redirectToSignIn = async (options?: RedirectOptions): Promise<unknown> => {
    const opts: RedirectOptions = {
      ...options,
      redirectUrl: options?.redirectUrl || window.location.href,
    };
    if (!this.#environment || !this.#environment.displayConfig) {
      return;
    }
    const { signInUrl } = this.#environment.displayConfig;
    const url = appendAsQueryParams(signInUrl, opts);
    return this.navigate(url);
  };

  public redirectToSignUp = async (options?: RedirectOptions): Promise<unknown> => {
    const opts: RedirectOptions = {
      ...options,
      redirectUrl: options?.redirectUrl || window.location.href,
    };
    if (!this.#environment || !this.#environment.displayConfig) {
      return;
    }
    const { signUpUrl } = this.#environment.displayConfig;
    const url = appendAsQueryParams(signUpUrl, opts);
    return this.navigate(url);
  };

  public redirectToUserProfile = async (): Promise<unknown> => {
    if (!this.#environment || !this.#environment.displayConfig) {
      return;
    }
    return this.navigate(this.#environment.displayConfig.userProfileUrl);
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
      this.session =
        (this.#options.selectInitialSession
          ? this.#options.selectInitialSession(newClient)
          : this.#defaultSession(newClient)) || null;
      this.organization = (this.session?.user.organizationMemberships || [])
        .map(om => om.organization)
        .find(org => org.id === this.session?.lastActiveOrganizationId);
      this.user = this.session ? this.session.user : null;
    }
    this.client = newClient;

    if (this.session) {
      const lastId = this.session.id;
      this.session = newClient.activeSessions.find(x => x.id === lastId);
      this.organization = (this.session?.user.organizationMemberships || [])
        .map(om => om.organization)
        .find(org => org.id === this.session?.lastActiveOrganizationId);
      this.user = this.session ? this.session.user : null;
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

  #loadInBrowser = async (): Promise<void> => {
    this.#authService = new AuthenticationService(this);

    this.#devBrowserHandler = createDevBrowserHandler({
      frontendApi: this.frontendApi,
      fapiClient: this.#fapiClient,
    });

    this.#pageLifecycle = createPageLifecycle();

    const isFapiDevOrStaging = isDevOrStagingUrl(this.frontendApi);
    const isInAccountsHostedPages = isAccountsHostedPages(window?.location.hostname);

    await this.#devBrowserHandler.setup({ purge: !isFapiDevOrStaging });

    this.#setupListeners();

    let retries = 0;
    while (retries < 2) {
      retries++;

      try {
        const shouldTouchEnv = isFapiDevOrStaging && !isInAccountsHostedPages;

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
          this.#componentControls = Clerk.mountComponentRenderer(this, this.#environment, this.#options);
        }

        break;
      } catch (err) {
        if (isError(err, 'dev_browser_unauthenticated')) {
          await this.#devBrowserHandler.setup({ purge: true });
        } else {
          throw err;
        }
      }

      if (retries >= 2) {
        clerkErrorInitFailed();
      }
    }
  };

  #loadInReactNative = async (): Promise<void> => {
    const [environment, client] = await Promise.all([
      Environment.getInstance().fetch({ touch: false }),
      Client.getInstance().fetch(),
    ]);

    this.#environment = environment;
    this.updateClient(client);
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
  };

  // TODO: Be more conservative about touches. Throttle, don't touch when only one user, etc
  #touchLastActiveSession = (session: ActiveSessionResource | null): Promise<unknown> => {
    if (!session) {
      return Promise.resolve();
    }
    return session.touch().catch(noop);
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

  assertComponentsReady(components: ComponentControls | null | undefined): asserts components is ComponentControls {
    if (!Clerk.mountComponentRenderer) {
      throw new Error('ClerkJS was loaded without UI components.');
    }
    if (!components) {
      throw new Error('ClerkJS components are not ready yet.');
    }
  }
}
