import { LocalStorageBroadcastChannel } from '@clerk/shared/utils/localStorageBroadcastChannel';
import { noop } from '@clerk/shared/utils/noop';
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
  OrganizationResource,
  RedirectOptions,
  Resources,
  SignInProps,
  SignInResource,
  SignOutCallback,
  SignUpProps,
  SignUpResource,
  UnsubscribeCallback,
  UserButtonProps,
  UserProfileProps,
  UserResource,
} from '@clerk/types';
import { AuthenticationService } from 'core/services';
import { ERROR_CODES } from 'ui/common/constants';
import {
  appendAsQueryParams,
  CLERK_BEFORE_UNLOAD_EVENT,
  ignoreEventValue,
  isAccountsHostedPages,
  isDevOrStagingUrl,
  isError,
  isReactNative,
  stripOrigin,
  validateFrontendApi,
  windowNavigate,
} from 'utils';
import { getClerkQueryParam } from 'utils/getClerkQueryParam';
import { memoizeListenerCallback } from 'utils/memoizeStateListenerCallback';

import packageJSON from '../../package.json';
import type Components from '../ui';
import createDevBrowserHandler, {
  DevBrowserHandler,
} from './devBrowserHandler';
import {
  clerkErrorInitFailed,
  clerkErrorInvalidFrontendApi,
  clerkErrorNoFrontendApi,
  clerkOAuthCallbackDidNotCompleteSignInSIgnUp,
} from './errors';
import createFapiClient, {
  FapiClient,
  FapiRequestCallback,
} from './fapiClient';
import {
  BaseResource,
  Client,
  Environment,
  MagicLinkError,
  MagicLinkErrorCode,
  Organization,
} from './resources/internal';

export type ClerkCoreBroadcastChannelEvent = { type: 'signout' };

declare global {
  interface Window {
    Clerk?: Clerk;
  }
}

const defaultOptions: ClerkOptions & {
  polling: boolean;
  authVersion: 1 | 2;
} = {
  polling: true,
  authVersion: 2,
};

// DX: deprecated <=2.4.2
// Todo: Remove deprecated returnBack form
interface RedirectToOverload {
  (returnBack?: boolean): Promise<unknown>;

  (opts?: RedirectOptions): Promise<unknown>;
}

// DX: deprecated <=2.4.2
// Todo: Remove deprecated returnBack form
const getOptsWithDeprecatedReturnBack = (opts?: boolean | RedirectOptions) => {
  if (!opts) {
    return undefined;
  }
  if (typeof opts === 'object') {
    return opts;
  }
  return { redirect_url: window.location.href };
};

export default class Clerk implements ClerkInterface {
  public static Components?: typeof Components;
  public static version: string = packageJSON.version;
  public client?: ClientResource;
  public session?: ActiveSessionResource | null;
  public user?: UserResource | null;
  public frontendApi: string;

