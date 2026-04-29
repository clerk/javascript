<script setup lang="ts">
import { ClerkHostRenderer } from '../ClerkHostRenderer';
import type { __internal_OAuthConsentProps } from '@clerk/shared/types';
import { useClerk } from '../../composables';

const clerk = useClerk();
const props = defineProps<__internal_OAuthConsentProps>();
</script>

<template>
  <ClerkHostRenderer
    :mount="clerk?.__internal_mountOAuthConsent"
    :unmount="clerk?.__internal_unmountOAuthConsent"
    :update-props="(clerk as any)?.__internal_updateProps"
    :props="props"
  />
</template>
