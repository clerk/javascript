<script setup lang="ts">
import { SignedIn, SignedOut, UserButton, OrganizationSwitcher, ClerkLoaded, ClerkLoading } from '@clerk/vue';
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
    <ClerkLoaded>
      <RouterView />
    </ClerkLoaded>
    <ClerkLoading>
      <div>Loading...</div>
    </ClerkLoading>
  </main>
</template>
