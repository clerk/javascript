import type { ClerkContextProviderState } from '@clerk/clerk-react/dist/contexts/ClerkContextProvider';
import type Clerk from '@clerk/clerk-react/dist/isomorphicClerk';
import type { deriveState } from '@clerk/clerk-react/dist/utils/deriveState';
import type { App, ComputedRef, InjectionKey, Ref } from 'vue';
import { inject } from 'vue';

interface ClerkProvideValue {
  clerk: Clerk;
  clerkLoaded: Ref<boolean>;
  state: Ref<ClerkContextProviderState>;
  derivedState: ComputedRef<ReturnType<typeof deriveState>>;
}

const ClerkProvideSymbol = Symbol() as InjectionKey<ClerkProvideValue>;

export function provideClerk(app: App, value: ClerkProvideValue) {
  app.provide(ClerkProvideSymbol, value);
}

export function useClerkProvide() {
  const value = inject(ClerkProvideSymbol);
  if (!value) {
    throw new Error('Clerk not provided');
  }
  return value;
}
