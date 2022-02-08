import type {
  ActiveSessionResource,
  AuthenticateWithMetamaskParams,
  ClientResource,
  HandleMagicLinkVerificationParams,
  HandleOAuthCallbackParams,
  RedirectOptions,
  Resources,
  SessionResource,
  SignInProps,
  SignOutCallback,
  SignUpProps,
  UserButtonProps,
  UserProfileProps,
  UserResource,
} from '@clerk/types';

import { noFrontendApiError } from './errors';
import type {
  BrowserClerk,
  BrowserClerkConstructor,
  ClerkProp,
  IsomorphicClerkOptions,
} from './types';
import { inBrowser, isConstructor, loadScript } from './utils';

export interface Global {
  Clerk?: BrowserClerk;
}

declare const global: Global;

type MethodName<T> = {
  [P in keyof T]: T[P] extends Function ? P : never;
}[keyof T];
type MethodCallback = () => void;

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
  private premountUserProfileNodes = new Map<
    HTMLDivElement,
    UserProfileProps
  >();
  private premountUserButtonNodes = new Map<HTMLDivElement, UserButtonProps>();
  private premountMethodCalls = new Map<
    MethodName<BrowserClerk>,
    MethodCallback
  >();

  private _loaded = false;

  ssrData: string | null = null;
  ssrClient?: ClientResource;
  ssrSession?: SessionResource | null;

  constructor(
    frontendApi: string,
    options: IsomorphicClerkOptions = {},
    Clerk: ClerkProp = null,
  ) {
    this.frontendApi = frontendApi;
    this.options = options;
    this.Clerk = Clerk;

    this.mode = inBrowser() ? 'browser' : 'server';

    // TODO: Support SRR for NextJS
    // const ssrDataNode = document.querySelector(`script[data-clerk="SSR"]`);
    // if (ssrDataNode) {
    //   this.ssrData = ssrDataNode.innerHTML;
    //   const parsedData = JSON.parse(this.ssrData);
    //   this.ssrClient = parsedData.client;
    //   this.ssrSession = parsedData.session;
    // }
  }

  async loadClerkJS(): Promise<BrowserClerk | undefined> {
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
        await loadScript(this.frontendApi, this.options.scriptUrl);

        if (!global.Clerk) {
          throw new Error(
            'Failed to download latest ClerkJS. Contact support@clerk.dev.',
          );
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

    this.premountSignInNodes.forEach(
      (props: SignInProps, node: HTMLDivElement) => {
        clerkjs.mountSignIn(node, props);
      },
    );

    this.premountSignUpNodes.forEach(
      (props: SignUpProps, node: HTMLDivElement) => {
        clerkjs.mountSignUp(node, props);
      },
    );

    this.premountUserProfileNodes.forEach(
      (props: UserProfileProps, node: HTMLDivElement) => {
        clerkjs.mountUserProfile(node, props);
      },
    );

    this.premountUserButtonNodes.forEach(
      (props: UserButtonProps, node: HTMLDivElement) => {
        clerkjs.mountUserButton(node, props);
      },
    );

    this._loaded = true;

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
      // TODO: add ssr condition
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
    if (this.clerkjs && this._loaded) {
      this.clerkjs.openSignIn(props);
    } else {
      this.preopenSignIn = props;
    }
  };

  closeSignIn = (): void => {
    if (this.clerkjs && this._loaded) {
      this.clerkjs.closeSignIn();
    } else {
      this.preopenSignIn = null;
    }
  };

  openSignUp = (props?: SignUpProps): void => {
    if (this.clerkjs && this._loaded) {
      this.clerkjs.openSignUp(props);
    } else {
      this.preopenSignUp = props;
    }
  };

  closeSignUp = (): void => {
    if (this.clerkjs && this._loaded) {
      this.clerkjs.closeSignUp();
    } else {
      this.preopenSignUp = null;
    }
  };

  mountSignIn = (node: HTMLDivElement, props: SignInProps): void => {
    if (this.clerkjs && this._loaded) {
      this.clerkjs.mountSignIn(node, props);
    } else {
      this.premountSignInNodes.set(node, props);
    }
  };

  unmountSignIn = (node: HTMLDivElement): void => {
    if (this.clerkjs && this._loaded) {
      this.clerkjs.unmountSignIn(node);
    } else {
      this.premountSignInNodes.delete(node);
    }
  };

  mountSignUp = (node: HTMLDivElement, props: SignUpProps): void => {
    if (this.clerkjs && this._loaded) {
      this.clerkjs.mountSignUp(node, props);
    } else {
      this.premountSignUpNodes.set(node, props);
    }
  };

  unmountSignUp = (node: HTMLDivElement): void => {
    if (this.clerkjs && this._loaded) {
      this.clerkjs.unmountSignUp(node);
    } else {
      this.premountSignUpNodes.delete(node);
    }
  };

  mountUserProfile = (node: HTMLDivElement, props: UserProfileProps): void => {
    if (this.clerkjs && this._loaded) {
      this.clerkjs.mountUserProfile(node, props);
    } else {
      this.premountUserProfileNodes.set(node, props);
    }
  };

  unmountUserProfile = (node: HTMLDivElement): void => {
    if (this.clerkjs && this._loaded) {
      this.clerkjs.unmountUserProfile(node);
    } else {
      this.premountUserProfileNodes.delete(node);
    }
  };

  mountUserButton = (
    node: HTMLDivElement,
    userButtonProps: UserButtonProps,
  ): void => {
    if (this.clerkjs && this._loaded) {
      this.clerkjs.mountUserButton(node, userButtonProps);
    } else {
      this.premountUserButtonNodes.set(node, userButtonProps);
    }
  };

  unmountUserButton = (node: HTMLDivElement): void => {
    if (this.clerkjs && this._loaded) {
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

  loadFromServer = (token: string): void => {
    if (this.mode === 'browser') {
      void this.throwError(
        'loadFromServer cannot be called in a browser context.',
      );
    }

    this.ssrData = JSON.stringify({
      client: this.client,
      session: this.session,
      token: token,
    });
  };

  navigate = (to: string): void => {
    const callback = () => this.clerkjs?.navigate(to);
    if (this.clerkjs && this._loaded) {
      void callback();
    } else {
      this.premountMethodCalls.set('navigate', callback);
    }
  };

  // DX: deprecated <=2.4.2
  // Deprecate the boolean type before removing returnBack
  redirectToSignIn = (opts: RedirectOptions | boolean): void => {
    const callback = () => this.clerkjs?.redirectToSignIn(opts as any);
    if (this.clerkjs && this._loaded) {
      void callback();
    } else {
      this.premountMethodCalls.set('redirectToSignIn', callback);
    }
  };

  // DX: deprecated <=2.4.2
  // Deprecate the boolean type before removing returnBack
  redirectToSignUp = (opts: RedirectOptions | boolean): void => {
    const callback = () => this.clerkjs?.redirectToSignUp(opts as any);
    if (this.clerkjs && this._loaded) {
      void callback();
    } else {
      this.premountMethodCalls.set('redirectToSignUp', callback);
    }
  };

  redirectToUserProfile = (): void => {
    const callback = () => this.clerkjs?.redirectToUserProfile();
    if (this.clerkjs && this._loaded) {
      callback();
    } else {
      this.premountMethodCalls.set('redirectToUserProfile', callback);
    }
  };

  handleRedirectCallback = (params: HandleOAuthCallbackParams): void => {
    const callback = () => this.clerkjs?.handleRedirectCallback(params);
    if (this.clerkjs && this._loaded) {
      void callback();
    } else {
      this.premountMethodCalls.set('handleRedirectCallback', callback);
    }
  };

  handleMagicLinkVerification = async (
    params: HandleMagicLinkVerificationParams,
  ): Promise<void> => {
    const callback = () => this.clerkjs?.handleMagicLinkVerification(params);
    if (this.clerkjs && this._loaded) {
      return callback() as Promise<void>;
    } else {
      this.premountMethodCalls.set('handleMagicLinkVerification', callback);
    }
  };

  authenticateWithMetamask = async (
    params: AuthenticateWithMetamaskParams,
  ): Promise<void> => {
    const callback = () => this.clerkjs?.authenticateWithMetamask(params);
    if (this.clerkjs && this._loaded) {
      return callback() as Promise<void>;
    } else {
      this.premountMethodCalls.set('authenticateWithMetamask', callback);
    }
  };

  signOut = async (signOutCallback?: SignOutCallback): Promise<void> => {
    const callback = () => this.clerkjs?.signOut(signOutCallback);
    if (this.clerkjs && this._loaded) {
      return callback() as Promise<void>;
    } else {
      this.premountMethodCalls.set('signOut', callback);
    }
  };

  signOutOne = async (signOutCallback?: SignOutCallback): Promise<void> => {
    const callback = () => this.clerkjs?.signOutOne(signOutCallback);
    if (this.clerkjs && this._loaded) {
      return callback() as Promise<void>;
    } else {
      this.premountMethodCalls.set('signOutOne', callback);
    }
  };
}
