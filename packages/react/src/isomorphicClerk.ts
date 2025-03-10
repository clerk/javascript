import { inBrowser } from '@clerk/shared/browser';
import { loadClerkJsScript } from '@clerk/shared/loadClerkJsScript';
import { handleValueOrFn } from '@clerk/shared/utils';
import type {
  __internal_UserVerificationModalProps,
  __internal_UserVerificationProps,
  AuthenticateWithCoinbaseWalletParams,
  AuthenticateWithGoogleOneTapParams,
  AuthenticateWithMetamaskParams,
  AuthenticateWithOKXWalletParams,
  Clerk,
  ClerkAuthenticateWithWeb3Params,
  ClerkOptions,
  ClientResource,
  CreateOrganizationParams,
  CreateOrganizationProps,
  DomainOrProxyUrl,
  GoogleOneTapProps,
  HandleEmailLinkVerificationParams,
  HandleOAuthCallbackParams,
  JoinWaitlistParams,
  ListenerCallback,
  LoadedClerk,
  OrganizationListProps,
  OrganizationProfileProps,
  OrganizationResource,
  OrganizationSwitcherProps,
  RedirectOptions,
  SetActiveParams,
  SignInProps,
  SignInRedirectOptions,
  SignInResource,
  SignUpProps,
  SignUpRedirectOptions,
  SignUpResource,
  UnsubscribeCallback,
  UserButtonProps,
  UserProfileProps,
  WaitlistProps,
  WaitlistResource,
  Without,
} from '@clerk/types';

import { errorThrower } from './errors/errorThrower';
import { unsupportedNonBrowserDomainOrProxyUrlFunction } from './errors/messages';
import type {
  BrowserClerk,
  BrowserClerkConstructor,
  ClerkProp,
  HeadlessBrowserClerk,
  HeadlessBrowserClerkConstructor,
  IsomorphicClerkOptions,
} from './types';
import { isConstructor } from './utils';

if (typeof globalThis.__BUILD_DISABLE_RHC__ === 'undefined') {
  globalThis.__BUILD_DISABLE_RHC__ = false;
}

const SDK_METADATA = {
  name: PACKAGE_NAME,
  version: PACKAGE_VERSION,
  environment: process.env.NODE_ENV,
};

export interface Global {
  Clerk?: HeadlessBrowserClerk | BrowserClerk;
}

declare const global: Global;

type GenericFunction<TArgs = never> = (...args: TArgs[]) => unknown;

type MethodName<T> = {
  [P in keyof T]: T[P] extends GenericFunction ? P : never;
}[keyof T];

type MethodCallback = () => Promise<unknown> | unknown;

type WithVoidReturn<F extends (...args: any) => any> = (
  ...args: Parameters<F>
) => ReturnType<F> extends Promise<infer T> ? Promise<T | void> : ReturnType<F> | void;
type WithVoidReturnFunctions<T> = {
  [K in keyof T]: T[K] extends (...args: any) => any ? WithVoidReturn<T[K]> : T[K];
};

type IsomorphicLoadedClerk = Without<
  WithVoidReturnFunctions<LoadedClerk>,
  | 'client'
  | '__internal_addNavigationListener'
  | '__internal_getCachedResources'
  | '__internal_reloadInitialResources'
  | '__internal_setComponentNavigationContext'
> & {
  client: ClientResource | undefined;
};

