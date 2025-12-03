<script setup lang="ts">
import { ClerkHostRenderer } from '../ClerkHostRenderer';
import { useClerk } from '../../composables';
import type { SignUpProps } from '@clerk/shared/types';

const clerk = useClerk();

const props = defineProps<SignUpProps>();
</script>

<template>
  <ClerkHostRenderer
    :mount="clerk?.mountSignUp"
    :unmount="clerk?.unmountSignUp"
    :props="props"
    :update-props="(clerk as any)?.__internal__updateProps"
  />
</template>
