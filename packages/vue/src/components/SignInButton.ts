import type { SignInProps } from '@clerk/types';
import { defineComponent, h } from 'vue';

import { useClerk } from '../composables/useClerk';
import { assertSingleChild, normalizeWithDefaultValue } from '../utils';

type SignInButtonProps = Pick<
  SignInProps,
  | 'fallbackRedirectUrl'
  | 'forceRedirectUrl'
  | 'signUpForceRedirectUrl'
  | 'signUpFallbackRedirectUrl'
  | 'initialValues'
  | 'withSignUp'
>;

export const SignInButton = defineComponent(
  (
    props: SignInButtonProps & {
      mode?: 'modal' | 'redirect';
    },
    { slots, attrs },
  ) => {
    const clerk = useClerk();

    function clickHandler() {
      const { mode, ...opts } = props;

      if (mode === 'modal') {
        return clerk.value?.openSignIn(opts);
      }

      const { withSignUp, ...redirectOpts } = opts;

      void clerk.value?.redirectToSignIn({
        ...redirectOpts,
        signInFallbackRedirectUrl: props.fallbackRedirectUrl,
        signInForceRedirectUrl: props.forceRedirectUrl,
      });
    }

    return () => {
      const children = normalizeWithDefaultValue(slots.default?.(), 'Sign in');
      const child = assertSingleChild(children, 'SignInButton');
      return h(child, {
        ...attrs,
        onClick: clickHandler,
      });
    };
  },
  {
    props: [
      'signUpForceRedirectUrl',
      'signUpFallbackRedirectUrl',
      'fallbackRedirectUrl',
      'forceRedirectUrl',
      'mode',
      'initialValues',
      'withSignUp',
    ],
  },
);
