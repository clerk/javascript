<script setup lang="ts">
import { UserProfile, useUser } from '@clerk/vue';

const { user } = useUser();
</script>

<template>
  <UserProfile />
  <div>Hello, {{ user?.firstName }}</div>
</template>
