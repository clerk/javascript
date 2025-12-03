<script setup lang="ts">
import { ClerkHostRenderer } from '../ClerkHostRenderer';
import type { PricingTableProps } from '@clerk/shared/types';
import { useClerk } from '../../composables';

const clerk = useClerk();
const props = defineProps<PricingTableProps>();
</script>

<template>
  <ClerkHostRenderer
    :mount="clerk?.mountPricingTable"
    :unmount="clerk?.unmountPricingTable"
    :update-props="(clerk as any)?.__internal__updateProps"
    :props="props"
  />
</template>
