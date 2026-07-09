<script setup lang="ts">
import { useAttrs, useSlots } from 'vue';
import { deprecated } from '@clerk/shared/deprecated';
import type { SignOutOptions } from '@clerk/shared/types';
import { useClerk } from '../composables/useClerk';
import { assertSingleChild, normalizeWithDefaultValue } from '../utils';

interface SignOutButtonProps {
  /**
   * @deprecated Use the `redirectUrl` and `sessionId` props directly instead.
   */
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
  if (props.signOutOptions) {
    deprecated('SignOutButton `signOutOptions`', 'Use the `redirectUrl` and `sessionId` props directly instead.');
  }

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
