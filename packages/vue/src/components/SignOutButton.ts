import type { SignOutOptions } from '@clerk/types';
import { defineComponent, h } from 'vue';

import { useClerk } from '../composables/useClerk';
import { assertSingleChild, normalizeWithDefaultValue } from '../utils';

interface SignOutButtonProps {
  signOutOptions?: SignOutOptions;
  sessionId?: string;
  redirectUrl?: string;
}

export const SignOutButton = defineComponent(
  (props: SignOutButtonProps, { slots, attrs }) => {
    const clerk = useClerk();

    function clickHandler() {
      const signOutOptions: SignOutOptions = {
        redirectUrl: props.signOutOptions?.redirectUrl ?? props.redirectUrl,
        sessionId: props.signOutOptions?.sessionId ?? props.sessionId,
      };
      void clerk.value?.signOut(signOutOptions);
    }

    return () => {
      const children = normalizeWithDefaultValue(slots.default?.(), 'Sign out');
      const child = assertSingleChild(children, 'SignOutButton');
      return h(child, {
        ...attrs,
        onClick: clickHandler,
      });
    };
  },
  {
    props: ['signOutOptions', 'sessionId', 'redirectUrl'],
  },
);
