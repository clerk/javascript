<script setup lang="ts">
import { useAttrs, useSlots } from 'vue';
import type { SignUpButtonProps } from '@clerk/shared/types';
import { useClerk } from '../composables/useClerk';
import { assertSingleChild, normalizeWithDefaultValue } from '../utils';

const props = defineProps<SignUpButtonProps>();

const clerk = useClerk();
const slots = useSlots();
const attrs = useAttrs();

function getChildComponent() {
  const children = normalizeWithDefaultValue(slots.default?.({}), 'Sign up');
  return assertSingleChild(children, 'SignUpButton');
}

function clickHandler() {
  const { mode, ...opts } = props;

  if (mode === 'modal') {
    return clerk.value?.openSignUp({ ...opts, appearance: props.appearance });
  }

  void clerk.value?.redirectToSignUp({
    ...opts,
    signUpFallbackRedirectUrl: props.fallbackRedirectUrl,
    signUpForceRedirectUrl: props.forceRedirectUrl,
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
