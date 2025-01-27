<script setup lang="ts">
import { ClerkHostRenderer } from '../ClerkHostRenderer';
import { useClerk } from '../../composables';
import type { GoogleOneTapProps } from '@clerk/types';

const clerk = useClerk();

const props = defineProps<GoogleOneTapProps>();
</script>

<template>
  <ClerkHostRenderer
    :mount="() => clerk?.openGoogleOneTap(props)"
    :unmount="clerk?.closeGoogleOneTap"
  />
</template>
