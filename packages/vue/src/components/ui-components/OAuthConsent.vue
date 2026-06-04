<script setup lang="ts">
import { ClerkHostRenderer } from '../ClerkHostRenderer';
import type { OAuthConsentProps } from '@clerk/shared/types';
import { useClerk } from '../../composables';

const clerk = useClerk();
const props = defineProps<OAuthConsentProps>();
</script>

<template>
  <ClerkHostRenderer
    :mount="clerk?.mountOAuthConsent"
    :unmount="clerk?.unmountOAuthConsent"
    :update-props="(clerk as any)?.__internal_updateProps"
    :props="props"
  />
</template>
