/// <reference types="astro/client" />

interface InternalEnv {
  readonly PUBLIC_CLERK_FRONTEND_API?: string;
  readonly PUBLIC_CLERK_PUBLISHABLE_KEY?: string;
  readonly PUBLIC_CLERK_JS_URL?: string;
  readonly PUBLIC_CLERK_JS_VERSION?: string;
  readonly PUBLIC_CLERK_UI_URL?: string;
  readonly PUBLIC_CLERK_PREFETCH_UI?: string;
  readonly CLERK_API_KEY?: string;
  readonly CLERK_API_URL?: string;
  readonly CLERK_API_VERSION?: string;
  readonly CLERK_JWT_KEY?: string;
  readonly CLERK_SECRET_KEY?: string;
  readonly CLERK_MACHINE_SECRET_KEY?: string;
  readonly PUBLIC_CLERK_DOMAIN?: string;
  readonly PUBLIC_CLERK_IS_SATELLITE?: string;
  readonly PUBLIC_CLERK_PROXY_URL?: string;
  readonly PUBLIC_CLERK_SIGN_IN_URL?: string;
  readonly PUBLIC_CLERK_SIGN_UP_URL?: string;
  readonly PUBLIC_CLERK_TELEMETRY_DISABLED?: string;
  readonly PUBLIC_CLERK_TELEMETRY_DEBUG?: string;
  readonly PUBLIC_CLERK_KEYLESS_CLAIM_URL?: string;
  readonly PUBLIC_CLERK_KEYLESS_API_KEYS_URL?: string;
  readonly PUBLIC_CLERK_KEYLESS_DISABLED?: string;
}

interface ImportMeta {
  readonly env: InternalEnv;
}

declare namespace App {
  interface Locals {
    runtime: { env: InternalEnv };
    keylessClaimUrl?: string;
    keylessApiKeysUrl?: string;
    keylessPublishableKey?: string;
  }
}

declare module 'virtual:@clerk/astro/config' {
  import type { AstroConfig } from 'astro';

  export const astroConfig: AstroConfig;
  export function isStaticOutput(forceStatic?: boolean): boolean;
}
