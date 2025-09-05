<script setup lang="ts">
import { useAttrs, useSlots } from 'vue';
import type { __experimental_CheckoutButtonProps } from '@clerk/types';
import { useClerk } from '../composables/useClerk';
import { useAuth } from '../composables/useAuth';
import { assertSingleChild, normalizeWithDefaultValue } from '../utils';

const props = defineProps<__experimental_CheckoutButtonProps>();

const clerk = useClerk();
const { userId, orgId } = useAuth();
const slots = useSlots();
const attrs = useAttrs();

// Authentication checks - similar to React implementation
if (userId.value === null) {
  throw new Error('Ensure that `<CheckoutButton />` is rendered inside a `<SignedIn />` component.');
}

if (orgId.value === null && props.for === 'organization') {
  throw new Error('Wrap `<CheckoutButton for="organization" />` with a check for an active organization.');
}

function getChildComponent() {
  const children = normalizeWithDefaultValue(slots.default?.({}), 'Checkout');
  return assertSingleChild(children, 'CheckoutButton');
}

function clickHandler() {
  if (!clerk.value) {
    return;
  }

  return clerk.value.__internal_openCheckout({
    planId: props.planId,
    planPeriod: props.planPeriod,
    for: props.for,
    onSubscriptionComplete: props.onSubscriptionComplete,
    newSubscriptionRedirectUrl: props.newSubscriptionRedirectUrl,
    ...props.checkoutProps,
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
