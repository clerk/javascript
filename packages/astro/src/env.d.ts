/// <reference types="astro/client" />

interface InternalEnv {
  readonly PUBLIC_CLERK_FRONTEND_API?: string;
  readonly PUBLIC_CLERK_PUBLISHABLE_KEY?: string;
  readonly PUBLIC_CLERK_JS_URL?: string;
  readonly PUBLIC_CLERK_JS_VERSION?: string;
  readonly PUBLIC_CLERK_UI_URL?: string;
  readonly PUBLIC_CLERK_UI_VERSION?: string;
  readonly PUBLIC_CLERK_PREFETCH_UI?: string;
  readonly PUBLIC_CLERK_SKIP_JS_CDN?: string;
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
}

interface ImportMeta {
  readonly env: InternalEnv;
}

declare namespace App {
  interface Locals {
    runtime: { env: InternalEnv };
  }
}

declare module 'virtual:@clerk/astro/config' {
  import type { AstroConfig } from 'astro';

  export const astroConfig: AstroConfig;
  export function isStaticOutput(forceStatic?: boolean): boolean;
}
