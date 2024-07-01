/// <reference types="astro/client" />

interface InternalEnv {
  readonly PUBLIC_ASTRO_APP_CLERK_FRONTEND_API?: string;
  readonly PUBLIC_ASTRO_APP_CLERK_PUBLISHABLE_KEY?: string;
  readonly PUBLIC_ASTRO_APP_CLERK_JS_URL?: string;
  readonly PUBLIC_ASTRO_APP_CLERK_JS_VARIANT?: 'headless' | '';
  readonly PUBLIC_ASTRO_APP_CLERK_JS_VERSION?: string;
  readonly CLERK_API_KEY?: string;
  readonly CLERK_API_URL?: string;
  readonly CLERK_API_VERSION?: string;
  readonly CLERK_JWT_KEY?: string;
  readonly CLERK_SECRET_KEY?: string;
  readonly PUBLIC_ASTRO_APP_CLERK_DOMAIN?: string;
  readonly PUBLIC_ASTRO_APP_CLERK_IS_SATELLITE?: string;
  readonly PUBLIC_ASTRO_APP_CLERK_PROXY_URL?: string;
  readonly PUBLIC_ASTRO_APP_CLERK_SIGN_IN_URL?: string;
  readonly PUBLIC_ASTRO_APP_CLERK_SIGN_UP_URL?: string;
}

interface ImportMeta {
  readonly env: InternalEnv;
}

declare namespace App {
  interface Locals {
    runtime: { env: InternalEnv };
  }
}
