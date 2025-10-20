<script setup lang="ts">
import { ClerkHostRenderer } from '../ClerkHostRenderer';
import { useClerk } from '../../composables';
import type { GoogleOneTapProps } from '@clerk/shared/types';

const clerk = useClerk();

const props = withDefaults(defineProps<GoogleOneTapProps>(), {
  cancelOnTapOutside: true,
  itpSupport: true,
  fedCmSupport: true,
});
</script>

<template>
  <ClerkHostRenderer
    :open="clerk?.openGoogleOneTap"
    :close="clerk?.closeGoogleOneTap"
    :props="props"
  />
</template>
