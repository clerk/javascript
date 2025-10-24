import { inject } from 'vue';

import { errorThrower } from '../errors/errorThrower';
import { ClerkInjectionKey } from '../keys';

export function useClerkContext(source: string) {
  const ctx = inject(ClerkInjectionKey);

  if (!ctx) {
    return errorThrower.throw(
      `${source} can only be used when the Vue plugin is installed. Learn more: https://clerk.com/docs/reference/vue/clerk-plugin`,
    );
  }

  return ctx;
}
