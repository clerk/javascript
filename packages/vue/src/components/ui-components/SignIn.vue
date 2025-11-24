<script setup lang="ts">
import { ClerkHostRenderer } from '../ClerkHostRenderer';
import { useClerk } from '../../composables';
import type { SignInProps } from '@clerk/shared/types';

const clerk = useClerk();

const props = withDefaults(defineProps<SignInProps>(), {
  transferable: undefined,
  withSignUp: undefined,
});
</script>

<template>
  <ClerkHostRenderer
    :mount="clerk?.mountSignIn"
    :unmount="clerk?.unmountSignIn"
    :props="props"
    :update-props="(clerk as any)?.__unstable__updateProps"
  />
</template>
