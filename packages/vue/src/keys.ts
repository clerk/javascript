import type { InjectionKey } from 'vue';

import type { VueClerkInjectionKeyType } from './types';

export const ClerkInjectionKey = Symbol('clerk') as InjectionKey<VueClerkInjectionKeyType>;
