import type {
  ActiveSessionResource,
  AuthenticateWithMetamaskParams,
  ClientResource,
  CreateOrganizationParams,
  HandleMagicLinkVerificationParams,
  HandleOAuthCallbackParams,
  InitialState,
  OrganizationMembershipResource,
  OrganizationResource,
  RedirectOptions,
  Resources,
  SignInProps,
  SignOut,
  SignOutCallback,
  SignOutOptions,
  SignUpProps,
  UserButtonProps,
  UserProfileProps,
  UserResource,
} from '@clerk/types';

import { noFrontendApiError } from './errors';
import type { BrowserClerk, BrowserClerkConstructor, ClerkProp, IsomorphicClerkOptions } from './types';
import { inClientSide, isConstructor, loadScript } from './utils';

export interface Global {
  Clerk?: BrowserClerk;
}

declare const global: Global;

type MethodName<T> = {
  [P in keyof T]: T[P] extends Function ? P : never;
}[keyof T];
type MethodCallback = () => void;

type NewIsomorphicClerkParams = {
  frontendApi: string;
  options: IsomorphicClerkOptions;
  Clerk: ClerkProp | null;
  initialState?: InitialState;
};

export default class IsomorphicClerk {
  private mode: string;
  private frontendApi: string;
  private options: IsomorphicClerkOptions;
  private Clerk: ClerkProp;
  private clerkjs: BrowserClerk | null = null;
  private preopenSignIn?: null | SignInProps = null;
  private preopenSignUp?: null | SignUpProps = null;
  private premountSignInNodes = new Map<HTMLDivElement, SignInProps>();
  private premountSignUpNodes = new Map<HTMLDivElement, SignUpProps>();
  private premountUserProfileNodes = new Map<HTMLDivElement, UserProfileProps>();
  private premountUserButtonNodes = new Map<HTMLDivElement, UserButtonProps>();
  private premountMethodCalls = new Map<MethodName<BrowserClerk>, MethodCallback>();
  private loadedListeners: Array<() => void> = [];

  #loaded = false;

  initialState: InitialState | undefined;

  get loaded(): boolean {
    return this.#loaded;
  }

  static #instance: IsomorphicClerk;

  static getOrCreateInstance(params: NewIsomorphicClerkParams) {
    if (!this.#instance) {
      this.#instance = new IsomorphicClerk(params);
    }
    return this.#instance;
  }

  constructor(params: NewIsomorphicClerkParams) {
    if (IsomorphicClerk.#instance) {
      throw new Error('An IsomorphicClerk instance already exists. Use IsomorphicClerk.getOrCreateInstance instead');
    }

    const { Clerk = null, frontendApi, initialState, options = {} } = params || {};
    this.frontendApi = frontendApi;
    this.options = options;
    this.Clerk = Clerk;
    this.initialState = initialState;
    this.mode = inClientSide() ? 'browser' : 'server';
  }

  async loadClerkJS(): Promise<BrowserClerk | undefined> {
    if (this.#loaded) {
      return;
    }

    if (!this.frontendApi) {
      this.throwError(noFrontendApiError);
    }
    try {
      if (this.Clerk) {
        // Set a fixed Clerk version
        let c;

        if (isConstructor<BrowserClerkConstructor>(this.Clerk)) {
          // Construct a new Clerk object if a constructor is passed
          c = new this.Clerk(this.frontendApi);
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
        await loadScript({
          frontendApi: this.frontendApi,
          scriptUrl: this.options.clerkJSUrl,
          scriptVariant: this.options.clerkJSVariant,
        });

        if (!global.Clerk) {
          throw new Error('Failed to download latest ClerkJS. Contact support@clerk.dev.');
        }

        await global.Clerk.load(this.options);
      }

      return this.hydrateClerkJS(global.Clerk);
    } catch (err) {
      let message;

      if (err instanceof Error) {
        message = err.message;
      } else {
        message = String(err);
      }

      this.throwError(message);

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

  // Custom wrapper to throw an error, since we need to apply different handling between
  // production and development builds. In Next.js we can throw a full screen error in
  // development mode. However, in production throwing an error results in an infinite loop
  // as shown at https://github.com/vercel/next.js/issues/6973
  throwError(errorMsg: string): void {
    if (process.env.NODE_ENV === 'production') {
      console.error(errorMsg);
    }
    throw new Error(errorMsg);
  }

  private hydrateClerkJS = async (clerkjs: BrowserClerk | undefined) => {
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
      // TODO: add ssr condition
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

  // TODO: Remove temp use of __unstable__environment
  get __unstable__environment(): any {
    if (this.clerkjs) {
      return (this.clerkjs as any).__unstable__environment;
      // TODO: add ssr condition
    } else {
      return undefined;
    }
  }

  setSession = (
    session: ActiveSessionResource | string | null,
    beforeEmit?: (session: ActiveSessionResource | null) => void | Promise<any>,
  ): Promise<void> => {
    if (this.clerkjs) {
      return this.clerkjs.setSession(session, beforeEmit);
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

  addListener = (listener: (emission: Resources) => void): void => {
    const callback = () => this.clerkjs?.addListener(listener);
    if (this.clerkjs) {
      callback();
    } else {
      this.premountMethodCalls.set('addListener', callback);
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

  redirectToSignIn = (opts: RedirectOptions): void => {
    const callback = () => this.clerkjs?.redirectToSignIn(opts as any);
    if (this.clerkjs && this.#loaded) {
      void callback();
    } else {
      this.premountMethodCalls.set('redirectToSignIn', callback);
    }
  };

  redirectToSignUp = (opts: RedirectOptions): void => {
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

  handleRedirectCallback = (params: HandleOAuthCallbackParams): void => {
    const callback = () => this.clerkjs?.handleRedirectCallback(params);
    if (this.clerkjs && this.#loaded) {
      void callback();
    } else {
      this.premountMethodCalls.set('handleRedirectCallback', callback);
    }
  };

  handleMagicLinkVerification = async (params: HandleMagicLinkVerificationParams): Promise<void> => {
    const callback = () => this.clerkjs?.handleMagicLinkVerification(params);
    if (this.clerkjs && this.#loaded) {
      return callback() as Promise<void>;
    } else {
      this.premountMethodCalls.set('handleMagicLinkVerification', callback);
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
