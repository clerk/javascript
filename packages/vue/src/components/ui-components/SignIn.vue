<script setup lang="ts">
import { ClerkHostRenderer } from '../ClerkHostRenderer';
import { useClerk } from '../../composables';
import type { SignInProps } from '@clerk/shared/types';
import { getCurrentInstance } from 'vue';

const clerk = useClerk();

defineProps<SignInProps>();

// Hacking our way to get actual initial uncasted boolean props as vue-tsc
// is having a hard time with SignInProps type and withDefaults()
const currentInstance = getCurrentInstance();

const hasInitialTransferable = 'transferable' in (currentInstance?.vnode.props ?? {});
const hasInitialWithSignUp = 'withSignUp' in (currentInstance?.vnode.props ?? {});
</script>

<template>
  <ClerkHostRenderer
    :mount="clerk?.mountSignIn"
    :unmount="clerk?.unmountSignIn"
    :props="{
      ...$props,
      transferable: hasInitialTransferable ? $props.transferable : undefined,
      withSignUp: hasInitialWithSignUp ? $props.withSignUp : undefined,
    }"
    :update-props="(clerk as any)?.__internal_updateProps"
  />
</template>
