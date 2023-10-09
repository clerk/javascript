import { deprecated, handleValueOrFn, inClientSide } from '@clerk/shared';
import type {
  ActiveSessionResource,
  AuthenticateWithMetamaskParams,
  BeforeEmitCallback,
  Clerk,
  ClientResource,
  CreateOrganizationParams,
  CreateOrganizationProps,
  DomainOrProxyUrl,
  HandleEmailLinkVerificationParams,
  HandleMagicLinkVerificationParams,
  HandleOAuthCallbackParams,
  ListenerCallback,
  OrganizationListProps,
  OrganizationMembershipResource,
  OrganizationResource,
  SetActiveParams,
  SignInProps,
  SignInRedirectOptions,
  SignOut,
  SignOutCallback,
  SignOutOptions,
  SignUpProps,
  SignUpRedirectOptions,
  UnsubscribeCallback,
  UserButtonProps,
  UserProfileProps,
  UserResource,
} from '@clerk/types';
import type { OrganizationProfileProps, OrganizationSwitcherProps } from '@clerk/types';

import { unsupportedNonBrowserDomainOrProxyUrlFunction } from './errors';
import type {
  BrowserClerk,
  BrowserClerkConstructor,
  ClerkProp,
  HeadlessBrowserClerk,
  HeadlessBrowserClerkConstrutor,
  IsomorphicClerkOptions,
} from './types';
import { isConstructor, loadClerkJsScript } from './utils';

export interface Global {
  Clerk?: HeadlessBrowserClerk | BrowserClerk;
}

declare const global: Global;

type GenericFunction<TArgs = never> = (...args: TArgs[]) => unknown;

type MethodName<T> = {
  [P in keyof T]: T[P] extends GenericFunction ? P : never;
}[keyof T];

type MethodCallback = () => Promise<unknown> | unknown;

export default class IsomorphicClerk {
  private readonly mode: 'browser' | 'server';
  private readonly frontendApi?: string;
  private readonly publishableKey?: string;
  private readonly options: IsomorphicClerkOptions;
  private readonly Clerk: ClerkProp;
  private clerkjs: BrowserClerk | HeadlessBrowserClerk | null = null;
  private preopenSignIn?: null | SignInProps = null;
  private preopenSignUp?: null | SignUpProps = null;
  private preopenUserProfile?: null | UserProfileProps = null;
  private preopenOrganizationProfile?: null | OrganizationProfileProps = null;
  private preopenCreateOrganization?: null | CreateOrganizationProps = null;
  private premountSignInNodes = new Map<HTMLDivElement, SignInProps>();
  private premountSignUpNodes = new Map<HTMLDivElement, SignUpProps>();
  private premountUserProfileNodes = new Map<HTMLDivElement, UserProfileProps>();
  private premountUserButtonNodes = new Map<HTMLDivElement, UserButtonProps>();
  private premountOrganizationProfileNodes = new Map<HTMLDivElement, OrganizationProfileProps>();
  private premountCreateOrganizationNodes = new Map<HTMLDivElement, CreateOrganizationProps>();
  private premountOrganizationSwitcherNodes = new Map<HTMLDivElement, OrganizationSwitcherProps>();
  private premountOrganizationListNodes = new Map<HTMLDivElement, OrganizationListProps>();
  private premountMethodCalls = new Map<MethodName<BrowserClerk>, MethodCallback>();
  private loadedListeners: Array<() => void> = [];

  #loaded = false;
  #domain: DomainOrProxyUrl['domain'];
  #proxyUrl: DomainOrProxyUrl['proxyUrl'];

  get loaded(): boolean {
    return this.#loaded;
  }

  static #instance: IsomorphicClerk;

