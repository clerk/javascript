<script setup lang="ts">
import { SignOutButton, Show } from '@clerk/vue';
</script>

<template>
  <div>
    <Show when="signed-in">
      <p data-signed-in>You are signed in</p>
      <SignOutButton />
    </Show>
    <Show when="signed-out">
      <p data-signed-out>You are signed out</p>
    </Show>
  </div>
</template>
