<script setup lang="ts">
import { useAttrs, useSlots } from 'vue';
import type { SignOutOptions } from '@clerk/shared/types';
import { useClerk } from '../composables/useClerk';
import { assertSingleChild, normalizeWithDefaultValue } from '../utils';

interface SignOutButtonProps {
  signOutOptions?: SignOutOptions;
  sessionId?: string;
  redirectUrl?: string;
}

const props = defineProps<SignOutButtonProps>();

const clerk = useClerk();
const slots = useSlots();
const attrs = useAttrs();

function getChildComponent() {
  const children = normalizeWithDefaultValue(slots.default?.({}), 'Sign out');
  return assertSingleChild(children, 'SignOutButton');
}

function clickHandler() {
  const signOutOptions: SignOutOptions = {
    redirectUrl: props.signOutOptions?.redirectUrl ?? props.redirectUrl,
    sessionId: props.signOutOptions?.sessionId ?? props.sessionId,
  };
  void clerk.value?.signOut(signOutOptions);
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
