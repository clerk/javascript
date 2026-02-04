import { inBrowser } from '@clerk/shared/browser';
import { deriveState } from '@clerk/shared/deriveState';
import { loadClerkJSScript, type LoadClerkJSScriptOptions, loadClerkUIScript } from '@clerk/shared/loadClerkJsScript';
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
    __internal_ClerkUICtor?: ClerkUiConstructor;
  }
}

export type PluginOptions<TUi extends Ui = Ui> = Without<IsomorphicClerkOptions, 'domain' | 'proxyUrl' | 'appearance'> &
  MultiDomainAndOrProxy & {
    initialState?: InitialState;
    appearance?: Appearance<TUi>;
    /**
     * Optional object to use the bundled Clerk UI instead of loading from CDN.
     * Import `ui` from `@clerk/ui` and pass it here to bundle the UI with your application.
     * When omitted, UI is loaded from Clerk's CDN.
     */
    ui?: TUi;
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
    } as LoadClerkJSScriptOptions;

    // We need this check for SSR apps like Nuxt as it will try to run this code on the server
    // and loadClerkJSScript contains browser-specific code
    if (inBrowser()) {
      void (async () => {
        try {
          const clerkPromise = loadClerkJSScript(options);
          // Honor explicit clerkUICtor even when prefetchUI={false}
          // Also support bundled UI via ui.ClerkUI prop
          const uiProp = pluginOptions.ui;
          const clerkUICtorPromise = pluginOptions.clerkUICtor
            ? Promise.resolve(pluginOptions.clerkUICtor)
            : uiProp?.ClerkUI
              ? Promise.resolve(uiProp.ClerkUI)
              : pluginOptions.prefetchUI === false
                ? Promise.resolve(undefined)
                : (async () => {
                    await loadClerkUIScript(options);
                    if (!window.__internal_ClerkUICtor) {
                      throw new Error('Failed to download latest Clerk UI. Contact support@clerk.com.');
                    }
                    return window.__internal_ClerkUICtor;
                  })();

          await clerkPromise;

          if (!window.Clerk) {
            throw new Error('Failed to download latest ClerkJS. Contact support@clerk.com.');
          }

          clerk.value = window.Clerk;
          const loadOptions = { ...options, ui: { ClerkUI: clerkUICtorPromise } } as unknown as ClerkOptions;
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
