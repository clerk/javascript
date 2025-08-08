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
    clerk: PluginOptions;
  }
}

export {};
