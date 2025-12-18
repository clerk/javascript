<script setup lang="ts">
import { ClerkLoaded, ClerkLoading, Show } from '@clerk/vue';
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
      <Show when="signedIn">
        <CustomUserButton />
      </Show>
      <Show when="signedOut">
        <RouterLink to="/sign-in">Sign in</RouterLink>
      </Show>
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
