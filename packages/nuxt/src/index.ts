import type { LoadClerkJsScriptOptions } from '@clerk/shared/loadClerkJsScript';
import {
  addComponent,
  addImports,
  addPlugin,
  addServerHandler,
  createResolver,
  defineNuxtModule,
  updateRuntimeConfig,
} from '@nuxt/kit';

export type ModuleOptions = Omit<LoadClerkJsScriptOptions, 'routerPush' | 'routerReplace'> & {
  /**
   * @experimental
   *
   * Skip the automatic server middleware registration. When enabled, you'll need to
   * register the middleware manually in your application.
   *
   * @default false
   *
   * @example
   *
   * ```ts
   * // server/middleware/clerk.ts
   * import { clerkMiddleware } from '@clerk/nuxt/server'
   *
   * export default clerkMiddleware((event) => {
   *   console.log('auth', event.context.auth)
   * })
   * ```
   */
  skipServerMiddleware?: boolean;
};

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@clerk/nuxt',
    configKey: 'clerk',
    compatibility: {
      nuxt: '>=3.0.0',
    },
  },
  setup(options, nuxt) {
    // These values must be set (even as undefined) to allow runtime config to work properly.
    // In Nuxt, having these keys defined (even as undefined) allows them to be overridden
    // by environment variables following the pattern NUXT_PUBLIC_CLERK_* (e.g. NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY).
    // More info https://nuxt.com/docs/guide/going-further/runtime-config
    void updateRuntimeConfig({
      // Public keys exposed to client
      public: {
        clerk: {
          ...options,
          publishableKey: options.publishableKey,
          signInUrl: options.signInUrl,
          signInFallbackRedirectUrl: options.signInFallbackRedirectUrl,
          signUpFallbackRedirectUrl: options.signUpFallbackRedirectUrl,
          signInForceRedirectUrl: options.signInForceRedirectUrl,
          signUpForceRedirectUrl: options.signUpForceRedirectUrl,
          signUpUrl: options.signUpUrl,
          domain: options.domain,
          clerkJSUrl: options.clerkJSUrl,
          clerkJSVariant: options.clerkJSVariant,
          clerkJSVersion: options.clerkJSVersion,
          // Backend specific variables that are safe to share.
          // We want them to be overridable like the other public keys (e.g NUXT_PUBLIC_CLERK_PROXY_URL)
          proxyUrl: options.proxyUrl,
          apiUrl: 'https://api.clerk.com',
          apiVersion: 'v1',
        },
      },
      // Private keys available only on within server-side
      clerk: {
        secretKey: undefined,
        jwtKey: undefined,
      },
    });

    const resolver = createResolver(import.meta.url);

    // Handle Nuxt-specific imports (e.g #imports)
    nuxt.options.build.transpile.push(resolver.resolve('./runtime'));

    // Add the `@clerk/vue` plugin
    addPlugin(resolver.resolve('./runtime/plugin'));

    // Allow skipping installing the server middleware
    // and let the user handle it manually
    if (!options.skipServerMiddleware) {
      addServerHandler({
        middleware: true,
        handler: resolver.resolve('./runtime/server/middleware'),
      });
    }

    // Add auto-imports for Clerk components and composables
    const components = [
      // Authentication Components
      'SignIn',
      'SignUp',
      // Unstyled Components
      'SignInButton',
      'SignOutButton',
      'SignUpButton',
      'SignInWithMetamaskButton',
      // User Components
      'UserButton',
      'UserProfile',
      // Organization Components
      'CreateOrganization',
      'OrganizationProfile',
      'OrganizationSwitcher',
      'OrganizationList',
      // Control Components
      'ClerkLoaded',
      'ClerkLoading',
      'Protect',
      'RedirectToSignIn',
      'RedirectToSignUp',
      'RedirectToUserProfile',
      'RedirectToOrganizationProfile',
      'RedirectToCreateOrganization',
      'SignedIn',
      'SignedOut',
    ];
    const composables = [
      'useAuth',
      'useClerk',
      'useSession',
      'useSessionList',
      'useSignIn',
      'useSignUp',
      'useUser',
      'useOrganization',
      // helpers
      'updateClerkOptions',
    ];
    addImports(
      composables.map(composable => ({
        name: composable,
        from: '@clerk/vue',
      })),
    );
    components.forEach(component => {
      void addComponent({
        name: component,
        export: component,
        filePath: '@clerk/vue',
      });
    });

    // addRouteMiddleware({ name: 'auth', path: resolver.resolve('./runtime/middleware/auth') })
    // addRouteMiddleware({ name: 'guest', path: resolver.resolve('./runtime/middleware/guest') })
  },
});