export class IsomorphicClerk implements IsomorphicLoadedClerk {
  private readonly mode: 'browser' | 'server';
  private readonly options: IsomorphicClerkOptions;
  private readonly Clerk: ClerkProp;
  private clerkjs: BrowserClerk | HeadlessBrowserClerk | null = null;
  private preopenOneTap?: null | GoogleOneTapProps = null;
  private preopenUserVerification?: null | __internal_UserVerificationProps = null;
  private preopenSignIn?: null | SignInProps = null;
  private preopenSignUp?: null | SignUpProps = null;
  private preopenUserProfile?: null | UserProfileProps = null;
  private preopenOrganizationProfile?: null | OrganizationProfileProps = null;
  private preopenCreateOrganization?: null | CreateOrganizationProps = null;
  private preOpenWaitlist?: null | WaitlistProps = null;
  private premountSignInNodes = new Map<HTMLDivElement, SignInProps | undefined>();
  private premountSignUpNodes = new Map<HTMLDivElement, SignUpProps | undefined>();
  private premountUserProfileNodes = new Map<HTMLDivElement, UserProfileProps | undefined>();
  private premountUserButtonNodes = new Map<HTMLDivElement, UserButtonProps | undefined>();
  private premountOrganizationProfileNodes = new Map<HTMLDivElement, OrganizationProfileProps | undefined>();
  private premountCreateOrganizationNodes = new Map<HTMLDivElement, CreateOrganizationProps | undefined>();
  private premountOrganizationSwitcherNodes = new Map<HTMLDivElement, OrganizationSwitcherProps | undefined>();
  private premountOrganizationListNodes = new Map<HTMLDivElement, OrganizationListProps | undefined>();
  private premountMethodCalls = new Map<MethodName<BrowserClerk>, MethodCallback>();
  private premountWaitlistNodes = new Map<HTMLDivElement, WaitlistProps | undefined>();
  // A separate Map of `addListener` method calls to handle multiple listeners.
  private premountAddListenerCalls = new Map<
    ListenerCallback,
    {
      unsubscribe: UnsubscribeCallback;
      nativeUnsubscribe?: UnsubscribeCallback;
    }
  >();
  private loadedListeners: Array<() => void> = [];

  #loaded = false;
  #domain: DomainOrProxyUrl['domain'];
  #proxyUrl: DomainOrProxyUrl['proxyUrl'];
  #publishableKey: string;

  get publishableKey(): string {
    return this.#publishableKey;
  }

  get loaded(): boolean {
    return this.#loaded;
  }

  static #instance: IsomorphicClerk | null | undefined;

