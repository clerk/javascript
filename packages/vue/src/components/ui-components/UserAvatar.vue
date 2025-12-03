<script setup lang="ts">
import { ClerkHostRenderer } from '../ClerkHostRenderer';
import type { UserAvatarProps } from '@clerk/shared/types';
import { useClerk } from '../../composables';

const clerk = useClerk();
const props = defineProps<UserAvatarProps>();
</script>

<template>
  <ClerkHostRenderer
    :mount="clerk?.mountUserAvatar"
    :unmount="clerk?.unmountUserAvatar"
    :update-props="(clerk as any)?.__internal__updateProps"
    :props="props"
  />
</template>
