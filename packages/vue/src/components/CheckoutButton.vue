<script setup lang="ts">
import { useAttrs, useSlots } from 'vue';
import type { __experimental_CheckoutButtonProps } from '@clerk/shared/types';
import { useClerk } from '../composables/useClerk';
import { useAuth } from '../composables/useAuth';
import { assertSingleChild, mergePortalProps, normalizePortalRoot, normalizeWithDefaultValue } from '../utils';

type CheckoutButtonProps = Omit<__experimental_CheckoutButtonProps, 'onSubscriptionComplete'>;
const props = defineProps<CheckoutButtonProps>();

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

const emit = defineEmits<{ (e: 'subscription-complete'): void }>();

function clickHandler() {
  if (!clerk.value) {
    return;
  }

  // Merge portal config: top-level props take precedence over nested checkoutProps
  // Note: checkoutProps.portalRoot is PortalRoot (HTMLElement | null | undefined) which is
  // incompatible with PortalProps.portalRoot, so we handle portalRoot separately
  // Also note: __internal_CheckoutProps only supports portalId and portalRoot, not disablePortal
  const topLevelPortalConfig = mergePortalProps(props);

  // Get portalRoot from top-level props first, then fallback to checkoutProps
  const portalRootValue = topLevelPortalConfig.portalRoot
    ? normalizePortalRoot(topLevelPortalConfig.portalRoot)
    : (props.checkoutProps?.portalRoot ?? undefined);

  return clerk.value.__internal_openCheckout({
    planId: props.planId,
    planPeriod: props.planPeriod,
    for: props.for,
    newSubscriptionRedirectUrl: props.newSubscriptionRedirectUrl,
    ...props.checkoutProps,
    portalId: topLevelPortalConfig.portalId ?? props.checkoutProps?.portalId,
    portalRoot: portalRootValue,
    onSubscriptionComplete: () => emit('subscription-complete'),
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