  static getOrCreateInstance(options: IsomorphicClerkOptions) {
    // During SSR: a new instance should be created for every request
    // During CSR: use the cached instance for the whole lifetime of the app
    // Also will recreate the instance if the provided Clerk instance changes
    // This method should be idempotent in both scenarios
    if (
      !inBrowser() ||
      !this.#instance ||
      (options.Clerk && this.#instance.Clerk !== options.Clerk) ||
      // Allow hot swapping PKs on the client
      this.#instance.publishableKey !== options.publishableKey
    ) {
      this.#instance = new IsomorphicClerk(options);
    }
    return this.#instance;
  }

  static clearInstance() {
    this.#instance = null;
  }

  get domain(): string {
    // This getter can run in environments where window is not available.
    // In those cases we should expect and use domain as a string
    if (typeof window !== 'undefined' && window.location) {
      return handleValueOrFn(this.#domain, new URL(window.location.href), '');
    }
    if (typeof this.#domain === 'function') {
      return errorThrower.throw(unsupportedNonBrowserDomainOrProxyUrlFunction);
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
      return errorThrower.throw(unsupportedNonBrowserDomainOrProxyUrlFunction);
    }
    return this.#proxyUrl || '';
  }

  public __internal_getOption<K extends keyof ClerkOptions>(key: K): ClerkOptions[K] | undefined {
    return this.clerkjs?.__internal_getOption(key);
  }

  constructor(options: IsomorphicClerkOptions) {
    const { Clerk = null, publishableKey } = options || {};
    this.#publishableKey = publishableKey;
    this.#proxyUrl = options?.proxyUrl;
    this.#domain = options?.domain;
    this.options = options;
    this.Clerk = Clerk;
    this.mode = inBrowser() ? 'browser' : 'server';

    if (!this.options.sdkMetadata) {
      this.options.sdkMetadata = SDK_METADATA;
    }

    if (this.#publishableKey) {
      void this.loadClerkJS();
    }
  }

  get sdkMetadata() {
    return this.clerkjs?.sdkMetadata || this.options.sdkMetadata || undefined;
  }

  get instanceType() {
    return this.clerkjs?.instanceType;
  }

  get frontendApi() {
    return this.clerkjs?.frontendApi || '';
  }

  get isStandardBrowser() {
    return this.clerkjs?.isStandardBrowser || this.options.standardBrowser || false;
  }

  get isSatellite() {
    // This getter can run in environments where window is not available.
    // In those cases we should expect and use domain as a string
    if (typeof window !== 'undefined' && window.location) {
      return handleValueOrFn(this.options.isSatellite, new URL(window.location.href), false);
    }
    if (typeof this.options.isSatellite === 'function') {
      return errorThrower.throw(unsupportedNonBrowserDomainOrProxyUrlFunction);
    }
    return false;
  }

  buildSignInUrl = (opts?: RedirectOptions): string | void => {
    const callback = () => this.clerkjs?.buildSignInUrl(opts) || '';
    if (this.clerkjs && this.#loaded) {
      return callback();
    } else {
      this.premountMethodCalls.set('buildSignInUrl', callback);
    }
  };

  buildSignUpUrl = (opts?: RedirectOptions): string | void => {
    const callback = () => this.clerkjs?.buildSignUpUrl(opts) || '';
    if (this.clerkjs && this.#loaded) {
      return callback();
    } else {
      this.premountMethodCalls.set('buildSignUpUrl', callback);
    }
  };

  buildAfterSignInUrl = (...args: Parameters<Clerk['buildAfterSignInUrl']>): string | void => {
    const callback = () => this.clerkjs?.buildAfterSignInUrl(...args) || '';
    if (this.clerkjs && this.#loaded) {
      return callback();
    } else {
      this.premountMethodCalls.set('buildAfterSignInUrl', callback);
    }
  };

  buildAfterSignUpUrl = (...args: Parameters<Clerk['buildAfterSignUpUrl']>): string | void => {
    const callback = () => this.clerkjs?.buildAfterSignUpUrl(...args) || '';
    if (this.clerkjs && this.#loaded) {
      return callback();
    } else {
      this.premountMethodCalls.set('buildAfterSignUpUrl', callback);
    }
  };

  buildAfterSignOutUrl = (): string | void => {
    const callback = () => this.clerkjs?.buildAfterSignOutUrl() || '';
    if (this.clerkjs && this.#loaded) {
      return callback();
    } else {
      this.premountMethodCalls.set('buildAfterSignOutUrl', callback);
    }
  };

  buildAfterMultiSessionSingleSignOutUrl = (): string | void => {
    const callback = () => this.clerkjs?.buildAfterMultiSessionSingleSignOutUrl() || '';
    if (this.clerkjs && this.#loaded) {
      return callback();
    } else {
      this.premountMethodCalls.set('buildAfterMultiSessionSingleSignOutUrl', callback);
    }
  };

  buildUserProfileUrl = (): string | void => {
    const callback = () => this.clerkjs?.buildUserProfileUrl() || '';
    if (this.clerkjs && this.#loaded) {
      return callback();
    } else {
      this.premountMethodCalls.set('buildUserProfileUrl', callback);
    }
  };

  buildCreateOrganizationUrl = (): string | void => {
    const callback = () => this.clerkjs?.buildCreateOrganizationUrl() || '';
    if (this.clerkjs && this.#loaded) {
      return callback();
    } else {
      this.premountMethodCalls.set('buildCreateOrganizationUrl', callback);
    }
  };

  buildOrganizationProfileUrl = (): string | void => {
    const callback = () => this.clerkjs?.buildOrganizationProfileUrl() || '';
    if (this.clerkjs && this.#loaded) {
      return callback();
    } else {
      this.premountMethodCalls.set('buildOrganizationProfileUrl', callback);
    }
  };

  buildWaitlistUrl = (): string | void => {
    const callback = () => this.clerkjs?.buildWaitlistUrl() || '';
    if (this.clerkjs && this.#loaded) {
      return callback();
    } else {
      this.premountMethodCalls.set('buildWaitlistUrl', callback);
    }
  };

  buildUrlWithAuth = (to: string): string | void => {
    const callback = () => this.clerkjs?.buildUrlWithAuth(to) || '';
    if (this.clerkjs && this.#loaded) {
      return callback();
    } else {
      this.premountMethodCalls.set('buildUrlWithAuth', callback);
    }
  };

  handleUnauthenticated = async () => {
    const callback = () => this.clerkjs?.handleUnauthenticated();
    if (this.clerkjs && this.#loaded) {
      void callback();
    } else {
      this.premountMethodCalls.set('handleUnauthenticated', callback);
    }
  };

  #waitForClerkJS(): Promise<HeadlessBrowserClerk | BrowserClerk> {
    return new Promise<HeadlessBrowserClerk | BrowserClerk>(resolve => {
      this.addOnLoaded(() => resolve(this.clerkjs!));
    });
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
      window.__clerk_publishable_key = this.#publishableKey;
      window.__clerk_proxy_url = this.proxyUrl;
      window.__clerk_domain = this.domain;
    }

    try {
      if (this.Clerk) {
        // Set a fixed Clerk version
        let c: ClerkProp;

        if (isConstructor<BrowserClerkConstructor | HeadlessBrowserClerkConstructor>(this.Clerk)) {
          // Construct a new Clerk object if a constructor is passed
          c = new this.Clerk(this.#publishableKey, {
            proxyUrl: this.proxyUrl,
            domain: this.domain,
          } as any);

          await c.load(this.options);
        } else {
          // Otherwise use the instantiated Clerk object
          c = this.Clerk;

          if (!c.loaded) {
            await c.load(this.options);
          }
        }

        global.Clerk = c;
      } else if (!__BUILD_DISABLE_RHC__) {
        // Hot-load latest ClerkJS from Clerk CDN
        if (!global.Clerk) {
          await loadClerkJsScript({
            ...this.options,
            publishableKey: this.#publishableKey,
            proxyUrl: this.proxyUrl,
            domain: this.domain,
            nonce: this.options.nonce,
          });
        }

        if (!global.Clerk) {
          throw new Error('Failed to download latest ClerkJS. Contact support@clerk.com.');
        }

        await global.Clerk.load(this.options);
      }

      if (global.Clerk?.loaded) {
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
    /**
     * When IsomorphicClerk is loaded execute the callback directly
     */
    if (this.loaded) {
      this.emitLoaded();
    }
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
    this.premountAddListenerCalls.forEach((listenerHandlers, listener) => {
      listenerHandlers.nativeUnsubscribe = clerkjs.addListener(listener);
    });

    if (this.preopenSignIn !== null) {
      clerkjs.openSignIn(this.preopenSignIn);
    }

    if (this.preopenSignUp !== null) {
      clerkjs.openSignUp(this.preopenSignUp);
    }

    if (this.preopenUserProfile !== null) {
      clerkjs.openUserProfile(this.preopenUserProfile);
    }

    if (this.preopenUserVerification !== null) {
      clerkjs.__internal_openReverification(this.preopenUserVerification);
    }

    if (this.preopenOneTap !== null) {
      clerkjs.openGoogleOneTap(this.preopenOneTap);
    }

    if (this.preopenOrganizationProfile !== null) {
      clerkjs.openOrganizationProfile(this.preopenOrganizationProfile);
    }

    if (this.preopenCreateOrganization !== null) {
      clerkjs.openCreateOrganization(this.preopenCreateOrganization);
    }

    if (this.preOpenWaitlist !== null) {
      clerkjs.openWaitlist(this.preOpenWaitlist);
    }

    this.premountSignInNodes.forEach((props, node) => {
      clerkjs.mountSignIn(node, props);
    });

    this.premountSignUpNodes.forEach((props, node) => {
      clerkjs.mountSignUp(node, props);
    });

    this.premountUserProfileNodes.forEach((props, node) => {
      clerkjs.mountUserProfile(node, props);
    });

    this.premountUserButtonNodes.forEach((props, node) => {
      clerkjs.mountUserButton(node, props);
    });

    this.premountOrganizationListNodes.forEach((props, node) => {
      clerkjs.mountOrganizationList(node, props);
    });

    this.premountWaitlistNodes.forEach((props, node) => {
      clerkjs.mountWaitlist(node, props);
    });

    this.#loaded = true;
    this.emitLoaded();
    return this.clerkjs;
  };

  get version() {
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

  get session() {
    if (this.clerkjs) {
      return this.clerkjs.session;
    } else {
      return undefined;
    }
  }

  get user() {
    if (this.clerkjs) {
      return this.clerkjs.user;
    } else {
      return undefined;
    }
  }

  get organization() {
    if (this.clerkjs) {
      return this.clerkjs.organization;
    } else {
      return undefined;
    }
  }

  get telemetry() {
    if (this.clerkjs) {
      return this.clerkjs.telemetry;
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

  get isSignedIn(): boolean {
    if (this.clerkjs) {
      return this.clerkjs.isSignedIn;
    } else {
      return false;
    }
  }

  __unstable__setEnvironment(...args: any): void {
    if (this.clerkjs && '__unstable__setEnvironment' in this.clerkjs) {
      (this.clerkjs as any).__unstable__setEnvironment(args);
    } else {
      return undefined;
    }
  }

  __unstable__updateProps = async (props: any): Promise<void> => {
    const clerkjs = await this.#waitForClerkJS();
    // Handle case where accounts has clerk-react@4 installed, but clerk-js@3 is manually loaded
    if (clerkjs && '__unstable__updateProps' in clerkjs) {
      return (clerkjs as any).__unstable__updateProps(props);
    }
  };

  /**
   * `setActive` can be used to set the active session and/or organization.
   */
  setActive = (params: SetActiveParams): Promise<void> => {
    if (this.clerkjs) {
      return this.clerkjs.setActive(params);
    } else {
      return Promise.reject();
    }
  };

  openSignIn = (props?: SignInProps) => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.openSignIn(props);
    } else {
      this.preopenSignIn = props;
    }
  };

  closeSignIn = () => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.closeSignIn();
    } else {
      this.preopenSignIn = null;
    }
  };

