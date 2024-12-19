import { inBrowser } from '@clerk/shared/browser';
import { deriveState } from '@clerk/shared/deriveState';
import { loadClerkJsScript, type LoadClerkJsScriptOptions } from '@clerk/shared/loadClerkJsScript';
import type { Clerk, ClientResource, Resources } from '@clerk/types';
import type { Plugin } from 'vue';
import { computed, ref, shallowRef, triggerRef } from 'vue';

import { ClerkInjectionKey } from './keys';

export type PluginOptions = LoadClerkJsScriptOptions;

/**
 * Vue plugin for integrating Clerk.
 *
 * @example
 * Basic usage in main.ts:
 *
 * ```ts
 * import { createApp } from 'vue'
 * import { clerkPlugin } from '@clerk/vue'
 * import App from './App.vue'
 *
 * const app = createApp(App)
 *
 * app.use(clerkPlugin, {
 *   publishableKey: 'pk_'
 * })
 *
 * app.mount('#app')
 * ```
 */
export const clerkPlugin: Plugin = {
  install(app, options: PluginOptions) {
    // @ts-expect-error: Internal property for SSR frameworks like Nuxt
    const { initialState } = options;

    const loaded = shallowRef(false);
    const clerk = shallowRef<Clerk | null>(null);

    const resources = ref<Resources>({
      client: {} as ClientResource,
      session: undefined,
      user: undefined,
      organization: undefined,
    });

    // We need this check for SSR apps like Nuxt as it will try to run this code on the server
    // and loadClerkJsScript contains browser-specific code
    if (inBrowser()) {
      void loadClerkJsScript(options).then(async () => {
        if (!window.Clerk) {
          throw new Error('Failed to download latest ClerkJS. Contact support@clerk.com.');
        }

        clerk.value = window.Clerk;
        await window.Clerk.load(options);
        loaded.value = true;

        clerk.value.addListener(payload => {
          resources.value = payload;
        });

        // When Clerk updates its state internally, Vue's reactivity system doesn't detect
        // the change since it's an external object being mutated. triggerRef() forces Vue
        // to re-evaluate all dependencies regardless of how the value was changed.
        triggerRef(clerk);
      });
    }

    const derivedState = computed(() => deriveState(loaded.value, resources.value, initialState));

    const authCtx = computed(() => {
      const { sessionId, userId, orgId, actor, orgRole, orgSlug, orgPermissions } = derivedState.value;
      return { sessionId, userId, actor, orgId, orgRole, orgSlug, orgPermissions };
    });
    const clientCtx = computed(() => resources.value.client);
    const userCtx = computed(() => derivedState.value.user);
    const sessionCtx = computed(() => derivedState.value.session);
    const organizationCtx = computed(() => derivedState.value.organization);

    app.provide(ClerkInjectionKey, {
      clerk,
      authCtx,
      clientCtx,
      sessionCtx,
      userCtx,
      organizationCtx,
    });
  },
};
