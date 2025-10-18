<script setup lang="ts">
import { useAttrs, useSlots } from 'vue';
import type { RedirectUrlProp } from '@clerk/shared/types';
import { useClerk } from '../composables/useClerk';
import { assertSingleChild, normalizeWithDefaultValue } from '../utils';

type Props = RedirectUrlProp & {
  mode?: 'modal' | 'redirect';
};

const props = defineProps<Props>();

const clerk = useClerk();
const slots = useSlots();
const attrs = useAttrs();

function getChildComponent() {
  const children = normalizeWithDefaultValue(slots.default?.({}), 'Sign in with Metamask');
  return assertSingleChild(children, 'SignInWithMetamaskButton');
}

function clickHandler() {
  void clerk.value?.authenticateWithMetamask({ redirectUrl: props.redirectUrl || undefined });
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
