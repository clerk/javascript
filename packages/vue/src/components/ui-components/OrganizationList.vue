<script setup lang="ts">
import { useClerk } from '../../composables';
import type { OrganizationListProps } from '@clerk/shared/types';
import { ClerkHostRenderer } from '../ClerkHostRenderer';

const clerk = useClerk();
const props = defineProps<OrganizationListProps>();
</script>

<template>
  <ClerkHostRenderer
    :mount="clerk?.mountOrganizationList"
    :unmount="clerk?.unmountOrganizationList"
    :update-props="(clerk as any)?.__internal_updateProps"
    :props="props"
  />
</template>
