<script setup lang="ts">
import { ClerkHostRenderer } from '../ClerkHostRenderer';
import type { ConfigureSSOProps } from '@clerk/shared/types';
import { useClerk } from '../../composables';

const clerk = useClerk();
const props = defineProps<ConfigureSSOProps>();
</script>

<template>
  <ClerkHostRenderer
    :mount="clerk?.mountConfigureSSO"
    :unmount="clerk?.unmountConfigureSSO"
    :update-props="(clerk as any)?.__internal_updateProps"
    :props="props"
  />
</template>
