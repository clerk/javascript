import { computed } from 'nanostores';

import { $clerk, $csrState, $initialState } from './internal';
import { deriveState } from './utils';

<<<<<<< HEAD
/**
 * A client side store that is prepopulated with the authentication context during SSR.
 * It is a nanostore, for instructions on how to use nanostores please review the [documentation](https://github.com/nanostores/nanostores)
 *
 * @example
 * A simple example:
 *
 * $authStore.subscribe((auth) => console.log(auth.userId))
 */
=======
>>>>>>> 956f8a51b (feat(astro): Introduce Astro SDK)
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

<<<<<<< HEAD
/**
 * A client side store that is populated after clerk-js has loaded.
 * The store returns back the authenticated user or `null`.
 * It is a nanostore, for instructions on how to use nanostores please review the [documentation](https://github.com/nanostores/nanostores)
 *
 * @example
 * A simple example:
 *
 * $userStore.subscribe((user) => console.log(user.id))
 */
=======
>>>>>>> 956f8a51b (feat(astro): Introduce Astro SDK)
export const $userStore = computed([$authStore], auth => auth.user);
// TODO: on mounted subscriber log telemetry
// onMount($userStore, () => {
//   // isomorphicClerk.telemetry?.record(eventMethodCalled('useSignIn'));
// });

<<<<<<< HEAD
/**
 * A client side store that is populated after clerk-js has loaded.
 * The store returns the session of the authenticated user or `null`.
 * It is a nanostore, for instructions on how to use nanostores please review the [documentation](https://github.com/nanostores/nanostores)
 *
 * @example
 * A simple example:
 *
 * $sessionStore.subscribe((session) => console.log(session.id))
 */
export const $sessionStore = computed([$authStore], auth => auth.session);

/**
 * A client side store that is populated after clerk-js has loaded.
 * The store returns the active organization of the authenticated user or `null`.
 * It is a nanostore, for instructions on how to use nanostores please review the [documentation](https://github.com/nanostores/nanostores)
 *
 * @example
 * A simple example:
 *
 * $organizationStore.subscribe((org) => console.log(org.id))
 */
export const $organizationStore = computed([$authStore], auth => auth.organization);

/**
 * A client side store that is populated after clerk-js has loaded.
 * The store returns the clerk client or `null`.
 * It is a nanostore, for instructions on how to use nanostores please review the [documentation](https://github.com/nanostores/nanostores)
 *
 * @example
 * A simple example:
 *
 * $clientStore.subscribe((client) => console.log(client.activeSessions))
 */
export const $clientStore = computed([$csrState], csr => csr.client);

/**
 * A client side store that is populated after clerk-js is instanciated.
 * The store returns the clerk instance or `null`.
 * It is a nanostore, for instructions on how to use nanostores please review the [documentation](https://github.com/nanostores/nanostores)
 *
 * @example
 * A simple example:
 *
 * $clerkStore.subscribe((clerk) => console.log(clerk.publishableKey))
 */
export const $clerkStore = computed([$clerk], clerk => clerk);

/**
 * A client side store that is populated after clerk-js has loaded.
 * The store returns all the sessions of the current clerk client or `null`.
 * It is a nanostore, for instructions on how to use nanostores please review the [documentation](https://github.com/nanostores/nanostores)
 *
 * @example
 * A simple example:
 *
 * $sessionListStore.subscribe((sessionList) => sessionList.map((session) => console.log('Session id:', sessino.id) ))
 */
export const $sessionListStore = computed([$clientStore], client => client?.sessions);

/**
 * A client side store that is populated after clerk-js has loaded.
 * The store returns a `SignInResource` or `null`.
 * It is a nanostore, for instructions on how to use nanostores please review the [documentation](https://github.com/nanostores/nanostores)
 *
 * @example
 * A simple example:
 *
 * $signInStore.subscribe((signIn) => console.log(signIn.status))
 */
export const $signInStore = computed([$clientStore], client => client?.signIn);

/**
 * A client side store that is populated after clerk-js has loaded.
 * The store returns a `SignUpResource` or `null`.
 * It is a nanostore, for instructions on how to use nanostores please review the [documentation](https://github.com/nanostores/nanostores)
 *
 * @example
 * A simple example:
 *
 * $signUpStore.subscribe((signUp) => console.log(signUp.status))
 */
=======
export const $sessionStore = computed([$authStore], auth => auth.session);
export const $organizationStore = computed([$authStore], auth => auth.organization);
export const $clientStore = computed([$csrState], csr => csr.client);
export const $clerkStore = computed([$clerk], clerk => clerk);
export const $sessionListStore = computed([$clientStore], client => client?.sessions);
export const $signInStore = computed([$clientStore], client => client?.signIn);
>>>>>>> 956f8a51b (feat(astro): Introduce Astro SDK)
export const $signUpStore = computed([$clientStore], client => client?.signUp);
