<script setup lang="ts">
import { SignedIn, SignedOut, OrganizationSwitcher, ClerkLoaded, ClerkLoading } from '@clerk/vue';
import CustomUserButton from './components/CustomUserButton.vue';
</script>

<template>
  <header class="header">
    <div>
      <div style="flex-grow: 1">
        <p class="title">Vue Clerk Integration test</p>
      </div>
      <SignedIn>
        <CustomUserButton />
        <OrganizationSwitcher />
      </SignedIn>
      <SignedOut>
        <RouterLink to="/sign-in">Sign in</RouterLink>
      </SignedOut>
    </div>
  </header>
  <main>
    <ClerkLoaded>
      <RouterView />
    </ClerkLoaded>
    <ClerkLoading>
      <div>Loading...</div>
    </ClerkLoading>
  </main>
</template>
