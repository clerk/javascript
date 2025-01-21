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

interface Window {
  __unstable__onBeforeSetActive: () => void | Promise<void>;
  __unstable__onAfterSetActive: () => void | Promise<void>;
}

declare const PACKAGE_NAME: string;
declare const PACKAGE_VERSION: string;

declare module globalThis {
  // eslint-disable-next-line no-var
  var __clerk_internal_keyless_logger:
    | {
        __cache: Map<string, { expiresAt: number }>;
        log: (param: { cacheKey: string; msg: string }) => void;
      }
    | undefined;
}
