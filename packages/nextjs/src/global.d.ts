declare global {
  interface Window {
    __unstable__onBeforeSetActive: () => void | Promise<void>;
    __unstable__onAfterSetActive: () => void | Promise<void>;
  }
}

declare global {
  const PACKAGE_NAME: string;
  const PACKAGE_VERSION: string;
  namespace NodeJS {
    interface ProcessEnv {
      CLERK_SECRET_KEY: string | undefined;
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string | undefined;
      NEXT_PUBLIC_CLERK_PROXY_URL: string | undefined;
      NEXT_PUBLIC_CLERK_SIGN_IN_URL: string | undefined;
      NEXT_PUBLIC_CLERK_SIGN_UP_URL: string | undefined;
      NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: string | undefined;
      NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: string | undefined;
    }
  }
}

export {};
