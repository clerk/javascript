<script setup lang="ts">
import { useAttrs, useSlots } from 'vue';
import type { __experimental_SubscriptionDetailsButtonProps } from '@clerk/shared/types';
import { useClerk } from '../composables/useClerk';
import { useAuth } from '../composables/useAuth';
import { assertSingleChild, mergePortalProps, normalizePortalRoot, normalizeWithDefaultValue } from '../utils';

type SubscriptionDetailsButtonProps = Omit<__experimental_SubscriptionDetailsButtonProps, 'onSubscriptionCancel'>;
const props = defineProps<SubscriptionDetailsButtonProps>();

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

const emit = defineEmits<{ (e: 'subscription-cancel'): void }>();

function clickHandler() {
  if (!clerk.value) {
    return;
  }

  // Merge portal config: top-level props take precedence over nested subscriptionDetailsProps
  // Note: subscriptionDetailsProps.portalRoot is PortalRoot (HTMLElement | null | undefined) which is
  // incompatible with PortalProps.portalRoot, so we handle portalRoot separately
  const topLevelPortalConfig = mergePortalProps(props);

  // Get portalRoot from top-level props first, then fallback to subscriptionDetailsProps
  const portalRootValue = topLevelPortalConfig.portalRoot
    ? normalizePortalRoot(topLevelPortalConfig.portalRoot)
    : (props.subscriptionDetailsProps?.portalRoot ?? undefined);

  return clerk.value.__internal_openSubscriptionDetails({
    for: props.for,
    ...props.subscriptionDetailsProps,
    portalId: topLevelPortalConfig.portalId ?? props.subscriptionDetailsProps?.portalId,
    portalRoot: portalRootValue,
    onSubscriptionCancel: () => emit('subscription-cancel'),
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
