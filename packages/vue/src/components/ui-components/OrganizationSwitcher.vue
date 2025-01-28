<script setup lang="ts">
import { useClerk } from '../../composables';
import type { OrganizationSwitcherProps } from '@clerk/types';
import { ClerkHostRenderer } from '../ClerkHostRenderer';

const clerk = useClerk();
const props = defineProps<OrganizationSwitcherProps>();
</script>

<template>
  <ClerkHostRenderer
    :mount="clerk?.mountOrganizationSwitcher"
    :unmount="clerk?.unmountOrganizationSwitcher"
    :update-props="(clerk as any)?.__unstable__updateProps"
    :props="props"
  />
</template>
