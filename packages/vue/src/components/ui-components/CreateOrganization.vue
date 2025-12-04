<script setup lang="ts">
import { ClerkHostRenderer } from '../ClerkHostRenderer';
import { useClerk } from '../../composables';
import type { CreateOrganizationProps } from '@clerk/shared/types';

const clerk = useClerk();
const props = defineProps<CreateOrganizationProps>();
</script>

<template>
  <ClerkHostRenderer
    :mount="clerk?.mountCreateOrganization"
    :unmount="clerk?.unmountCreateOrganization"
    :update-props="(clerk as any)?.__internal_updateProps"
    :props="props"
  />
</template>
