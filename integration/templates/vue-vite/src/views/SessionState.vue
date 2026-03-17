<script setup lang="ts">
import { useSession } from '@clerk/vue';

const { isLoaded, isSignedIn, session } = useSession();
</script>

<template>
  <div id="session-state">
    <p data-session-is-loaded>{{ isLoaded }}</p>
    <p data-session-is-signed-in>{{ isSignedIn }}</p>
    <p data-session-id>{{ session?.id }}</p>
    <p data-session-status>{{ session?.status }}</p>
    <p data-session-user-id>{{ session?.user?.id }}</p>
  </div>
</template>
