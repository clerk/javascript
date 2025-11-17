<script setup lang="ts">
import { ClerkHostRenderer } from '../ClerkHostRenderer';
import type { APIKeysProps } from '@clerk/shared/types';
import { useClerk } from '../../composables';

const clerk = useClerk();
const props = defineProps<APIKeysProps>();
</script>

<template>
  <ClerkHostRenderer
    :mount="clerk?.mountAPIKeys"
    :unmount="clerk?.unmountAPIKeys"
    :update-props="(clerk as any)?.__unstable__updateProps"
    :props="props"
  />
</template>
