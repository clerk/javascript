import type { RedirectUrlProp } from '@clerk/types';
import { defineComponent, h } from 'vue';

import { useClerk } from '../composables/useClerk';
import { assertSingleChild, normalizeWithDefaultValue } from '../utils';

export const SignInWithMetamaskButton = defineComponent(
  (
    props: RedirectUrlProp & {
      mode?: 'modal' | 'redirect';
    },
    { slots, attrs },
  ) => {
    const clerk = useClerk();

    function clickHandler() {
      void clerk.value?.authenticateWithMetamask({ redirectUrl: props.redirectUrl || undefined });
    }

    return () => {
      const children = normalizeWithDefaultValue(slots.default?.(), 'Sign in with Metamask');
      const child = assertSingleChild(children, 'SignInWithMetamaskButton');
      return h(child, {
        ...attrs,
        onClick: clickHandler,
      });
    };
  },
  {
    props: ['redirectUrl', 'mode'],
  },
);
