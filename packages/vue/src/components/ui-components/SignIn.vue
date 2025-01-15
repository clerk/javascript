<script setup lang="ts">
import { Portal } from '../uiComponents';
import { useClerk } from '../../composables';
import { SignInProps } from '@clerk/types';

const clerk = useClerk();

defineProps<SignInProps>();
</script>

<template>
  <Portal
    :mount="clerk?.mountSignIn"
    :unmount="clerk?.unmountSignIn"
    :update-props="(clerk as any)?.__unstable__updateProps"
  />
</template>
