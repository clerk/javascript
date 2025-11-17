declare namespace NodeJS {
  interface ProcessEnv {
    CLERK_SECRET_KEY: string | undefined;
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string | undefined;
    NEXT_PUBLIC_CLERK_PROXY_URL: string | undefined;
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: string | undefined;
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: string | undefined;
    NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL: string | undefined;
    NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL: string | undefined;
    NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: string | undefined;
    NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL: string | undefined;
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: string | undefined;
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: string | undefined;
  }
}

type RequireMetadata<T extends (to: any, metadata?: any) => any> = T extends (
  to: infer To,
  metadata?: infer Metadata,
) => infer R
  ? (to: To, metadata: Metadata) => R
  : never;

type NavigationFunction =
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  | RequireMetadata<NonNullable<import('./types').NextClerkProviderProps['routerPush']>>
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  | RequireMetadata<NonNullable<import('./types').NextClerkProviderProps['routerReplace']>>;

interface Window {
  __clerk_internal_navigations: Record<
    string,
    {
      fun: NavigationFunction;
      promisesBuffer: Array<() => void> | undefined;
    }
  >;
  __clerk_nav_await: Array<(value: void) => void>;
  __clerk_nav: (to: string) => Promise<void>;

  __unstable__onBeforeSetActive: (intent?: 'sign-out') => void | Promise<void>;
  __unstable__onAfterSetActive: () => void | Promise<void>;

  next?: {
    version: string;
  };
}

declare const PACKAGE_NAME: string;
declare const PACKAGE_VERSION: string;

declare namespace globalThis {
  // eslint-disable-next-line no-var
  var next:
    | {
        version?: string;
      }
    | undefined;
  // eslint-disable-next-line no-var
  var __clerk_internal_keyless_logger:
    | {
        __cache: Map<string, { expiresAt: number; data?: unknown }>;
        log: (param: { cacheKey: string; msg: string }) => void;
        run: (
          callback: () => Promise<unknown>,
          {
            cacheKey,
            onSuccessStale,
            onErrorStale,
          }: {
            cacheKey: string;
            onSuccessStale?: number;
            onErrorStale?: number;
          },
        ) => Promise<unknown>;
      }
    | undefined;
}
