<script setup lang="ts">
import { ClerkHostRenderer } from '../ClerkHostRenderer';
import type { __experimental_ConfigureSSOProps } from '@clerk/shared/types';
import { useClerk } from '../../composables';

const clerk = useClerk();
const props = defineProps<__experimental_ConfigureSSOProps>();
</script>

<template>
  <ClerkHostRenderer
    :mount="clerk?.__experimental_mountConfigureSSO"
    :unmount="clerk?.__experimental_unmountConfigureSSO"
    :update-props="(clerk as any)?.__internal_updateProps"
    :props="props"
  />
</template>
