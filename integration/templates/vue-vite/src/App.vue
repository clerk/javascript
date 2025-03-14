<script setup lang="ts">
import { SignedIn, SignedOut, ClerkLoaded, ClerkLoading } from '@clerk/vue';
import CustomUserButton from './components/CustomUserButton.vue';
import LanguagePicker from './components/LanguagePicker.vue';
</script>

<template>
  <header class="header">
    <div>
      <div style="flex-grow: 1">
        <p class="title">Vue Clerk Integration test</p>
      </div>
      <LanguagePicker />
      <SignedIn>
        <CustomUserButton />
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
