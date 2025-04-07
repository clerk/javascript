<script setup lang="ts">
import { ClerkHostRenderer } from '../ClerkHostRenderer';
import { useClerk } from '../../composables';
import type { GoogleOneTapProps } from '@clerk/types';

const clerk = useClerk();

const props = defineProps<GoogleOneTapProps>();
</script>

<template>
  <ClerkHostRenderer
    :open="clerk?.openGoogleOneTap"
    :close="clerk?.closeGoogleOneTap"
    :props="props"
  />
</template>
