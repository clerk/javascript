<script setup lang="ts">
import { SignInButton, SignUpButton } from '@clerk/vue';
</script>

<template>
  <SignInButton mode="modal" fallbackRedirectUrl="/" />
  <SignUpButton mode="modal" fallbackRedirectUrl="/" />
</template>
