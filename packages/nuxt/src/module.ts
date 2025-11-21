import type { Without } from '@clerk/shared/types';
import type { PluginOptions } from '@clerk/vue';
import {
  addComponent,
  addImports,
  addImportsDir,
  addPlugin,
  addServerHandler,
  addTypeTemplate,
  createResolver,
  defineNuxtModule,
  updateRuntimeConfig,
} from '@nuxt/kit';

export type ModuleOptions = Without<
  PluginOptions,
  'routerPush' | 'routerReplace' | 'publishableKey' | 'initialState'
> & {
  publishableKey?: string;
  /**
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
   *   console.log('auth', event.context.auth())
   * })
   * ```
   */
  skipServerMiddleware?: boolean;
};

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: PACKAGE_NAME,
    version: PACKAGE_VERSION,
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
      // Public keys exposed to client and shared with the server
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
          clerkUiUrl: options.clerkUiUrl,
          clerkJSVariant: options.clerkJSVariant,
          clerkJSVersion: options.clerkJSVersion,
          isSatellite: options.isSatellite,
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
        machineSecretKey: undefined,
        jwtKey: undefined,
        webhookSigningSecret: undefined,
      },
    });

    const resolver = createResolver(import.meta.url);

    // Handle Nuxt-specific imports (e.g #imports)
    nuxt.options.build.transpile.push(resolver.resolve('./runtime'));

    // Optimize @clerk/vue to avoid missing injection Symbol key errors
    nuxt.options.vite.optimizeDeps = nuxt.options.vite.optimizeDeps || {};
    nuxt.options.vite.optimizeDeps.include = nuxt.options.vite.optimizeDeps.include || [];
    nuxt.options.vite.optimizeDeps.include.push('@clerk/vue');

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

    // Adds TS support for `event.context.auth()` in event handlers
    addTypeTemplate(
      {
        filename: 'types/clerk.d.ts',
        getContents: () => `import type { SessionAuthObject } from '@clerk/backend';
          import type { AuthFn } from '@clerk/nuxt/server';

          declare module 'h3' {
            interface H3EventContext {
              auth: SessionAuthObject & AuthFn;
            }
          }
        `,
      },
      { nitro: true },
    );

    // Add auto-imports for Clerk components, composables and client utils
    addImportsDir(resolver.resolve('./runtime/composables'));
    addImports([
      {
        name: 'createRouteMatcher',
        from: resolver.resolve('./runtime/client'),
      },
      {
        name: 'updateClerkOptions',
        from: resolver.resolve('./runtime/client'),
      },
    ]);

    // Components that use path-based routing (wrapped components)
    const wrappedComponents = [
      'SignIn',
      'SignUp',
      'UserProfile',
      'OrganizationProfile',
      'CreateOrganization',
      'OrganizationList',
    ] as const;

    wrappedComponents.forEach(component => {
      void addComponent({
        name: component,
        export: component,
        filePath: resolver.resolve('./runtime/components'),
      });
    });

    // Other components exported directly from @clerk/vue
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const otherComponents: Array<keyof typeof import('@clerk/vue')> = [
      // Authentication Components
      'GoogleOneTap',
      // Unstyled Components
      'SignInButton',
      'SignOutButton',
      'SignUpButton',
      'SignInWithMetamaskButton',
      // User Components
      'UserButton',
      // Organization Components
      'OrganizationSwitcher',
      // Billing Components
      'PricingTable',
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
      'Waitlist',
    ];
    otherComponents.forEach(component => {
      void addComponent({
        name: component,
        export: component,
        filePath: '@clerk/vue',
      });
    });
  },
});
