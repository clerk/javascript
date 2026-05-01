<script setup lang="ts">
import { useOrganization } from '@clerk/vue';

const { isLoaded, organization, membership } = useOrganization();
</script>

<template>
  <div id="org-state">
    <p data-org-is-loaded>{{ isLoaded }}</p>
    <p data-org-id>{{ organization?.id }}</p>
    <p data-org-name>{{ organization?.name }}</p>
    <p data-org-slug>{{ organization?.slug }}</p>
    <p data-org-role>{{ membership?.role }}</p>
  </div>
</template>
