import { inBrowser } from '@clerk/shared/browser';
import { handleValueOrFn } from '@clerk/shared/handleValueOrFn';
import { loadClerkJsScript } from '@clerk/shared/loadClerkJsScript';
import type { TelemetryCollector } from '@clerk/shared/telemetry';
import type {
  __experimental_UserVerificationModalProps,
  __experimental_UserVerificationProps,
  ActiveSessionResource,
  AuthenticateWithCoinbaseParams,
  AuthenticateWithGoogleOneTapParams,
  AuthenticateWithMetamaskParams,
  Clerk,
  ClerkAuthenticateWithWeb3Params,
  ClientResource,
  CreateOrganizationParams,
  CreateOrganizationProps,
  DomainOrProxyUrl,
  GoogleOneTapProps,
  HandleEmailLinkVerificationParams,
  HandleOAuthCallbackParams,
  InstanceType,
  ListenerCallback,
  LoadedClerk,
  OrganizationListProps,
  OrganizationProfileProps,
  OrganizationResource,
  OrganizationSwitcherProps,
  RedirectOptions,
  SDKMetadata,
  SetActiveParams,
  SignInProps,
  SignInRedirectOptions,
  SignInResource,
  SignOut,
  SignOutCallback,
  SignOutOptions,
  SignUpProps,
  SignUpRedirectOptions,
  SignUpResource,
  UnsubscribeCallback,
  UserButtonProps,
  UserProfileProps,
  UserResource,
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

type IsomorphicLoadedClerk = Without<
  LoadedClerk,
  /**
   * Override ClerkJS methods in order to support premountMethodCalls
   */
  | 'buildSignInUrl'
  | 'buildSignUpUrl'
  | 'buildUserProfileUrl'
  | 'buildCreateOrganizationUrl'
  | 'buildOrganizationProfileUrl'
  | 'buildAfterSignUpUrl'
  | 'buildAfterSignInUrl'
  | 'buildAfterSignOutUrl'
  | 'buildAfterMultiSessionSingleSignOutUrl'
  | 'buildUrlWithAuth'
  | 'handleRedirectCallback'
  | 'handleGoogleOneTapCallback'
  | 'handleUnauthenticated'
  | 'authenticateWithMetamask'
  | 'authenticateWithCoinbase'
  | 'authenticateWithWeb3'
  | 'authenticateWithGoogleOneTap'
  | 'createOrganization'
  | 'getOrganization'
  | 'mountUserButton'
  | 'mountOrganizationList'
  | 'mountOrganizationSwitcher'
  | 'mountOrganizationProfile'
  | 'mountCreateOrganization'
  | 'mountSignUp'
  | 'mountSignIn'
  | 'mountUserProfile'
  | '__experimental_mountUserVerification'
  | 'client'
> & {
  // TODO: Align return type and parms
  handleRedirectCallback: (params: HandleOAuthCallbackParams) => void;
  handleGoogleOneTapCallback: (signInOrUp: SignInResource | SignUpResource, params: HandleOAuthCallbackParams) => void;
  handleUnauthenticated: () => void;
  // TODO: Align Promise unknown
  authenticateWithMetamask: (params: AuthenticateWithMetamaskParams) => Promise<void>;
  authenticateWithCoinbase: (params: AuthenticateWithCoinbaseParams) => Promise<void>;
  authenticateWithWeb3: (params: ClerkAuthenticateWithWeb3Params) => Promise<void>;
  authenticateWithGoogleOneTap: (
    params: AuthenticateWithGoogleOneTapParams,
  ) => Promise<SignInResource | SignUpResource>;
  // TODO: Align return type (maybe not possible or correct)
  createOrganization: (params: CreateOrganizationParams) => Promise<OrganizationResource | void>;
  // TODO: Align return type (maybe not possible or correct)
  getOrganization: (organizationId: string) => Promise<OrganizationResource | void>;

  // TODO: Align return type
  buildSignInUrl: (opts?: RedirectOptions) => string | void;
  // TODO: Align return type
  buildSignUpUrl: (opts?: RedirectOptions) => string | void;
  // TODO: Align return type
  buildUserProfileUrl: () => string | void;
  // TODO: Align return type
  buildCreateOrganizationUrl: () => string | void;
  // TODO: Align return type
  buildOrganizationProfileUrl: () => string | void;
  // TODO: Align return type
  buildAfterSignInUrl: () => string | void;
  // TODO: Align return type
  buildAfterSignUpUrl: () => string | void;
  // TODO: Align return type
  buildAfterSignOutUrl: () => string | void;
  // TODO: Align return type
  buildAfterMultiSessionSingleSignOutUrl: () => string | void;
  // TODO: Align optional props
  mountUserButton: (node: HTMLDivElement, props: UserButtonProps) => void;
  mountOrganizationList: (node: HTMLDivElement, props: OrganizationListProps) => void;
  mountOrganizationSwitcher: (node: HTMLDivElement, props: OrganizationSwitcherProps) => void;
  mountOrganizationProfile: (node: HTMLDivElement, props: OrganizationProfileProps) => void;
  mountCreateOrganization: (node: HTMLDivElement, props: CreateOrganizationProps) => void;
  mountSignUp: (node: HTMLDivElement, props: SignUpProps) => void;
  mountSignIn: (node: HTMLDivElement, props: SignInProps) => void;
  mountUserProfile: (node: HTMLDivElement, props: UserProfileProps) => void;
  __experimental_mountUserVerification: (node: HTMLDivElement, props: __experimental_UserVerificationProps) => void;
  client: ClientResource | undefined;
};

export class IsomorphicClerk implements IsomorphicLoadedClerk {
  private readonly mode: 'browser' | 'server';
  private readonly options: IsomorphicClerkOptions;
  private readonly Clerk: ClerkProp;
  private clerkjs: BrowserClerk | HeadlessBrowserClerk | null = null;
  private preopenOneTap?: null | GoogleOneTapProps = null;
  private preopenUserVerification?: null | __experimental_UserVerificationProps = null;
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
  private premountUserVerificationNodes = new Map<HTMLDivElement, __experimental_UserVerificationProps>();
  private premountMethodCalls = new Map<MethodName<BrowserClerk>, MethodCallback>();
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
    if (!inBrowser() || !this.#instance || (options.Clerk && this.#instance.Clerk !== options.Clerk)) {
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

    void this.loadClerkJS();
  }

  get sdkMetadata(): SDKMetadata | undefined {
    return this.clerkjs?.sdkMetadata || this.options.sdkMetadata || undefined;
  }

  get instanceType(): InstanceType | undefined {
    return this.clerkjs?.instanceType;
  }

  get frontendApi(): string {
    return this.clerkjs?.frontendApi || '';
  }

  get isStandardBrowser(): boolean {
    return this.clerkjs?.isStandardBrowser || this.options.standardBrowser || false;
  }

  get isSatellite(): boolean {
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

  buildAfterSignInUrl = (): string | void => {
    const callback = () => this.clerkjs?.buildAfterSignInUrl() || '';
    if (this.clerkjs && this.#loaded) {
      return callback();
    } else {
      this.premountMethodCalls.set('buildAfterSignInUrl', callback);
    }
  };

  buildAfterSignUpUrl = (): string | void => {
    const callback = () => this.clerkjs?.buildAfterSignUpUrl() || '';
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

  buildUrlWithAuth = (to: string): string | void => {
    const callback = () => this.clerkjs?.buildUrlWithAuth(to) || '';
    if (this.clerkjs && this.#loaded) {
      return callback();
    } else {
      this.premountMethodCalls.set('buildUrlWithAuth', callback);
    }
  };

  handleUnauthenticated = (): void => {
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
      } else {
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
      clerkjs.__experimental_openUserVerification(this.preopenUserVerification);
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

    this.premountSignInNodes.forEach((props: SignInProps, node: HTMLDivElement) => {
      clerkjs.mountSignIn(node, props);
    });

    this.premountSignUpNodes.forEach((props: SignUpProps, node: HTMLDivElement) => {
      clerkjs.mountSignUp(node, props);
    });

    this.premountUserProfileNodes.forEach((props: UserProfileProps, node: HTMLDivElement) => {
      clerkjs.mountUserProfile(node, props);
    });

    this.premountUserVerificationNodes.forEach((props: __experimental_UserVerificationProps, node: HTMLDivElement) => {
      clerkjs.__experimental_mountUserVerification(node, props);
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

  get telemetry(): TelemetryCollector | undefined {
    if (this.clerkjs) {
      // @ts-expect-error -- We can't add the type here due to the TelemetryCollector type existing in shared, but the Clerk type existing in types
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
  setActive = ({ session, organization, beforeEmit }: SetActiveParams): Promise<void> => {
    if (this.clerkjs) {
      return this.clerkjs.setActive({ session, organization, beforeEmit });
    } else {
      return Promise.reject();
    }
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

  __experimental_openUserVerification = (props?: __experimental_UserVerificationModalProps): void => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.__experimental_openUserVerification(props);
    } else {
      this.preopenUserVerification = props;
    }
  };

  __experimental_closeUserVerification = (): void => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.__experimental_closeUserVerification();
    } else {
      this.preopenUserVerification = null;
    }
  };

  openGoogleOneTap = (props?: GoogleOneTapProps): void => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.openGoogleOneTap(props);
    } else {
      this.preopenOneTap = props;
    }
  };

  closeGoogleOneTap = (): void => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.closeGoogleOneTap();
    } else {
      this.preopenOneTap = null;
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

  __experimental_mountUserVerification = (node: HTMLDivElement, props: __experimental_UserVerificationProps): void => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.__experimental_mountUserVerification(node, props);
    } else {
      this.premountUserVerificationNodes.set(node, props);
    }
  };

  __experimental_unmountUserVerification = (node: HTMLDivElement): void => {
    if (this.clerkjs && this.#loaded) {
      this.clerkjs.__experimental_unmountUserVerification(node);
    } else {
      this.premountUserVerificationNodes.delete(node);
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

  navigate = (to: string): void => {
    const callback = () => this.clerkjs?.navigate(to);
    if (this.clerkjs && this.#loaded) {
      void callback();
    } else {
      this.premountMethodCalls.set('navigate', callback);
    }
  };

  redirectWithAuth = async (...args: Parameters<Clerk['redirectWithAuth']>): Promise<unknown> => {
    const callback = () => this.clerkjs?.redirectWithAuth(...args);
    if (this.clerkjs && this.#loaded) {
      return callback();
    } else {
      this.premountMethodCalls.set('redirectWithAuth', callback);
      return;
    }
  };

  redirectToSignIn = async (opts: SignInRedirectOptions): Promise<unknown> => {
    const callback = () => this.clerkjs?.redirectToSignIn(opts as any);
    if (this.clerkjs && this.#loaded) {
      return callback();
    } else {
      this.premountMethodCalls.set('redirectToSignIn', callback);
      return;
    }
  };

  redirectToSignUp = async (opts: SignUpRedirectOptions): Promise<unknown> => {
    const callback = () => this.clerkjs?.redirectToSignUp(opts as any);
    if (this.clerkjs && this.#loaded) {
      return callback();
    } else {
      this.premountMethodCalls.set('redirectToSignUp', callback);
      return;
    }
  };

  redirectToUserProfile = async (): Promise<unknown> => {
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

  redirectToAfterSignIn = (): void => {
    const callback = () => this.clerkjs?.redirectToAfterSignIn();
    if (this.clerkjs && this.#loaded) {
      callback();
    } else {
      this.premountMethodCalls.set('redirectToAfterSignIn', callback);
    }
  };

  redirectToAfterSignOut = (): void => {
    const callback = () => this.clerkjs?.redirectToAfterSignOut();
    if (this.clerkjs && this.#loaded) {
      callback();
    } else {
      this.premountMethodCalls.set('redirectToAfterSignOut', callback);
    }
  };

  redirectToOrganizationProfile = async (): Promise<unknown> => {
    const callback = () => this.clerkjs?.redirectToOrganizationProfile();
    if (this.clerkjs && this.#loaded) {
      return callback();
    } else {
      this.premountMethodCalls.set('redirectToOrganizationProfile', callback);
      return;
    }
  };

  redirectToCreateOrganization = async (): Promise<unknown> => {
    const callback = () => this.clerkjs?.redirectToCreateOrganization();
    if (this.clerkjs && this.#loaded) {
      return callback();
    } else {
      this.premountMethodCalls.set('redirectToCreateOrganization', callback);
      return;
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

  handleGoogleOneTapCallback = (
    signInOrUp: SignInResource | SignUpResource,
    params: HandleOAuthCallbackParams,
  ): void => {
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

  authenticateWithCoinbase = async (params: AuthenticateWithCoinbaseParams): Promise<void> => {
    const callback = () => this.clerkjs?.authenticateWithCoinbase(params);
    if (this.clerkjs && this.#loaded) {
      return callback() as Promise<void>;
    } else {
      this.premountMethodCalls.set('authenticateWithCoinbase', callback);
    }
  };

  authenticateWithWeb3 = async (params: ClerkAuthenticateWithWeb3Params): Promise<void> => {
    const callback = () => this.clerkjs?.authenticateWithWeb3(params);
    if (this.clerkjs && this.#loaded) {
      return callback() as Promise<void>;
    } else {
      this.premountMethodCalls.set('authenticateWithWeb3', callback);
    }
  };

  authenticateWithGoogleOneTap = async (
    params: AuthenticateWithGoogleOneTapParams,
  ): Promise<SignInResource | SignUpResource> => {
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
