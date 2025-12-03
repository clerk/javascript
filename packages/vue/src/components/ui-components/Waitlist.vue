<script setup lang="ts">
import { ClerkHostRenderer } from '../ClerkHostRenderer';
import type { WaitlistProps } from '@clerk/shared/types';
import { useClerk } from '../../composables';

const clerk = useClerk();
const props = defineProps<WaitlistProps>();
</script>

<template>
  <ClerkHostRenderer
    :mount="clerk?.mountWaitlist"
    :unmount="clerk?.unmountWaitlist"
    :update-props="(clerk as any)?.__internal_updateProps"
    :props="props"
  />
</template>
