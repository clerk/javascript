import type { SignUpProps } from '@clerk/types';
import { defineComponent, h } from 'vue';

import { useClerk } from '../composables/useClerk';
import { assertSingleChild, normalizeWithDefaultValue } from '../utils';

type SignUpButtonProps = {
  unsafeMetadata?: SignUpUnsafeMetadata;
} & Pick<
  SignUpProps,
  'fallbackRedirectUrl' | 'forceRedirectUrl' | 'signInForceRedirectUrl' | 'signInFallbackRedirectUrl'
>;

export const SignUpButton = defineComponent(
  (
    props: SignUpButtonProps & {
      mode?: 'modal' | 'redirect';
    },
    { slots, attrs },
  ) => {
    const clerk = useClerk();

    function clickHandler() {
      const { mode, ...opts } = props;

      if (mode === 'modal') {
        return clerk.value?.openSignUp(opts);
      }

      void clerk.value?.redirectToSignUp({
        ...opts,
        signUpFallbackRedirectUrl: props.fallbackRedirectUrl,
        signUpForceRedirectUrl: props.forceRedirectUrl,
      });
    }

    return () => {
      const children = normalizeWithDefaultValue(slots.default?.(), 'Sign up');
      const child = assertSingleChild(children, 'SignUpButton');
      return h(child, {
        ...attrs,
        onClick: clickHandler,
      });
    };
  },
  {
    props: [
      'unsafeMetadata',
      'signInForceRedirectUrl',
      'signInFallbackRedirectUrl',
      'fallbackRedirectUrl',
      'forceRedirectUrl',
      'mode',
    ],
  },
);