  __internal_openReverification = (props?: __internal_UserVerificationModalProps) => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.__internal_openReverification(props);
    } else {
      this.preopenUserVerification = props;
    }
  };

  __internal_closeReverification = () => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.__internal_closeReverification();
    } else {
      this.preopenUserVerification = null;
    }
  };

  openGoogleOneTap = (props?: GoogleOneTapProps) => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.openGoogleOneTap(props);
    } else {
      this.preopenOneTap = props;
    }
  };

  closeGoogleOneTap = () => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.closeGoogleOneTap();
    } else {
      this.preopenOneTap = null;
    }
  };

  openUserProfile = (props?: UserProfileProps) => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.openUserProfile(props);
    } else {
      this.preopenUserProfile = props;
    }
  };

  closeUserProfile = () => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.closeUserProfile();
    } else {
      this.preopenUserProfile = null;
    }
  };

  openOrganizationProfile = (props?: OrganizationProfileProps) => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.openOrganizationProfile(props);
    } else {
      this.preopenOrganizationProfile = props;
    }
  };

  closeOrganizationProfile = () => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.closeOrganizationProfile();
    } else {
      this.preopenOrganizationProfile = null;
    }
  };

  openCreateOrganization = (props?: CreateOrganizationProps) => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.openCreateOrganization(props);
    } else {
      this.preopenCreateOrganization = props;
    }
  };

  closeCreateOrganization = () => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.closeCreateOrganization();
    } else {
      this.preopenCreateOrganization = null;
    }
  };

  openWaitlist = (props?: WaitlistProps) => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.openWaitlist(props);
    } else {
      this.preOpenWaitlist = props;
    }
  };

  closeWaitlist = () => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.closeWaitlist();
    } else {
      this.preOpenWaitlist = null;
    }
  };

  openSignUp = (props?: SignUpProps) => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.openSignUp(props);
    } else {
      this.preopenSignUp = props;
    }
  };

  closeSignUp = () => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.closeSignUp();
    } else {
      this.preopenSignUp = null;
    }
  };

  mountSignIn = (node: HTMLDivElement, props?: SignInProps) => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.mountSignIn(node, props);
    } else {
      this.premountSignInNodes.set(node, props);
    }
  };

  unmountSignIn = (node: HTMLDivElement) => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.unmountSignIn(node);
    } else {
      this.premountSignInNodes.delete(node);
    }
  };

  mountSignUp = (node: HTMLDivElement, props?: SignUpProps) => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.mountSignUp(node, props);
    } else {
      this.premountSignUpNodes.set(node, props);
    }
  };

  unmountSignUp = (node: HTMLDivElement) => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.unmountSignUp(node);
    } else {
      this.premountSignUpNodes.delete(node);
    }
  };

  mountUserProfile = (node: HTMLDivElement, props?: UserProfileProps) => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.mountUserProfile(node, props);
    } else {
      this.premountUserProfileNodes.set(node, props);
    }
  };

  unmountUserProfile = (node: HTMLDivElement) => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.unmountUserProfile(node);
    } else {
      this.premountUserProfileNodes.delete(node);
    }
  };

  mountOrganizationProfile = (node: HTMLDivElement, props?: OrganizationProfileProps) => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.mountOrganizationProfile(node, props);
    } else {
      this.premountOrganizationProfileNodes.set(node, props);
    }
  };

  unmountOrganizationProfile = (node: HTMLDivElement) => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.unmountOrganizationProfile(node);
    } else {
      this.premountOrganizationProfileNodes.delete(node);
    }
  };

  mountCreateOrganization = (node: HTMLDivElement, props?: CreateOrganizationProps) => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.mountCreateOrganization(node, props);
    } else {
      this.premountCreateOrganizationNodes.set(node, props);
    }
  };

  unmountCreateOrganization = (node: HTMLDivElement) => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.unmountCreateOrganization(node);
    } else {
      this.premountCreateOrganizationNodes.delete(node);
    }
  };

  mountOrganizationSwitcher = (node: HTMLDivElement, props?: OrganizationSwitcherProps) => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.mountOrganizationSwitcher(node, props);
    } else {
      this.premountOrganizationSwitcherNodes.set(node, props);
    }
  };

  unmountOrganizationSwitcher = (node: HTMLDivElement) => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.unmountOrganizationSwitcher(node);
    } else {
      this.premountOrganizationSwitcherNodes.delete(node);
    }
  };

  __experimental_prefetchOrganizationSwitcher = () => {
    const callback = () => this.clerkjs?.__experimental_prefetchOrganizationSwitcher();
    if (this.clerkjs && this.#loaded) {
      void callback();
    } else {
      this.premountMethodCalls.set('__experimental_prefetchOrganizationSwitcher', callback);
    }
  };

  mountOrganizationList = (node: HTMLDivElement, props?: OrganizationListProps) => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.mountOrganizationList(node, props);
    } else {
      this.premountOrganizationListNodes.set(node, props);
    }
  };

  unmountOrganizationList = (node: HTMLDivElement) => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.unmountOrganizationList(node);
    } else {
      this.premountOrganizationListNodes.delete(node);
    }
  };

  mountUserButton = (node: HTMLDivElement, userButtonProps?: UserButtonProps) => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.mountUserButton(node, userButtonProps);
    } else {
      this.premountUserButtonNodes.set(node, userButtonProps);
    }
  };

  unmountUserButton = (node: HTMLDivElement) => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.unmountUserButton(node);
    } else {
      this.premountUserButtonNodes.delete(node);
    }
  };

  mountWaitlist = (node: HTMLDivElement, props?: WaitlistProps) => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.mountWaitlist(node, props);
    } else {
      this.premountWaitlistNodes.set(node, props);
    }
  };

  unmountWaitlist = (node: HTMLDivElement) => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.unmountWaitlist(node);
    } else {
      this.premountWaitlistNodes.delete(node);
    }
  };

  addListener = (listener: ListenerCallback): UnsubscribeCallback => {
    if (this.clerkjs) {
      return this.clerkjs.addListener(listener);
    } else {
      const unsubscribe = () => {
        const listenerHandlers = this.premountAddListenerCalls.get(listener);
        if (listenerHandlers) {
          listenerHandlers.nativeUnsubscribe?.();
          this.premountAddListenerCalls.delete(listener);
        }
      };
      this.premountAddListenerCalls.set(listener, { unsubscribe, nativeUnsubscribe: undefined });
      return unsubscribe;
    }
  };

  navigate = (to: string) => {
    const callback = () => this.clerkjs?.navigate(to);
    if (this.clerkjs && this.#loaded) {
      void callback();
    } else {
      this.premountMethodCalls.set('navigate', callback);
    }
  };

  redirectWithAuth = async (...args: Parameters<Clerk['redirectWithAuth']>) => {
    const callback = () => this.clerkjs?.redirectWithAuth(...args);
    if (this.clerkjs && this.#loaded) {
      return callback();
    } else {
      this.premountMethodCalls.set('redirectWithAuth', callback);
      return;
    }
  };

  redirectToSignIn = async (opts?: SignInRedirectOptions) => {
    const callback = () => this.clerkjs?.redirectToSignIn(opts as any);
    if (this.clerkjs && this.#loaded) {
      return callback();
    } else {
      this.premountMethodCalls.set('redirectToSignIn', callback);
      return;
    }
  };

  redirectToSignUp = async (opts?: SignUpRedirectOptions) => {
    const callback = () => this.clerkjs?.redirectToSignUp(opts as any);
    if (this.clerkjs && this.#loaded) {
      return callback();
    } else {
      this.premountMethodCalls.set('redirectToSignUp', callback);
      return;
    }
  };

  redirectToUserProfile = async () => {
    const callback = () => this.clerkjs?.redirectToUserProfile();
    if (this.clerkjs && this.#loaded) {
      return callback();
    } else {
      this.premountMethodCalls.set('redirectToUserProfile', callback);
      return;
    }
  };

  redirectToAfterSignUp = (): void => {
    const callback = () => this.clerkjs?.redirectToAfterSignUp();
    if (this.clerkjs && this.#loaded) {
      return callback();
    } else {
      this.premountMethodCalls.set('redirectToAfterSignUp', callback);
    }
  };

  redirectToAfterSignIn = () => {
    const callback = () => this.clerkjs?.redirectToAfterSignIn();
    if (this.clerkjs && this.#loaded) {
      callback();
    } else {
      this.premountMethodCalls.set('redirectToAfterSignIn', callback);
    }
  };

  redirectToAfterSignOut = () => {
    const callback = () => this.clerkjs?.redirectToAfterSignOut();
    if (this.clerkjs && this.#loaded) {
      callback();
    } else {
      this.premountMethodCalls.set('redirectToAfterSignOut', callback);
    }
  };

  redirectToOrganizationProfile = async () => {
    const callback = () => this.clerkjs?.redirectToOrganizationProfile();
    if (this.clerkjs && this.#loaded) {
      return callback();
    } else {
      this.premountMethodCalls.set('redirectToOrganizationProfile', callback);
      return;
    }
  };

  redirectToCreateOrganization = async () => {
    const callback = () => this.clerkjs?.redirectToCreateOrganization();
    if (this.clerkjs && this.#loaded) {
      return callback();
    } else {
      this.premountMethodCalls.set('redirectToCreateOrganization', callback);
      return;
    }
  };

  redirectToWaitlist = async () => {
    const callback = () => this.clerkjs?.redirectToWaitlist();
    if (this.clerkjs && this.#loaded) {
      return callback();
    } else {
      this.premountMethodCalls.set('redirectToWaitlist', callback);
      return;
    }
  };

  handleRedirectCallback = async (params: HandleOAuthCallbackParams): Promise<void> => {
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

  handleGoogleOneTapCallback = async (
    signInOrUp: SignInResource | SignUpResource,
    params: HandleOAuthCallbackParams,
  ): Promise<void> => {
    const callback = () => this.clerkjs?.handleGoogleOneTapCallback(signInOrUp, params);
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
      this.premountMethodCalls.set('handleGoogleOneTapCallback', callback);
    }
  };

  handleEmailLinkVerification = async (params: HandleEmailLinkVerificationParams) => {
    const callback = () => this.clerkjs?.handleEmailLinkVerification(params);
    if (this.clerkjs && this.#loaded) {
      return callback() as Promise<void>;
    } else {
      this.premountMethodCalls.set('handleEmailLinkVerification', callback);
    }
  };

  authenticateWithMetamask = async (params?: AuthenticateWithMetamaskParams) => {
    const callback = () => this.clerkjs?.authenticateWithMetamask(params);
    if (this.clerkjs && this.#loaded) {
      return callback() as Promise<void>;
    } else {
      this.premountMethodCalls.set('authenticateWithMetamask', callback);
    }
  };

  authenticateWithCoinbaseWallet = async (params?: AuthenticateWithCoinbaseWalletParams) => {
    const callback = () => this.clerkjs?.authenticateWithCoinbaseWallet(params);
    if (this.clerkjs && this.#loaded) {
      return callback() as Promise<void>;
    } else {
      this.premountMethodCalls.set('authenticateWithCoinbaseWallet', callback);
    }
  };

  authenticateWithOKXWallet = async (params?: AuthenticateWithOKXWalletParams) => {
    const callback = () => this.clerkjs?.authenticateWithOKXWallet(params);
    if (this.clerkjs && this.#loaded) {
      return callback() as Promise<void>;
    } else {
      this.premountMethodCalls.set('authenticateWithOKXWallet', callback);
    }
  };

  authenticateWithWeb3 = async (params: ClerkAuthenticateWithWeb3Params) => {
    const callback = () => this.clerkjs?.authenticateWithWeb3(params);
    if (this.clerkjs && this.#loaded) {
      return callback() as Promise<void>;
    } else {
      this.premountMethodCalls.set('authenticateWithWeb3', callback);
    }
  };

  authenticateWithGoogleOneTap = async (params: AuthenticateWithGoogleOneTapParams) => {
    const clerkjs = await this.#waitForClerkJS();
    return clerkjs.authenticateWithGoogleOneTap(params);
  };

  createOrganization = async (params: CreateOrganizationParams): Promise<OrganizationResource | void> => {
    const callback = () => this.clerkjs?.createOrganization(params);
    if (this.clerkjs && this.#loaded) {
      return callback() as Promise<OrganizationResource>;
    } else {
      this.premountMethodCalls.set('createOrganization', callback);
    }
  };

  getOrganization = async (organizationId: string): Promise<OrganizationResource | void> => {
    const callback = () => this.clerkjs?.getOrganization(organizationId);
    if (this.clerkjs && this.#loaded) {
      return callback() as Promise<OrganizationResource>;
    } else {
      this.premountMethodCalls.set('getOrganization', callback);
    }
  };

  joinWaitlist = async (params: JoinWaitlistParams): Promise<WaitlistResource | void> => {
    const callback = () => this.clerkjs?.joinWaitlist(params);
    if (this.clerkjs && this.#loaded) {
      return callback() as Promise<WaitlistResource>;
    } else {
      this.premountMethodCalls.set('joinWaitlist', callback);
    }
  };

  signOut = async (...args: Parameters<Clerk['signOut']>) => {
    const callback = () => this.clerkjs?.signOut(...args);
    if (this.clerkjs && this.#loaded) {
      return callback() as Promise<void>;
    } else {
      this.premountMethodCalls.set('signOut', callback);
    }
  };
}
