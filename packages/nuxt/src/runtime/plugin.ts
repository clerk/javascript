import { clerkPlugin } from '@clerk/vue';
import { setClerkJsLoadingErrorPackageName, setErrorThrowerOptions } from '@clerk/vue/internal';
import { defineNuxtPlugin, navigateTo, useRuntimeConfig, useState } from 'nuxt/app';

setErrorThrowerOptions({ packageName: PACKAGE_NAME });
setClerkJsLoadingErrorPackageName(PACKAGE_NAME);

export default defineNuxtPlugin(nuxtApp => {
  // SSR-friendly shared state
  const initialState = useState('clerk-initial-state', () => undefined);

  if (import.meta.server) {
    // Save the initial state from server and pass it to the plugin
    initialState.value = nuxtApp.ssrContext?.event.context.__clerk_initial_state;
  }

  nuxtApp.vueApp.use(clerkPlugin, {
    ...(useRuntimeConfig().public.clerk ?? {}),
    routerPush: (to: string) => navigateTo(to),
    routerReplace: (to: string) => navigateTo(to, { replace: true }),
    initialState: initialState.value,
  });
});