  static getOrCreateInstance(options: IsomorphicClerkOptions) {
    // During SSR: a new instance should be created for every request
    // During CSR: use the cached instance for the whole lifetime of the app
    // Also will recreate the instance if the provided Clerk instance changes
    // This method should be idempotent in both scenarios
    if (!inClientSide() || !this.#instance || (options.Clerk && this.#instance.Clerk !== options.Clerk)) {
      this.#instance = new IsomorphicClerk(options);
    }
    return this.#instance;
  }

  get domain(): string {
    // This getter can run in environments where window is not available.
    // In those cases we should expect and use domain as a string
    if (typeof window !== 'undefined' && window.location) {
      return handleValueOrFn(this.#domain, new URL(window.location.href), '');
    }
    if (typeof this.#domain === 'function') {
      throw new Error(unsupportedNonBrowserDomainOrProxyUrlFunction);
    }
    return this.#domain || '';
  }

  get proxyUrl(): string {
    // This getter can run in environments where window is not available.
    // In those cases we should expect and use proxy as a string
    if (typeof window !== 'undefined' && window.location) {
      return handleValueOrFn(this.#proxyUrl, new URL(window.location.href), '');
    }
    if (typeof this.#proxyUrl === 'function') {
      throw new Error(unsupportedNonBrowserDomainOrProxyUrlFunction);
    }
    return this.#proxyUrl || '';
  }

  constructor(options: IsomorphicClerkOptions) {
    const { Clerk = null, frontendApi, publishableKey } = options || {};
    this.frontendApi = frontendApi;
    this.publishableKey = publishableKey;
    this.#proxyUrl = options?.proxyUrl;
    this.#domain = options?.domain;
    this.options = options;
    this.Clerk = Clerk;
    this.mode = inClientSide() ? 'browser' : 'server';
    void this.loadClerkJS();
  }

  async loadClerkJS(): Promise<HeadlessBrowserClerk | BrowserClerk | undefined> {
    if (this.mode !== 'browser' || this.#loaded) {
      return;
    }

    // Store frontendAPI value on window as a fallback. This value can be used as a
    // fallback during ClerkJS hot loading in case ClerkJS fails to find the
    // "data-clerk-frontend-api" attribute on its script tag.

    // This can happen when the DOM is altered completely during client rehydration.
    // For example, in Remix with React 18 the document changes completely via `hydrateRoot(document)`.

    // For more information refer to:
    // - https://github.com/remix-run/remix/issues/2947
    // - https://github.com/facebook/react/issues/24430
    if (typeof window !== 'undefined') {
      window.__clerk_frontend_api = this.frontendApi;
      window.__clerk_publishable_key = this.publishableKey;
      window.__clerk_proxy_url = this.proxyUrl;
      window.__clerk_domain = this.domain;
    }

    try {
      if (this.Clerk) {
        // Set a fixed Clerk version
        let c: ClerkProp;

        if (isConstructor<BrowserClerkConstructor | HeadlessBrowserClerkConstrutor>(this.Clerk)) {
          // Construct a new Clerk object if a constructor is passed
          c = new this.Clerk(this.publishableKey || this.frontendApi || '', {
            proxyUrl: this.proxyUrl,
            domain: this.domain,
          } as any);
          await c.load(this.options);
        } else {
          // Otherwise use the instantiated Clerk object
          c = this.Clerk;

          if (!c.isReady()) {
            await c.load(this.options);
          }
        }

        global.Clerk = c;
      } else {
        // Hot-load latest ClerkJS from Clerk CDN
        if (!global.Clerk) {
          await loadClerkJsScript({
            ...this.options,
            frontendApi: this.frontendApi,
            publishableKey: this.publishableKey,
            proxyUrl: this.proxyUrl,
            domain: this.domain,
          });
        }

        if (!global.Clerk) {
          throw new Error('Failed to download latest ClerkJS. Contact support@clerk.com.');
        }

        await global.Clerk.load(this.options);
      }

      if (global.Clerk?.loaded || global.Clerk?.isReady()) {
        return this.hydrateClerkJS(global.Clerk);
      }
      return;
    } catch (err) {
      const error = err as Error;
      // In Next.js we can throw a full screen error in development mode.
      // However, in production throwing an error results in an infinite loop.
      // More info at: https://github.com/vercel/next.js/issues/6973
      if (process.env.NODE_ENV === 'production') {
        console.error(error.stack || error.message || error);
      } else {
        throw err;
      }
      return;
    }
  }

  public addOnLoaded = (cb: () => void) => {
    this.loadedListeners.push(cb);
  };

  public emitLoaded = () => {
    this.loadedListeners.forEach(cb => cb());
    this.loadedListeners = [];
  };

  private hydrateClerkJS = (clerkjs: BrowserClerk | HeadlessBrowserClerk | undefined) => {
    if (!clerkjs) {
      throw new Error('Failed to hydrate latest Clerk JS');
    }

    this.clerkjs = clerkjs;

    this.premountMethodCalls.forEach(cb => cb());

    if (this.preopenSignIn !== null) {
      clerkjs.openSignIn(this.preopenSignIn);
    }

    if (this.preopenSignUp !== null) {
      clerkjs.openSignUp(this.preopenSignUp);
    }

    if (this.preopenUserProfile !== null) {
      clerkjs.openUserProfile(this.preopenUserProfile);
    }

    if (this.preopenOrganizationProfile !== null) {
      clerkjs.openOrganizationProfile(this.preopenOrganizationProfile);
    }

    if (this.preopenCreateOrganization !== null) {
      clerkjs.openCreateOrganization(this.preopenCreateOrganization);
    }

    this.premountSignInNodes.forEach((props: SignInProps, node: HTMLDivElement) => {
      clerkjs.mountSignIn(node, props);
    });

    this.premountSignUpNodes.forEach((props: SignUpProps, node: HTMLDivElement) => {
      clerkjs.mountSignUp(node, props);
    });

    this.premountUserProfileNodes.forEach((props: UserProfileProps, node: HTMLDivElement) => {
      clerkjs.mountUserProfile(node, props);
    });

    this.premountUserButtonNodes.forEach((props: UserButtonProps, node: HTMLDivElement) => {
      clerkjs.mountUserButton(node, props);
    });

    this.premountOrganizationListNodes.forEach((props: OrganizationListProps, node: HTMLDivElement) => {
      clerkjs.mountOrganizationList(node, props);
    });

    this.#loaded = true;
    this.emitLoaded();
    return this.clerkjs;
  };

  get version(): string | undefined {
    return this.clerkjs?.version;
  }

  get client(): ClientResource | undefined {
    if (this.clerkjs) {
      return this.clerkjs.client;
      // TODO: add ssr condition
    } else {
      return undefined;
    }
  }

  get session(): ActiveSessionResource | undefined | null {
    if (this.clerkjs) {
      return this.clerkjs.session;
    } else {
      return undefined;
    }
  }

  get user(): UserResource | undefined | null {
    if (this.clerkjs) {
      return this.clerkjs.user;
    } else {
      return undefined;
    }
  }

  get organization(): OrganizationResource | undefined | null {
    if (this.clerkjs) {
      return this.clerkjs.organization;
    } else {
      return undefined;
    }
  }

  get __unstable__environment(): any {
    if (this.clerkjs) {
      return (this.clerkjs as any).__unstable__environment;
      // TODO: add ssr condition
    } else {
      return undefined;
    }
  }

  __unstable__setEnvironment(...args: any): void {
    if (this.clerkjs && '__unstable__setEnvironment' in this.clerkjs) {
      (this.clerkjs as any).__unstable__setEnvironment(args);
    } else {
      return undefined;
    }
  }

  __unstable__updateProps = (props: any): any => {
    // Handle case where accounts has clerk-react@4 installed, but clerk-js@3 is manually loaded
    if (this.clerkjs && '__unstable__updateProps' in this.clerkjs) {
      (this.clerkjs as any).__unstable__updateProps(props);
    } else {
      return undefined;
    }
  };

  /**
   * `setActive` can be used to set the active session and/or organization.
   * It will eventually replace `setSession`.
   *
   * @experimental
   */
  setActive = ({ session, organization, beforeEmit }: SetActiveParams): Promise<void> => {
    if (this.clerkjs) {
      return this.clerkjs.setActive({ session, organization, beforeEmit });
    } else {
      return Promise.reject();
    }
  };

  setSession = (session: ActiveSessionResource | string | null, beforeEmit?: BeforeEmitCallback): Promise<void> => {
    deprecated('setSession', 'Use `Clerk.setActive` instead');
    return this.setActive({ session, beforeEmit });
  };

  openSignIn = (props?: SignInProps): void => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.openSignIn(props);
    } else {
      this.preopenSignIn = props;
    }
  };

