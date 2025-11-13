import { inBrowser } from '@clerk/shared/browser';
import { deriveState } from '@clerk/shared/deriveState';
import { loadClerkJsScript, type LoadClerkJsScriptOptions } from '@clerk/shared/loadClerkJsScript';
import type {
  Clerk,
  ClientResource,
  InitialState,
  MultiDomainAndOrProxy,
  Resources,
  Without,
} from '@clerk/shared/types';
import type { Plugin } from 'vue';
import { computed, ref, shallowRef, triggerRef } from 'vue';

import { ClerkInjectionKey } from './keys';

export type PluginOptions = Without<LoadClerkJsScriptOptions, 'domain' | 'proxyUrl'> &
  MultiDomainAndOrProxy & {
    initialState?: InitialState;
  };

const SDK_METADATA = {
  name: PACKAGE_NAME,
  version: PACKAGE_VERSION,
  environment: process.env.NODE_ENV,
};

/**
 * Vue plugin for integrating Clerk.
 *
 * @example
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
export const clerkPlugin: Plugin<[PluginOptions]> = {
  install(app, pluginOptions) {
    const { initialState } = pluginOptions || {};

    const loaded = shallowRef(false);
    const clerk = shallowRef<Clerk | null>(null);

    const resources = ref<Resources>({
      client: undefined as unknown as ClientResource,
      session: undefined,
      user: undefined,
      organization: undefined,
    });

    const options = {
      ...pluginOptions,
      sdkMetadata: pluginOptions.sdkMetadata || SDK_METADATA,
    } as LoadClerkJsScriptOptions;

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
      const {
        sessionId,
        userId,
        orgId,
        actor,
        orgRole,
        orgSlug,
        orgPermissions,
        sessionStatus,
        sessionClaims,
        factorVerificationAge,
      } = derivedState.value;
      return {
        sessionId,
        userId,
        actor,
        orgId,
        orgRole,
        orgSlug,
        orgPermissions,
        sessionStatus,
        sessionClaims,
        factorVerificationAge,
      };
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
