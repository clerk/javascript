<script setup lang="ts">
import { ClerkHostRenderer } from '../ClerkHostRenderer';
import type { PricingTableProps } from '@clerk/types';
import { useClerk } from '../../composables';

const clerk = useClerk();
const props = defineProps<PricingTableProps>();
</script>

<template>
  <ClerkHostRenderer
    :mount="clerk?.__experimental_mountPricingTable"
    :unmount="clerk?.__experimental_unmountPricingTable"
    :update-props="(clerk as any)?.__unstable__updateProps"
    :props="props"
  />
</template>
