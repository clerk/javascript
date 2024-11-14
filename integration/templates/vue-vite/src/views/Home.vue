<script setup lang="ts">
import { useAuth } from '@clerk/vue';

const { isSignedIn } = useAuth();
</script>

<template>
  <div>
    <ul>
      <li v-if="isSignedIn"><RouterLink to="/profile">Profile</RouterLink></li>
    </ul>
  </div>
</template>
