import { signal } from 'alien-signals';

import type { SignIn } from './resources/SignIn';

export const signInSignal = signal<{ resource: SignIn | null }>({ resource: null });