  closeSignIn = (): void => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.closeSignIn();
    } else {
      this.preopenSignIn = null;
    }
  };

  openUserProfile = (props?: UserProfileProps): void => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.openUserProfile(props);
    } else {
      this.preopenUserProfile = props;
    }
  };

  closeUserProfile = (): void => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.closeUserProfile();
    } else {
      this.preopenUserProfile = null;
    }
  };

  openOrganizationProfile = (props?: OrganizationProfileProps): void => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.openOrganizationProfile(props);
    } else {
      this.preopenOrganizationProfile = props;
    }
  };

  closeOrganizationProfile = (): void => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.closeOrganizationProfile();
    } else {
      this.preopenOrganizationProfile = null;
    }
  };

  openCreateOrganization = (props?: CreateOrganizationProps): void => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.openCreateOrganization(props);
    } else {
      this.preopenCreateOrganization = props;
    }
  };

  closeCreateOrganization = (): void => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.closeCreateOrganization();
    } else {
      this.preopenCreateOrganization = null;
    }
  };

  openSignUp = (props?: SignUpProps): void => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.openSignUp(props);
    } else {
      this.preopenSignUp = props;
    }
  };

  closeSignUp = (): void => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.closeSignUp();
    } else {
      this.preopenSignUp = null;
    }
  };

  mountSignIn = (node: HTMLDivElement, props: SignInProps): void => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.mountSignIn(node, props);
    } else {
      this.premountSignInNodes.set(node, props);
    }
  };

  unmountSignIn = (node: HTMLDivElement): void => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.unmountSignIn(node);
    } else {
      this.premountSignInNodes.delete(node);
    }
  };

  mountSignUp = (node: HTMLDivElement, props: SignUpProps): void => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.mountSignUp(node, props);
    } else {
      this.premountSignUpNodes.set(node, props);
    }
  };

  unmountSignUp = (node: HTMLDivElement): void => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.unmountSignUp(node);
    } else {
      this.premountSignUpNodes.delete(node);
    }
  };

  mountUserProfile = (node: HTMLDivElement, props: UserProfileProps): void => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.mountUserProfile(node, props);
    } else {
      this.premountUserProfileNodes.set(node, props);
    }
  };

  unmountUserProfile = (node: HTMLDivElement): void => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.unmountUserProfile(node);
    } else {
      this.premountUserProfileNodes.delete(node);
    }
  };

  mountOrganizationProfile = (node: HTMLDivElement, props: OrganizationProfileProps): void => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.mountOrganizationProfile(node, props);
    } else {
      this.premountOrganizationProfileNodes.set(node, props);
    }
  };

  unmountOrganizationProfile = (node: HTMLDivElement): void => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.unmountOrganizationProfile(node);
    } else {
      this.premountOrganizationProfileNodes.delete(node);
    }
  };

  mountCreateOrganization = (node: HTMLDivElement, props: CreateOrganizationProps): void => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.mountCreateOrganization(node, props);
    } else {
      this.premountCreateOrganizationNodes.set(node, props);
    }
  };

  unmountCreateOrganization = (node: HTMLDivElement): void => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.unmountCreateOrganization(node);
    } else {
      this.premountCreateOrganizationNodes.delete(node);
    }
  };

  mountOrganizationSwitcher = (node: HTMLDivElement, props: OrganizationSwitcherProps): void => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.mountOrganizationSwitcher(node, props);
    } else {
      this.premountOrganizationSwitcherNodes.set(node, props);
    }
  };

  unmountOrganizationSwitcher = (node: HTMLDivElement): void => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.unmountOrganizationSwitcher(node);
    } else {
      this.premountOrganizationSwitcherNodes.delete(node);
    }
  };

  mountOrganizationList = (node: HTMLDivElement, props: OrganizationListProps): void => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.mountOrganizationList(node, props);
    } else {
      this.premountOrganizationListNodes.set(node, props);
    }
  };

  unmountOrganizationList = (node: HTMLDivElement): void => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.unmountOrganizationList(node);
    } else {
      this.premountOrganizationListNodes.delete(node);
    }
  };

  mountUserButton = (node: HTMLDivElement, userButtonProps: UserButtonProps): void => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.mountUserButton(node, userButtonProps);
    } else {
      this.premountUserButtonNodes.set(node, userButtonProps);
    }
  };

  unmountUserButton = (node: HTMLDivElement): void => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.unmountUserButton(node);
    } else {
      this.premountUserButtonNodes.delete(node);
    }
  };

  addListener = (listener: ListenerCallback): UnsubscribeCallback => {
    const callback = () => this.clerkjs?.addListener(listener);

    if (this.clerkjs) {
      return callback() as UnsubscribeCallback;
    } else {
      this.premountMethodCalls.set('addListener', callback);
      return () => this.premountMethodCalls.delete('addListener');
    }
  };

  navigate = (to: string): void => {
    const callback = () => this.clerkjs?.navigate(to);
    if (this.clerkjs && this.#loaded) {
      void callback();
    } else {
      this.premountMethodCalls.set('navigate', callback);
    }
  };

  redirectWithAuth = (...args: Parameters<Clerk['redirectWithAuth']>): void => {
    const callback = () => this.clerkjs?.redirectWithAuth(...args);
    if (this.clerkjs && this.#loaded) {
      void callback();
    } else {
      this.premountMethodCalls.set('redirectWithAuth', callback);
    }
  };

  redirectToSignIn = (opts: SignInRedirectOptions): void => {
    const callback = () => this.clerkjs?.redirectToSignIn(opts as any);
    if (this.clerkjs && this.#loaded) {
      void callback();
    } else {
      this.premountMethodCalls.set('redirectToSignIn', callback);
    }
  };

  redirectToSignUp = (opts: SignUpRedirectOptions): void => {
    const callback = () => this.clerkjs?.redirectToSignUp(opts as any);
    if (this.clerkjs && this.#loaded) {
      void callback();
    } else {
      this.premountMethodCalls.set('redirectToSignUp', callback);
    }
  };

  redirectToUserProfile = (): void => {
    const callback = () => this.clerkjs?.redirectToUserProfile();
    if (this.clerkjs && this.#loaded) {
      callback();
    } else {
      this.premountMethodCalls.set('redirectToUserProfile', callback);
    }
  };

  redirectToHome = (): void => {
    const callback = () => this.clerkjs?.redirectToHome();
    if (this.clerkjs && this.#loaded) {
      callback();
    } else {
      this.premountMethodCalls.set('redirectToHome', callback);
    }
  };

  redirectToOrganizationProfile = (): void => {
    const callback = () => this.clerkjs?.redirectToOrganizationProfile();
    if (this.clerkjs && this.#loaded) {
      callback();
    } else {
      this.premountMethodCalls.set('redirectToOrganizationProfile', callback);
    }
  };

  redirectToCreateOrganization = (): void => {
    const callback = () => this.clerkjs?.redirectToCreateOrganization();
    if (this.clerkjs && this.#loaded) {
      callback();
    } else {
      this.premountMethodCalls.set('redirectToCreateOrganization', callback);
    }
  };

  handleRedirectCallback = (params: HandleOAuthCallbackParams): void => {
    const callback = () => this.clerkjs?.handleRedirectCallback(params);
    if (this.clerkjs && this.#loaded) {
      void callback()?.catch(() => {
        // This error is caused when the host app is using React18
        // and strictMode is enabled. This useEffects runs twice because
        // the clerk-react ui components mounts, unmounts and mounts again
        // so the clerk-js component loses its state because of the custom
        // unmount callback we're using.
        // This needs to be solved by tweaking the logic in uiComponents.tsx
        // or by making handleRedirectCallback idempotent
      });
    } else {
      this.premountMethodCalls.set('handleRedirectCallback', callback);
    }
  };
  /**
   * @deprecated Use `handleEmailLinkVerification` instead.
   */
  handleMagicLinkVerification = async (params: HandleMagicLinkVerificationParams): Promise<void> => {
    deprecated('handleMagicLinkVerification', 'Use `handleEmailLinkVerification` instead.');
    const callback = () => this.clerkjs?.handleMagicLinkVerification(params);
    if (this.clerkjs && this.#loaded) {
      return callback() as Promise<void>;
    } else {
      this.premountMethodCalls.set('handleMagicLinkVerification', callback);
    }
  };

  handleEmailLinkVerification = async (params: HandleEmailLinkVerificationParams): Promise<void> => {
    const callback = () => this.clerkjs?.handleEmailLinkVerification(params);
    if (this.clerkjs && this.#loaded) {
      return callback() as Promise<void>;
    } else {
      this.premountMethodCalls.set('handleEmailLinkVerification', callback);
    }
  };

  authenticateWithMetamask = async (params: AuthenticateWithMetamaskParams): Promise<void> => {
    const callback = () => this.clerkjs?.authenticateWithMetamask(params);
    if (this.clerkjs && this.#loaded) {
      return callback() as Promise<void>;
    } else {
      this.premountMethodCalls.set('authenticateWithMetamask', callback);
    }
  };

  createOrganization = async (params: CreateOrganizationParams): Promise<OrganizationResource | void> => {
    const callback = () => this.clerkjs?.createOrganization(params);
    if (this.clerkjs && this.#loaded) {
      return callback() as Promise<OrganizationResource>;
    } else {
      this.premountMethodCalls.set('createOrganization', callback);
    }
  };

  getOrganizationMemberships = async (): Promise<OrganizationMembershipResource[] | void> => {
    const callback = () => this.clerkjs?.getOrganizationMemberships();
    if (this.clerkjs && this.#loaded) {
      return callback() as Promise<OrganizationMembershipResource[]>;
    } else {
      this.premountMethodCalls.set('getOrganizationMemberships', callback);
    }
  };

  getOrganization = async (organizationId: string): Promise<OrganizationResource | undefined | void> => {
    const callback = () => this.clerkjs?.getOrganization(organizationId);
    if (this.clerkjs && this.#loaded) {
      return callback() as Promise<OrganizationResource | undefined>;
    } else {
      this.premountMethodCalls.set('getOrganization', callback);
    }
  };

  signOut: SignOut = async (
    signOutCallbackOrOptions?: SignOutCallback | SignOutOptions,
    options?: SignOutOptions,
  ): Promise<void> => {
    const callback = () => this.clerkjs?.signOut(signOutCallbackOrOptions as any, options);
    if (this.clerkjs && this.#loaded) {
      return callback() as Promise<void>;
    } else {
      this.premountMethodCalls.set('signOut', callback);
    }
  };
}
