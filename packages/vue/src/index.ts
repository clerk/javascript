import type { ClerkContextProviderState } from '@clerk/clerk-react/dist/contexts/ClerkContextProvider';
import Clerk from '@clerk/clerk-react/dist/isomorphicClerk';
import { deriveState } from '@clerk/clerk-react/dist/utils/deriveState';
import type { ClientResource } from '@clerk/types';
import type { App } from 'vue';
import { computed, ref } from 'vue';

import { provideClerk } from './injection';

export { useAuth, useClerk, useMagicLink, useSession, useSessionList, useSignIn, useUser } from './composables';

type ClerkOptions = {
  publishableKey: string;
};
export default {
  install(app: App, options: ClerkOptions) {
    const { clerk, loaded, state, derivedState } = createClerk(options);

    provideClerk(app, { clerk, state, derivedState, clerkLoaded: loaded });
  },
};

function createClerk(options: ClerkOptions) {
  const clerk = new Clerk({
    publishableKey: options.publishableKey,
  });

  const loaded = ref(clerk.loaded);
  clerk.addOnLoaded(() => (loaded.value = true));

  const state = ref<ClerkContextProviderState>({
    client: clerk.client as ClientResource,
    session: clerk.session,
    user: clerk.user,
    organization: clerk.organization,
    lastOrganizationInvitation: null,
    lastOrganizationMember: null,
  });
  clerk.addListener(e => (state.value = { ...e }));

  // TODO: inital state
  const derivedState = computed(() => deriveState(loaded.value, state.value, undefined));

  return {
    clerk,
    loaded,
    state,
    derivedState,
  };
}

if (typeof global === 'undefined' && typeof window !== 'undefined' && !window.global) {
  (window as any).global = window;
}
