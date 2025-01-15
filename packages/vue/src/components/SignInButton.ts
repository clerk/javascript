import type { PropType } from 'vue';
import { defineComponent, h } from 'vue';

import { useClerk } from '../composables/useClerk';
import { assertSingleChild, normalizeWithDefaultValue } from '../utils';

export const SignInButton = defineComponent({
  props: {
    fallbackRedirectUrl: String,
    forceRedirectUrl: String,
    signUpForceRedirectUrl: String,
    signUpFallbackRedirectUrl: String,
    initialValues: Object,
    // withSignUp: Boolean,
    mode: {
      type: String as PropType<'modal' | 'redirect'>,
      required: false,
    },
  },
  setup(props, { slots, attrs }) {
    const clerk = useClerk();

    function clickHandler() {
      const { mode, ...opts } = props;

      if (mode === 'modal') {
        return clerk.value?.openSignIn(opts);
      }

      void clerk.value?.redirectToSignIn({
        ...opts,
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
});
