<script setup lang="ts">
import { useAttrs, useSlots } from 'vue';
import type { __experimental_PlanDetailsButtonProps, __internal_PlanDetailsProps } from '@clerk/shared/types';
import { useClerk } from '../composables/useClerk';
import { assertSingleChild, mergePortalProps, normalizePortalRoot, normalizeWithDefaultValue } from '../utils';

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

  // Merge portal config: top-level props take precedence over nested planDetailsProps
  // Note: planDetailsProps.portalRoot is PortalRoot (HTMLElement | null | undefined) which is
  // incompatible with PortalProps.portalRoot, so we handle portalRoot separately
  const topLevelPortalConfig = mergePortalProps(props);

  // Get portalRoot from top-level props first, then fallback to planDetailsProps
  const portalRootValue = topLevelPortalConfig.portalRoot
    ? normalizePortalRoot(topLevelPortalConfig.portalRoot)
    : (props.planDetailsProps?.portalRoot ?? undefined);

  // Build the props object respecting the discriminated union (planId XOR plan)
  const planDetailsCallProps: __internal_PlanDetailsProps = props.plan
    ? {
        plan: props.plan,
        initialPlanPeriod: props.initialPlanPeriod,
        appearance: props.planDetailsProps?.appearance,
        portalId: topLevelPortalConfig.portalId ?? props.planDetailsProps?.portalId,
        portalRoot: portalRootValue,
      }
    : {
        planId: props.planId!,
        initialPlanPeriod: props.initialPlanPeriod,
        appearance: props.planDetailsProps?.appearance,
        portalId: topLevelPortalConfig.portalId ?? props.planDetailsProps?.portalId,
        portalRoot: portalRootValue,
      };

  return clerk.value.__internal_openPlanDetails(planDetailsCallProps);
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
