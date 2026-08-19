<script setup lang="ts">
import type { OAuthDeviceVerificationProps } from '@clerk/shared/types';
import { useClerk } from '../../composables';
import { ClerkHostRenderer } from '../ClerkHostRenderer';

const clerk = useClerk();
const props = defineProps<OAuthDeviceVerificationProps>();
</script>

<template>
  <ClerkHostRenderer
    :mount="clerk?.mountOAuthDeviceVerification"
    :unmount="clerk?.unmountOAuthDeviceVerification"
    :update-props="(clerk as any)?.__internal_updateProps"
    :props="props"
  />
</template>
