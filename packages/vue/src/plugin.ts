import { inBrowser } from '@clerk/shared/browser';
import { deriveState } from '@clerk/shared/deriveState';
import { loadClerkJsScript, type LoadClerkJsScriptOptions, loadClerkUiScript } from '@clerk/shared/loadClerkJsScript';
import type {
  Clerk,
  ClerkOptions,
  ClientResource,
  InitialState,
  IsomorphicClerkOptions,
  MultiDomainAndOrProxy,
  Resources,
  Without,
} from '@clerk/shared/types';
import type { ClerkUiConstructor } from '@clerk/shared/ui';
import type { Appearance, Ui } from '@clerk/ui/internal';
import type { Plugin } from 'vue';
import { computed, ref, shallowRef, triggerRef } from 'vue';

import { ClerkInjectionKey } from './keys';
declare global {
  interface Window {
    __internal_ClerkUiCtor?: ClerkUiConstructor;
  }
}

export type PluginOptions<TUi extends Ui = Ui> = Without<IsomorphicClerkOptions, 'domain' | 'proxyUrl' | 'appearance'> &
  MultiDomainAndOrProxy & {
    initialState?: InitialState;
    appearance?: Appearance<TUi>;
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
  install<TUi extends Ui = Ui>(app: any, pluginOptions: PluginOptions<TUi>) {
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
      void (async () => {
        try {
          const clerkPromise = loadClerkJsScript(options);
          const clerkUiCtorPromise = (async () => {
            await loadClerkUiScript(options);
            if (!window.__internal_ClerkUiCtor) {
              throw new Error('Failed to download latest Clerk UI. Contact support@clerk.com.');
            }
            return window.__internal_ClerkUiCtor;
          })();

          await clerkPromise;

          if (!window.Clerk) {
            throw new Error('Failed to download latest ClerkJS. Contact support@clerk.com.');
          }

          clerk.value = window.Clerk;
          const loadOptions = { ...options, clerkUiCtor: clerkUiCtorPromise } as unknown as ClerkOptions;
          await window.Clerk.load(loadOptions);
          loaded.value = true;

          if (clerk.value) {
            clerk.value.addListener(payload => {
              resources.value = payload;
            });

            // When Clerk updates its state internally, Vue's reactivity system doesn't detect
            // the change since it's an external object being mutated. triggerRef() forces Vue
            // to re-evaluate all dependencies regardless of how the value was changed.
            triggerRef(clerk);
          }
        } catch (err) {
          const error = err as Error;
          console.error(error.stack || error.message || error);
        }
      })();
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
