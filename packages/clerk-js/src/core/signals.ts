import { signal, computed } from 'alien-signals';

import type { SignIn } from './resources/SignIn';

export const signInSignal = signal<{ resource: SignIn | null }>({ resource: null });
export const signInErrorSignal = signal<{ errors: unknown }>({ errors: null });

export const signInComputedSignal = computed(() => {
  const signIn = signInSignal().resource;
  const errors = signInErrorSignal().errors;

  if (!signIn) {
    return { errors: null, signIn: null };
  }

  return { errors, signIn: signIn.__internal_future };
});
