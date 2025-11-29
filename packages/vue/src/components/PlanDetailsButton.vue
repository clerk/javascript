<script setup lang="ts">
import { useAttrs, useSlots } from 'vue';
import type { __experimental_PlanDetailsButtonProps } from '@clerk/shared/types';
import { useClerk } from '../composables/useClerk';
import { assertSingleChild, normalizeWithDefaultValue } from '../utils';

const props = defineProps<__experimental_PlanDetailsButtonProps>();

const clerk = useClerk();
const slots = useSlots();
const attrs = useAttrs();

function getChildComponent() {
  const children = normalizeWithDefaultValue(slots.default?.({}), 'Plan details');
  return assertSingleChild(children, 'PlanDetailsButton');
}

function clickHandler() {
  if (!clerk.value) {
    return;
  }

  return clerk.value.__internal_openPlanDetails({
    plan: props.plan,
    planId: props.planId,
    initialPlanPeriod: props.initialPlanPeriod,
    ...props.planDetailsProps,
  } as __experimental_PlanDetailsButtonProps);
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
