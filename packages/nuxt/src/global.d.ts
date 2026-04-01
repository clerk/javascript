import type { PluginOptions } from '@clerk/vue';

declare global {
  const PACKAGE_NAME: string;
  const PACKAGE_VERSION: string;
}

// See https://nuxt.com/docs/guide/going-further/runtime-config#typing-runtime-config
declare module 'nuxt/schema' {
  interface RuntimeConfig {
    clerk: {
      secretKey?: string;
      machineSecretKey?: string;
      jwtKey?: string;
      webhookSigningSecret?: string;
    };
  }
  interface PublicRuntimeConfig {
    clerk: PluginOptions & {
      /**
       * The URL that `@clerk/clerk-js` should be hot-loaded from.
       * Supports NUXT_PUBLIC_CLERK_JS_URL env var.
       */
      jsUrl?: string;
      /**
       * The URL that `@clerk/ui` should be hot-loaded from.
       * Supports NUXT_PUBLIC_CLERK_UI_URL env var.
       */
      uiUrl?: string;
      /**
       * The npm version for `@clerk/clerk-js`.
       */
      clerkJSVersion?: string;
      /**
       * The npm version for `@clerk/ui`.
       */
      clerkUIVersion?: string;
    };
  }
}

export {};
