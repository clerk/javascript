<script setup lang="ts">
import { useUser } from '@clerk/vue';

const { isLoaded, isSignedIn, user } = useUser();
</script>

<template>
  <div id="user-state">
    <p data-user-is-loaded>{{ isLoaded }}</p>
    <p data-user-is-signed-in>{{ isSignedIn }}</p>
    <p data-user-id>{{ user?.id }}</p>
    <p data-user-email>{{ user?.primaryEmailAddress?.emailAddress }}</p>
    <p data-user-first-name>{{ user?.firstName }}</p>
    <p data-user-last-name>{{ user?.lastName }}</p>
  </div>
</template>
