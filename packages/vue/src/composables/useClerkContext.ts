import { inject } from 'vue';

import { ClerkInjectionKey } from '../keys';

export function useClerkContext() {
  const ctx = inject(ClerkInjectionKey);

  if (!ctx) {
    throw new Error(
      'This component/composable can only be used when the Vue plugin is installed. Learn more: https://clerk.com/docs/quickstarts/vue',
    );
  }

  return ctx;
}
