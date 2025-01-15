<script setup lang="ts">
import { useAttrs, useSlots } from 'vue';
import type { SignInProps } from '@clerk/types';
import { useClerk } from '../composables/useClerk';
import { assertSingleChild, normalizeWithDefaultValue } from '../utils';

type SignInButtonProps = Pick<
  SignInProps,
  'fallbackRedirectUrl' | 'forceRedirectUrl' | 'signUpForceRedirectUrl' | 'signUpFallbackRedirectUrl' | 'initialValues'
> & {
  mode?: 'modal' | 'redirect';
};

const props = defineProps<SignInButtonProps>();

const clerk = useClerk();
const slots = useSlots();
const attrs = useAttrs();

function getChildComponent() {
  const children = normalizeWithDefaultValue(slots.default?.({}), 'Sign in');
  return assertSingleChild(children, 'SignInButton');
}

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
</script>

<template>
  <component
    :is="getChildComponent"
    v-bind="attrs"
    @click="clickHandler"
  >
    <slot />
  </component>
</template>
