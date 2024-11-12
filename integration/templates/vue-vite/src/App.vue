<script setup lang="ts">
import { SignedIn, SignedOut, UserButton, OrganizationSwitcher, useClerk } from '@clerk/vue';

const clerk = useClerk();
</script>

<template>
  <header class="header">
    <div>
      <div style="flex-grow: 1">
        <p class="title">Vue Clerk Integration test</p>
      </div>
      <SignedIn>
        <UserButton />
        <OrganizationSwitcher />
      </SignedIn>
      <SignedOut>
        <RouterLink to="/sign-in">Sign in</RouterLink>
      </SignedOut>
    </div>
  </header>
  <main>
    <RouterView v-if="clerk?.loaded" />
    <div v-else>Loading...</div>
  </main>
</template>