  #environment?: EnvironmentResource | null;
  #components?: Components | null;
  #listeners: Array<(emission: Resources) => void> = [];
  #options: ClerkOptions & { authVersion: 1 | 2 } = { authVersion: 2 };
  #isReady = false;
  #unloading = false;
  #broadcastChannel: LocalStorageBroadcastChannel<ClerkCoreBroadcastChannelEvent> | null =
    null;
  #fapiClient: FapiClient;
  #authService: AuthenticationService | null = null;
  #devBrowserHandler: DevBrowserHandler | null = null;

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
    this.#options = {
      ...defaultOptions,
      ...options,
      authVersion: options?.authVersion || defaultOptions.authVersion,
    };

    if (isReactNative()) {
      await this.#loadInReactNative();
    } else {
      await this.#loadInBrowser();
    }

    this.#isReady = true;
  };

  public signOutOne = async (
    signOutCallback?: SignOutCallback,
  ): Promise<void> => {
    if (this.#environment?.authConfig.singleSessionMode) {
      return this.signOut(signOutCallback);
    }
    await this.session?.remove();
    return this.setSession(null, ignoreEventValue(signOutCallback));
  };

  public signOut = async (signOutCallback?: SignOutCallback): Promise<void> => {
    if (!this.client) {
      return;
    }
    await this.client.destroy();
    return this.setSession(null, ignoreEventValue(signOutCallback));
  };

  public openSignIn = (nodeProps?: SignInProps): void => {
    this.assertComponentsReady(this.#components);
    this.#components.openSignIn(nodeProps || {});
  };

  public closeSignIn = (): void => {
    this.assertComponentsReady(this.#components);
    this.#components.closeSignIn();
  };

  public openSignUp = (nodeProps?: SignInProps): void => {
    this.assertComponentsReady(this.#components);
    this.#components.openSignUp(nodeProps || {});
  };

  public closeSignUp = (): void => {
    this.assertComponentsReady(this.#components);
    this.#components.closeSignUp();
  };

  public mountSignIn = (
    node: HTMLDivElement,
    nodeProps?: SignInProps,
  ): void => {
    this.assertComponentsReady(this.#components);
    this.#components.mountSignIn(node, nodeProps || {});
  };

  public unmountSignIn = (node: HTMLDivElement): void => {
    this.assertComponentsReady(this.#components);
    this.#components.unmountSignIn(node);
  };

  public mountSignUp = (
    node: HTMLDivElement,
    signUpProps?: SignUpProps,
  ): void => {
    this.assertComponentsReady(this.#components);
    // DX: deprecated <=1.28.0
    this.#components.mountSignUp(node, signUpProps || {});
  };

  public unmountSignUp = (node: HTMLDivElement): void => {
    this.assertComponentsReady(this.#components);
    this.#components.unmountSignUp(node);
  };

  public mountUserProfile = (
    node: HTMLDivElement,
    userProfileProps?: UserProfileProps,
  ): void => {
    this.assertComponentsReady(this.#components);
    this.#components.mountUserProfile(node, userProfileProps || {});
  };

  public unmountUserProfile = (node: HTMLDivElement): void => {
    this.assertComponentsReady(this.#components);
    this.#components.unmountUserProfile(node);
  };

  public mountUserButton = (
    node: HTMLDivElement,
    userButtonProps?: UserButtonProps,
  ): void => {
    this.assertComponentsReady(this.#components);
    this.#components.mountUserButton(node, userButtonProps || {});
  };

  public unmountUserButton = (node: HTMLDivElement): void => {
    this.assertComponentsReady(this.#components);
    this.#components.unmountUserButton(node);
  };

  public setSession = async (
    session: ActiveSessionResource | string | null,
    beforeEmit?: BeforeEmitCallback,
  ): Promise<void> => {
    if (!this.client) {
      throw new Error(
        'setSession is being called before the client is loaded. Wait for init.',
      );
    }

    if (typeof session === 'string') {
      session =
        (this.client.sessions.find(
          x => x.id === session,
        ) as ActiveSessionResource) || null;
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
    if (beforeEmit) {
      this.session = undefined;
      this.user = undefined;
      this.#emit();
      await beforeEmit(session);
    }

    //3. Check if hard reloading (onbeforeunload).  If not, set the user/session and emit
    if (this.#unloading) {
      return;
    }
    this.session = session;
    this.user = this.session ? this.session.user : null;

    this.#emit();
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

  public redirectToSignIn: RedirectToOverload = async (
    opts,
  ): Promise<unknown> => {
    if (!this.#environment || !this.#environment.displayConfig) {
      return;
    }
    const { signInUrl } = this.#environment.displayConfig;
    const url = appendAsQueryParams(
      signInUrl,
      getOptsWithDeprecatedReturnBack(opts),
    );
    return this.navigate(url);
  };

  public redirectToSignUp: RedirectToOverload = async (
    opts,
  ): Promise<unknown> => {
    if (!this.#environment || !this.#environment.displayConfig) {
      return;
    }
    const { signUpUrl } = this.#environment.displayConfig;
    const url = appendAsQueryParams(
      signUpUrl,
      getOptsWithDeprecatedReturnBack(opts),
    );
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

    const shouldCompleteOnThisDevice = sessions.some(
      s => s.id === newSessionId,
    );
    const shouldContinueOnThisDevice =
      signIn.status === 'needs_second_factor' ||
      signUp.status === 'missing_requirements';

    const navigate = (to: string) =>
      customNavigate && typeof customNavigate === 'function'
        ? customNavigate(to)
        : this.navigate(to);

    const redirectComplete = params.redirectUrlComplete
      ? () => navigate(params.redirectUrlComplete as string)
      : noop;
    const redirectContinue = params.redirectUrl
      ? () => navigate(params.redirectUrl as string)
      : noop;

    if (shouldCompleteOnThisDevice) {
      return this.setSession(newSessionId, redirectComplete);
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
      firstFactorVerificationSessionId:
        firstFactorVerification.error?.meta?.sessionId,
    };

    const navigate = (to: string) =>
      customNavigate && typeof customNavigate === 'function'
        ? customNavigate(to)
        : this.navigate(to);

    const makeNavigate = (to: string) => () => navigate(to);

    const navigateToSignIn = makeNavigate(displayConfig.signInUrl);

    const navigateToFactorTwo = makeNavigate(
      params.secondFactorUrl || displayConfig.signInUrl + '#/factor-two',
    );

    const navigateAfterSignIn = makeNavigate(
      params.afterSignInUrl ||
        params.redirectUrl ||
        displayConfig.afterSignInUrl,
    );

    const navigateAfterSignUp = makeNavigate(
      params.afterSignUpUrl ||
        params.redirectUrl ||
        displayConfig.afterSignUpUrl,
    );

    const userExistsButNeedsToSignIn =
      su.externalAccountStatus === 'transferable' &&
      su.externalAccountErrorCode === 'external_account_exists';

    if (userExistsButNeedsToSignIn) {
      const res = await signIn.create({ transfer: true });
      switch (res.status) {
        case 'complete':
          return this.setSession(res.createdSessionId, navigateAfterSignIn);
        case 'needs_second_factor':
          return navigateToFactorTwo();
        default:
          clerkOAuthCallbackDidNotCompleteSignInSIgnUp('sign in');
      }
    }

    const userNeedsToBeCreated =
      si.firstFactorVerificationStatus === 'transferable';

    if (userNeedsToBeCreated) {
      const res = await signUp.create({ transfer: true });
      switch (res.status) {
        case 'complete':
          return this.setSession(res.createdSessionId, navigateAfterSignUp);
        default:
          clerkOAuthCallbackDidNotCompleteSignInSIgnUp('sign in');
      }
    }

    if (si.status === 'needs_second_factor') {
      return navigateToFactorTwo();
    }

    const suUserAlreadySignedIn =
      (su.externalAccountStatus === 'failed' ||
        su.externalAccountStatus === 'unverified') &&
      su.externalAccountErrorCode === 'identifier_already_signed_in' &&
      su.externalAccountSessionId;

    const siUserAlreadySignedIn =
      si.firstFactorVerificationStatus === 'failed' &&
      si.firstFactorVerificationErrorCode === 'identifier_already_signed_in' &&
      si.firstFactorVerificationSessionId;

    const userAlreadySignedIn = suUserAlreadySignedIn || siUserAlreadySignedIn;
    if (userAlreadySignedIn) {
      const sessionId =
        si.firstFactorVerificationSessionId || su.externalAccountSessionId;
      if (sessionId) {
        return this.setSession(sessionId, navigateAfterSignIn);
      }
    }

    return navigateToSignIn();
  };

  public handleUnauthenticated = async (
    opts = { broadcast: true },
  ): Promise<unknown> => {
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
    return this.setSession(null);
  };

  public authenticateWithMetamask = async ({
    redirectUrl,
  }: AuthenticateWithMetamaskParams = {}): Promise<void> => {
    if (!this.client) {
      return;
    }

    let signInOrSignUp: SignInResource | SignUpResource;
    try {
      signInOrSignUp = await this.client.signIn.authenticateWithMetamask();
    } catch (err) {
      if (isError(err, ERROR_CODES.FORM_IDENTIFIER_NOT_FOUND)) {
        signInOrSignUp = await this.client.signUp.authenticateWithMetamask();
      } else {
        throw err;
      }
    }

    if (signInOrSignUp.createdSessionId) {
      await this.setSession(signInOrSignUp.createdSessionId, () => {
        if (redirectUrl) {
          return this.navigate(redirectUrl);
        }
        return Promise.resolve();
      });
    }
  };

  public createOrganization = async ({
    name,
  }: CreateOrganizationParams): Promise<OrganizationResource> => {
    return await Organization.create(name);
  };

  public getOrganizations = async (): Promise<OrganizationResource[]> => {
    return await Organization.retrieve();
  };

  public getOrganization = async (
    organizationId: string,
  ): Promise<OrganizationResource | undefined> => {
    return (await Organization.retrieve()).find(
      org => org.id === organizationId,
    );
  };

  updateClient = (newClient: ClientResource): void => {
    if (!this.client) {
      // This is the first time client is being
      // set, so we also need to set session
      this.session =
        (this.#options.selectInitialSession
          ? this.#options.selectInitialSession(newClient)
          : this.#defaultSession(newClient)) || null;
      this.user = this.session ? this.session.user : null;
    }
    this.client = newClient;

    if (this.session) {
      const lastId = this.session.id;
      this.session = newClient.activeSessions.find(x => x.id === lastId);
      this.user = this.session ? this.session.user : null;
    }

    this.#emit();
  };

  get __unstable__environment(): null | { displayConfig: any } {
    if (!this.#environment) {
      return null;
    }
    return { displayConfig: { ...this.#environment.displayConfig } };
  }

  __unstable__onBeforeRequest(callback: FapiRequestCallback<any>): void {
    this.#fapiClient.onBeforeRequest(callback);
  }

  __unstable__onAfterResponse(callback: FapiRequestCallback<any>): void {
    this.#fapiClient.onAfterResponse(callback);
  }

  #loadInBrowser = async (): Promise<void> => {
    this.#authService = new AuthenticationService(this);

    this.#devBrowserHandler = createDevBrowserHandler({
      frontendApi: this.frontendApi,
      authVersion: this.#options.authVersion,
      fapiClient: this.#fapiClient,
    });

    const isFapiDevOrStaging = isDevOrStagingUrl(this.frontendApi);
    const isInAccountsHostedPages = isAccountsHostedPages(
      window?.location.hostname,
    );

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
          authVersion: this.#options.authVersion,
          enablePolling: this.#options.polling,
          environment: this.#environment,
        });

        if (Clerk.Components) {
          this.#components = Clerk.Components.render(
            this,
            this.#environment,
            this.#options,
          );
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
      const lastActiveSession = client.activeSessions.find(
        s => s.id === client.lastActiveSessionId,
      );
      if (lastActiveSession) {
        return lastActiveSession;
      }
    }
    const session = client.activeSessions[0];
    return session || null;
  };

  #setupListeners = (): void => {
    if (typeof document == 'undefined') {
      return;
    }

    document.addEventListener('visibilitychange', async () => {
      if (
        document.visibilityState === 'visible' &&
        typeof this.session !== 'undefined'
      ) {
        void Promise.all([this.#touchLastActiveSession(this.session)]);
      }
    });

    window.addEventListener(CLERK_BEFORE_UNLOAD_EVENT, () => {
      this.#unloading = true;
    });

    this.#broadcastChannel?.addEventListener('message', async ({ data }) => {
      if (data.type === 'signout') {
        void this.handleUnauthenticated({ broadcast: false });
      }
    });
  };

  // TODO: Be more conservative about touches. Throttle, don't touch when only one user, etc
  #touchLastActiveSession = (
    session: ActiveSessionResource | null,
  ): Promise<unknown> => {
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
        });
      }
    }
  };

  #broadcastSignOutEvent = () => {
    this.#broadcastChannel?.postMessage({ type: 'signout' });
  };

  assertComponentsReady(
    components: Components | null | undefined,
  ): asserts components is Components {
    if (!Clerk.Components) {
      throw new Error('ClerkJS was loaded without UI components.');
    }
    if (!components) {
      throw new Error('ClerkJS components are not ready yet.');
    }
  }
}
