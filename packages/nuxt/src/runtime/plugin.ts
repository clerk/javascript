import { setClerkJSLoadingErrorPackageName } from '@clerk/shared/loadClerkJsScript';
import type { InitialState } from '@clerk/shared/types';
import { clerkPlugin } from '@clerk/vue';
import { setErrorThrowerOptions } from '@clerk/vue/internal';
import { defineNuxtPlugin, navigateTo, useRuntimeConfig, useState } from 'nuxt/app';

setErrorThrowerOptions({ packageName: PACKAGE_NAME });
setClerkJSLoadingErrorPackageName(PACKAGE_NAME);

export default defineNuxtPlugin(nuxtApp => {
  // SSR-friendly shared state
  const initialState = useState<InitialState | undefined>('clerk-initial-state', () => undefined);
  const keylessContext = useState<{ claimUrl?: string; apiKeysUrl?: string } | undefined>(
    'clerk-keyless-context',
    () => undefined,
  );

  if (import.meta.server) {
    // Save the initial state from server and pass it to the plugin
    initialState.value = nuxtApp.ssrContext?.event.context.__clerk_initial_state;
    keylessContext.value = nuxtApp.ssrContext?.event.context.__clerk_keyless;
  }

  const runtimeConfig = useRuntimeConfig();
  const clerkConfig = runtimeConfig.public.clerk ?? {};

  nuxtApp.vueApp.use(clerkPlugin as any, {
    ...clerkConfig,
    // Map jsUrl/uiUrl to clerkJSUrl/clerkUIUrl as expected by the Vue plugin
    clerkJSUrl: clerkConfig.jsUrl,
    clerkUIUrl: clerkConfig.uiUrl,
    sdkMetadata: {
      name: PACKAGE_NAME,
      version: PACKAGE_VERSION,
      environment: process.env.NODE_ENV,
    },
    routerPush: (to: string) => navigateTo(to),
    routerReplace: (to: string) => navigateTo(to, { replace: true }),
    initialState: initialState.value,
    // Add keyless mode props if present
    ...(keylessContext.value
      ? {
          __internal_keyless_claimKeylessApplicationUrl: keylessContext.value.claimUrl,
          __internal_keyless_copyInstanceKeysUrl: keylessContext.value.apiKeysUrl,
        }
      : {}),
  });
});
