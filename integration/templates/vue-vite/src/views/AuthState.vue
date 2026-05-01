<script setup lang="ts">
import { useAuth } from '@clerk/vue';

const { isLoaded, isSignedIn, userId, sessionId, orgId, orgRole, orgSlug } = useAuth();
</script>

<template>
  <div id="auth-state">
    <p data-auth-is-loaded>{{ isLoaded }}</p>
    <p data-auth-is-signed-in>{{ isSignedIn }}</p>
    <p data-auth-user-id>{{ userId }}</p>
    <p data-auth-session-id>{{ sessionId }}</p>
    <p data-auth-org-id>{{ orgId }}</p>
    <p data-auth-org-role>{{ orgRole }}</p>
    <p data-auth-org-slug>{{ orgSlug }}</p>
  </div>
</template>
