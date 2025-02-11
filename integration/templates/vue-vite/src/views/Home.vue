<script setup lang="ts">
import { SignedIn, OrganizationSwitcher, useAuth } from '@clerk/vue';

const { isSignedIn } = useAuth();
</script>

<template>
  <SignedIn>
    <OrganizationSwitcher />
  </SignedIn>
  <div>
    <ul>
      <li v-if="isSignedIn"><RouterLink to="/profile">Profile</RouterLink></li>
    </ul>
  </div>
</template>
