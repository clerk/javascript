import { inBrowser } from '@clerk/shared/browser';
import { clerkEvents, createClerkEventBus } from '@clerk/shared/clerkEventBus';
import { loadClerkJsScript } from '@clerk/shared/loadClerkJsScript';
import { handleValueOrFn } from '@clerk/shared/utils';
import type {
  __internal_CheckoutProps,
  __internal_NavigateToTaskIfAvailableParams,
  __internal_OAuthConsentProps,
  __internal_PlanDetailsProps,
  __internal_SubscriptionDetailsProps,
  __internal_UserVerificationModalProps,
  __internal_UserVerificationProps,
  APIKeysNamespace,
  APIKeysProps,
  AuthenticateWithCoinbaseWalletParams,
  AuthenticateWithGoogleOneTapParams,
  AuthenticateWithMetamaskParams,
  AuthenticateWithOKXWalletParams,
  Clerk,
  ClerkAuthenticateWithWeb3Params,
  ClerkOptions,
  ClerkStatus,
  ClientResource,
  CommerceBillingNamespace,
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
  PricingTableProps,
  RedirectOptions,
  SetActiveParams,
  SignInProps,
  SignInRedirectOptions,
  SignInResource,
  SignUpProps,
  SignUpRedirectOptions,
  SignUpResource,
  TaskSelectOrganizationProps,
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
  | 'billing'
  | 'apiKeys'
  | '__internal_setComponentNavigationContext'
  | '__internal_setActiveInProgress'
  | '__internal_hasAfterAuthFlows'
> & {
  client: ClientResource | undefined;
  billing: CommerceBillingNamespace | undefined;
  apiKeys: APIKeysNamespace | undefined;
};

export class IsomorphicClerk implements IsomorphicLoadedClerk {
  private readonly mode: 'browser' | 'server';
  private readonly options: IsomorphicClerkOptions;
  private readonly Clerk: ClerkProp;
  private clerkjs: BrowserClerk | HeadlessBrowserClerk | null = null;
  private preopenOneTap?: null | GoogleOneTapProps = null;
  private preopenUserVerification?: null | __internal_UserVerificationProps = null;
  private preopenSignIn?: null | SignInProps = null;
  private preopenCheckout?: null | __internal_CheckoutProps = null;
  private preopenPlanDetails: null | __internal_PlanDetailsProps = null;
  private preopenSubscriptionDetails: null | __internal_SubscriptionDetailsProps = null;
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
  private premountPricingTableNodes = new Map<HTMLDivElement, PricingTableProps | undefined>();
  private premountApiKeysNodes = new Map<HTMLDivElement, APIKeysProps | undefined>();
  private premountOAuthConsentNodes = new Map<HTMLDivElement, __internal_OAuthConsentProps | undefined>();
  private premountTaskSelectOrganizationNodes = new Map<HTMLDivElement, TaskSelectOrganizationProps | undefined>();
  // A separate Map of `addListener` method calls to handle multiple listeners.
  private premountAddListenerCalls = new Map<
    ListenerCallback,
    {
      unsubscribe: UnsubscribeCallback;
      nativeUnsubscribe?: UnsubscribeCallback;
    }
  >();
  private loadedListeners: Array<() => void> = [];

  #status: ClerkStatus = 'loading';
  #domain: DomainOrProxyUrl['domain'];
  #proxyUrl: DomainOrProxyUrl['proxyUrl'];
  #publishableKey: string;
  #eventBus = createClerkEventBus();

  get publishableKey(): string {
    return this.#publishableKey;
  }

  get loaded(): boolean {
    return this.clerkjs?.loaded || false;
  }

  get status(): ClerkStatus {
    /**
     * If clerk-js is not available the returned value can either be "loading" or "error".
     */
    if (!this.clerkjs) {
      return this.#status;
    }
    return (
      this.clerkjs?.status ||
      /**
       * Support older clerk-js versions.
       * If clerk-js is available but `.status` is missing it we need to fallback to `.loaded`.
       * Since "degraded" an "error" did not exist before,
       * map "loaded" to "ready" and "not loaded" to "loading".
       */
      (this.clerkjs.loaded ? 'ready' : 'loading')
    );
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

  /**
   * Accesses private options from the `Clerk` instance and defaults to
   * `IsomorphicClerk` options when in SSR context.
   *  @internal
   */
  public __internal_getOption<K extends keyof ClerkOptions>(key: K): ClerkOptions[K] | undefined {
    return this.clerkjs?.__internal_getOption ? this.clerkjs?.__internal_getOption(key) : this.options[key];
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
    this.#eventBus.emit(clerkEvents.Status, 'loading');
    this.#eventBus.prioritizedOn(clerkEvents.Status, status => (this.#status = status));

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
    if (this.clerkjs && this.loaded) {
      return callback();
    } else {
      this.premountMethodCalls.set('buildSignInUrl', callback);
    }
  };

  buildSignUpUrl = (opts?: RedirectOptions): string | void => {
    const callback = () => this.clerkjs?.buildSignUpUrl(opts) || '';
    if (this.clerkjs && this.loaded) {
      return callback();
    } else {
      this.premountMethodCalls.set('buildSignUpUrl', callback);
    }
  };

  buildAfterSignInUrl = (...args: Parameters<Clerk['buildAfterSignInUrl']>): string | void => {
    const callback = () => this.clerkjs?.buildAfterSignInUrl(...args) || '';
    if (this.clerkjs && this.loaded) {
      return callback();
    } else {
      this.premountMethodCalls.set('buildAfterSignInUrl', callback);
    }
  };

  buildAfterSignUpUrl = (...args: Parameters<Clerk['buildAfterSignUpUrl']>): string | void => {
    const callback = () => this.clerkjs?.buildAfterSignUpUrl(...args) || '';
    if (this.clerkjs && this.loaded) {
      return callback();
    } else {
      this.premountMethodCalls.set('buildAfterSignUpUrl', callback);
    }
  };

  buildAfterSignOutUrl = (): string | void => {
    const callback = () => this.clerkjs?.buildAfterSignOutUrl() || '';
    if (this.clerkjs && this.loaded) {
      return callback();
    } else {
      this.premountMethodCalls.set('buildAfterSignOutUrl', callback);
    }
  };

  buildNewSubscriptionRedirectUrl = (): string | void => {
    const callback = () => this.clerkjs?.buildNewSubscriptionRedirectUrl() || '';
    if (this.clerkjs && this.loaded) {
      return callback();
    } else {
      this.premountMethodCalls.set('buildNewSubscriptionRedirectUrl', callback);
    }
  };

  buildAfterMultiSessionSingleSignOutUrl = (): string | void => {
    const callback = () => this.clerkjs?.buildAfterMultiSessionSingleSignOutUrl() || '';
    if (this.clerkjs && this.loaded) {
      return callback();
    } else {
      this.premountMethodCalls.set('buildAfterMultiSessionSingleSignOutUrl', callback);
    }
  };

  buildUserProfileUrl = (): string | void => {
    const callback = () => this.clerkjs?.buildUserProfileUrl() || '';
    if (this.clerkjs && this.loaded) {
      return callback();
    } else {
      this.premountMethodCalls.set('buildUserProfileUrl', callback);
    }
  };

  buildCreateOrganizationUrl = (): string | void => {
    const callback = () => this.clerkjs?.buildCreateOrganizationUrl() || '';
    if (this.clerkjs && this.loaded) {
      return callback();
    } else {
      this.premountMethodCalls.set('buildCreateOrganizationUrl', callback);
    }
  };

  buildOrganizationProfileUrl = (): string | void => {
    const callback = () => this.clerkjs?.buildOrganizationProfileUrl() || '';
    if (this.clerkjs && this.loaded) {
      return callback();
    } else {
      this.premountMethodCalls.set('buildOrganizationProfileUrl', callback);
    }
  };

  buildWaitlistUrl = (): string | void => {
    const callback = () => this.clerkjs?.buildWaitlistUrl() || '';
    if (this.clerkjs && this.loaded) {
      return callback();
    } else {
      this.premountMethodCalls.set('buildWaitlistUrl', callback);
    }
  };

  buildUrlWithAuth = (to: string): string | void => {
    const callback = () => this.clerkjs?.buildUrlWithAuth(to) || '';
    if (this.clerkjs && this.loaded) {
      return callback();
    } else {
      this.premountMethodCalls.set('buildUrlWithAuth', callback);
    }
  };

  handleUnauthenticated = async () => {
    const callback = () => this.clerkjs?.handleUnauthenticated();
    if (this.clerkjs && this.loaded) {
      void callback();
    } else {
      this.premountMethodCalls.set('handleUnauthenticated', callback);
    }
  };

  #waitForClerkJS(): Promise<HeadlessBrowserClerk | BrowserClerk> {
    return new Promise<HeadlessBrowserClerk | BrowserClerk>(resolve => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.addOnLoaded(() => resolve(this.clerkjs!));
    });
  }

  async loadClerkJS(): Promise<HeadlessBrowserClerk | BrowserClerk | undefined> {
    if (this.mode !== 'browser' || this.loaded) {
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

          this.beforeLoad(c);
          await c.load(this.options);
        } else {
          // Otherwise use the instantiated Clerk object
          c = this.Clerk;
          if (!c.loaded) {
            this.beforeLoad(c);
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

        this.beforeLoad(global.Clerk);
        await global.Clerk.load(this.options);
      }

      if (global.Clerk?.loaded) {
        return this.hydrateClerkJS(global.Clerk);
      }
      return;
    } catch (err) {
      const error = err as Error;
      this.#eventBus.emit(clerkEvents.Status, 'error');
      console.error(error.stack || error.message || error);
      return;
    }
  }

  public on: Clerk['on'] = (...args) => {
    // Support older clerk-js versions.
    if (this.clerkjs?.on) {
      return this.clerkjs.on(...args);
    } else {
      this.#eventBus.on(...args);
    }
  };

  public off: Clerk['off'] = (...args) => {
    // Support older clerk-js versions.
    if (this.clerkjs?.off) {
      return this.clerkjs.off(...args);
    } else {
      this.#eventBus.off(...args);
    }
  };

  /**
   * @deprecated Please use `addStatusListener`. This api will be removed in the next major.
   */
  public addOnLoaded = (cb: () => void) => {
    this.loadedListeners.push(cb);
    /**
     * When IsomorphicClerk is loaded execute the callback directly
     */
    if (this.loaded) {
      this.emitLoaded();
    }
  };

  /**
   * @deprecated Please use `__internal_setStatus`. This api will be removed in the next major.
   */
  public emitLoaded = () => {
    this.loadedListeners.forEach(cb => cb());
    this.loadedListeners = [];
  };

  private beforeLoad = (clerkjs: BrowserClerk | HeadlessBrowserClerk | undefined) => {
    if (!clerkjs) {
      throw new Error('Failed to hydrate latest Clerk JS');
    }
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

    this.#eventBus.internal.retrieveListeners('status')?.forEach(listener => {
      // Since clerkjs exists it will call `this.clerkjs.on('status', listener)`
      this.on('status', listener, { notify: true });
    });

    if (this.preopenSignIn !== null) {
      clerkjs.openSignIn(this.preopenSignIn);
    }

    if (this.preopenCheckout !== null) {
      clerkjs.__internal_openCheckout(this.preopenCheckout);
    }

    if (this.preopenPlanDetails !== null) {
      clerkjs.__internal_openPlanDetails(this.preopenPlanDetails);
    }

    if (this.preopenSubscriptionDetails !== null) {
      clerkjs.__internal_openSubscriptionDetails(this.preopenSubscriptionDetails);
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

    this.premountPricingTableNodes.forEach((props, node) => {
      clerkjs.mountPricingTable(node, props);
    });

    this.premountApiKeysNodes.forEach((props, node) => {
      clerkjs.mountApiKeys(node, props);
    });

    this.premountOAuthConsentNodes.forEach((props, node) => {
      clerkjs.__internal_mountOAuthConsent(node, props);
    });

    this.premountTaskSelectOrganizationNodes.forEach((props, node) => {
      clerkjs.mountTaskSelectOrganization(node, props);
    });

    /**
     * Only update status in case `clerk.status` is missing. In any other case, `clerk-js` should be the orchestrator.
     */
    if (typeof this.clerkjs.status === 'undefined') {
      this.#eventBus.emit(clerkEvents.Status, 'ready');
    }

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

  get billing(): CommerceBillingNamespace | undefined {
    return this.clerkjs?.billing;
  }

  get apiKeys(): APIKeysNamespace | undefined {
    return this.clerkjs?.apiKeys;
  }

  __experimental_checkout = (...args: Parameters<Clerk['__experimental_checkout']>) => {
    return this.clerkjs?.__experimental_checkout(...args);
  };

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

  __internal_navigateToTaskIfAvailable = async (params?: __internal_NavigateToTaskIfAvailableParams): Promise<void> => {
    if (this.clerkjs) {
      return this.clerkjs.__internal_navigateToTaskIfAvailable(params);
    } else {
      return Promise.reject();
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
    if (this.clerkjs && this.loaded) {
      this.clerkjs.openSignIn(props);
    } else {
      this.preopenSignIn = props;
    }
  };

  closeSignIn = () => {
    if (this.clerkjs && this.loaded) {
      this.clerkjs.closeSignIn();
    } else {
      this.preopenSignIn = null;
    }
  };

  __internal_openCheckout = (props?: __internal_CheckoutProps) => {
    if (this.clerkjs && this.loaded) {
      this.clerkjs.__internal_openCheckout(props);
    } else {
      this.preopenCheckout = props;
    }
  };

  __internal_closeCheckout = () => {
    if (this.clerkjs && this.loaded) {
      this.clerkjs.__internal_closeCheckout();
    } else {
      this.preopenCheckout = null;
    }
  };

  __internal_openPlanDetails = (props: __internal_PlanDetailsProps) => {
    if (this.clerkjs && this.loaded) {
      this.clerkjs.__internal_openPlanDetails(props);
    } else {
      this.preopenPlanDetails = props;
    }
  };

  __internal_closePlanDetails = () => {
    if (this.clerkjs && this.loaded) {
      this.clerkjs.__internal_closePlanDetails();
    } else {
      this.preopenPlanDetails = null;
    }
  };

  __internal_openSubscriptionDetails = (props?: __internal_SubscriptionDetailsProps) => {
    if (this.clerkjs && this.loaded) {
      this.clerkjs.__internal_openSubscriptionDetails(props);
    } else {
      this.preopenSubscriptionDetails = props ?? null;
    }
  };

  __internal_closeSubscriptionDetails = () => {
    if (this.clerkjs && this.loaded) {
      this.clerkjs.__internal_closeSubscriptionDetails();
    } else {
      this.preopenSubscriptionDetails = null;
    }
  };

  __internal_openReverification = (props?: __internal_UserVerificationModalProps) => {
    if (this.clerkjs && this.loaded) {
      this.clerkjs.__internal_openReverification(props);
    } else {
      this.preopenUserVerification = props;
    }
  };

  __internal_closeReverification = () => {
    if (this.clerkjs && this.loaded) {
      this.clerkjs.__internal_closeReverification();
    } else {
      this.preopenUserVerification = null;
    }
  };

  openGoogleOneTap = (props?: GoogleOneTapProps) => {
    if (this.clerkjs && this.loaded) {
      this.clerkjs.openGoogleOneTap(props);
    } else {
      this.preopenOneTap = props;
    }
  };

  closeGoogleOneTap = () => {
    if (this.clerkjs && this.loaded) {
      this.clerkjs.closeGoogleOneTap();
    } else {
      this.preopenOneTap = null;
    }
  };

  openUserProfile = (props?: UserProfileProps) => {
    if (this.clerkjs && this.loaded) {
      this.clerkjs.openUserProfile(props);
    } else {
      this.preopenUserProfile = props;
    }
  };

  closeUserProfile = () => {
    if (this.clerkjs && this.loaded) {
      this.clerkjs.closeUserProfile();
    } else {
      this.preopenUserProfile = null;
    }
  };

  openOrganizationProfile = (props?: OrganizationProfileProps) => {
    if (this.clerkjs && this.loaded) {
      this.clerkjs.openOrganizationProfile(props);
    } else {
      this.preopenOrganizationProfile = props;
    }
  };

  closeOrganizationProfile = () => {
    if (this.clerkjs && this.loaded) {
      this.clerkjs.closeOrganizationProfile();
    } else {
      this.preopenOrganizationProfile = null;
    }
  };

  openCreateOrganization = (props?: CreateOrganizationProps) => {
    if (this.clerkjs && this.loaded) {
      this.clerkjs.openCreateOrganization(props);
    } else {
      this.preopenCreateOrganization = props;
    }
  };

  closeCreateOrganization = () => {
    if (this.clerkjs && this.loaded) {
      this.clerkjs.closeCreateOrganization();
    } else {
      this.preopenCreateOrganization = null;
    }
  };

  openWaitlist = (props?: WaitlistProps) => {
    if (this.clerkjs && this.loaded) {
      this.clerkjs.openWaitlist(props);
    } else {
      this.preOpenWaitlist = props;
    }
  };

  closeWaitlist = () => {
    if (this.clerkjs && this.loaded) {
      this.clerkjs.closeWaitlist();
    } else {
      this.preOpenWaitlist = null;
    }
  };

  openSignUp = (props?: SignUpProps) => {
    if (this.clerkjs && this.loaded) {
      this.clerkjs.openSignUp(props);
    } else {
      this.preopenSignUp = props;
    }
  };

  closeSignUp = () => {
    if (this.clerkjs && this.loaded) {
      this.clerkjs.closeSignUp();
    } else {
      this.preopenSignUp = null;
    }
  };

  mountSignIn = (node: HTMLDivElement, props?: SignInProps) => {
    if (this.clerkjs && this.loaded) {
      this.clerkjs.mountSignIn(node, props);
    } else {
      this.premountSignInNodes.set(node, props);
    }
  };

  unmountSignIn = (node: HTMLDivElement) => {
    if (this.clerkjs && this.loaded) {
      this.clerkjs.unmountSignIn(node);
    } else {
      this.premountSignInNodes.delete(node);
    }
  };

  mountSignUp = (node: HTMLDivElement, props?: SignUpProps) => {
    if (this.clerkjs && this.loaded) {
      this.clerkjs.mountSignUp(node, props);
    } else {
      this.premountSignUpNodes.set(node, props);
    }
  };

  unmountSignUp = (node: HTMLDivElement) => {
    if (this.clerkjs && this.loaded) {
      this.clerkjs.unmountSignUp(node);
    } else {
      this.premountSignUpNodes.delete(node);
    }
  };

  mountUserProfile = (node: HTMLDivElement, props?: UserProfileProps) => {
    if (this.clerkjs && this.loaded) {
      this.clerkjs.mountUserProfile(node, props);
    } else {
      this.premountUserProfileNodes.set(node, props);
    }
  };

  unmountUserProfile = (node: HTMLDivElement) => {
    if (this.clerkjs && this.loaded) {
      this.clerkjs.unmountUserProfile(node);
    } else {
      this.premountUserProfileNodes.delete(node);
    }
  };

  mountOrganizationProfile = (node: HTMLDivElement, props?: OrganizationProfileProps) => {
    if (this.clerkjs && this.loaded) {
      this.clerkjs.mountOrganizationProfile(node, props);
    } else {
      this.premountOrganizationProfileNodes.set(node, props);
    }
  };

  unmountOrganizationProfile = (node: HTMLDivElement) => {
    if (this.clerkjs && this.loaded) {
      this.clerkjs.unmountOrganizationProfile(node);
    } else {
      this.premountOrganizationProfileNodes.delete(node);
    }
  };

  mountCreateOrganization = (node: HTMLDivElement, props?: CreateOrganizationProps) => {
    if (this.clerkjs && this.loaded) {
      this.clerkjs.mountCreateOrganization(node, props);
    } else {
      this.premountCreateOrganizationNodes.set(node, props);
    }
  };

  unmountCreateOrganization = (node: HTMLDivElement) => {
    if (this.clerkjs && this.loaded) {
      this.clerkjs.unmountCreateOrganization(node);
    } else {
      this.premountCreateOrganizationNodes.delete(node);
    }
  };

  mountOrganizationSwitcher = (node: HTMLDivElement, props?: OrganizationSwitcherProps) => {
    if (this.clerkjs && this.loaded) {
      this.clerkjs.mountOrganizationSwitcher(node, props);
    } else {
      this.premountOrganizationSwitcherNodes.set(node, props);
    }
  };

  unmountOrganizationSwitcher = (node: HTMLDivElement) => {
    if (this.clerkjs && this.loaded) {
      this.clerkjs.unmountOrganizationSwitcher(node);
    } else {
      this.premountOrganizationSwitcherNodes.delete(node);
    }
  };

  __experimental_prefetchOrganizationSwitcher = () => {
    const callback = () => this.clerkjs?.__experimental_prefetchOrganizationSwitcher();
    if (this.clerkjs && this.loaded) {
      void callback();
    } else {
      this.premountMethodCalls.set('__experimental_prefetchOrganizationSwitcher', callback);
    }
  };

  mountOrganizationList = (node: HTMLDivElement, props?: OrganizationListProps) => {
    if (this.clerkjs && this.loaded) {
      this.clerkjs.mountOrganizationList(node, props);
    } else {
      this.premountOrganizationListNodes.set(node, props);
    }
  };

  unmountOrganizationList = (node: HTMLDivElement) => {
    if (this.clerkjs && this.loaded) {
      this.clerkjs.unmountOrganizationList(node);
    } else {
      this.premountOrganizationListNodes.delete(node);
    }
  };

  mountUserButton = (node: HTMLDivElement, userButtonProps?: UserButtonProps) => {
    if (this.clerkjs && this.loaded) {
      this.clerkjs.mountUserButton(node, userButtonProps);
    } else {
      this.premountUserButtonNodes.set(node, userButtonProps);
    }
  };

  unmountUserButton = (node: HTMLDivElement) => {
    if (this.clerkjs && this.loaded) {
      this.clerkjs.unmountUserButton(node);
    } else {
      this.premountUserButtonNodes.delete(node);
    }
  };

  mountWaitlist = (node: HTMLDivElement, props?: WaitlistProps) => {
    if (this.clerkjs && this.loaded) {
      this.clerkjs.mountWaitlist(node, props);
    } else {
      this.premountWaitlistNodes.set(node, props);
    }
  };

  unmountWaitlist = (node: HTMLDivElement) => {
    if (this.clerkjs && this.loaded) {
      this.clerkjs.unmountWaitlist(node);
    } else {
      this.premountWaitlistNodes.delete(node);
    }
  };

  mountPricingTable = (node: HTMLDivElement, props?: PricingTableProps) => {
    if (this.clerkjs && this.loaded) {
      this.clerkjs.mountPricingTable(node, props);
    } else {
      this.premountPricingTableNodes.set(node, props);
    }
  };

  unmountPricingTable = (node: HTMLDivElement) => {
    if (this.clerkjs && this.loaded) {
      this.clerkjs.unmountPricingTable(node);
    } else {
      this.premountPricingTableNodes.delete(node);
    }
  };

  mountApiKeys = (node: HTMLDivElement, props?: APIKeysProps): void => {
    if (this.clerkjs && this.loaded) {
      this.clerkjs.mountApiKeys(node, props);
    } else {
      this.premountApiKeysNodes.set(node, props);
    }
  };

  unmountApiKeys = (node: HTMLDivElement): void => {
    if (this.clerkjs && this.loaded) {
      this.clerkjs.unmountApiKeys(node);
    } else {
      this.premountApiKeysNodes.delete(node);
    }
  };

  __internal_mountOAuthConsent = (node: HTMLDivElement, props?: __internal_OAuthConsentProps) => {
    if (this.clerkjs && this.loaded) {
      this.clerkjs.__internal_mountOAuthConsent(node, props);
    } else {
      this.premountOAuthConsentNodes.set(node, props);
    }
  };

  __internal_unmountOAuthConsent = (node: HTMLDivElement) => {
    if (this.clerkjs && this.loaded) {
      this.clerkjs.__internal_unmountOAuthConsent(node);
    } else {
      this.premountOAuthConsentNodes.delete(node);
    }
  };

  mountTaskSelectOrganization = (node: HTMLDivElement, props?: TaskSelectOrganizationProps): void => {
    if (this.clerkjs && this.loaded) {
      this.clerkjs.mountTaskSelectOrganization(node, props);
    } else {
      this.premountTaskSelectOrganizationNodes.set(node, props);
    }
  };

  unmountTaskSelectOrganization = (node: HTMLDivElement): void => {
    if (this.clerkjs && this.loaded) {
      this.clerkjs.unmountTaskSelectOrganization(node);
    } else {
      this.premountTaskSelectOrganizationNodes.delete(node);
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
    if (this.clerkjs && this.loaded) {
      void callback();
    } else {
      this.premountMethodCalls.set('navigate', callback);
    }
  };

  redirectWithAuth = async (...args: Parameters<Clerk['redirectWithAuth']>) => {
    const callback = () => this.clerkjs?.redirectWithAuth(...args);
    if (this.clerkjs && this.loaded) {
      return callback();
    } else {
      this.premountMethodCalls.set('redirectWithAuth', callback);
      return;
    }
  };

  redirectToSignIn = async (opts?: SignInRedirectOptions) => {
    const callback = () => this.clerkjs?.redirectToSignIn(opts as any);
    if (this.clerkjs && this.loaded) {
      return callback();
    } else {
      this.premountMethodCalls.set('redirectToSignIn', callback);
      return;
    }
  };

  redirectToSignUp = async (opts?: SignUpRedirectOptions) => {
    const callback = () => this.clerkjs?.redirectToSignUp(opts as any);
    if (this.clerkjs && this.loaded) {
      return callback();
    } else {
      this.premountMethodCalls.set('redirectToSignUp', callback);
      return;
    }
  };

  redirectToUserProfile = async () => {
    const callback = () => this.clerkjs?.redirectToUserProfile();
    if (this.clerkjs && this.loaded) {
      return callback();
    } else {
      this.premountMethodCalls.set('redirectToUserProfile', callback);
      return;
    }
  };

  redirectToAfterSignUp = (): void => {
    const callback = () => this.clerkjs?.redirectToAfterSignUp();
    if (this.clerkjs && this.loaded) {
      return callback();
    } else {
      this.premountMethodCalls.set('redirectToAfterSignUp', callback);
    }
  };

  redirectToAfterSignIn = () => {
    const callback = () => this.clerkjs?.redirectToAfterSignIn();
    if (this.clerkjs && this.loaded) {
      callback();
    } else {
      this.premountMethodCalls.set('redirectToAfterSignIn', callback);
    }
  };

  redirectToAfterSignOut = () => {
    const callback = () => this.clerkjs?.redirectToAfterSignOut();
    if (this.clerkjs && this.loaded) {
      callback();
    } else {
      this.premountMethodCalls.set('redirectToAfterSignOut', callback);
    }
  };

  redirectToOrganizationProfile = async () => {
    const callback = () => this.clerkjs?.redirectToOrganizationProfile();
    if (this.clerkjs && this.loaded) {
      return callback();
    } else {
      this.premountMethodCalls.set('redirectToOrganizationProfile', callback);
      return;
    }
  };

  redirectToCreateOrganization = async () => {
    const callback = () => this.clerkjs?.redirectToCreateOrganization();
    if (this.clerkjs && this.loaded) {
      return callback();
    } else {
      this.premountMethodCalls.set('redirectToCreateOrganization', callback);
      return;
    }
  };

  redirectToWaitlist = async () => {
    const callback = () => this.clerkjs?.redirectToWaitlist();
    if (this.clerkjs && this.loaded) {
      return callback();
    } else {
      this.premountMethodCalls.set('redirectToWaitlist', callback);
      return;
    }
  };

  handleRedirectCallback = async (params: HandleOAuthCallbackParams): Promise<void> => {
    const callback = () => this.clerkjs?.handleRedirectCallback(params);
    if (this.clerkjs && this.loaded) {
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
    if (this.clerkjs && this.loaded) {
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
    if (this.clerkjs && this.loaded) {
      return callback() as Promise<void>;
    } else {
      this.premountMethodCalls.set('handleEmailLinkVerification', callback);
    }
  };

  authenticateWithMetamask = async (params?: AuthenticateWithMetamaskParams) => {
    const callback = () => this.clerkjs?.authenticateWithMetamask(params);
    if (this.clerkjs && this.loaded) {
      return callback() as Promise<void>;
    } else {
      this.premountMethodCalls.set('authenticateWithMetamask', callback);
    }
  };

  authenticateWithCoinbaseWallet = async (params?: AuthenticateWithCoinbaseWalletParams) => {
    const callback = () => this.clerkjs?.authenticateWithCoinbaseWallet(params);
    if (this.clerkjs && this.loaded) {
      return callback() as Promise<void>;
    } else {
      this.premountMethodCalls.set('authenticateWithCoinbaseWallet', callback);
    }
  };

  authenticateWithOKXWallet = async (params?: AuthenticateWithOKXWalletParams) => {
    const callback = () => this.clerkjs?.authenticateWithOKXWallet(params);
    if (this.clerkjs && this.loaded) {
      return callback() as Promise<void>;
    } else {
      this.premountMethodCalls.set('authenticateWithOKXWallet', callback);
    }
  };

  authenticateWithWeb3 = async (params: ClerkAuthenticateWithWeb3Params) => {
    const callback = () => this.clerkjs?.authenticateWithWeb3(params);
    if (this.clerkjs && this.loaded) {
      return callback() as Promise<void>;
    } else {
      this.premountMethodCalls.set('authenticateWithWeb3', callback);
    }
  };

  authenticateWithGoogleOneTap = async (params: AuthenticateWithGoogleOneTapParams) => {
    const clerkjs = await this.#waitForClerkJS();
    return clerkjs.authenticateWithGoogleOneTap(params);
  };

  __internal_loadStripeJs = async () => {
    const clerkjs = await this.#waitForClerkJS();
    return clerkjs.__internal_loadStripeJs();
  };

  createOrganization = async (params: CreateOrganizationParams): Promise<OrganizationResource | void> => {
    const callback = () => this.clerkjs?.createOrganization(params);
    if (this.clerkjs && this.loaded) {
      return callback() as Promise<OrganizationResource>;
    } else {
      this.premountMethodCalls.set('createOrganization', callback);
    }
  };

  getOrganization = async (organizationId: string): Promise<OrganizationResource | void> => {
    const callback = () => this.clerkjs?.getOrganization(organizationId);
    if (this.clerkjs && this.loaded) {
      return callback() as Promise<OrganizationResource>;
    } else {
      this.premountMethodCalls.set('getOrganization', callback);
    }
  };

  joinWaitlist = async (params: JoinWaitlistParams): Promise<WaitlistResource | void> => {
    const callback = () => this.clerkjs?.joinWaitlist(params);
    if (this.clerkjs && this.loaded) {
      return callback() as Promise<WaitlistResource>;
    } else {
      this.premountMethodCalls.set('joinWaitlist', callback);
    }
  };

  signOut = async (...args: Parameters<Clerk['signOut']>) => {
    const callback = () => this.clerkjs?.signOut(...args);
    if (this.clerkjs && this.loaded) {
      return callback() as Promise<void>;
    } else {
      this.premountMethodCalls.set('signOut', callback);
    }
  };
}
