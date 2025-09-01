<script setup lang="ts">
import { useAttrs, useSlots } from 'vue';
import type { __experimental_SubscriptionDetailsButtonProps } from '@clerk/types';
import { useClerk } from '../composables/useClerk';
import { useAuth } from '../composables/useAuth';
import { assertSingleChild, normalizeWithDefaultValue } from '../utils';

const props = defineProps<__experimental_SubscriptionDetailsButtonProps>();

const clerk = useClerk();
const { userId, orgId } = useAuth();
const slots = useSlots();
const attrs = useAttrs();

// Authentication checks - similar to React implementation
if (userId.value === null) {
  throw new Error('Ensure that `<SubscriptionDetailsButton />` is rendered inside a `<SignedIn />` component.');
}

if (orgId.value === null && props.for === 'organization') {
  throw new Error('Wrap `<SubscriptionDetailsButton for="organization" />` with a check for an active organization.');
}

function getChildComponent() {
  const children = normalizeWithDefaultValue(slots.default?.({}), 'Subscription details');
  return assertSingleChild(children, 'SubscriptionDetailsButton');
}

function clickHandler() {
  if (!clerk.value) {
    return;
  }

  return clerk.value.__internal_openSubscriptionDetails({
    for: props.for,
    onSubscriptionCancel: props.onSubscriptionCancel,
    ...props.subscriptionDetailsProps,
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
