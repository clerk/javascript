import { computed } from 'nanostores';

import { $clerk, $csrState, $initialState } from './internal';
import { deriveState } from './utils';

export const $authStore = computed([$csrState, $initialState], (state, initialState) => {
  return deriveState(
    state.isLoaded,
    {
      session: state.session,
      user: state.user,
      organization: state.organization,
      client: state.client!,
    },
    initialState,
  );
});

export const $userStore = computed([$authStore], auth => auth.user);
// TODO: on mounted subscriber log telemetry
// onMount($userStore, () => {
//   // isomorphicClerk.telemetry?.record(eventMethodCalled('useSignIn'));
// });

export const $sessionStore = computed([$authStore], auth => auth.session);
export const $organizationStore = computed([$authStore], auth => auth.organization);
export const $clientStore = computed([$csrState], csr => csr.client);
export const $clerkStore = computed([$clerk], clerk => clerk);
export const $sessionListStore = computed([$clientStore], client => client?.sessions);
export const $signInStore = computed([$clientStore], client => client?.signIn);
export const $signUpStore = computed([$clientStore], client => client?.signUp);
